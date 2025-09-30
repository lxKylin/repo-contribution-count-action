#!/usr/bin/env node

/**
 * 快速测试脚本 - 用于演示 Action 功能
 * 使用模拟数据，不需要真实的 GitHub API 调用
 */

const fs = require('fs');
const path = require('path');
const { BadgeGenerator } = require('../src/badge-generator');

console.log('🧪 GitHub Action 快速演示测试\n');

// 模拟 PR 和 Commits 统计数据
const mockRepoCounts = {
  'microsoft/vscode': 15, // PRs
  'facebook/react': 8,    // PRs  
  'nodejs/node': 5,       // PRs
  'kubernetes/kubernetes': 12 // PRs
};

const mockCommitCounts = {
  'vitejs/docs-cn': 23,
  'vuejs/vue': 8,
  'nodejs/node': 12,
  'microsoft/typescript': 6
};

// 创建输出目录
const outputDir = './test-output';
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// 测试不同的输出格式和样式
const testCases = [
  { format: 'markdown', style: 'flat', filename: 'demo-pr-flat', data: mockRepoCounts, type: 'PRs' },
  { format: 'markdown', style: 'flat-square', filename: 'demo-pr-flat-square', data: mockRepoCounts, type: 'PRs' },
  { format: 'markdown', style: 'for-the-badge', filename: 'demo-pr-for-the-badge', data: mockRepoCounts, type: 'PRs' },
  { format: 'html', style: 'flat', filename: 'demo-pr-html', data: mockRepoCounts, type: 'PRs' },
  { format: 'json', style: 'flat', filename: 'demo-pr-json', data: mockRepoCounts, type: 'PRs' },
  { format: 'markdown', style: 'flat', filename: 'demo-commits-flat', data: mockCommitCounts, type: 'commits' },
  { format: 'html', style: 'flat-square', filename: 'demo-commits-html', data: mockCommitCounts, type: 'commits' },
  { format: 'json', style: 'flat', filename: 'demo-commits-json', data: mockCommitCounts, type: 'commits' }
];

console.log('📊 模拟数据:');
console.log('PR 数据:');
Object.entries(mockRepoCounts).forEach(([repo, count]) => {
  console.log(`   ${repo}: ${count} PRs`);
});
console.log('Commits 数据:');
Object.entries(mockCommitCounts).forEach(([repo, count]) => {
  console.log(`   ${repo}: ${count} commits`);
});
console.log('');

testCases.forEach(({ format, style, filename, data, type }) => {
  console.log(`🎨 生成 ${format} 格式 (${style} 样式, ${type})...`);
  
  const badgeGenerator = new BadgeGenerator(style);
  const badges = badgeGenerator.generateBadges(data, format, type);
  
  // 确定文件扩展名
  const ext = format === 'json' ? 'json' : format === 'html' ? 'html' : 'md';
  const outputFile = path.join(outputDir, `${filename}.${ext}`);
  
  // 保存文件
  fs.writeFileSync(outputFile, badges);
  console.log(`   ✅ 保存到: ${outputFile}`);
});

// 生成表格格式
console.log('\n📋 生成表格格式...');
const badgeGenerator = new BadgeGenerator('flat');
const tableFormat = badgeGenerator.generateTableFormat(mockRepoCounts);
fs.writeFileSync(path.join(outputDir, 'demo-table.md'), tableFormat);
console.log(`   ✅ 保存到: ${path.join(outputDir, 'demo-table.md')}`);

// 生成完整报告
const report = `# 🚀 GitHub Action 演示报告

## 测试时间
${new Date().toLocaleString('zh-CN')}

## PR 统计摘要
总计在 ${Object.keys(mockRepoCounts).length} 个仓库中创建了 ${Object.values(mockRepoCounts).reduce((sum, count) => sum + count, 0)} 个 PR

## 📊 图标展示 (Markdown 格式)

${badgeGenerator.generateBadges(mockRepoCounts, 'markdown')}

## 📋 表格格式

${tableFormat}

## 🎨 不同样式预览

### Flat 样式
![microsoft/vscode](https://img.shields.io/badge/microsoft%2Fvscode-15%20PRs-brightgreen?style=flat)

### Flat Square 样式  
![microsoft/vscode](https://img.shields.io/badge/microsoft%2Fvscode-15%20PRs-brightgreen?style=flat-square)

### For The Badge 样式
![microsoft/vscode](https://img.shields.io/badge/microsoft%2Fvscode-15%20PRs-brightgreen?style=for-the-badge)

### Social 样式
![microsoft/vscode](https://img.shields.io/badge/microsoft%2Fvscode-15%20PRs-brightgreen?style=social)

## 📈 数据分析

| 仓库 | PR 数量 | 级别 |
|------|---------|------|
${Object.entries(mockRepoCounts)
  .sort(([,a], [,b]) => b - a)
  .map(([repo, count]) => {
    let level = '初级';
    if (count >= 15) level = '高级';
    else if (count >= 10) level = '中级';
    return `| ${repo} | ${count} | ${level} |`;
  }).join('\n')}

---
*此报告由 repo-pr-count-action 生成*
`;

fs.writeFileSync(path.join(outputDir, 'demo-report.md'), report);
console.log(`\n📝 完整报告保存到: ${path.join(outputDir, 'demo-report.md')}`);

console.log('\n🎉 演示测试完成！');
console.log(`📁 查看生成的文件: ${outputDir}/`);
console.log('\n生成的文件列表:');
fs.readdirSync(outputDir)
  .filter(file => file.startsWith('demo-'))
  .forEach(file => {
    console.log(`   📄 ${file}`);
  });

console.log('\n💡 提示:');
console.log('   1. 查看 demo-report.md 获取完整的演示效果');
console.log('   2. 使用 test-local/index.js 进行真实 API 测试');
console.log('   3. 设置 GITHUB_TOKEN 环境变量后可测试真实功能');