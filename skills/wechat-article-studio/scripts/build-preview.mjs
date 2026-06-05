#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import { parseMarkdown, extractTitle, renderPreviewArticle, escapeHtml, escapeAttribute } from "./lib/markdown.mjs";
import { DEFAULT_WECHAT_THEME_ID, getPreviewThemeOptions, listWechatThemes } from "./lib/wechat-themes.mjs";

function 帮助() {
  console.log(`用法：
node scripts/build-preview.mjs <文章目录>

功能：
  从 article.md 生成 preview.html。
  预览页左侧显示 Markdown 源码，右侧实时渲染 Markdown。
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
  const themeDefinitions = listWechatThemes().map((theme) => ({
    id: theme.id,
    label: theme.label,
    description: theme.description,
    preview: theme.preview,
    styles: theme.styles,
  }));
  const defaultTheme = themes.find((theme) => theme.id === DEFAULT_WECHAT_THEME_ID) || themes[0];
  const themeCss = themes.map((theme) => {
    return `body[data-preview-style="${escapeAttribute(theme.id)}"] {\n      ${cssVariables(theme)}\n    }`;
  }).join("\n    ");
  const themeOptions = themes.map((theme) => {
    const selected = theme.id === defaultTheme.id ? " selected" : "";
    return `<option value="${escapeAttribute(theme.id)}"${selected}>${escapeHtml(theme.label)}</option>`;
  }).join("\n          ");
  const initialLineCount = markdown.split(/\r\n|\r|\n/).length;

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
      background: linear-gradient(180deg, #fbfaf7 0%, var(--bg) 100%);
      color: var(--ink);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
      line-height: 1.72;
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
      padding: 12px clamp(14px, 3vw, 32px);
      border-bottom: 1px solid var(--line);
      background: color-mix(in srgb, var(--paper) 93%, transparent);
      backdrop-filter: blur(14px);
    }
    .toolbar-title {
      min-width: 0;
    }
    .toolbar-title strong {
      display: block;
      max-width: 52vw;
      overflow: hidden;
      color: var(--ink);
      font-size: 15px;
      line-height: 1.32;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .toolbar-title span {
      color: var(--muted);
      font-size: 12px;
    }
    .actions {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-shrink: 0;
    }
    .style-picker {
      display: flex;
      align-items: center;
      gap: 7px;
      color: var(--muted);
      font-size: 13px;
      white-space: nowrap;
    }
    select {
      appearance: none;
      min-width: 128px;
      border: 1px solid color-mix(in srgb, var(--accent) 30%, var(--line));
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
      min-height: 38px;
      border: 1px solid color-mix(in srgb, var(--accent) 36%, var(--line));
      border-radius: 8px;
      background: var(--accent);
      color: #fff;
      cursor: pointer;
      font: inherit;
      font-size: 14px;
      font-weight: 650;
      line-height: 1;
      padding: 10px 13px;
    }
    button:hover { background: var(--accent-strong); }
    #copy-md {
      background: var(--paper);
      color: var(--accent-strong);
    }
    #copy-md:hover {
      background: color-mix(in srgb, var(--soft) 72%, var(--paper));
    }
    button:focus-visible,
    select:focus-visible,
    textarea:focus-visible {
      outline: 2px solid color-mix(in srgb, var(--accent) 54%, transparent);
      outline-offset: 2px;
    }
    .status {
      min-width: 92px;
      color: var(--muted);
      font-size: 13px;
      text-align: right;
    }
    .studio-shell {
      display: grid;
      grid-template-columns: minmax(320px, 0.92fr) minmax(360px, 1.08fr);
      gap: 16px;
      width: min(100%, 1440px);
      margin: 16px auto 54px;
      padding: 0 16px;
      align-items: start;
    }
    .pane {
      min-width: 0;
      overflow: hidden;
      border: 1px solid var(--line);
      border-radius: 8px;
      background: color-mix(in srgb, var(--paper) 94%, #fff);
      box-shadow: var(--shadow);
    }
    .pane-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      min-height: 48px;
      padding: 12px 14px;
      border-bottom: 1px solid var(--line);
    }
    .pane-head strong {
      color: var(--ink);
      font-size: 14px;
      line-height: 1.2;
    }
    .pane-head span {
      min-width: 0;
      overflow: hidden;
      color: var(--muted);
      font-size: 12px;
      line-height: 1.35;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .source-pane {
      position: sticky;
      top: 72px;
      height: calc(100vh - 88px);
      min-height: 560px;
    }
    .source-wrap {
      height: calc(100% - 48px);
      background: #111827;
    }
    textarea {
      display: block;
      width: 100%;
      height: 100%;
      min-height: 420px;
      resize: none;
      border: 0;
      background: #111827;
      color: #e5e7eb;
      caret-color: var(--accent);
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
      font-size: 14px;
      line-height: 1.65;
      padding: 18px;
      tab-size: 2;
      white-space: pre-wrap;
    }
    .preview-pane {
      background: color-mix(in srgb, var(--paper) 96%, #fff);
    }
    article {
      width: 100%;
      min-height: calc(100vh - 140px);
      overflow: hidden;
      background: var(--paper);
    }
    .content {
      overflow-wrap: anywhere;
      padding: clamp(22px, 4vw, 48px);
      word-break: break-word;
    }
    h1, h2, h3 { line-height: 1.28; letter-spacing: 0; }
    h1 {
      margin: 0 0 28px;
      color: black;
      font-size: clamp(26px, 4vw, 38px);
    }
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
    h3 {
      margin: 30px 0 12px;
      font-size: 20px;
    }
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
    a {
      color: var(--accent-strong);
      text-decoration-thickness: 1px;
      text-underline-offset: 4px;
    }
    figure {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      margin: 10px 0;
    }
    figure img {
      display: block;
      max-width: 100%;
      height: auto;
      margin: 0 auto;
      background: #eee4d4;
    }
    figcaption {
      margin-top: 5px;
      color: #888;
      font-size: 14px;
      line-height: 1.5;
      text-align: center;
    }
    ul {
      margin: 8px 0;
      padding-left: 25px;
      color: black;
      list-style-type: disc;
    }
    li {
      margin: 5px 0;
      color: rgb(1, 1, 1);
      font-size: 16px;
      font-weight: 500;
      line-height: 26px;
      text-align: left;
    }
    pre {
      overflow-x: auto;
      margin: 10px 0;
      border-radius: 0;
      background: var(--code-bg);
      color: var(--code-ink);
      font-size: 12px;
      line-height: 1.7;
      padding: 16px;
      white-space: pre-wrap;
    }
    code {
      border-radius: 4px;
      background: rgba(27, 31, 35, 0.05);
      color: var(--accent);
      font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace;
      font-size: 0.92em;
      margin: 0 2px;
      padding: 2px 4px;
      word-break: break-all;
      word-wrap: break-word;
    }
    pre code {
      background: transparent;
      color: inherit;
      font-size: inherit;
      margin: 0;
      padding: 0;
    }
    blockquote {
      margin: 12px 0;
      border-left: 4px solid var(--accent);
      background: var(--soft);
      color: black;
      font-size: 16px;
      line-height: 26px;
      padding: 10px 14px;
    }
    @media (max-width: 980px) {
      .toolbar {
        align-items: flex-start;
        flex-direction: column;
      }
      .toolbar-title strong {
        max-width: 100%;
      }
      .actions {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
        flex-shrink: 1;
        width: 100%;
      }
      .style-picker {
        grid-column: 1 / -1;
        width: 100%;
      }
      .style-picker span {
        flex-shrink: 0;
      }
      select {
        flex: 1;
        min-width: 0;
      }
      button {
        width: 100%;
        white-space: nowrap;
      }
      .status {
        grid-column: 1 / -1;
        min-width: 0;
        text-align: left;
      }
      .studio-shell {
        grid-template-columns: 1fr;
        margin-top: 12px;
        padding: 0 10px 36px;
      }
      .source-pane {
        position: static;
        height: auto;
        min-height: 0;
      }
      .source-wrap {
        height: 42vh;
        min-height: 340px;
      }
      article {
        min-height: 0;
      }
      .content {
        padding: 22px 16px 32px;
      }
    }
    @media (max-width: 560px) {
      .actions {
        grid-template-columns: 1fr;
      }
      .pane-head {
        align-items: flex-start;
        flex-direction: column;
        gap: 4px;
      }
      .pane-head span {
        width: 100%;
        white-space: normal;
      }
      textarea {
        font-size: 13px;
        padding: 14px;
      }
    }
  </style>
</head>
<body data-preview-style="${escapeAttribute(defaultTheme.id)}">
  <header class="toolbar">
    <div class="toolbar-title">
      <strong>${escapeHtml(title)}</strong>
      <span>Markdown 源码 / 渲染预览 / 公众号排版复制</span>
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
  <main class="studio-shell">
    <section class="pane source-pane" aria-label="Markdown 源码">
      <div class="pane-head">
        <strong>Markdown 源码</strong>
        <span id="source-meta">${markdown.length} 字 / ${initialLineCount} 行</span>
      </div>
      <div class="source-wrap">
        <textarea id="markdown-editor" spellcheck="false" aria-label="Markdown 源码">${escapeHtml(markdown)}</textarea>
      </div>
    </section>
    <section class="pane preview-pane" aria-label="Markdown 渲染预览">
      <div class="pane-head">
        <strong>渲染预览</strong>
        <span id="theme-note">${escapeHtml(defaultTheme.description)}</span>
      </div>
      <article>
        <div class="content" id="preview-content">
${articleHtml}
        </div>
      </article>
    </section>
  </main>
  <script type="application/json" id="markdown-source">${jsonForScript(markdown)}</script>
  <script type="application/json" id="theme-definitions">${jsonForScript(themeDefinitions)}</script>
  <script type="application/json" id="image-manifest">${jsonForScript(manifest || { images: [] })}</script>
  <script>
    var statusEl = document.getElementById("status");
    var styleSelect = document.getElementById("style-select");
    var themeNote = document.getElementById("theme-note");
    var sourceMeta = document.getElementById("source-meta");
    var editor = document.getElementById("markdown-editor");
    var previewContent = document.getElementById("preview-content");
    var initialMarkdown = JSON.parse(document.getElementById("markdown-source").textContent);
    var themeDefinitions = JSON.parse(document.getElementById("theme-definitions").textContent);
    var imageManifest = JSON.parse(document.getElementById("image-manifest").textContent);
    var themeById = {};
    var statusTimer = 0;
    var renderTimer = 0;

    themeDefinitions.forEach(function(theme) {
      themeById[theme.id] = theme;
    });
    editor.value = initialMarkdown;

    function escapeHtml(value) {
      return String(value == null ? "" : value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;");
    }
    function escapeAttr(value) {
      return escapeHtml(value).replaceAll("'", "&#39;");
    }
    function styleAttr(value) {
      return ' style="' + escapeAttr(value || "") + '"';
    }
    function dataAttrs(theme) {
      return ' data-tool="wechat-article-studio" data-theme="' + escapeAttr(theme.id) + '"';
    }
    var INLINE_CODE_MARK = String.fromCharCode(96);
    var FENCE_MARK = INLINE_CODE_MARK + INLINE_CODE_MARK + INLINE_CODE_MARK;
    function isBlockStart(line) {
      return /^#{1,6}\\s+/.test(line)
        || /^!\\[[^\\]]*]\\([^)]+\\)\\s*$/.test(line)
        || /^[-*]\\s+/.test(line)
        || /^>\\s?/.test(line)
        || line.startsWith(FENCE_MARK);
    }
    function parseMarkdown(markdown) {
      var lines = String(markdown || "").replace(/\\r\\n/g, "\\n").split("\\n");
      var blocks = [];
      var i = 0;
      while (i < lines.length) {
        var line = lines[i];
        var fence = line.match(new RegExp("^" + FENCE_MARK + "\\\\s*([A-Za-z0-9_-]+)?\\\\s*$"));
        if (!line.trim()) {
          i += 1;
          continue;
        }
        if (fence) {
          var language = fence[1] || "";
          var code = [];
          i += 1;
          while (i < lines.length && !new RegExp("^" + FENCE_MARK + "\\\\s*$").test(lines[i])) {
            code.push(lines[i]);
            i += 1;
          }
          if (i < lines.length) i += 1;
          blocks.push({ type: "code", language: language, text: code.join("\\n") });
          continue;
        }
        var heading = line.match(/^(#{1,6})\\s+(.+?)\\s*$/);
        if (heading) {
          blocks.push({ type: "heading", level: heading[1].length, text: heading[2] });
          i += 1;
          continue;
        }
        var image = line.match(/^!\\[([^\\]]*)]\\(([^)]+)\\)\\s*$/);
        if (image) {
          blocks.push({ type: "image", alt: image[1], src: image[2] });
          i += 1;
          continue;
        }
        if (/^[-*]\\s+/.test(line)) {
          var items = [];
          while (i < lines.length && /^[-*]\\s+/.test(lines[i])) {
            items.push(lines[i].replace(/^[-*]\\s+/, "").trim());
            i += 1;
          }
          blocks.push({ type: "list", items: items });
          continue;
        }
        if (/^>\\s?/.test(line)) {
          var quote = [];
          while (i < lines.length && /^>\\s?/.test(lines[i])) {
            quote.push(lines[i].replace(/^>\\s?/, ""));
            i += 1;
          }
          blocks.push({ type: "quote", text: quote.join("\\n") });
          continue;
        }
        var paragraph = [line.trim()];
        i += 1;
        while (i < lines.length && lines[i].trim() && !isBlockStart(lines[i])) {
          paragraph.push(lines[i].trim());
          i += 1;
        }
        blocks.push({ type: "paragraph", text: paragraph.join(" ") });
      }
      return blocks;
    }
    function renderInline(text, options) {
      options = options || {};
      var tokens = [];
      var rest = String(text == null ? "" : text);
      var codeIndex = 0;
      var codeStyle = options.codeStyle ? styleAttr(options.codeStyle) : "";
      var linkStyle = options.linkStyle ? styleAttr(options.linkStyle) : "";
      rest = rest.replace(new RegExp(INLINE_CODE_MARK + "([^" + INLINE_CODE_MARK + "]+)" + INLINE_CODE_MARK, "g"), function(_, code) {
        var key = "@@CODE_" + codeIndex + "@@";
        tokens.push({ key: key, html: "<code" + codeStyle + ">" + escapeHtml(code) + "</code>" });
        codeIndex += 1;
        return key;
      });
      rest = escapeHtml(rest);
      rest = rest.replace(/\\[([^\\]]+)]\\((https?:\\/\\/[^)]+)\\)/g, function(_, label, url) {
        return '<a href="' + escapeAttr(url) + '"' + linkStyle + ">" + label + "</a>";
      });
      rest = rest.replace(/(^|[\\s(])((https?:\\/\\/)[^\\s<)]+)/g, function(_, prefix, url) {
        return prefix + '<a href="' + escapeAttr(url) + '"' + linkStyle + ">" + escapeHtml(url) + "</a>";
      });
      tokens.forEach(function(token) {
        rest = rest.replace(token.key, token.html);
      });
      return rest;
    }
    function renderPreviewArticle(blocks) {
      return blocks.map(function(block) {
        if (block.type === "heading") {
          var level = Math.min(block.level, 3);
          if (level === 2) {
            return '<h2><span class="heading-content">' + renderInline(block.text) + "</span></h2>";
          }
          return "<h" + level + ">" + renderInline(block.text) + "</h" + level + ">";
        }
        if (block.type === "paragraph") {
          return "<p>" + renderInline(block.text) + "</p>";
        }
        if (block.type === "image") {
          return [
            "<figure>",
            '<img src="' + escapeAttr(block.src) + '" alt="' + escapeAttr(block.alt) + '">',
            block.alt ? "<figcaption>" + escapeHtml(block.alt) + "</figcaption>" : "",
            "</figure>"
          ].join("");
        }
        if (block.type === "list") {
          return "<ul>" + block.items.map(function(item) { return "<li>" + renderInline(item) + "</li>"; }).join("") + "</ul>";
        }
        if (block.type === "quote") {
          return "<blockquote>" + block.text.split("\\n").map(function(line) { return renderInline(line); }).join("<br>") + "</blockquote>";
        }
        if (block.type === "code") {
          return "<pre><code>" + escapeHtml(block.text) + "</code></pre>";
        }
        return "";
      }).join("\\n");
    }
    function isRemoteUrl(src) {
      return /^https?:\\/\\//i.test(src) || /^data:/i.test(src);
    }
    function normalizeImagePath(src) {
      return String(src || "").split("#")[0].split("?")[0].replace(/\\\\/g, "/").replace(/^\\.\\//, "");
    }
    function resolveImageSrc(src) {
      if (isRemoteUrl(src)) return src;
      var normalized = normalizeImagePath(src);
      var images = imageManifest && Array.isArray(imageManifest.images) ? imageManifest.images : [];
      var found = images.find(function(item) {
        return normalizeImagePath(item.localPath || "") === normalized;
      });
      return found && found.url ? found.url : normalized;
    }
    function renderWechatInline(text, theme) {
      return renderInline(text, {
        codeStyle: theme.styles.code,
        linkStyle: theme.styles.link
      });
    }
    function renderWechatArticle(blocks, theme) {
      var s = theme.styles || {};
      var html = blocks.map(function(block) {
        if (block.type === "heading") {
          if (block.level === 1) {
            return "<h1" + dataAttrs(theme) + styleAttr(s.h1) + "><span" + styleAttr(s.h1Span || "") + ">" + renderWechatInline(block.text, theme) + "</span></h1>";
          }
          return "<h2" + dataAttrs(theme) + styleAttr(s.h2) + "><span" + styleAttr(s.h2Span || "") + ">" + renderWechatInline(block.text, theme) + "</span>" + (s.h2Suffix || "") + "</h2>";
        }
        if (block.type === "paragraph") {
          return "<p" + dataAttrs(theme) + styleAttr(s.p) + ">" + renderWechatInline(block.text, theme) + "</p>";
        }
        if (block.type === "image") {
          var src = resolveImageSrc(block.src);
          return [
            "<figure" + dataAttrs(theme) + styleAttr(s.figure) + ">",
            '<img src="' + escapeAttr(src) + '" alt="' + escapeAttr(block.alt) + '"' + styleAttr(s.img) + ">",
            block.alt ? "<figcaption" + styleAttr(s.figcaption) + ">" + escapeHtml(block.alt) + "</figcaption>" : "",
            "</figure>"
          ].join("");
        }
        if (block.type === "list") {
          var items = block.items.map(function(item) {
            return "<li><section" + styleAttr(s.liSection) + ">" + renderWechatInline(item, theme) + "</section></li>";
          }).join("");
          return "<ul" + dataAttrs(theme) + styleAttr(s.ul) + ">" + items + "</ul>";
        }
        if (block.type === "quote") {
          return "<blockquote" + dataAttrs(theme) + styleAttr(s.quote) + ">" + block.text.split("\\n").map(function(line) { return renderWechatInline(line, theme); }).join("<br>") + "</blockquote>";
        }
        if (block.type === "code") {
          return "<pre" + dataAttrs(theme) + styleAttr(s.pre) + "><code" + styleAttr(s.preCode) + ">" + escapeHtml(block.text) + "</code></pre>";
        }
        return "";
      }).join("\\n");
      return '<section id="nice" data-tool="wechat-article-studio" data-theme="' + escapeAttr(theme.id) + '"' + styleAttr(s.root) + ">\\n" + html + "\\n</section>\\n";
    }
    function currentTheme() {
      return themeById[styleSelect.value] || themeDefinitions[0];
    }
    function updateMeta() {
      var text = editor.value;
      var lines = text ? text.split(/\\r\\n|\\r|\\n/).length : 1;
      sourceMeta.textContent = text.length + " 字 / " + lines + " 行";
    }
    function renderNow() {
      previewContent.innerHTML = renderPreviewArticle(parseMarkdown(editor.value));
      updateMeta();
    }
    function setStatus(text, delay) {
      window.clearTimeout(statusTimer);
      statusEl.textContent = text;
      if (delay) {
        statusTimer = window.setTimeout(function() {
          statusEl.textContent = "可复制排版";
        }, delay);
      }
    }
    function applyPreviewStyle(value) {
      document.body.dataset.previewStyle = value;
      var theme = currentTheme();
      themeNote.textContent = theme ? theme.description : "";
      try { localStorage.setItem("wechat-article-preview-style", value); } catch (error) {}
    }
    try {
      var savedStyle = localStorage.getItem("wechat-article-preview-style");
      if (savedStyle && Array.prototype.some.call(styleSelect.options, function(option) { return option.value === savedStyle; })) {
        styleSelect.value = savedStyle;
      }
    } catch (error) {}
    applyPreviewStyle(styleSelect.value);
    renderNow();
    styleSelect.addEventListener("change", function() {
      applyPreviewStyle(styleSelect.value);
      setStatus("已切换样式", 1200);
    });
    editor.addEventListener("input", function() {
      window.clearTimeout(renderTimer);
      renderTimer = window.setTimeout(function() {
        renderNow();
        setStatus("预览已更新", 900);
      }, 80);
    });
    function fallbackCopyText(text) {
      var helper = document.createElement("textarea");
      helper.value = text;
      helper.setAttribute("readonly", "");
      helper.style.position = "fixed";
      helper.style.left = "-9999px";
      helper.style.top = "0";
      document.body.appendChild(helper);
      helper.select();
      var ok = document.execCommand("copy");
      document.body.removeChild(helper);
      if (!ok) throw new Error("copy failed");
    }
    async function copyPlainText(text) {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        return;
      }
      fallbackCopyText(text);
    }
    async function copyWechatHtml(wechatHtml, markdownText) {
      if (navigator.clipboard && window.ClipboardItem && navigator.clipboard.write) {
        var item = new ClipboardItem({
          "text/html": new Blob([wechatHtml], { type: "text/html" }),
          "text/plain": new Blob([markdownText], { type: "text/plain" })
        });
        await navigator.clipboard.write([item]);
        return;
      }
      await copyPlainText(wechatHtml);
    }
    document.getElementById("copy-md").addEventListener("click", function() {
      copyPlainText(editor.value)
        .then(function() { setStatus("已复制 Markdown", 1600); })
        .catch(function() { setStatus("复制失败", 1600); });
    });
    document.getElementById("copy-wechat").addEventListener("click", function() {
      var markdownText = editor.value;
      var wechatHtml = renderWechatArticle(parseMarkdown(markdownText), currentTheme());
      copyWechatHtml(wechatHtml, markdownText)
        .then(function() { setStatus("已复制当前样式", 1600); })
        .catch(function() { setStatus("复制失败", 1600); });
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
