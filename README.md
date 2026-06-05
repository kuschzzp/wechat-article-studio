<div align="center">

# WeChat Article Studio

**An Agent Skill for writing, illustrating, previewing, and packaging WeChat Official Account articles.**

Build technical explainers, AI news posts, and short comic-style WeChat articles with a repeatable folder workflow, image briefs, generated illustrations, Markdown preview, WeChat rich-text rendering, image hosting, and pre-publish checks.

[简体中文](./README.zh-CN.md) · [Roadmap](./ROADMAP.md) · [Skill Entry](./skills/wechat-article-studio/SKILL.md) · [Preview Shell](./skills/wechat-article-studio/assets/previews/index.html) · [Workflow](./skills/wechat-article-studio/references/workflow.md)

[![Agent Skill](https://img.shields.io/badge/Agent%20Skill-wechat--article--studio-35B378)](./skills/wechat-article-studio/SKILL.md)
[![WeChat Workflow](https://img.shields.io/badge/workflow-article%20studio-111827)](./skills/wechat-article-studio/references/workflow.md)
[![License: MIT](https://img.shields.io/badge/license-MIT-10B981)](./LICENSE)

</div>

---

## What Is WeChat Article Studio?

WeChat Article Studio is an Agent Skill for creators who publish WeChat Official Account articles about technology, open-source projects, and AI news.

It turns article creation into a structured package:

- writing notes
- publishable Markdown
- publish checklist
- image design brief
- generated comic-style images
- local preview page with style switching
- WeChat rich-text HTML
- image-host manifest
- AI-flavor writing checks

The Skill is opinionated about process. It asks the agent to research first, draft with a human voice, design images before generating them, use Codex `image-gen` for all new illustrations, generate images one at a time with no concurrent image requests, upload article images to a configurable image host by default, and generate a split preview workspace that can copy both Markdown and WeChat-ready rich text.

If `image-gen` is not available in the current environment, the Skill must tell the user that images will not be generated. It should still create the image brief, but should not replace image generation with search results or another image tool.

## Install

The package is distributed as an Agent Skill and can be installed with the `skills` CLI after you publish or clone the repository.

> The command is `npx skills`, plural.

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

### Multiple Clients

```bash
npx skills add https://github.com/kuschzzp/wechat-article-studio -g --skill wechat-article-studio -a codex -a claude-code -a opencode
```

### Local Checkout

```bash
npx skills add ./ -g --skill wechat-article-studio -a codex
```

### Update An Installed Skill

```bash
npx skills update wechat-article-studio -g -y
```

For a project-installed skill:

```bash
npx skills update wechat-article-studio -p -y
```

## Quick Start

After installation, ask your agent to use the skill:

```text
Use $wechat-article-studio to write a WeChat article introducing this GitHub project.
Use wechat-article-studio to turn this AI news into a short comic-style article.
用 wechat-article-studio 写一篇技术公众号文章，带配图、预览页和发布注意事项。
用 wechat-article-studio 介绍这个开源项目，并默认把图片上传到图床。
```

The Skill will guide the agent to:

1. Research volatile facts before writing.
2. Create one article folder.
3. Write `writing-notes.md`.
4. Plan comic-style illustrations in `image-brief.md`.
5. Generate images with `image-gen` one at a time when available.
6. Upload local article images to a configurable image host by default.
7. Replace Markdown image paths with hosted URLs when upload succeeds.
8. Write the publishable article in `article.md`.
9. Run Chinese humanizer checks.
10. Render `publish.wechat.html` with the selected theme.
11. Generate `preview.html` with a left Markdown source pane, right rendered preview pane, style selector, and current-theme copy button.
12. Write `publish-checklist.md`.

## Image Generation And Hosting

All new article illustrations must be generated with the built-in `image-gen` tool. This keeps the image pipeline explicit and avoids mixing in untracked web images.

Default image behavior:

- If `image-gen` is available, generate article images into `images/`.
- Multiple images must be generated sequentially in the order listed in `image-brief.md`; do not call `image-gen` concurrently.
- If `image-gen` is not available, tell the user and skip image generation.
- After images are generated, upload them with `scripts/upload-images.mjs`.
- The upload script writes `image-host-manifest.json`.
- By default, the upload script rewrites `article.md` image paths to hosted URLs.
- Local `images/...` paths are a fallback only when no image host is available.

The bundled provider is `temppic.sinancode.com`, mainly for demonstrating and testing the upload flow. For production publishing, you can replace it or add a more durable provider; per-article link checks are handled in `publish-checklist.md`.

## Preview And WeChat Rendering

Every article should include a local `preview.html`.

The preview page:

- opens as a static local HTML file
- shows editable Markdown source on the left
- renders the current Markdown on the right
- provides a style dropdown for real-time Markdown and WeChat-copy style switching
- provides a "Copy Markdown" button for the current source text
- provides a "Copy Current Style" button that copies WeChat inline-style HTML for the selected theme

WeChat rich-text output is generated as inline-style HTML because WeChat editors may strip classes, external CSS, and parts of `<style>`.
The bundled theme is `coral-tab`, a WeChat style with black body text, coral section labels, and a pale angled tab. `scripts/render-wechat.mjs` supports `--theme`, and `preview.html` uses the same theme definitions for copied WeChat HTML.

## Reference Link Format

Source links in articles and publish checklists should use standard Markdown links:

```markdown
- [GitHub repository: project name](https://github.com/example/project)
- [Official docs: project name](https://example.com/docs)
```

Avoid naked URLs such as `Project URL: https://example.com`. `scripts/check-article.mjs` checks for this.

## What Is Included?

```text
skills/wechat-article-studio/
├── SKILL.md                         # Skill entry point
├── agents/
│   └── openai.yaml                  # Agent metadata
├── assets/
│   └── previews/
│       └── index.html               # Static preview shell for the workflow
├── references/
│   ├── workflow.md                  # Article production workflow
│   ├── image-prompts.md             # Comic-style image prompt patterns
│   └── humanizer-zh.md              # Chinese anti-AI-flavor writing rules
└── scripts/
    ├── scaffold-article.mjs         # Create an article folder
    ├── upload-images.mjs            # Upload local article images and rewrite Markdown URLs
    ├── render-wechat.mjs            # Render WeChat inline-style HTML
    ├── build-preview.mjs            # Build split preview.html with style switching
    ├── check-article.mjs            # Validate article package
    ├── check-ai-flavor.mjs          # Scan AI-flavored writing patterns
    ├── image-hosts/                 # Pluggable image-host providers
    └── lib/                         # Shared Markdown, theme, and humanizer helpers
```

## Core Article Folder

The generated article folder follows this shape:

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

`article.md` remains the source of truth. `preview.html`, `publish.wechat.html`, and `image-host-manifest.json` are generated helper files.

## Development

Run package checks:

```bash
npm run check
```

Start the local static preview server:

```bash
npm run preview:serve
```

Then open:

```text
http://127.0.0.1:<port>/assets/previews/
```

Package verification:

```bash
npm pack --dry-run
```

## License

MIT
