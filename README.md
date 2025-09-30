# Repository Contribution Count Action

一个用于统计用户在指定仓库中 PR 或 Commits 数量并生成图标的 GitHub Action。

## 功能特性

- 📊 统计用户在多个仓库中的 PR 或 Commits 数量
- 🎨 生成美观的图标展示统计结果
- 🔗 支持批量输入 PR 链接或 Commits 链接
- 📝 支持多种输出格式（Markdown、HTML、JSON）
- 🎯 自动解析仓库信息和用户名
- 🌈 根据贡献数量自动选择图标颜色

## 输入参数

| 参数名          | 必需 | 默认值     | 说明                                                          |
| --------------- | ---- | ---------- | ------------------------------------------------------------- |
| `pr-links`      | ✅   | -          | PR 链接列表，用换行符分隔                                     |
| `github-token`  | ✅   | -          | GitHub token，用于访问 GitHub API                             |
| `badge-style`   | ❌   | `flat`     | 图标样式（flat, flat-square, plastic, for-the-badge, social） |
| `output-format` | ❌   | `markdown` | 输出格式（markdown, html, json）                              |

## 输出结果

| 输出名        | 说明                       |
| ------------- | -------------------------- |
| `badges`      | 生成的图标标记             |
| `summary`     | PR 统计摘要                |
| `repo-counts` | 各仓库 PR 数量的 JSON 格式 |

## 使用示例

### 基础用法

```yaml
name: Update PR Badges

on:
  schedule:
    - cron: '0 0 * * 0' # 每周更新一次
  workflow_dispatch: # 支持手动触发

jobs:
  update-badges:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Count PRs and Generate Badges
        id: pr-count
        uses: ./
        with:
          pr-links: |
            https://github.com/vitejs/docs-cn/commits?author=lxKylin
            https://github.com/vitest-dev/docs-cn/commits?author=lxKylin
            https://github.com/vitejs/docs-cn/pulls?q=is%3Apr+author%3AlxKylin
            https://github.com/element-plus/element-plus/commits?author=lxKylin
          github-token: ${{ secrets.GITHUB_TOKEN }}
          badge-style: 'flat-square'
          output-format: 'markdown'

      - name: Update README
        run: |
          echo "## 我的 PR 统计" >> PR_STATS.md
          echo "" >> PR_STATS.md
          echo "${{ steps.pr-count.outputs.badges }}" >> PR_STATS.md
          echo "" >> PR_STATS.md
          echo "📈 ${{ steps.pr-count.outputs.summary }}" >> PR_STATS.md
```

### 高级用法 - 自动更新个人资料

```yaml
name: Update Profile PR Stats

on:
  schedule:
    - cron: '0 6 * * 1' # 每周一早上 6 点更新
  workflow_dispatch:

jobs:
  update-profile:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Profile Repo
        uses: actions/checkout@v4
        with:
          repository: your-username/your-username
          token: ${{ secrets.PROFILE_TOKEN }}

      - name: Generate PR Statistics
        id: stats
        uses: lxKylin/repo-pr-count-action@v1
        with:
          pr-links: |
            https://github.com/vitejs/docs-cn/commits?author=lxKylin
            https://github.com/vitest-dev/docs-cn/commits?author=lxKylin
            https://github.com/vitejs/docs-cn/pulls?q=is%3Apr+author%3AlxKylin
            https://github.com/element-plus/element-plus/commits?author=lxKylin
          github-token: ${{ secrets.GITHUB_TOKEN }}
          badge-style: 'for-the-badge'
          output-format: 'markdown'

      - name: Update Profile README
        run: |
          # 更新 README.md 中的 PR 统计部分
          sed -i '/<!-- PR_STATS_START -->/,/<!-- PR_STATS_END -->/c\
          <!-- PR_STATS_START -->\
          ## 🚀 我的开源贡献\
          \
          ${{ steps.stats.outputs.badges }}\
          \
          > ${{ steps.stats.outputs.summary }}\
          \
          *最后更新: $(date "+%Y-%m-%d %H:%M:%S")*\
          <!-- PR_STATS_END -->' README.md

      - name: Commit and Push
        run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          git add README.md
          git commit -m "📊 更新 PR 统计数据" || exit 0
          git push
```

## 支持的 PR 链接格式

Action 支持多种 PR 链接格式：

1. **具体的 PR 链接**（推荐）

   ```
   https://github.com/vitejs/docs-cn/commits?author=lxKylin
   ```

2. **搜索链接**（包含作者信息）
   ```
   https://github.com/owner/repo/pulls?q=is%3Apr+author%3Ausername
   ```

## 图标样式

支持 shields.io 的所有样式：

- `flat` - 扁平样式（默认）
- `flat-square` - 扁平方形
- `plastic` - 塑料质感
- `for-the-badge` - 大型徽章
- `social` - 社交样式

## 输出格式示例

### Markdown 格式

```markdown
![Total PRs](https://img.shields.io/badge/Total%20PRs-25%20in%203%20repos-brightgreen?style=flat)

[![microsoft/vscode PRs](https://img.shields.io/badge/microsoft%2Fvscode-15%20PRs-brightgreen?style=flat)](https://github.com/microsoft/vscode)

[![facebook/react PRs](https://img.shields.io/badge/facebook%2Freact-8%20PRs-green?style=flat)](https://github.com/facebook/react)

[![vercel/next.js PRs](https://img.shields.io/badge/vercel%2Fnext.js-2%20PRs-green?style=flat)](https://github.com/vercel/next.js)

[![vitejs/docs-cn PRs](https://img.shields.io/static/v1?label=vitejs%2Fdocs-cn&message=31+PRs&color=orange&style=flat)](https://github.com/vitejs/docs-cn)

[![vitest-dev/docs-cn PRs](https://img.shields.io/static/v1?label=vitest-dev%2Fdocs-cn&message=54+PRs&color=red&style=flat)](https://github.com/vitest-dev/docs-cn)
```

![Total PRs](https://img.shields.io/badge/Total%20PRs-25%20in%203%20repos-brightgreen?style=flat)

[![microsoft/vscode PRs](https://img.shields.io/badge/microsoft%2Fvscode-15%20PRs-brightgreen?style=flat)](https://github.com/microsoft/vscode)

[![facebook/react PRs](https://img.shields.io/badge/facebook%2Freact-8%20PRs-green?style=flat)](https://github.com/facebook/react)

[![vercel/next.js PRs](https://img.shields.io/badge/vercel%2Fnext.js-2%20PRs-green?style=flat)](https://github.com/vercel/next.js)

[![vitejs/docs-cn PRs](https://img.shields.io/static/v1?label=vitejs%2Fdocs-cn&message=31+PRs&color=orange&style=flat)](https://github.com/vitejs/docs-cn)

[![vitest-dev/docs-cn PRs](https://img.shields.io/static/v1?label=vitest-dev%2Fdocs-cn&message=54+PRs&color=red&style=flat)](https://github.com/vitest-dev/docs-cn)

### HTML 格式

```html
<img
  src="https://img.shields.io/badge/Total%20PRs-25%20in%203%20repos-brightgreen?style=flat"
  alt="Total PRs"
/>
<a href="https://github.com/microsoft/vscode">
  <img
    src="https://img.shields.io/badge/microsoft%2Fvscode-15%20PRs-brightgreen?style=flat"
    alt="microsoft/vscode PRs"
  />
</a>
<a href="https://github.com/facebook/react">
  <img
    src="https://img.shields.io/badge/facebook%2Freact-8%20PRs-green?style=flat"
    alt="facebook/react PRs"
  />
</a>
<a href="https://github.com/vercel/next.js">
  <img
    src="https://img.shields.io/badge/vercel%2Fnext.js-2%20PRs-green?style=flat"
    alt="vercel/next.js PRs"
  />
</a>
<a href="https://github.com/vitejs/docs-cn">
  <img
    src="https://img.shields.io/static/v1?label=vitejs%2Fdocs-cn&message=31+PRs&color=orange&style=flat"
    alt="vitejs/docs-cn PRs"
  />
</a>
<a href="https://github.com/vitest-dev/docs-cn">
  <img
    src="https://img.shields.io/static/v1?label=vitest-dev%2Fdocs-cn&message=54+PRs&color=red&style=flat"
    alt="vitest-dev/docs-cn PRs"
  />
</a>
```

<img
  src="https://img.shields.io/badge/Total%20PRs-25%20in%203%20repos-brightgreen?style=flat"
  alt="Total PRs"
/>
<a href="https://github.com/microsoft/vscode">
<img
    src="https://img.shields.io/badge/microsoft%2Fvscode-15%20PRs-brightgreen?style=flat"
    alt="microsoft/vscode PRs"
  />
</a>
<a href="https://github.com/facebook/react">
<img
    src="https://img.shields.io/badge/facebook%2Freact-8%20PRs-green?style=flat"
    alt="facebook/react PRs"
  />
</a>
<a href="https://github.com/vercel/next.js">
<img
    src="https://img.shields.io/badge/vercel%2Fnext.js-2%20PRs-green?style=flat"
    alt="vercel/next.js PRs"
  />
</a>
<a href="https://github.com/vitejs/docs-cn">
<img
    src="https://img.shields.io/static/v1?label=vitejs%2Fdocs-cn&message=31+PRs&color=orange&style=flat"
    alt="vitejs/docs-cn PRs"
  />
</a>
<a href="https://github.com/vitest-dev/docs-cn">
<img
    src="https://img.shields.io/static/v1?label=vitest-dev%2Fdocs-cn&message=54+PRs&color=red&style=flat"
    alt="vitest-dev/docs-cn PRs"
  />
</a>

### JSON 格式

```json
[
  {
    "repository": "SUMMARY",
    "count": 25,
    "badgeUrl": "https://img.shields.io/badge/Total%20PRs-25%20in%203%20repos-brightgreen?style=flat",
    "repoUrl": null
  },
  {
    "repository": "microsoft/vscode",
    "count": 15,
    "badgeUrl": "https://img.shields.io/badge/microsoft%2Fvscode-15%20PRs-brightgreen?style=flat",
    "repoUrl": "https://github.com/microsoft/vscode"
  }
]
```

### 其他示例

[其他图标样式示例](./EXAMPLES.md)

## 开发和贡献

### 本地测试

我们提供了完整的本地测试工具，让您可以在本地验证 Action 的功能：

#### 🚀 快速体验（无需 Token）

```bash
# 立即查看 Action 效果（使用模拟数据）
npm run test:demo
```

这会生成各种格式的演示文件到 `test-output/` 目录。

#### 🧪 完整功能测试（需要 GitHub Token）

1. **获取 GitHub Token**
   - 访问 [GitHub Settings > Personal access tokens](https://github.com/settings/tokens)
   - 创建 token 并选择 `public_repo` 权限

2. **运行测试**

   ```bash
   # 基础测试
   GITHUB_TOKEN=your_token npm run test:local basic

   # 自定义 PR 链接测试
   GITHUB_TOKEN=your_token \
   TEST_PR_LINKS="https://github.com/vitejs/docs-cn/commits?author=lxKylin" \
   npm run test:local custom
   ```

3. **查看结果**
   测试结果会保存在 `test-output/` 目录中，包括：
   - 生成的图标文件
   - 详细的 JSON 数据
   - 完整的测试报告

#### 📋 可用测试

| 测试名称      | 描述           |
| ------------- | -------------- |
| `basic`       | 基础功能测试   |
| `multiFormat` | 多格式输出测试 |
| `styleTest`   | 图标样式测试   |
| `custom`      | 自定义配置测试 |

详细的本地测试指南请查看 [test-local/README.md](test-local/README.md)。

### 本地开发

1. 克隆仓库

   ```bash
   git clone https://github.com/your-username/repo-pr-count-action.git
   cd repo-pr-count-action
   ```

2. 安装依赖

   ```bash
   pnpm install
   ```

3. 运行测试

   ```bash
   pnpm test test:local
   ```

4. 构建项目
   ```bash
   pnpm run build
   ```

### 项目结构

```
.
├── action.yml              # Action 配置文件
├── package.json            # Node.js 项目配置
├── src/                    # 源代码目录
│   ├── index.js           # 主入口文件
│   ├── pr-counter.js      # PR 统计逻辑
│   └── badge-generator.js # 图标生成逻辑
├── dist/                  # 构建输出目录
├── __tests__/             # 测试文件目录
└── README.md              # 项目文档
```

## API 限制说明

- 该 Action 使用 GitHub API 获取 PR 信息
- 默认的 `GITHUB_TOKEN` 有一定的 API 调用限制
- 对于大量仓库的统计，建议添加适当的延迟
- 建议在 Action 中缓存结果，避免频繁调用

## 常见问题

### Q: 为什么我的 PR 数量显示为 0？

A: 请检查：

1. GitHub token 是否有足够的权限
2. PR 链接格式是否正确
3. 仓库是否为私有仓库（需要相应权限）

### Q: 支持私有仓库吗？

A: 支持，但需要使用有相应权限的 GitHub token。

### Q: 如何自定义图标颜色？

A: 目前图标颜色根据 PR 数量自动确定，后续版本会支持自定义颜色。

## 许可证

本项目使用 MIT 许可证。详见 [LICENSE](LICENSE) 文件。

## 致谢

- 感谢 [shields.io](https://shields.io) 提供图标服务
- 感谢 [GitHub Actions](https://github.com/features/actions) 平台
