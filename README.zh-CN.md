<div align="center">

# 微信公众号文章工坊

**用于创作、配图、预览和打包微信公众号文章的 Agent Skill。**

它面向技术科普、AI 资讯、开源项目介绍和短漫画风格公众号文章，固化一套从资料核对、正文写作、配图设计、image-gen 生成、图片托管、公众号排版到发布检查的流程。

[English](./README.md) · [Roadmap](./ROADMAP.md) · [Skill 入口](./skills/wechat-article-studio/SKILL.md) · [预览壳](./skills/wechat-article-studio/assets/previews/index.html) · [工作流](./skills/wechat-article-studio/references/workflow.md)

[![Agent Skill](https://img.shields.io/badge/Agent%20Skill-wechat--article--studio-35B378)](./skills/wechat-article-studio/SKILL.md)
[![WeChat Workflow](https://img.shields.io/badge/workflow-article%20studio-111827)](./skills/wechat-article-studio/references/workflow.md)
[![License: MIT](https://img.shields.io/badge/license-MIT-10B981)](./LICENSE)

</div>

---

## 这是什么？

微信公众号文章工坊是一个给 Agent 使用的写作与发布 Skill，适合经常写技术公众号、AI 资讯和开源项目介绍的作者。

它不是只让 Agent 输出一段正文，而是让每篇文章都形成一个完整文件夹：

- 编写思路
- 可发布 Markdown 正文
- 发布注意事项
- 配图设计文案
- 漫画风格生成图
- 本地预览页
- 公众号富文本 HTML
- 图片托管 manifest
- 去 AI 味检查结果

它的流程比较明确：先查资料，再定文章角度；先写配图方案，再逐张生成图片；所有新配图都必须使用 Codex 自带的 `image-gen`，并且禁止并发生成；图片默认上传到可配置的托管服务，正文默认使用线上 URL；最后生成左侧 Markdown 源码、右侧渲染预览的本地工作台和公众号可复制 HTML。

如果当前环境没有 `image-gen`，Skill 必须告诉用户“当前无法使用 image-gen，因此不会生成文章配图”。这时只写 `image-brief.md`，不使用图片搜索或其他生成工具替代。

## 安装

本项目以 Agent Skill 形式分发，发布或本地 clone 后可通过 `skills` CLI 安装。

> 命令是复数 `npx skills`。

### Codex

```bash
npx skills add https://github.com/kuschzzp/wechat-article-studio -g --skill wechat-article-studio -a codex
```

### Claude Code

```bash
npx skills add https://github.com/kuschzzp/wechat-article-studio -g --skill wechat-article-studio -a claude-code
```

### OpenCode

```bash
npx skills add https://github.com/kuschzzp/wechat-article-studio -g --skill wechat-article-studio -a opencode
```

### 多客户端同时安装

```bash
npx skills add https://github.com/kuschzzp/wechat-article-studio -g --skill wechat-article-studio -a codex -a claude-code -a opencode
```

### 从本地仓库安装

```bash
npx skills add ./ -g --skill wechat-article-studio -a codex
```

### 更新已安装的 Skill

```bash
npx skills update wechat-article-studio -g -y
```

项目级安装使用：

```bash
npx skills update wechat-article-studio -p -y
```

## 快速开始

安装后，可以这样让 Agent 使用：

```text
Use $wechat-article-studio to write a WeChat article introducing this GitHub project.
Use wechat-article-studio to turn this AI news into a short comic-style article.
用 wechat-article-studio 写一篇技术公众号文章，带配图、预览页和发布注意事项。
用 wechat-article-studio 介绍这个开源项目，并默认把图片上传到图床。
```

Skill 会引导 Agent：

1. 先核对容易变化的事实。
2. 创建单篇文章目录。
3. 写 `writing-notes.md`。
4. 在 `image-brief.md` 里规划漫画风格配图。
5. 在可用时用 `image-gen` 按顺序逐张生成图片。
6. 默认把本地图片上传到可配置的图片托管服务。
7. 上传成功后，把正文图片路径替换成线上 URL。
8. 写保留 Markdown 骨架的 `article.md` 发布稿。
9. 做中文去 AI 味检查。
10. 按所选主题渲染 `publish.wechat.html`。
11. 生成左侧源码、右侧渲染预览的 `preview.html`，并保留样式下拉框和复制按钮。
12. 写 `publish-checklist.md`。

## 图片生成与托管

所有新配图都必须使用内置 `image-gen` 工具生成。这样图片来源可追踪，也能避免混入没有记录的网络图片。

默认图片流程：

- 如果 `image-gen` 可用，生成图片到 `images/`。
- 多张图片必须按 `image-brief.md` 的顺序一张一张生成，禁止在同一轮里并发调用 `image-gen`。
- 图片文字按上下文克制使用：可以有短标题、标牌、按钮词、气泡词或图解标签，但长文案和精确文字优先放正文或后期叠字。
- 如果 `image-gen` 不可用，告诉用户并跳过图片生成。
- 图片生成后，运行 `scripts/upload-images.mjs` 上传。
- 上传脚本写入 `image-host-manifest.json`。
- 上传脚本默认把 `article.md` 里的本地图片路径替换成线上 URL。
- 只有没有可用托管服务时，才保留 `images/...` 本地路径。

当前内置 provider 是 `temppic.sinancode.com`，用于演示和调试图片上传流程。正式发布时，可以替换或新增更稳定的 provider；单篇文章的外链检查细节由 Skill 写入 `publish-checklist.md`。

## 预览与公众号排版

每篇文章都应生成本地 `preview.html`。

预览页会：

- 作为静态 HTML 本地打开
- 左侧显示可编辑的 Markdown 源码
- 右侧实时渲染当前 Markdown 内容
- 提供样式下拉框，实时切换 Markdown 预览风格和公众号复制风格
- 提供“复制 Markdown”按钮，复制左侧当前源码
- 提供“复制当前样式”按钮，复制当前主题对应的公众号内联样式 HTML

公众号富文本输出使用内联样式，因为微信编辑器可能会丢弃 class、外部 CSS 或部分 `<style>`。
当前内置主题包括 `coral-tab`、`minimal-black` 和 `blue-grid`，默认仍然使用 `coral-tab`。`scripts/render-wechat.mjs` 支持用 `--theme` 指定主题，`preview.html` 会用同一套主题配置生成复制内容。

完成一篇文章后，Skill 的交付回复会说明每个主要文件的作用，方便作者知道哪些文件用于写作、预览、复制、图床追踪和发布检查。

正文结构检查以提醒为主。它会提示二级标题太少、图片 alt 太泛、长文缺少列表或引用等问题，但不会把所有文章强行锁成同一个模板。

## 参考链接格式

正文和发布清单里的资料来源统一使用纯文本 URL。微信公众号普通第三方链接不能直接跳转，所以不要写成 Markdown 超链接：

```markdown
- GitHub 仓库：项目名 https://github.com/example/project
- 官方文档：项目名 https://example.com/docs
```

不要写 `[项目地址](https://example.com)` 这类 Markdown 超链接。`scripts/check-article.mjs` 会检查正文和发布清单里的这类问题。

图片 alt 文本只用于 Markdown 语义和可访问性，不会在预览页或公众号 HTML 里渲染成图片下方说明。

## 包含什么？

```text
skills/wechat-article-studio/
├── SKILL.md                         # Skill 入口
├── agents/
│   └── openai.yaml                  # Agent 元数据
├── assets/
│   └── previews/
│       └── index.html               # 工作流静态预览壳
├── references/
│   ├── workflow.md                  # 文章生产工作流
│   ├── image-prompts.md             # 漫画风格配图提示词
│   └── humanizer-zh.md              # 中文去 AI 味写作规则
└── scripts/
    ├── scaffold-article.mjs         # 创建文章目录
    ├── upload-images.mjs            # 上传图片并回写正文 URL
    ├── render-wechat.mjs            # 渲染公众号内联样式 HTML
    ├── build-preview.mjs            # 生成左右分栏、可切换样式的 preview.html
    ├── check-article.mjs            # 检查文章包完整性
    ├── check-ai-flavor.mjs          # 扫描 AI 写作痕迹
    ├── image-hosts/                 # 可插拔图片托管 provider
    └── lib/                         # Markdown、主题和 humanizer 工具
```

## 单篇文章目录

```text
YYYY-MM-DD-short-topic/
├── writing-notes.md
├── article.md
├── publish-checklist.md
├── image-brief.md
├── preview.html
├── publish.wechat.html
├── image-host-manifest.json
└── images/
```

`article.md` 是正文源文件。`preview.html`、`publish.wechat.html`、`image-host-manifest.json` 是辅助产物，可以重新生成。

## 开发

运行检查：

```bash
npm run check
```

启动本地静态预览服务：

```bash
npm run preview:serve
```

然后打开：

```text
http://127.0.0.1:<port>/assets/previews/
```

打包验证：

```bash
npm pack --dry-run
```

## 开源协议

MIT
