#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import { parseMarkdown, extractTitle, renderPreviewArticle, escapeHtml } from "./lib/markdown.mjs";

function 帮助() {
  console.log(`用法：
node scripts/build-preview.mjs <文章目录>

功能：
  从 article.md 生成 preview.html。
  预览页提供样式下拉框，可实时切换 Markdown 预览风格。
  如果文章目录里存在 publish.wechat.html，预览页会显示“复制公众号排版”按钮。
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
const wechatPath = path.join(articleDir, "publish.wechat.html");

function jsonForScript(value) {
  return JSON.stringify(value).replaceAll("<", "\\u003c");
}

try {
  const markdown = await fs.readFile(articlePath, "utf8");
  const blocks = parseMarkdown(markdown);
  const title = extractTitle(blocks, "文章预览");
  const articleHtml = renderPreviewArticle(blocks);
  let wechatHtml = "";
  try {
    wechatHtml = await fs.readFile(wechatPath, "utf8");
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }

  const html = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>文章预览 - ${escapeHtml(title)}</title>
  <style>
    :root {
      color-scheme: light;
      --bg: #f6f1e8;
      --paper: #fffaf1;
      --ink: #263238;
      --muted: #66736f;
      --line: #d8cdbb;
      --accent: #087f7a;
      --accent-strong: #055f5b;
      --coral: #d76651;
      --code-bg: #1f2933;
      --code-ink: #e6edf3;
      --shadow: 0 18px 46px rgba(42, 33, 20, 0.14);
    }
    body[data-preview-style="wechat-green"] {
      --bg: #f7fbf8;
      --paper: #ffffff;
      --ink: #202124;
      --muted: #6b7280;
      --line: #dce8df;
      --accent: #35b378;
      --accent-strong: #22895b;
      --coral: #35b378;
      --code-bg: #f8f8f8;
      --code-ink: #333333;
      --shadow: 0 14px 34px rgba(29, 84, 55, 0.1);
    }
    body[data-preview-style="clean-white"] {
      --bg: #f5f7fb;
      --paper: #ffffff;
      --ink: #1f2937;
      --muted: #64748b;
      --line: #e5e7eb;
      --accent: #2563eb;
      --accent-strong: #1d4ed8;
      --coral: #ef4444;
      --code-bg: #111827;
      --code-ink: #f9fafb;
      --shadow: 0 16px 38px rgba(15, 23, 42, 0.1);
    }
    body[data-preview-style="ink-note"] {
      --bg: #eee9df;
      --paper: #fffdf8;
      --ink: #1c1c1c;
      --muted: #6f675c;
      --line: #cbc2b3;
      --accent: #111111;
      --accent-strong: #000000;
      --coral: #9a4b35;
      --code-bg: #252525;
      --code-ink: #f3eee5;
      --shadow: 0 20px 44px rgba(28, 25, 20, 0.13);
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: linear-gradient(180deg, rgba(255,250,241,0.82), rgba(246,241,232,0.96)), var(--bg);
      color: var(--ink);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
      line-height: 1.78;
    }
    .toolbar {
      position: sticky;
      top: 0;
      z-index: 10;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      padding: 14px clamp(16px, 4vw, 48px);
      border-bottom: 1px solid rgba(216,205,187,0.78);
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
    select {
      appearance: none;
      min-width: 118px;
      border: 1px solid rgba(8,127,122,0.22);
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
      border: 1px solid rgba(8,127,122,0.28);
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
    button:disabled { cursor: not-allowed; opacity: 0.45; }
    .status { min-width: 86px; color: var(--muted); font-size: 13px; text-align: right; }
    main { width: min(100%, 860px); margin: 34px auto 72px; padding: 0 18px; }
    article {
      overflow: hidden;
      border: 1px solid rgba(216,205,187,0.86);
      border-radius: 12px;
      background: var(--paper);
      box-shadow: var(--shadow);
    }
    .content { padding: clamp(24px, 5vw, 54px); }
    h1, h2, h3 { line-height: 1.28; letter-spacing: 0; }
    h1 { margin: 0 0 28px; font-size: clamp(28px, 5vw, 42px); }
    h2 {
      margin: 42px 0 14px;
      padding-top: 4px;
      border-top: 1px solid rgba(216,205,187,0.72);
      font-size: clamp(22px, 4vw, 28px);
    }
    h3 { margin: 30px 0 12px; font-size: 20px; }
    p { margin: 0 0 18px; font-size: 17px; }
    a { color: var(--accent-strong); text-decoration-thickness: 1px; text-underline-offset: 4px; }
    figure { margin: 28px -6px 34px; }
    figure img {
      display: block;
      width: 100%;
      height: auto;
      border: 1px solid rgba(216,205,187,0.9);
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
      color: #075f5b;
      font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace;
      font-size: 0.92em;
      padding: 0.12em 0.34em;
    }
    pre code { background: transparent; color: inherit; font-size: inherit; padding: 0; }
    blockquote {
      margin: 22px 0;
      border-left: 4px solid var(--coral);
      background: rgba(215,102,81,0.08);
      color: #4a4038;
      padding: 12px 18px;
    }
    @media (max-width: 640px) {
      .toolbar { align-items: flex-start; flex-direction: column; }
      .actions { width: 100%; }
      .style-picker { width: 100%; }
      select { flex: 1; min-width: 0; }
      button { flex: 1; }
      .status { min-width: 66px; }
      main { margin-top: 18px; padding: 0 10px; }
      article { border-radius: 10px; }
      .content { padding: 22px 16px 32px; }
      p, li { font-size: 16px; }
    }
  </style>
</head>
<body data-preview-style="paper">
  <header class="toolbar">
    <div class="toolbar-title">
      <strong>${escapeHtml(title)}</strong>
      <span>本地 Markdown 预览</span>
    </div>
    <div class="actions">
      <label class="style-picker">
        <span>样式</span>
        <select id="style-select" aria-label="选择预览样式">
          <option value="paper">工坊暖纸</option>
          <option value="wechat-green">公众号绿</option>
          <option value="clean-white">清爽白底</option>
          <option value="ink-note">墨色笔记</option>
        </select>
      </label>
      <button type="button" id="copy-md">复制 Markdown</button>
      <button type="button" id="copy-wechat" ${wechatHtml ? "" : "disabled"}>复制公众号排版</button>
      <span class="status" id="status">${wechatHtml ? "已加载排版" : "无排版 HTML"}</span>
    </div>
  </header>
  <main>
    <article>
      <div class="content">
${articleHtml}
      </div>
    </article>
  </main>
  <script type="application/json" id="markdown-source">${jsonForScript(markdown)}</script>
  <script type="application/json" id="wechat-source">${jsonForScript(wechatHtml)}</script>
  <script>
    const statusEl = document.getElementById("status");
    const styleSelect = document.getElementById("style-select");
    const markdown = JSON.parse(document.getElementById("markdown-source").textContent);
    const wechatHtml = JSON.parse(document.getElementById("wechat-source").textContent);
    function applyPreviewStyle(value) {
      document.body.dataset.previewStyle = value;
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
      window.setTimeout(() => { statusEl.textContent = wechatHtml ? "已加载排版" : "无排版 HTML"; }, 1200);
    });
    async function copyText(text, okText) {
      await navigator.clipboard.writeText(text);
      statusEl.textContent = okText;
      window.setTimeout(() => { statusEl.textContent = wechatHtml ? "已加载排版" : "无排版 HTML"; }, 1600);
    }
    document.getElementById("copy-md").addEventListener("click", () => {
      copyText(markdown, "已复制 Markdown").catch(() => { statusEl.textContent = "复制失败"; });
    });
    document.getElementById("copy-wechat").addEventListener("click", async () => {
      if (!wechatHtml) return;
      try {
        if (window.ClipboardItem) {
          const item = new ClipboardItem({
            "text/html": new Blob([wechatHtml], { type: "text/html" }),
            "text/plain": new Blob([markdown], { type: "text/plain" })
          });
          await navigator.clipboard.write([item]);
          statusEl.textContent = "已复制排版";
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
