---
name: wechat-article-studio
description: 当用户要创作、改写、包装、预览或发布微信公众号文章时必须使用这个技能，尤其适用于技术知识短漫画、AI 资讯播报、开源项目介绍、去除 AI 写作痕迹、文章配图设计、image-gen 配图生成、Markdown 本地预览、公众号富文本排版、临时图床上传和发布前检查。用户说“写一篇公众号”“介绍这个项目”“做成漫画风格”“生成配图”“做公众号排版”“预览 Markdown”“上传图片到图床”“整理发布流程”“去 AI 味”时也要触发。
---

# 微信公众号文章工坊

这个技能用于把一次公众号文章创作固化成可重复执行的流程。目标不是只给一篇正文，而是留下一个完整的文章文件夹：思路、正文、发布注意事项、配图设计、实际图片、本地预览和需要时的公众号排版产物。

回复用户默认使用中文。除非用户明确要求，不要输出英文说明。

## 先读哪些资料

触发本技能后，根据任务读取这些文件：

- 做整篇文章：先读 `references/workflow.md`。
- 写正文、改正文或做发布前审稿：必须读 `references/humanizer-zh.md`。
- 涉及配图、漫画风格或 image-gen：再读 `references/image-prompts.md`。如果当前环境没有可用的 `image-gen` 工具，必须明确告诉用户“当前无法使用 image-gen，因此不会生成文章配图”，只写 `image-brief.md`，不要用其他图片工具替代。
- 要创建目录、预览、检查、公众号排版或图床上传：查看 `scripts/` 里的对应脚本说明，必要时读脚本源码。

## 标准产物

每篇文章一个目录，目录名使用当天日期和短主题：

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

可选生成物：

```text
preview.wechat.html
```

`article.md` 是正文源文件。默认情况下，正文图片应使用图床 URL；只有图床不可用时才保留本地路径。`preview.html`、`publish.wechat.html`、`image-host-manifest.json` 都是辅助产物，可以删除后重新生成。

## 固定工作步骤

1. 先理解选题。
   - 如果用户给了项目、新闻或知识点，直接推断一个文章角度。
   - 如果范围太大，只问一个短问题，不要连续追问。

2. 先查资料，再写正文。
   - 开源项目、AI 新闻、模型、产品功能、价格、政策、版本号、Star 数、发布时间都可能变化，必须联网核对。
   - 优先看官方来源：README、文档、Release、论文、博客、仓库源码。
   - 把核对时间、来源链接、关键事实、不能写死的信息写进 `writing-notes.md`。

3. 先写思路文档。
   - 明确读者是谁。
   - 写一句话观点。
   - 列出事实依据、表达方式、正文结构、标题备选。
   - 标出风险：版本变化、benchmark 不可泛化、截图/图床过期、外链限制。

4. 设计短漫画叙事。
   - 先找一个读者熟悉的小场景，例如“AI 在代码城市迷路”“开发者拿着地图找调用链”。
   - 每篇文章配图不少于 2 张。漫画风格文章按节奏决定张数，通常 3-5 张更自然。
   - 配图必须先写进 `image-brief.md`，再调用 image-gen。

5. 生成图片。
   - 所有新配图必须使用内置 `image-gen` 工具生成。
   - 如果当前环境没有 `image-gen`，要提示用户并跳过实际配图生成；仍然要完成 `image-brief.md`。
   - 调用 `image-gen` 时必须串行：先生成第 1 张，确认完成并保存文件后，再生成第 2 张。
   - 禁止在同一轮或同一次工具调用里并发请求多张图。生成失败时只重试当前这一张，不跳到下一张并发补位。
   - 图片统一放进 `images/`。
   - 文件名稳定、带序号，例如 `01-cover-code-city.png`。
   - 图片默认不强塞文字；根据文章上下文可以克制使用短标题、标牌、按钮词、气泡词或图解标签。
   - 精确长文案优先放正文或后期叠字，不交给 image-gen 硬生成；避免 logo、水印、品牌名、伪代码和密集小字。

6. 默认上传图片到图床。
   - 图片生成后默认运行 `scripts/upload-images.mjs` 上传正文引用的本地图片。
   - 上传成功后默认把 `article.md` 里的本地图片路径替换成图床 URL。
   - 如果所有可用图床都失败，才保留本地文件路径，并在 `publish-checklist.md` 写清楚原因。
   - 图床结果写入 `image-host-manifest.json`，方便后续追踪、重传或删除。

7. 写可发布正文。
   - 正文写进 `article.md`，不是提纲。
   - `article.md` 必须保留 Markdown 文章结构，不要写成纯文本口播稿。
   - 用短段落，技术点讲清楚，语气像真人作者。
   - 允许有轻微吐槽和个人想法，但事实要有依据。
   - 常规文章建议 1 个 `#` 主标题和 3-5 个 `##` 二级标题；短文可以更少，但不能一整篇只有一个标题和大量短句。
   - 根据题材调整结构：开源项目类写“它解决什么麻烦、怎么工作、适合谁、我的想法”；观点经验类写“卡在哪里、真正问题、可以怎么做、我的想法”。
   - 适当使用列表或引用块帮助扫读，但不要为了凑格式硬塞。
   - 默认使用图床 URL 引入图片，例如 `![封面图](https://example.com/image.png)`。
   - 只有图床不可用时才使用本地路径，例如 `![封面图](images/01-cover-code-city.png)`。
   - 图片 alt 要描述画面，例如 `![封面图：创作者面对空白文档和一堆教程](...)`；alt 只作为 Markdown 语义和可访问性文本，不在预览页或公众号 HTML 里渲染成图片下方说明。
   - 文章末尾如果附来源，使用纯文本，不使用 Markdown 超链接，例如 `官方文档：项目名 https://example.com/docs`。
   - 微信公众号不支持普通第三方外链跳转。不要把来源写成 `[说明](https://example.com/)`。

8. 做去 AI 味审稿。
   - 按 `references/humanizer-zh.md` 扫描正文。
   - 删除填充短语、宣传腔、宏大意义、模糊归因、通用乐观结尾。
   - 打破机械结构：连续相同句长、三段式、否定式排比、粗体标题列表。
   - 给正文保留个人想法、具体感受和必要怀疑。
   - 在 `writing-notes.md` 或 `publish-checklist.md` 里记录质量评分。

9. 写发布注意事项。
   - 标题候选、摘要、封面图、图片清单、来源链接、发布前要刷新的事实、公众号编辑器注意点都写进 `publish-checklist.md`。
   - 来源链接也必须使用纯文本格式，例如 `官方文档：项目名 https://example.com/docs`。
   - 发布稿里需要表达个人想法的区域，统一命名为“我的想法”，不要写成“我的判断”。
   - 如果使用临时图床，必须写明过期时间和发布前检查方式。

10. 渲染公众号富文本。
   - 公众号富文本 HTML 也是固定流程的一部分，默认运行 `scripts/render-wechat.mjs`。
   - 可用 `--theme` 指定主题，例如 `--theme coral-tab`、`--theme minimal-black`、`--theme blue-grid`。
   - 主题配置集中在 `scripts/lib/wechat-themes.mjs`，预览页和公众号复制都使用同一份主题配置。
   - 微信公众号更容易保留内联样式，不要依赖 class、外部 CSS 或 `<style>`。
   - 第三方平台复制出来的 HTML 只能当样式样本，要清理无效 CSS，再转成稳定模板。

11. 生成预览页面。
   - 使用 `scripts/build-preview.mjs` 生成或更新 `preview.html`。
   - 预览页是固定产物，不是可选项。
   - 页面必须能直接打开，左侧是 Markdown 源码，右侧是 Markdown 渲染后的样子。
   - 左侧源码编辑后，右侧预览和复制内容要跟随当前源码刷新。
   - 页面必须提供“复制 Markdown”按钮，复制左侧当前源码。
   - 页面顶部必须有样式下拉框，能实时切换 Markdown 预览风格。
   - “复制当前样式”必须复制当前下拉框对应的公众号内联样式 HTML，不能只切换本地 CSS。

12. 交付前检查。
    - 使用 `scripts/check-article.mjs`。
    - 使用 `scripts/check-ai-flavor.mjs` 扫描 AI 写作痕迹。
    - 检查必备文件、图片数量、图片路径、预览快照和正文是否一致。
    - Markdown 结构质量以警告为主：H2 太少、图片 alt 太泛、长文没有列表/引用、连续短句过多时提醒，但不要把所有文章锁成同一个模板。
    - 把无法验证的事项告诉用户。

## 可用脚本

从文章工作区根目录运行，脚本路径按实际安装位置调整。当前调试目录下可这样运行：

```bash
node _skills/wechat-article-studio/scripts/scaffold-article.mjs --title "文章标题" --slug short-topic
node _skills/wechat-article-studio/scripts/upload-images.mjs 2026-06-05-short-topic --provider temppic
node _skills/wechat-article-studio/scripts/render-wechat.mjs 2026-06-05-short-topic --theme coral-tab
node _skills/wechat-article-studio/scripts/build-preview.mjs 2026-06-05-short-topic
node _skills/wechat-article-studio/scripts/check-article.mjs 2026-06-05-short-topic
node _skills/wechat-article-studio/scripts/check-ai-flavor.mjs 2026-06-05-short-topic
```

脚本分工：

- `scaffold-article.mjs`：创建文章目录和四个 Markdown 文件。
- `build-preview.mjs`：从 `article.md` 生成本地 `preview.html`，左侧显示 Markdown 源码，右侧实时渲染预览，并复制当前主题的公众号 HTML。
- `render-wechat.mjs`：把 `article.md` 转成公众号可复制的内联样式 HTML，支持 `--theme`。
- `check-article.mjs`：检查文章目录是否完整，并检查来源是否误用了 Markdown 超链接。
- `check-ai-flavor.mjs`：扫描正文里的 AI 味词、公式结构和发布稿风险。
- `upload-images.mjs`：上传正文引用的本地图片，写入图床 manifest，并默认把 `article.md` 图片路径替换成线上 URL。
- `image-hosts/temppic.mjs`：已验证过的临时图床 provider，正式使用前仍要重新验证。

## 写作口味

文章要像作者本人在给读者讲清楚一件技术事。不要写成产品通稿。完整规则见 `references/humanizer-zh.md`。

五条硬规则：

- 删除填充短语和强调拐杖词。
- 打破公式结构，少用“不是……而是……”“不仅……而且……”。
- 变化句子节奏，不要连续三句长度和结构都相似。
- 信任读者，直接陈述事实，不反复铺垫和解释。
- 删除像海报金句一样的结尾，换成具体判断或下一步事实。

推荐写法：

- “AI 不怕代码多，它怕没路标。”
- “CodeGraph 更像仓库地铁图，不是自动改 bug 神器。”
- “这个数字挺诱人。但我的想法是：先把它理解成方向正确，不是装上就稳赢。”

避免写法：

- “该项目标志着代码理解领域的重要转折点。”
- “此外，它在不断演变的 AI 格局中发挥着至关重要的作用。”
- “这不仅是一个工具，更是一场范式革命。”

## 最终回复

完成后只做简短交付：

- 文章目录在哪里。
- 创建或更新了哪些文件。
- 逐个说明主要产物文件的作用：`writing-notes.md`、`article.md`、`publish-checklist.md`、`image-brief.md`、`images/`、`preview.html`、`publish.wechat.html`、`image-host-manifest.json`。
- 生成了几张图。
- 如果当前环境没有 `image-gen`，明确说明没有生成配图。
- 做过哪些检查。
- 哪些发布事项还需要人工确认。

不要在最终回复里整篇粘贴正文，除非用户明确要求。
