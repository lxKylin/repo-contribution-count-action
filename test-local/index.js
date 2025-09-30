#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '../.env') })

const { runLocalTest } = require('./local-test-runner')
const testConfigs = require('./test-configs')

// 输出文件保存功能
class OutputManager {
  constructor(outputDir = './test-output') {
    this.outputDir = outputDir
    this.ensureOutputDir()
  }

  ensureOutputDir() {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true })
    }
  }

  saveTestResult(testName, result) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const fileName = `${testName}-${timestamp}`

    // 保存主要输出文件
    if (result.success && result.outputs) {
      // 保存图标输出
      if (result.outputs.badges) {
        const ext = this.getFileExtension(result.outputs)
        fs.writeFileSync(
          path.join(this.outputDir, `${fileName}-badges.${ext}`),
          result.outputs.badges
        )
      }

      // 保存JSON格式的详细数据
      fs.writeFileSync(
        path.join(this.outputDir, `${fileName}-data.json`),
        JSON.stringify(
          {
            testName,
            timestamp: new Date().toISOString(),
            outputs: result.outputs,
            repoCounts: result.repoCounts,
            success: result.success
          },
          null,
          2
        )
      )

      // 保存摘要报告
      console.log('result', result)
      this.generateReport(fileName, result)
    }

    // 保存日志文件
    if (result.logs) {
      fs.writeFileSync(
        path.join(this.outputDir, `${fileName}-logs.txt`),
        result.logs
          .map((log) => `[${log.level.toUpperCase()}] ${log.message}`)
          .join('\n')
      )
    }

    console.log(`📁 测试结果已保存到: ${this.outputDir}`)
    console.log(`   文件前缀: ${fileName}`)
  }

  getFileExtension(outputs) {
    const badges = outputs.badges || ''
    if (badges.includes('<img') || badges.includes('<a')) return 'html'
    if (badges.startsWith('[') || badges.startsWith('{')) return 'json'
    return 'md'
  }

  generateReport(fileName, result) {
    const report = `# PR 统计测试报告

## 测试信息
- 测试时间: ${new Date().toLocaleString('zh-CN')}
- 测试状态: ${result.success ? '✅ 成功' : '❌ 失败'}

## 统计结果
${result.outputs.summary}

## 仓库详情
${Object.entries(result.repoCounts || {})
  .map(([repo, count]) => `- **${repo}**: ${count} PRs`)
  .join('\n')}

## 生成的图标
${result.outputs.badges}

## 原始数据
\`\`\`json
${result.outputs['repo-counts']}
\`\`\`

---
*报告生成时间: ${new Date().toISOString()}*
`

    fs.writeFileSync(path.join(this.outputDir, `${fileName}-report.md`), report)
  }
}

// 主测试函数
async function runTests() {
  console.log('🧪 GitHub Action 本地测试工具\n')

  // 检查 GitHub Token
  const githubToken = process.env.GITHUB_TOKEN
  if (!githubToken) {
    console.error('❌ 错误: 未找到 GITHUB_TOKEN 环境变量\n')
    console.log('🔧 解决方案:')
    console.log('1. 创建 GitHub Token:')
    console.log('   访问: https://github.com/settings/tokens')
    console.log('   权限: 选择 "public_repo"\n')
    console.log('2. 配置环境变量:')
    console.log(
      '   方法一: 编辑根目录的 .env 文件，设置 GITHUB_TOKEN=your_token'
    )
    console.log(
      '   方法二: 使用命令行: GITHUB_TOKEN=your_token pnpm run test:local [test_name]\n'
    )
    console.log('💡 快速体验（无需 token）:')
    console.log('   运行: pnpm run test:demo')
    console.log('   这会使用模拟数据展示 Action 效果\n')
    process.exit(1)
  }

  // 获取命令行参数
  const testName = process.argv[2] || 'basic'
  const outputDir = process.env.OUTPUT_DIR || './test-output'

  // 验证测试配置
  if (!testConfigs[testName]) {
    console.error(`❌ 错误: 未找到测试配置 "${testName}"`)
    console.log('可用的测试配置:')
    Object.keys(testConfigs).forEach((name) => {
      console.log(`  - ${name}: ${testConfigs[name].description}`)
    })
    process.exit(1)
  }

  const config = { ...testConfigs[testName], githubToken }
  console.log('🚀 配置:', config)
  const outputManager = new OutputManager(outputDir)

  console.log(`📋 运行测试: ${config.name}`)
  console.log(`📝 描述: ${config.description}\n`)

  try {
    // 运行测试
    const result = await runLocalTest(config)

    // 保存结果
    outputManager.saveTestResult(testName, result)

    // 显示结果
    if (result.success) {
      console.log('\n🎉 测试完成! 结果预览:')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log(result.outputs.badges)
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log(`📊 ${result.outputs.summary}`)
    } else {
      console.log(`\n💥 测试失败: ${result.error}`)
    }
  } catch (error) {
    console.error(`\n💥 测试执行异常: ${error.message}`)
    process.exit(1)
  }
}

// 显示帮助信息
function showHelp() {
  console.log(`
🧪 GitHub Action 本地测试工具

用法:
  pnpm run test:local [test_name]
  # 或者
  node test-local/index.js [test_name]

可用的测试配置:
${Object.entries(testConfigs)
  .map(([name, config]) => `  ${name.padEnd(12)} - ${config.description}`)
  .join('\n')}

环境变量 (.env 文件或命令行):
  GITHUB_TOKEN    GitHub API token (必需)
  OUTPUT_DIR      输出目录 (默认: ./test-output)
  TEST_PR_LINKS   自定义 PR 链接 (用于 custom 测试)
  BADGE_STYLE     图标样式 (用于 custom 测试)
  OUTPUT_FORMAT   输出格式 (用于 custom 测试)

示例:
  # 快速演示 (无需 token)
  pnpm run test:demo

  # 运行基础测试
  GITHUB_TOKEN=your_token pnpm run test:local basic

  # 运行自定义测试
  GITHUB_TOKEN=your_token TEST_PR_LINKS="https://github.com/owner/repo/pull/123" pnpm run test:local custom

  # 查看帮助
  pnpm run test:local --help

🔗 获取 GitHub Token: https://github.com/settings/tokens
`)
}

// 主程序入口
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  showHelp()
} else {
  runTests().catch((error) => {
    console.error('\n💥 测试执行失败:')
    console.error(error.message)
    console.log('\n💡 提示: 运行 "pnpm run test:local --help" 查看使用帮助')
    process.exit(1)
  })
}
