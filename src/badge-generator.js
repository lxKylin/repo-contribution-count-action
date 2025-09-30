class BadgeGenerator {
  constructor(style = 'flat') {
    this.style = style;
    this.baseUrl = 'https://img.shields.io/badge';
  }

  /**
   * 为单个仓库生成图标 URL
   * @param {string} repoName 仓库名
   * @param {number} count PR 数量
   * @returns {string} 图标 URL
   */
  generateBadgeUrl(repoName, count) {
    // 对仓库名进行 URL 编码
    const encodedRepoName = encodeURIComponent(repoName);
    const label = encodedRepoName;
    const message = `${count} PRs`;
    const color = this.getColorByCount(count);

    return `${this.baseUrl}/${label}-${encodeURIComponent(message)}-${color}?style=${this.style}`;
  }

  /**
   * 根据 PR 数量确定图标颜色
   * @param {number} count PR 数量
   * @returns {string} 颜色代码
   */
  getColorByCount(count) {
    if (count === 0) return 'lightgrey';
    if (count <= 5) return 'green';
    if (count <= 15) return 'brightgreen';
    if (count <= 30) return 'yellow';
    if (count <= 50) return 'orange';
    return 'red';
  }

  /**
   * 生成 Markdown 格式的图标
   * @param {string} repoName 仓库名
   * @param {number} count PR 数量
   * @returns {string} Markdown 格式的图标
   */
  generateMarkdownBadge(repoName, count) {
    const badgeUrl = this.generateBadgeUrl(repoName, count);
    const repoUrl = `https://github.com/${repoName}`;
    return `[![${repoName} PRs](${badgeUrl})](${repoUrl})`;
  }

  /**
   * 生成 HTML 格式的图标
   * @param {string} repoName 仓库名
   * @param {number} count PR 数量
   * @returns {string} HTML 格式的图标
   */
  generateHtmlBadge(repoName, count) {
    const badgeUrl = this.generateBadgeUrl(repoName, count);
    const repoUrl = `https://github.com/${repoName}`;
    return `<a href="${repoUrl}"><img src="${badgeUrl}" alt="${repoName} PRs"></a>`;
  }

  /**
   * 生成汇总图标
   * @param {Object} repoCounts 仓库 PR 统计
   * @returns {string} 汇总图标的 URL
   */
  generateSummaryBadge(repoCounts) {
    const totalPRs = Object.values(repoCounts).reduce((sum, count) => sum + count, 0);
    const repoCount = Object.keys(repoCounts).length;

    const label = 'Total PRs';
    const message = `${totalPRs} in ${repoCount} repos`;
    const color = this.getColorByCount(totalPRs);

    return `${this.baseUrl}/${encodeURIComponent(label)}-${encodeURIComponent(message)}-${color}?style=${this.style}`;
  }

  /**
   * 为所有仓库生成图标
   * @param {Object} repoCounts 仓库 PR 统计
   * @param {string} format 输出格式 (markdown, html, json)
   * @returns {string|Object} 生成的图标内容
   */
  generateBadges(repoCounts, format = 'markdown') {
    const badges = [];

    // 为每个仓库生成图标
    for (const [repoName, count] of Object.entries(repoCounts)) {
      let badge;

      switch (format.toLowerCase()) {
        case 'html':
          badge = this.generateHtmlBadge(repoName, count);
          break;
        case 'json':
          badge = {
            repository: repoName,
            count: count,
            badgeUrl: this.generateBadgeUrl(repoName, count),
            repoUrl: `https://github.com/${repoName}`
          };
          break;
        case 'markdown':
        default:
          badge = this.generateMarkdownBadge(repoName, count);
          break;
      }

      badges.push(badge);
    }

    // 添加汇总图标
    if (Object.keys(repoCounts).length > 1) {
      const summaryBadgeUrl = this.generateSummaryBadge(repoCounts);

      switch (format.toLowerCase()) {
        case 'html':
          badges.unshift(`<img src="${summaryBadgeUrl}" alt="Total PRs">`);
          break;
        case 'json':
          badges.unshift({
            repository: 'SUMMARY',
            count: Object.values(repoCounts).reduce((sum, count) => sum + count, 0),
            badgeUrl: summaryBadgeUrl,
            repoUrl: null
          });
          break;
        case 'markdown':
        default:
          badges.unshift(`![Total PRs](${summaryBadgeUrl})`);
          break;
      }
    }

    // 返回结果
    switch (format.toLowerCase()) {
      case 'json':
        return JSON.stringify(badges, null, 2);
      case 'html':
        return badges.join('\n');
      case 'markdown':
      default:
        return badges.join('\n\n');
    }
  }

  /**
   * 生成自定义样式的表格格式图标
   * @param {Object} repoCounts 仓库 PR 统计
   * @returns {string} Markdown 表格格式
   */
  generateTableFormat(repoCounts) {
    let table = '| 仓库 | PR 数量 | 图标 |\n';
    table += '|------|---------|------|\n';

    for (const [repoName, count] of Object.entries(repoCounts)) {
      const badgeUrl = this.generateBadgeUrl(repoName, count);
      const repoUrl = `https://github.com/${repoName}`;
      table += `| [${repoName}](${repoUrl}) | ${count} | ![${repoName}](${badgeUrl}) |\n`;
    }

    // 添加汇总行
    if (Object.keys(repoCounts).length > 1) {
      const totalPRs = Object.values(repoCounts).reduce((sum, count) => sum + count, 0);
      const summaryBadgeUrl = this.generateSummaryBadge(repoCounts);
      table += `| **总计** | **${totalPRs}** | ![Total](${summaryBadgeUrl}) |\n`;
    }

    return table;
  }
}

module.exports = { BadgeGenerator };
