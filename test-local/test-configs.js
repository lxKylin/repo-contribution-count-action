// 测试配置文件

const testConfigs = {
  // 基础测试 - 使用公开的 PR 链接进行测试
  basic: {
    name: '基础功能测试',
    description: '使用公开的 PR 链接测试基本功能',
    prLinks: `https://github.com/vitejs/docs-cn/commits?author=lxKylin
    https://github.com/vitest-dev/docs-cn/commits?author=lxKylin
    https://github.com/element-plus/element-plus/commits?author=lxKylin`,
    badgeStyle: 'flat',
    outputFormat: 'markdown'
  },

  // 多格式输出测试
  multiFormat: {
    name: '多格式输出测试',
    description: '测试不同的输出格式',
    prLinks: `https://github.com/vitejs/docs-cn/commits?author=lxKylin`,
    badgeStyle: 'flat-square',
    outputFormat: 'json'
  },

  // 样式测试
  styleTest: {
    name: '图标样式测试',
    description: '测试不同的图标样式',
    prLinks: `https://github.com/vitejs/docs-cn/commits?author=lxKylin
    https://github.com/vitest-dev/docs-cn/commits?author=lxKylin
    `,
    badgeStyle: 'for-the-badge',
    outputFormat: 'html'
  },

  // 单个仓库测试
  singleRepo: {
    name: '单个仓库测试',
    description: '测试单个仓库的 PR 统计',
    prLinks: `https://github.com/vitejs/docs-cn/commits?author=lxKylin`,
    badgeStyle: 'social',
    outputFormat: 'markdown'
  },

  // Commits 统计测试
  commits: {
    name: 'Commits 统计测试',
    description: '测试 commits 链接的解析和统计',
    prLinks: `https://github.com/vitejs/docs-cn/commits?author=lxKylin
https://github.com/vitest-dev/docs-cn/commits?author=lxKylin`,
    badgeStyle: 'flat',
    outputFormat: 'markdown'
  },
  custom: {
    name: '自定义测试',
    description: '从环境变量读取配置进行测试',
    // 这些值会从环境变量中读取
    prLinks:
      process.env.TEST_PR_LINKS ||
      `https://github.com/vitejs/docs-cn/commits?author=lxKylin`,
    badgeStyle: process.env.BADGE_STYLE || 'flat',
    outputFormat: process.env.OUTPUT_FORMAT || 'markdown'
  },

  // 测试排除Merge commits功能
  excludeMerge: {
    name: '排除Merge Commits测试',
    description: '测试排除Merge commits后的统计结果',
    prLinks: `https://github.com/vitest-dev/docs-cn/commits?author=lxKylin`,
    badgeStyle: 'flat',
    outputFormat: 'markdown',
    includeMergeCommits: false // 新参数
  }
};

module.exports = testConfigs;
