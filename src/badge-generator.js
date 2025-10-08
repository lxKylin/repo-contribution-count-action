class BadgeGenerator {
  constructor(style = 'flat') {
    this.style = style;
    this.baseUrl = 'https://img.shields.io/badge';
  }

  /**
   * 为单个仓库生成图标 URL
   * @param {string} repoName 仓库名
   * @param {number} count 贡献数量
   * @param {string} type 贡献类型 ('commits' 或 'PRs')
   * @returns {string} 图标 URL
   */
  generateBadgeUrl(repoName, count, type = 'PRs') {
    // 使用 shields.io 的动态标签格式来解决特殊字符问题
    // 格式: https://img.shields.io/static/v1?label=LABEL&message=MESSAGE&color=COLOR
    const color = this.getColorByCount(count);

    const params = new URLSearchParams({
      label: repoName,
      message: `${count} ${type}`,
      color: color,
      style: this.style
    });

    return `https://img.shields.io/static/v1?${params.toString()}`;
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
   * @param {number} count 贡献数量
   * @param {string} type 贡献类型
   * @returns {string} Markdown 格式的图标
   */
  generateMarkdownBadge(repoName, count, type = 'PRs') {
    const badgeUrl = this.generateBadgeUrl(repoName, count, type);
    const repoUrl = `https://github.com/${repoName}`;
    return `[![${repoName} ${type}](${badgeUrl})](${repoUrl})`;
  }

  /**
   * 生成 HTML 格式的图标
   * @param {string} repoName 仓库名
   * @param {number} count 贡献数量
   * @param {string} type 贡献类型
   * @returns {string} HTML 格式的图标
   */
  generateHtmlBadge(repoName, count, type = 'PRs') {
    const badgeUrl = this.generateBadgeUrl(repoName, count, type);
    const repoUrl = `https://github.com/${repoName}`;
    return `<a href="${repoUrl}"><img src="${badgeUrl}" alt="${repoName} ${type}"></a>`;
  }

  /**
   * 生成汇总图标
   * @param {Object} repoCounts 仓库贡献统计
   * @param {string} type 贡献类型
   * @returns {string} 汇总图标的 URL
   */
  generateSummaryBadge(repoCounts, type = 'PRs') {
    const total = Object.values(repoCounts).reduce(
      (sum, count) => sum + count,
      0
    );
    const repoCount = Object.keys(repoCounts).length;

    const label = `Total ${type}`;
    const message = `${total} in ${repoCount} repos`;
    const color = this.getColorByCount(total);

    const params = new URLSearchParams({
      label: label,
      message: message,
      color: color,
      style: this.style
    });

    return `https://img.shields.io/static/v1?${params.toString()}`;
  }

  /**
   * 为所有仓库生成图标
   * @param {Object} repoCounts 仓库贡献统计
   * @param {string} format 输出格式 (markdown, html, json)
   * @param {string} type 贡献类型
   * @param {boolean} sortByCount 是否按数量排序，默认为true
   * @returns {string|Object} 生成的图标内容
   */
  generateBadges(
    repoCounts,
    format = 'markdown',
    type = 'PRs',
    sortByCount = true
  ) {
    const badges = [];

    // 按PR数量进行排序（从高到低）
    let sortedRepos;
    if (sortByCount) {
      sortedRepos = Object.entries(repoCounts).sort((a, b) => b[1] - a[1]);
    } else {
      sortedRepos = Object.entries(repoCounts);
    }

    // 为每个仓库生成图标
    for (const [repoName, count] of sortedRepos) {
      let badge;

      switch (format.toLowerCase()) {
        case 'html':
          badge = this.generateHtmlBadge(repoName, count, type);
          break;
        case 'json':
          badge = {
            repository: repoName,
            count: count,
            badgeUrl: this.generateBadgeUrl(repoName, count, type),
            repoUrl: `https://github.com/${repoName}`
          };
          break;
        case 'markdown':
        default:
          badge = this.generateMarkdownBadge(repoName, count, type);
          break;
      }

      badges.push(badge);
    }

    // 添加汇总图标
    if (Object.keys(repoCounts).length > 1) {
      const summaryBadgeUrl = this.generateSummaryBadge(repoCounts, type);

      switch (format.toLowerCase()) {
        case 'html':
          badges.unshift(`<img src="${summaryBadgeUrl}" alt="Total ${type}">`);
          break;
        case 'json':
          badges.unshift({
            repository: 'SUMMARY',
            count: Object.values(repoCounts).reduce(
              (sum, count) => sum + count,
              0
            ),
            badgeUrl: summaryBadgeUrl,
            repoUrl: null
          });
          break;
        case 'markdown':
        default:
          badges.unshift(`![Total ${type}](${summaryBadgeUrl})`);
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
   * @param {Object} repoCounts 仓库贡献统计
   * @param {string} type 贡献类型
   * @param {boolean} sortByCount 是否按数量排序，默认为true
   * @returns {string} Markdown 表格格式
   */
  generateTableFormat(repoCounts, type = 'PRs', sortByCount = true) {
    let table = `| 仓库 | ${type} 数量 | 图标 |\n`;
    table += '|------|---------|------|\n';

    // 按PR数量进行排序（从高到低）
    let sortedRepos;
    if (sortByCount) {
      sortedRepos = Object.entries(repoCounts).sort((a, b) => b[1] - a[1]);
    } else {
      sortedRepos = Object.entries(repoCounts);
    }

    for (const [repoName, count] of sortedRepos) {
      const badgeUrl = this.generateBadgeUrl(repoName, count, type);
      const repoUrl = `https://github.com/${repoName}`;
      table += `| [${repoName}](${repoUrl}) | ${count} | ![${repoName}](${badgeUrl}) |\n`;
    }

    // 添加汇总行
    if (Object.keys(repoCounts).length > 1) {
      const total = Object.values(repoCounts).reduce(
        (sum, count) => sum + count,
        0
      );
      const summaryBadgeUrl = this.generateSummaryBadge(repoCounts, type);
      table += `| **总计** | **${total}** | ![Total](${summaryBadgeUrl}) |\n`;
    }

    return table;
  }
}

module.exports = { BadgeGenerator };
