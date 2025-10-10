const core = require('@actions/core');
const github = require('@actions/github');
const { PrCounter } = require('./pr-counter');
const { BadgeGenerator } = require('./badge-generator');

async function run() {
  try {
    // 获取输入参数
    const prLinks = core.getInput('pr-links', { required: true });

    core.info('prLinks', prLinks);

    const githubToken = core.getInput('github-token', { required: true });
    const badgeStyle = core.getInput('badge-style') || 'flat';
    const outputFormat = core.getInput('output-format') || 'markdown';
    const sortByCount = core.getInput('sort-by-count') !== 'false'; // 默认为 true，除非明确设置为 'false'
    const includeMergeCommits =
      core.getInput('include-merge-commits') !== 'false'; // 默认为 true

    core.info('开始统计贡献数量...');

    // 初始化 GitHub API 客户端
    const octokit = github.getOctokit(githubToken);

    // 解析链接以确定贡献类型
    const linksList = prLinks.split('\n').filter((link) => link.trim());

    core.info(`发现 ${linksList.length} 个链接, ${linksList}`);

    // 检测链接类型
    const isCommitLinks = linksList.some((link) =>
      link.includes('/commits?author=')
    );
    const contributionType = isCommitLinks ? 'commits' : 'PRs';
    core.info(`检测到贡献类型: ${contributionType}`);

    // 统计贡献数量
    const prCounter = new PrCounter(octokit);
    const repoCounts = await prCounter.countPRsByRepository(
      linksList,
      includeMergeCommits
    );

    core.info(`${contributionType} 统计完成:`);
    for (const [repo, count] of Object.entries(repoCounts)) {
      core.info(`${repo}: ${count} ${contributionType}`);
    }

    // 生成图标
    const badgeGenerator = new BadgeGenerator(badgeStyle);
    const badges = badgeGenerator.generateBadges(
      repoCounts,
      outputFormat,
      contributionType,
      sortByCount
    );

    // 生成摘要
    const totalContributions = Object.values(repoCounts).reduce(
      (sum, count) => sum + count,
      0
    );
    const summary = `总计在 ${Object.keys(repoCounts).length} 个仓库中创建了 ${totalContributions} 个 ${contributionType}`;

    // 设置输出
    core.setOutput('badges', badges);
    core.setOutput('summary', summary);
    core.setOutput('repo-counts', JSON.stringify(repoCounts));

    core.info('✅ Action 执行完成!');
  } catch (error) {
    core.setFailed(`Action 执行失败: ${error.message}`);
  }
}

run();
