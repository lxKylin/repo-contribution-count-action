const core = require('@actions/core');

class PrCounter {
  constructor(octokit) {
    this.octokit = octokit;
  }

  /**
   * 从链接中解析仓库信息和用户名
   * @param {string} link PR 链接或 commits 链接
   * @returns {Object} 包含 owner, repo, user, type 的对象
   */
  parsePRLink(link) {
    // 支持多种链接格式
    // PR 链接: https://github.com/owner/repo/pull/123
    // PR 搜索: https://github.com/owner/repo/pulls?q=is%3Apr+author%3Ausername
    // Commits 链接: https://github.com/owner/repo/commits?author=username

    let githubUrlPattern,
      match,
      owner,
      repo,
      user = null;

    // 尝试匹配 commits 链接
    githubUrlPattern =
      /https:\/\/github\.com\/([^\/]+)\/([^\/]+)\/commits\?author=([^&]+)/;
    match = link.match(githubUrlPattern);

    if (match) {
      [, owner, repo, user] = match;
      return { owner, repo, user, type: 'commits' };
    }

    // 尝试匹配 PR 链接
    githubUrlPattern =
      /https:\/\/github\.com\/([^\/]+)\/([^\/]+)\/pull(?:s?)\/?(\d*)/;
    match = link.match(githubUrlPattern);

    if (match) {
      [, owner, repo] = match;

      // 从链接中提取用户名（如果是搜索链接）
      const authorMatch = link.match(/author%3A([^&]+)/);
      if (authorMatch) {
        user = decodeURIComponent(authorMatch[1]);
      }

      return { owner, repo, user, type: 'pulls' };
    }

    throw new Error(`无效的链接格式: ${link}`);
  }

  /**
   * 获取指定 PR 的作者
   * @param {string} owner 仓库所有者
   * @param {string} repo 仓库名
   * @param {number} prNumber PR 编号
   * @returns {string} PR 作者用户名
   */
  async getPRAuthor(owner, repo, prNumber) {
    try {
      const { data: pr } = await this.octokit.rest.pulls.get({
        owner,
        repo,
        pull_number: prNumber
      });

      return pr.user.login;
    } catch (error) {
      core.warning(`获取 PR #${prNumber} 信息失败: ${error.message}`);
      return null;
    }
  }

  /**
   * 统计用户在指定仓库中的 commits 数量
   * @param {string} owner 仓库所有者
   * @param {string} repo 仓库名
   * @param {string} user 用户名
   * @param {boolean} includeMergeCommits 是否包含Merge commits（默认true）
   * @returns {number} Commits 数量
   */
  async countUserCommitsInRepo(owner, repo, user, includeMergeCommits = true) {
    try {
      let page = 1;
      let totalCount = 0;
      let hasMore = true;

      while (hasMore) {
        const { data: commits } = await this.octokit.rest.repos.listCommits({
          owner,
          repo,
          author: user,
          per_page: 100,
          page: page
        });

        if (commits.length === 0) {
          hasMore = false;
          break;
        }

        // 根据配置决定是否包含Merge commits
        const filteredCommits = includeMergeCommits
          ? commits
          : commits.filter(
              (commit) => !commit.commit.message.startsWith('Merge')
            );

        totalCount += filteredCommits.length;
        page++;

        // 如果当前页面没有满 100 个，说明是最后一页
        if (commits.length < 100) {
          hasMore = false;
        }
      }

      return totalCount;
    } catch (error) {
      core.warning(
        `统计仓库 ${owner}/${repo} 中用户 ${user} 的 commits 失败: ${error.message}`
      );
      return 0;
    }
  }

  /**
   * 统计用户在指定仓库中的 PR 数量
   * @param {string} owner 仓库所有者
   * @param {string} repo 仓库名
   * @param {string} user 用户名
   * @returns {number} PR 数量
   */
  async countUserPRsInRepo(owner, repo, user) {
    try {
      let page = 1;
      let totalCount = 0;
      let hasMore = true;

      while (hasMore) {
        const { data: pulls } = await this.octokit.rest.pulls.list({
          owner,
          repo,
          state: 'all',
          per_page: 100,
          page: page
        });

        if (pulls.length === 0) {
          hasMore = false;
          break;
        }

        // 统计当前页面中该用户的 PR 数量
        const userPRs = pulls.filter((pr) => pr.user.login === user);
        totalCount += userPRs.length;

        page++;

        // 如果当前页面没有满 100 个，说明是最后一页
        if (pulls.length < 100) {
          hasMore = false;
        }
      }

      return totalCount;
    } catch (error) {
      core.warning(
        `统计仓库 ${owner}/${repo} 中用户 ${user} 的 PR 失败: ${error.message}`
      );
      return 0;
    }
  }

  /**
   * 根据链接列表统计各仓库的贡献数量（支持 PR 和 commits）
   * @param {string[]} links 链接列表
   * @param {boolean} includeMergeCommits 是否包含Merge commits
   * @returns {Object} 仓库名到贡献数量的映射
   */
  async countPRsByRepository(links, includeMergeCommits = true) {
    const repoCounts = {};
    const processedRepos = new Set();

    for (const link of links) {
      try {
        const { owner, repo, user: linkUser, type } = this.parsePRLink(link);
        const repoKey = `${owner}/${repo}`;
        console.log('type', type, link);
        // 如果已经处理过这个仓库，跳过
        if (processedRepos.has(repoKey)) {
          continue;
        }

        let user = linkUser;

        // 如果链接中没有用户信息，尝试从具体的 PR 中提取
        if (!user && type === 'pulls') {
          const prNumberMatch = link.match(/\/pull\/(\d+)/);
          if (prNumberMatch) {
            const prNumber = parseInt(prNumberMatch[1]);
            user = await this.getPRAuthor(owner, repo, prNumber);
          }
        }

        if (!user) {
          core.warning(`无法确定链接 ${link} 的用户，跳过此链接`);
          continue;
        }

        // 根据链接类型使用相应的统计方法
        let count;
        if (type === 'commits') {
          core.info(`正在统计仓库 ${repoKey} 中用户 ${user} 的 commits...`);
          count = await this.countUserCommitsInRepo(
            owner,
            repo,
            user,
            includeMergeCommits
          );
        } else {
          core.info(`正在统计仓库 ${repoKey} 中用户 ${user} 的 PR...`);
          count = await this.countUserPRsInRepo(owner, repo, user);
        }

        repoCounts[repoKey] = count;
        processedRepos.add(repoKey);

        // 添加延迟以避免 API 限制
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        core.warning(`处理链接 ${link} 失败: ${error.message}`);
      }
    }

    return repoCounts;
  }
}

module.exports = { PrCounter };
