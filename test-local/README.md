# 本地测试指南

这个目录包含了用于本地测试 GitHub Action 的所有工具和配置。

## 🚀 快速开始

### 1. 立即体验（无需 GitHub Token）

如果你想快速看到 Action 的效果，可以运行演示测试：

```bash
npm run test:demo
```

这会使用模拟数据生成各种格式的输出文件，保存在 `test-output/` 目录中。

### 2. 完整功能测试（需要 GitHub Token）

#### 获取 GitHub Token

1. 访问 [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)
2. 点击 "Generate new token (classic)"
3. 设置权限：选择 `public_repo` （用于访问公共仓库）
4. 复制生成的 token

#### 设置环境变量

根目录下创建 `.env` 文件：

编辑 `.env` 文件，填入你的 GitHub Token：

```env
GITHUB_TOKEN=your_github_token_here
```

#### 运行测试

```bash
# 运行基础测试
npm run test:local basic

# 或者直接使用环境变量
GITHUB_TOKEN=your_token npm run test:local basic
```

## 📋 可用的测试配置

| 测试名称      | 描述           | 特点                              |
| ------------- | -------------- | --------------------------------- |
| `basic`       | 基础功能测试   | 使用公开的 PR 链接，Markdown 输出 |
| `multiFormat` | 多格式输出测试 | JSON 格式输出，flat-square 样式   |
| `styleTest`   | 图标样式测试   | HTML 输出，for-the-badge 样式     |
| `singleRepo`  | 单个仓库测试   | 测试单个仓库的处理                |
| `custom`      | 自定义测试     | 从环境变量读取配置                |

### 测试示例

```bash
# 基础测试
npm run test:local basic

# 测试 JSON 输出格式
npm run test:local multiFormat

# 测试不同图标样式
npm run test:local styleTest

# 自定义测试（使用环境变量配置）
TEST_PR_LINKS="https://github.com/your/repo/pull/123" npm run test:local custom
```

## 📁 输出文件

测试完成后，结果会保存在 `test-output/` 目录中：

```
test-output/
├── basic-2024-01-15T10-30-00-badges.md      # 生成的图标
├── basic-2024-01-15T10-30-00-data.json      # 详细数据
├── basic-2024-01-15T10-30-00-logs.txt       # 执行日志
└── basic-2024-01-15T10-30-00-report.md      # 完整报告
```

### 文件说明

- **`*-badges.md/html/json`**: 生成的图标内容
- **`*-data.json`**: 包含所有输出数据的 JSON 文件
- **`*-logs.txt`**: 测试过程中的日志信息
- **`*-report.md`**: 包含统计结果和图标预览的完整报告

## 🛠️ 高级配置

### 自定义测试配置

你可以在 `test-configs.js` 中添加自己的测试配置：

```javascript
// test-local/test-configs.js
const testConfigs = {
  // ... 现有配置

  myCustomTest: {
    name: '我的自定义测试',
    description: '测试我关心的仓库',
    prLinks: `https://github.com/my/repo1/pull/123
https://github.com/my/repo2/pull/456`,
    badgeStyle: 'flat-square',
    outputFormat: 'markdown'
  }
};
```

然后运行：

```bash
npm run test:local myCustomTest
```

### 环境变量配置

支持的环境变量：

```env
# 必需
GITHUB_TOKEN=your_github_token

# 可选 - 用于 custom 测试
TEST_PR_LINKS="https://github.com/owner/repo/pull/123"
BADGE_STYLE=flat
OUTPUT_FORMAT=markdown
OUTPUT_DIR=./my-test-output
```

## 🧪 测试场景

### 1. 开发调试

在开发过程中测试代码修改：

```bash
# 修改代码后重新构建
npm run build

# 运行快速测试验证功能
npm run test:demo
```

### 2. PR 验证

验证特定 PR 链接的处理：

```bash
GITHUB_TOKEN=your_token \
TEST_PR_LINKS="https://github.com/microsoft/vscode/pull/200000" \
npm run test:local custom
```

### 3. 输出格式测试

测试不同的输出格式和样式：

```bash
# 测试 JSON 输出
npm run test:local multiFormat

# 测试 HTML 输出
npm run test:local styleTest
```

### 4. 批量仓库测试

测试多个仓库的处理：

```bash
GITHUB_TOKEN=your_token \
TEST_PR_LINKS="https://github.com/facebook/react/pull/28000
https://github.com/microsoft/vscode/pull/200000
https://github.com/nodejs/node/pull/50000" \
BADGE_STYLE=for-the-badge \
npm run test:local custom
```

## 🐛 故障排除

### 常见问题

1. **API 限制错误**

   ```
   Error: API rate limit exceeded
   ```

   - 解决方案：等待一段时间后重试，或使用具有更高限制的 GitHub Token

2. **无效的 PR 链接**

   ```
   Error: 无效的 PR 链接格式
   ```

   - 检查 PR 链接格式是否正确
   - 确保链接可以访问

3. **Token 权限不足**

   ```
   Error: Bad credentials
   ```

   - 检查 GitHub Token 是否正确
   - 确保 Token 有 `public_repo` 权限

### 调试技巧

1. **查看详细日志**

   ```bash
   # 日志文件包含详细的执行信息
   cat test-output/*-logs.txt
   ```

2. **检查数据文件**

   ```bash
   # 查看原始数据
   cat test-output/*-data.json | jq .
   ```

3. **逐步调试**
   ```bash
   # 使用单个 PR 进行测试
   npm run test:local singleRepo
   ```

## 📚 相关文档

- [主要文档](../README.md) - 项目总体介绍
- [使用示例](../EXAMPLES.md) - 更多使用示例
- [GitHub Actions 文档](https://docs.github.com/en/actions) - 官方文档

## 🤝 贡献

如果你发现测试工具的问题或有改进建议，欢迎提交 Issue 或 PR！
