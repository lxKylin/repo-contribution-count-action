# 使用示例

这里展示一些 `repo-pr-count-action` 的实际使用示例。

## 示例 1: 基础统计

统计用户在几个主要开源项目中的 PR 数量：

```yaml
- name: 统计我的开源贡献
  uses: your-username/repo-pr-count-action@v1
  with:
    pr-links: |
      https://github.com/microsoft/vscode/pull/123456
      https://github.com/facebook/react/pull/78901
      https://github.com/nodejs/node/pull/23456
    github-token: ${{ secrets.GITHUB_TOKEN }}
```

**输出效果:**

![Total PRs](https://img.shields.io/badge/Total%20PRs-25%20in%203%20repos-yellow?style=flat)

[![microsoft/vscode PRs](https://img.shields.io/badge/microsoft%2Fvscode-15%20PRs-brightgreen?style=flat)](https://github.com/microsoft/vscode)

[![facebook/react PRs](https://img.shields.io/badge/facebook%2Freact-8%20PRs-brightgreen?style=flat)](https://github.com/facebook/react)

[![nodejs/node PRs](https://img.shields.io/badge/nodejs%2Fnode-2%20PRs-green?style=flat)](https://github.com/nodejs/node)

## 示例 2: 表格格式展示

使用 `generateTableFormat` 方法生成的表格样式：

| 仓库 | PR 数量 | 图标 |
|------|---------|------|
| [kubernetes/kubernetes](https://github.com/kubernetes/kubernetes) | 12 | ![kubernetes/kubernetes](https://img.shields.io/badge/kubernetes%2Fkubernetes-12%20PRs-brightgreen?style=flat) |
| [golang/go](https://github.com/golang/go) | 5 | ![golang/go](https://img.shields.io/badge/golang%2Fgo-5%20PRs-green?style=flat) |
| [docker/docker](https://github.com/docker/docker) | 3 | ![docker/docker](https://img.shields.io/badge/docker%2Fdocker-3%20PRs-green?style=flat) |
| **总计** | **20** | ![Total](https://img.shields.io/badge/Total%20PRs-20%20in%203%20repos-yellow?style=flat) |

## 示例 3: 不同样式的图标

### Flat Square 样式
```yaml
badge-style: 'flat-square'
```
![Example](https://img.shields.io/badge/example-10%20PRs-brightgreen?style=flat-square)

### For The Badge 样式
```yaml
badge-style: 'for-the-badge'
```
![Example](https://img.shields.io/badge/example-10%20PRs-brightgreen?style=for-the-badge)

### Social 样式
```yaml
badge-style: 'social'
```
![Example](https://img.shields.io/badge/example-10%20PRs-brightgreen?style=social)

## 示例 4: JSON 输出格式

当设置 `output-format: 'json'` 时，输出格式如下：

```json
[
  {
    "repository": "SUMMARY",
    "count": 25,
    "badgeUrl": "https://img.shields.io/badge/Total%20PRs-25%20in%203%20repos-yellow?style=flat",
    "repoUrl": null
  },
  {
    "repository": "microsoft/vscode",
    "count": 15,
    "badgeUrl": "https://img.shields.io/badge/microsoft%2Fvscode-15%20PRs-brightgreen?style=flat",
    "repoUrl": "https://github.com/microsoft/vscode"
  },
  {
    "repository": "facebook/react",
    "count": 8,
    "badgeUrl": "https://img.shields.io/badge/facebook%2Freact-8%20PRs-brightgreen?style=flat",
    "repoUrl": "https://github.com/facebook/react"
  },
  {
    "repository": "nodejs/node",
    "count": 2,
    "badgeUrl": "https://img.shields.io/badge/nodejs%2Fnode-2%20PRs-green?style=flat",
    "repoUrl": "https://github.com/nodejs/node"
  }
]
```

## 颜色说明

图标颜色会根据 PR 数量自动调整：

- 🔘 **lightgrey**: 0 个 PR
- 🟢 **green**: 1-5 个 PR  
- 🟢 **brightgreen**: 6-15 个 PR
- 🟡 **yellow**: 16-30 个 PR
- 🟠 **orange**: 31-50 个 PR
- 🔴 **red**: 50+ 个 PR

## 完整工作流示例

```yaml
name: 更新 PR 统计

on:
  schedule:
    - cron: '0 0 * * 0'  # 每周日更新
  workflow_dispatch:

jobs:
  update-pr-stats:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: 生成 PR 统计
        id: pr-stats
        uses: your-username/repo-pr-count-action@v1
        with:
          pr-links: |
            https://github.com/microsoft/vscode/pull/123456
            https://github.com/facebook/react/pull/78901
            https://github.com/nodejs/node/pull/23456
            https://github.com/kubernetes/kubernetes/pull/34567
          github-token: ${{ secrets.GITHUB_TOKEN }}
          badge-style: 'flat-square'
          output-format: 'markdown'

      - name: 更新 README
        run: |
          # 创建或更新 PR 统计文件
          cat > pr-stats.md << 'EOF'
          # 🚀 我的开源贡献统计
          
          ${{ steps.pr-stats.outputs.badges }}
          
          > ${{ steps.pr-stats.outputs.summary }}
          
          *最后更新时间: $(date "+%Y-%m-%d %H:%M:%S UTC")*
          EOF

      - name: 提交更新
        run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          git add pr-stats.md
          git commit -m "📊 更新 PR 统计 [skip ci]" || exit 0
          git push
```