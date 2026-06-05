<div align="center">

# 微信公众号文章工坊

**用于创作、配图、预览和打包微信公众号文章的 Agent Skill。**

它面向技术科普、AI 资讯、开源项目介绍和短漫画风格公众号文章，固化一套从资料核对、正文写作、配图设计、image-gen 生成、图床上传、公众号排版到发布检查的流程。

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
- 临时图床 manifest
- 去 AI 味检查结果

它的流程比较明确：先查资料，再定文章角度；先写配图方案，再生成图片；所有新配图都必须使用 Codex 自带的 `image-gen`；图片默认上传图床，正文默认使用线上 URL；最后生成可切换样式的本地预览页和公众号可复制 HTML。

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
5. 在可用时用 `image-gen` 生成图片。
6. 默认把本地图片上传到临时图床。
7. 上传成功后，把正文图片路径替换成线上 URL。
8. 写 `article.md` 发布稿。
9. 做中文去 AI 味检查。
10. 渲染 `publish.wechat.html`。
11. 生成带样式下拉框和复制按钮的 `preview.html`。
12. 写 `publish-checklist.md`。

## 图片生成与图床

所有新配图都必须使用内置 `image-gen` 工具生成。这样图片来源可追踪，也能避免混入没有记录的网络图片。

默认图片流程：

- 如果 `image-gen` 可用，生成图片到 `images/`。
- 如果 `image-gen` 不可用，告诉用户并跳过图片生成。
- 图片生成后，运行 `scripts/upload-images.mjs` 上传。
- 上传脚本写入 `image-host-manifest.json`。
- 上传脚本默认把 `article.md` 里的本地图片路径替换成线上 URL。
- 只有没有可用图床时，才保留 `images/...` 本地路径。

当前内置临时图床 provider 是 `temppic.sinancode.com`。临时图床可能失效或过期，所以发布清单里要写明过期时间和发布前复查方式。

## 预览与公众号排版

每篇文章都应生成本地 `preview.html`。

预览页会：

- 作为静态 HTML 本地打开
- 渲染当前 Markdown 快照
- 提供样式下拉框，实时切换 Markdown 预览风格
- 提供“复制 Markdown”按钮
- 在 `publish.wechat.html` 存在时提供“复制公众号排版”按钮

公众号富文本输出使用内联样式，因为微信编辑器可能会丢弃 class、外部 CSS 或部分 `<style>`。

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
    ├── build-preview.mjs            # 生成可切换样式的 preview.html
    ├── check-article.mjs            # 检查文章包完整性
    ├── check-ai-flavor.mjs          # 扫描 AI 写作痕迹
    ├── image-hosts/                 # 可插拔图床 provider
    └── lib/                         # Markdown 和 humanizer 工具
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
