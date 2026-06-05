#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import { parseMarkdown, extractTitle, renderPreviewArticle, renderWechatArticle, escapeHtml, escapeAttribute } from "./lib/markdown.mjs";
import { DEFAULT_WECHAT_THEME_ID, getPreviewThemeOptions } from "./lib/wechat-themes.mjs";

function 帮助() {
  console.log(`用法：
node scripts/build-preview.mjs <文章目录>

功能：
  从 article.md 生成 preview.html。
  预览页提供样式下拉框，可实时切换 Markdown 预览风格。
  “复制当前样式”会复制当前下拉框对应的公众号内联样式 HTML。
`);
}

if (process.argv.includes("--help") || process.argv.includes("-h")) {
  帮助();
  process.exit(0);
}

const target = process.argv[2];
if (!target) {
  帮助();
  process.exit(1);
}

const articleDir = path.resolve(target);
const articlePath = path.join(articleDir, "article.md");
const previewPath = path.join(articleDir, "preview.html");
const manifestPath = path.join(articleDir, "image-host-manifest.json");

function jsonForScript(value) {
  return JSON.stringify(value).replaceAll("<", "\\u003c");
}

async function readManifest() {
  try {
    return JSON.parse(await fs.readFile(manifestPath, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return null;
    throw error;
  }
}

function cssVariables(theme) {
  const vars = theme.preview;
  return [
    `--bg: ${vars.bg};`,
    `--paper: ${vars.paper};`,
    `--ink: ${vars.ink};`,
    `--muted: ${vars.muted};`,
    `--line: ${vars.line};`,
    `--accent: ${vars.accent};`,
    `--accent-strong: ${vars.accentStrong};`,
    `--soft: ${vars.soft};`,
    `--code-bg: ${vars.codeBg};`,
    `--code-ink: ${vars.codeInk};`,
    `--shadow: ${vars.shadow};`,
  ].join("\n      ");
}

try {
  const markdown = await fs.readFile(articlePath, "utf8");
  const manifest = await readManifest();
  const blocks = parseMarkdown(markdown);
  const title = extractTitle(blocks, "文章预览");
  const articleHtml = renderPreviewArticle(blocks);
  const themes = getPreviewThemeOptions();
  const defaultTheme = themes.find((theme) => theme.id === DEFAULT_WECHAT_THEME_ID) || themes[0];
  const themeCss = themes.map((theme) => {
    return `body[data-preview-style="${escapeAttribute(theme.id)}"] {\n      ${cssVariables(theme)}\n    }`;
  }).join("\n    ");
  const themeOptions = themes.map((theme) => {
    const selected = theme.id === defaultTheme.id ? " selected" : "";
    return `<option value="${escapeAttribute(theme.id)}"${selected}>${escapeHtml(theme.label)}</option>`;
  }).join("\n          ");
  const themeDescriptionById = Object.fromEntries(themes.map((theme) => [theme.id, theme.description]));
  const wechatHtmlByTheme = Object.fromEntries(themes.map((theme) => {
    return [theme.id, renderWechatArticle(blocks, { articleDir, manifest, themeId: theme.id, strictTheme: true })];
  }));

  const html = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>文章预览 - ${escapeHtml(title)}</title>
  <style>
    :root {
      color-scheme: light;
      ${cssVariables(defaultTheme)}
    }
    ${themeCss}
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: radial-gradient(circle at top left, color-mix(in srgb, var(--accent) 10%, transparent), transparent 34vw), linear-gradient(180deg, color-mix(in srgb, var(--paper) 68%, transparent), var(--bg));
      color: var(--ink);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
      line-height: 1.78;
      overflow-x: hidden;
    }
    .toolbar {
      position: sticky;
      top: 0;
      z-index: 10;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      padding: 13px clamp(16px, 4vw, 48px);
      border-bottom: 1px solid color-mix(in srgb, var(--line) 82%, transparent);
      background: color-mix(in srgb, var(--paper) 90%, transparent);
      backdrop-filter: blur(14px);
    }
    .toolbar-title { min-width: 0; }
    .toolbar-title strong {
      display: block;
      overflow: hidden;
      font-size: 15px;
      line-height: 1.3;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .toolbar-title span { color: var(--muted); font-size: 12px; }
    .actions { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
    .style-picker {
      display: flex;
      align-items: center;
      gap: 7px;
      color: var(--muted);
      font-size: 13px;
      white-space: nowrap;
    }
    .theme-note {
      display: block;
      max-width: 260px;
      overflow: hidden;
      color: var(--muted);
      font-size: 12px;
      line-height: 1.35;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    select {
      appearance: none;
      min-width: 128px;
      border: 1px solid color-mix(in srgb, var(--accent) 28%, var(--line));
      border-radius: 8px;
      background: var(--paper);
      color: var(--ink);
      cursor: pointer;
      font: inherit;
      font-size: 14px;
      line-height: 1;
      padding: 10px 30px 10px 12px;
      background-image: linear-gradient(45deg, transparent 50%, var(--muted) 50%), linear-gradient(135deg, var(--muted) 50%, transparent 50%);
      background-position: calc(100% - 15px) 50%, calc(100% - 10px) 50%;
      background-size: 5px 5px, 5px 5px;
      background-repeat: no-repeat;
    }
    button {
      appearance: none;
      border: 1px solid color-mix(in srgb, var(--accent) 36%, var(--line));
      border-radius: 8px;
      background: var(--accent);
      color: #fff;
      cursor: pointer;
      font: inherit;
      font-size: 14px;
      font-weight: 650;
      line-height: 1;
      padding: 11px 14px;
    }
    button:hover { background: var(--accent-strong); }
    #copy-md {
      background: var(--paper);
      color: var(--accent-strong);
    }
    #copy-md:hover {
      background: color-mix(in srgb, var(--soft) 70%, var(--paper));
    }
    button:disabled { cursor: not-allowed; opacity: 0.45; }
    .status { min-width: 86px; color: var(--muted); font-size: 13px; text-align: right; }
    main { width: min(100%, 860px); margin: 34px auto 72px; padding: 0 18px; }
    .theme-note-wrap {
      margin: 18px auto -14px;
    }
    article {
      width: 100%;
      overflow: hidden;
      border: 1px solid color-mix(in srgb, var(--line) 88%, transparent);
      border-radius: 12px;
      background: var(--paper);
      box-shadow: var(--shadow);
    }
    .content {
      overflow-wrap: anywhere;
      padding: clamp(24px, 5vw, 54px);
      word-break: break-word;
    }
    h1, h2, h3 { line-height: 1.28; letter-spacing: 0; }
    h1 { margin: 0 0 28px; color: black; font-size: clamp(28px, 5vw, 42px); }
    h2 {
      margin: 30px 0 15px;
      padding: 0;
      border-bottom: 2px solid var(--accent);
      color: black;
      font-size: 1.3em;
      font-weight: bold;
    }
    h2 .heading-content {
      display: inline-block;
      margin-right: 3px;
      border-top-left-radius: 3px;
      border-top-right-radius: 3px;
      background: var(--accent);
      color: #ffffff;
      font-weight: bold;
      padding: 3px 10px 1px;
    }
    h2::after {
      display: inline-block;
      vertical-align: bottom;
      border-bottom: 36px solid #efebe9;
      border-right: 20px solid transparent;
      content: "";
    }
    h3 { margin: 30px 0 12px; font-size: 20px; }
    p {
      margin: 0;
      color: black;
      font-size: 16px;
      line-height: 26px;
      overflow-wrap: anywhere;
      padding-bottom: 8px;
      padding-top: 8px;
      word-break: break-word;
    }
    a { color: var(--accent-strong); text-decoration-thickness: 1px; text-underline-offset: 4px; }
    figure { margin: 28px -6px 34px; }
    figure img {
      display: block;
      width: 100%;
      height: auto;
      border: 1px solid color-mix(in srgb, var(--line) 90%, transparent);
      border-radius: 10px;
      background: #eee4d4;
    }
    figcaption { margin-top: 8px; color: var(--muted); font-size: 13px; line-height: 1.5; text-align: center; }
    ul { margin: 0 0 22px; padding-left: 1.3em; }
    li { margin: 7px 0; font-size: 17px; }
    pre {
      overflow-x: auto;
      margin: 18px 0 24px;
      border-radius: 10px;
      background: var(--code-bg);
      color: var(--code-ink);
      font-size: 14px;
      line-height: 1.65;
      padding: 16px 18px;
    }
    code {
      border-radius: 5px;
      background: rgba(8,127,122,0.1);
      color: var(--accent-strong);
      font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace;
      font-size: 0.92em;
      padding: 0.12em 0.34em;
    }
    pre code { background: transparent; color: inherit; font-size: inherit; padding: 0; }
    blockquote {
      margin: 22px 0;
      border-left: 4px solid var(--accent);
      background: var(--soft);
      color: var(--ink);
      padding: 12px 18px;
    }
    @media (max-width: 640px) {
      .toolbar {
        align-items: flex-start;
        flex-direction: column;
        max-width: 100vw;
        overflow: hidden;
      }
      .toolbar-title { width: 100%; }
      .actions {
        display: grid;
        grid-template-columns: minmax(0, 1fr);
        flex-shrink: 1;
        min-width: 0;
        width: 100%;
      }
      .actions > * { min-width: 0; }
      .style-picker {
        grid-column: 1 / -1;
        width: 100%;
      }
      .style-picker span { flex-shrink: 0; }
      select { flex: 1; min-width: 0; }
      button {
        min-height: 42px;
        padding: 10px 8px;
        white-space: nowrap;
        width: 100%;
      }
      .theme-note { max-width: 100%; white-space: normal; }
      .status {
        grid-column: 1 / -1;
        min-width: 0;
        width: 100%;
        text-align: left;
      }
      main { margin-top: 18px; padding: 0 10px; }
      .theme-note-wrap { margin-bottom: -4px; }
      article { border-radius: 10px; }
      .content { padding: 22px 16px 32px; }
      p, li { font-size: 16px; }
    }
  </style>
</head>
<body data-preview-style="${escapeAttribute(defaultTheme.id)}">
  <header class="toolbar">
    <div class="toolbar-title">
      <strong>${escapeHtml(title)}</strong>
      <span>Markdown 预览 / 公众号排版复制</span>
    </div>
    <div class="actions">
      <label class="style-picker">
        <span>样式</span>
        <select id="style-select" aria-label="选择预览样式">
          ${themeOptions}
        </select>
      </label>
      <button type="button" id="copy-md">复制 Markdown</button>
      <button type="button" id="copy-wechat">复制当前样式</button>
      <span class="status" id="status">可复制排版</span>
    </div>
  </header>
  <main class="theme-note-wrap">
    <span class="theme-note" id="theme-note">${escapeHtml(defaultTheme.description)}</span>
  </main>
  <main class="article-wrap">
    <article>
      <div class="content">
${articleHtml}
      </div>
    </article>
  </main>
  <script type="application/json" id="markdown-source">${jsonForScript(markdown)}</script>
  <script type="application/json" id="wechat-sources">${jsonForScript(wechatHtmlByTheme)}</script>
  <script type="application/json" id="theme-descriptions">${jsonForScript(themeDescriptionById)}</script>
  <script>
    const statusEl = document.getElementById("status");
    const styleSelect = document.getElementById("style-select");
    const themeNote = document.getElementById("theme-note");
    const markdown = JSON.parse(document.getElementById("markdown-source").textContent);
    const wechatHtmlByTheme = JSON.parse(document.getElementById("wechat-sources").textContent);
    const themeDescriptions = JSON.parse(document.getElementById("theme-descriptions").textContent);
    function applyPreviewStyle(value) {
      document.body.dataset.previewStyle = value;
      themeNote.textContent = themeDescriptions[value] || "";
      try { localStorage.setItem("wechat-article-preview-style", value); } catch (error) {}
    }
    try {
      const savedStyle = localStorage.getItem("wechat-article-preview-style");
      if (savedStyle && [...styleSelect.options].some((option) => option.value === savedStyle)) {
        styleSelect.value = savedStyle;
      }
    } catch (error) {}
    applyPreviewStyle(styleSelect.value);
    styleSelect.addEventListener("change", () => {
      applyPreviewStyle(styleSelect.value);
      statusEl.textContent = "已切换样式";
      window.setTimeout(() => { statusEl.textContent = "可复制排版"; }, 1200);
    });
    async function copyText(text, okText) {
      await navigator.clipboard.writeText(text);
      statusEl.textContent = okText;
      window.setTimeout(() => { statusEl.textContent = "可复制排版"; }, 1600);
    }
    document.getElementById("copy-md").addEventListener("click", () => {
      copyText(markdown, "已复制 Markdown").catch(() => { statusEl.textContent = "复制失败"; });
    });
    document.getElementById("copy-wechat").addEventListener("click", async () => {
      const wechatHtml = wechatHtmlByTheme[styleSelect.value];
      if (!wechatHtml) return;
      try {
        if (window.ClipboardItem) {
          const item = new ClipboardItem({
            "text/html": new Blob([wechatHtml], { type: "text/html" }),
            "text/plain": new Blob([markdown], { type: "text/plain" })
          });
          await navigator.clipboard.write([item]);
          statusEl.textContent = "已复制当前样式";
        } else {
          await copyText(wechatHtml, "已复制 HTML");
        }
      } catch (error) {
        statusEl.textContent = "复制失败";
      }
    });
  </script>
</body>
</html>
`;

  await fs.writeFile(previewPath, html, "utf8");
  console.log(`已生成：${path.relative(process.cwd(), previewPath)}`);
} catch (error) {
  console.error(`生成预览失败：${error.message}`);
  process.exit(1);
}
