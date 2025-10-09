const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs');
const path = require('path');

// 模拟 GitHub Actions 的 core 模块
class MockCore {
  constructor() {
    this.inputs = {};
    this.outputs = {};
    this.logs = [];
  }

  getInput(name, options = {}) {
    const value = this.inputs[name];
    if (options.required && !value) {
      throw new Error(`Input required and not supplied: ${name}`);
    }
    return value || '';
  }

  setOutput(name, value) {
    this.outputs[name] = value;
    console.log(`🔧 Output: ${name} = ${value}`);
  }

  info(message) {
    console.log(`ℹ️  ${message}`);
    this.logs.push({ level: 'info', message });
  }

  warning(message) {
    console.log(`⚠️  ${message}`);
    this.logs.push({ level: 'warning', message });
  }

  setFailed(message) {
    console.error(`❌ ${message}`);
    this.logs.push({ level: 'error', message });
    throw new Error(message);
  }

  // 设置输入参数的方法
  setInput(name, value) {
    this.inputs[name] = value;
  }

  // 获取所有输出
  getOutputs() {
    return this.outputs;
  }

  // 获取所有日志
  getLogs() {
    return this.logs;
  }
}

// 创建模拟的 core 实例
const mockCore = new MockCore();

// 导入我们的主要逻辑
const { PrCounter } = require('../src/pr-counter');
const { BadgeGenerator } = require('../src/badge-generator');

async function runLocalTest(testConfig) {
  console.log('🚀 开始本地测试 GitHub Action...\n');

  try {
    // 设置输入参数
    mockCore.setInput('pr-links', testConfig.prLinks);
    mockCore.setInput('github-token', testConfig.githubToken);
    mockCore.setInput('badge-style', testConfig.badgeStyle || 'flat');
    mockCore.setInput('output-format', testConfig.outputFormat || 'markdown');

    console.log('📝 测试配置:');
    console.log(
      `   PR 链接数量: ${testConfig.prLinks.split('\n').filter((l) => l.trim()).length}`
    );
    console.log(`   图标样式: ${testConfig.badgeStyle || 'flat'}`);
    console.log(`   输出格式: ${testConfig.outputFormat || 'markdown'}\n`);

    // 模拟 GitHub API 调用（使用真实的 API）
    const octokit = github.getOctokit(testConfig.githubToken);

    // 解析 PR 链接
    const linksList = testConfig.prLinks
      .split('\n')
      .filter((link) => link.trim());
    mockCore.info(`发现 ${linksList.length} 个 PR 链接`);

    console.log('linksList', linksList);

    // 统计 PR 数量
    const prCounter = new PrCounter(octokit);
    const repoCounts = await prCounter.countPRsByRepository(linksList);

    mockCore.info('PR 统计完成:');
    for (const [repo, count] of Object.entries(repoCounts)) {
      mockCore.info(`${repo}: ${count} PRs`);
    }

    // 生成图标
    const badgeGenerator = new BadgeGenerator(testConfig.badgeStyle || 'flat');
    const badges = badgeGenerator.generateBadges(
      repoCounts,
      testConfig.outputFormat || 'markdown'
    );

    // 生成摘要
    const totalPRs = Object.values(repoCounts).reduce(
      (sum, count) => sum + count,
      0
    );
    const summary = `总计在 ${Object.keys(repoCounts).length} 个仓库中创建了 ${totalPRs} 个 PR`;

    // 设置输出
    mockCore.setOutput('badges', badges);
    mockCore.setOutput('summary', summary);
    mockCore.setOutput('repo-counts', JSON.stringify(repoCounts));

    console.log('\n✅ 测试执行成功！');
    return {
      success: true,
      outputs: mockCore.getOutputs(),
      logs: mockCore.getLogs(),
      repoCounts
    };
  } catch (error) {
    mockCore.setFailed(`测试执行失败: ${error.message}`);
    return {
      success: false,
      error: error.message,
      logs: mockCore.getLogs()
    };
  }
}

module.exports = { runLocalTest, MockCore };
