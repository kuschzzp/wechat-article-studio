# Roadmap

WeChat Article Studio is a focused Agent Skill for WeChat Official Account article production. It helps an agent create a complete article package instead of leaving the user with a loose draft.

## Current Scope

The current Skill includes:

- A fixed article folder workflow.
- Writing notes, publishable Markdown, image brief, and publish checklist templates.
- Chinese anti-AI-flavor writing rules adapted from the local `AGENTS.md`.
- Comic-style image prompt guidance for technical articles.
- A hard rule that new illustrations must use Codex `image-gen`.
- A sequential image-generation rule: one image at a time, no concurrent `image-gen` calls.
- A fallback rule that no article images are generated when `image-gen` is unavailable.
- A local split Markdown preview builder with source editing, rendered preview, and style switching.
- WeChat rich-text rendering with inline styles.
- Temporary image-host upload with a pluggable provider interface.
- Default Markdown image URL replacement after successful image upload.
- Article package checks and AI-flavor scans.

The current rule remains the foundation:

> Build a complete article folder. Do not only write a chat response.

## Product Direction

The project should stay workflow-oriented. The Skill should help authors produce WeChat-ready article packages with clear source files, generated assets, preview output, and publish notes.

Planned categories:

- **Article workflows**: open-source project intro, AI news, technical explainer, short comic article.
- **Writing rules**: source verification, human voice, title candidates, publish checklist.
- **Image workflows**: image brief, image-gen prompts, image-host upload, expiration tracking.
- **WeChat rendering**: inline styles, copied third-party template cleanup, style switching preview.
- **Publishing checks**: links, image URLs, AI-flavor score, outdated facts, editor caveats.

## Proposed Future Structure

The repository should keep the installable Skill under `skills/wechat-article-studio/`:

```text
skills/wechat-article-studio/
├── SKILL.md
├── agents/
├── assets/
│   └── previews/
├── references/
└── scripts/
```

Future reusable templates can be added under:

```text
skills/wechat-article-studio/assets/templates/
```

Before adding many templates, introduce machine-readable metadata:

```text
catalog/
├── article-types.json
├── preview-styles.json
└── wechat-templates.json
```

This catalog should drive README tables, preview dropdown options, template rendering, and validation.

## Near-Term Work

### v0.2: Stable Article Package Workflow

- Keep `scaffold-article.mjs`, `upload-images.mjs`, `render-wechat.mjs`, `build-preview.mjs`, `check-article.mjs`, and `check-ai-flavor.mjs` stable.
- Add tests for Markdown image extraction and replacement.
- Add a sample article without large binary images.
- Improve `publish-checklist.md` generation for temporary image hosts.
- Make preview style metadata easier to extend.

### v0.3: Template Catalog

- Add global WeChat template metadata.
- Support multiple named WeChat render styles.
- Add a template importer for copied third-party inline HTML samples.
- Clean invalid CSS from imported samples.
- Keep generated WeChat HTML reproducible from `article.md`.

### v0.4: Image Host Rotation

- Add more image-host providers.
- Add provider health checks.
- Add upload retry and expiration warnings.
- Add manifest update mode for replacing expired URLs.
- Add optional delete command for uploaded temporary images.

### v0.5: Preview App Upgrade

- Add richer WeChat preview diagnostics.
- Add template dropdown next to Markdown style dropdown.
- Add warnings for local images, expired image URLs, and missing source links.
- Keep the preview page static and dependency-free unless a real need appears.

### v1.0: Publish-Ready WeChat Article Studio

- Stable public structure.
- Complete install and update docs.
- Useful sample articles.
- Template and image-host catalogs.
- Package checks and dry-run packaging.
- Clear compatibility notes for Codex, Claude Code, and OpenCode.

## Quality Bar

Every change should pass these checks:

- `npm run check`
- `npm pack --dry-run`
- No `.DS_Store` or generated article folders in the package.
- `SKILL.md` stays concise and points to references for details.
- Scripts work with Node 18 or newer.
- Preview pages remain static files.
- Image generation never silently falls back to unapproved tools.
- Article image URLs default to hosted URLs after upload succeeds.
- Local image paths are treated as fallback, not the normal publishing path.

## Non-Goals

These are out of scope unless the project direction changes:

- A full CMS.
- A WeChat official API publishing client.
- A long-form blogging platform.
- A general image-generation skill.
- A generic Markdown editor.
- Runtime dependency on a large frontend framework for preview pages.

## Maintenance Principles

- Keep the workflow boring and repeatable.
- Prefer explicit files over hidden state.
- Keep generated article artifacts out of the package by default.
- Treat temporary image hosts as fragile.
- Keep the author's voice sharper than the tool's voice.
