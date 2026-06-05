import path from "node:path";
import { DEFAULT_WECHAT_THEME_ID, getWechatTheme } from "./wechat-themes.mjs";

export function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function escapeAttribute(value) {
  return escapeHtml(value).replaceAll("'", "&#39;");
}

function isBlockStart(line) {
  return /^#{1,6}\s+/.test(line)
    || /^!\[[^\]]*]\([^)]+\)\s*$/.test(line)
    || /^[-*]\s+/.test(line)
    || /^>\s?/.test(line)
    || /^```/.test(line);
}

export function parseMarkdown(markdown) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const blocks = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) {
      i += 1;
      continue;
    }

    const fence = line.match(/^```\s*([A-Za-z0-9_-]+)?\s*$/);
    if (fence) {
      const language = fence[1] || "";
      const code = [];
      i += 1;
      while (i < lines.length && !/^```\s*$/.test(lines[i])) {
        code.push(lines[i]);
        i += 1;
      }
      if (i < lines.length) i += 1;
      blocks.push({ type: "code", language, text: code.join("\n") });
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.+?)\s*$/);
    if (heading) {
      blocks.push({ type: "heading", level: heading[1].length, text: heading[2] });
      i += 1;
      continue;
    }

    const image = line.match(/^!\[([^\]]*)]\(([^)]+)\)\s*$/);
    if (image) {
      blocks.push({ type: "image", alt: image[1], src: image[2] });
      i += 1;
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^[-*]\s+/, "").trim());
        i += 1;
      }
      blocks.push({ type: "list", items });
      continue;
    }

    if (/^>\s?/.test(line)) {
      const quote = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) {
        quote.push(lines[i].replace(/^>\s?/, ""));
        i += 1;
      }
      blocks.push({ type: "quote", text: quote.join("\n") });
      continue;
    }

    const paragraph = [line.trim()];
    i += 1;
    while (i < lines.length && lines[i].trim() && !isBlockStart(lines[i])) {
      paragraph.push(lines[i].trim());
      i += 1;
    }
    blocks.push({ type: "paragraph", text: paragraph.join(" ") });
  }

  return blocks;
}

export function extractTitle(blocks, fallback = "文章预览") {
  const firstTitle = blocks.find((block) => block.type === "heading" && block.level === 1);
  return firstTitle ? firstTitle.text : fallback;
}

export function extractMarkdownImages(markdown) {
  const images = [];
  const pattern = /!\[([^\]]*)]\(([^)]+)\)/g;
  let match;
  while ((match = pattern.exec(markdown)) !== null) {
    images.push({ alt: match[1], src: match[2] });
  }
  return images;
}

export function isRemoteUrl(src) {
  return /^https?:\/\//i.test(src) || /^data:/i.test(src);
}

export function normalizeImagePath(src) {
  return src.split("#")[0].split("?")[0];
}

export function renderInline(text, options = {}) {
  const tokens = [];
  let rest = String(text);
  let codeIndex = 0;
  const codeStyle = options.codeStyle ? ` style="${escapeAttribute(options.codeStyle)}"` : "";
  const linkStyle = options.linkStyle ? ` style="${escapeAttribute(options.linkStyle)}"` : "";

  rest = rest.replace(/`([^`]+)`/g, (_, code) => {
    const key = `@@CODE_${codeIndex}@@`;
    tokens.push({ key, html: `<code${codeStyle}>${escapeHtml(code)}</code>` });
    codeIndex += 1;
    return key;
  });

  rest = escapeHtml(rest);
  rest = rest.replace(/\[([^\]]+)]\((https?:\/\/[^)]+)\)/g, (_, label, url) => {
    return `<a href="${escapeAttribute(url)}"${linkStyle}>${label}</a>`;
  });
  rest = rest.replace(/(^|[\s(])((https?:\/\/)[^\s<)]+)/g, (_, prefix, url) => {
    return `${prefix}<a href="${escapeAttribute(url)}"${linkStyle}>${escapeHtml(url)}</a>`;
  });

  for (const token of tokens) {
    rest = rest.replace(token.key, token.html);
  }

  return rest;
}

export function renderPreviewArticle(blocks) {
  return blocks.map((block) => {
    if (block.type === "heading") {
      const level = Math.min(block.level, 3);
      if (level === 2) {
        return `<h2><span class="heading-content">${renderInline(block.text)}</span></h2>`;
      }
      return `<h${level}>${renderInline(block.text)}</h${level}>`;
    }
    if (block.type === "paragraph") {
      return `<p>${renderInline(block.text)}</p>`;
    }
    if (block.type === "image") {
      return [
        "<figure>",
        `<img src="${escapeAttribute(block.src)}" alt="${escapeAttribute(block.alt)}">`,
        block.alt ? `<figcaption>${escapeHtml(block.alt)}</figcaption>` : "",
        "</figure>",
      ].join("");
    }
    if (block.type === "list") {
      return `<ul>${block.items.map((item) => `<li>${renderInline(item)}</li>`).join("")}</ul>`;
    }
    if (block.type === "quote") {
      return `<blockquote>${block.text.split("\n").map(renderInline).join("<br>")}</blockquote>`;
    }
    if (block.type === "code") {
      return `<pre><code>${escapeHtml(block.text)}</code></pre>`;
    }
    return "";
  }).join("\n");
}

export function resolveImageSrc(src, articleDir, manifest) {
  if (isRemoteUrl(src)) return src;
  const normalized = normalizeImagePath(src);
  const fromManifest = manifest?.images?.find((item) => {
    const localPath = normalizeImagePath(item.localPath || "");
    return localPath === normalized || path.normalize(localPath) === path.normalize(normalized);
  });
  if (fromManifest?.url) return fromManifest.url;
  return normalized;
}

function renderWechatInline(text, theme) {
  return renderInline(text, {
    codeStyle: theme.styles.code,
    linkStyle: theme.styles.link,
  });
}

export function renderWechatArticle(blocks, options = {}) {
  const articleDir = options.articleDir || "";
  const manifest = options.manifest || null;
  const theme = getWechatTheme(options.themeId || DEFAULT_WECHAT_THEME_ID, { strict: Boolean(options.strictTheme) });
  const 样式 = theme.styles;
  const html = blocks.map((block) => {
    if (block.type === "heading") {
      if (block.level === 1) {
        return `<h1 data-tool="wechat-article-studio" data-theme="${escapeAttribute(theme.id)}" style="${样式.h1}"><span style="${样式.h1Span || ""}">${renderWechatInline(block.text, theme)}</span></h1>`;
      }
      return `<h2 data-tool="wechat-article-studio" data-theme="${escapeAttribute(theme.id)}" style="${样式.h2}"><span style="${样式.h2Span || ""}">${renderWechatInline(block.text, theme)}</span>${样式.h2Suffix || ""}</h2>`;
    }
    if (block.type === "paragraph") {
      return `<p data-tool="wechat-article-studio" data-theme="${escapeAttribute(theme.id)}" style="${样式.p}">${renderWechatInline(block.text, theme)}</p>`;
    }
    if (block.type === "image") {
      const src = resolveImageSrc(block.src, articleDir, manifest);
      return [
        `<figure data-tool="wechat-article-studio" data-theme="${escapeAttribute(theme.id)}" style="${样式.figure}">`,
        `<img src="${escapeAttribute(src)}" alt="${escapeAttribute(block.alt)}" style="${样式.img}">`,
        block.alt ? `<figcaption style="${样式.figcaption}">${escapeHtml(block.alt)}</figcaption>` : "",
        "</figure>",
      ].join("");
    }
    if (block.type === "list") {
      const items = block.items.map((item) => {
        return `<li><section style="${样式.liSection}">${renderWechatInline(item, theme)}</section></li>`;
      }).join("");
      return `<ul data-tool="wechat-article-studio" data-theme="${escapeAttribute(theme.id)}" style="${样式.ul}">${items}</ul>`;
    }
    if (block.type === "quote") {
      return `<blockquote data-tool="wechat-article-studio" data-theme="${escapeAttribute(theme.id)}" style="${样式.quote}">${block.text.split("\n").map((line) => renderWechatInline(line, theme)).join("<br>")}</blockquote>`;
    }
    if (block.type === "code") {
      return `<pre data-tool="wechat-article-studio" data-theme="${escapeAttribute(theme.id)}" style="${样式.pre}"><code style="${样式.preCode}">${escapeHtml(block.text)}</code></pre>`;
    }
    return "";
  }).join("\n");

  return `<section id="nice" data-tool="wechat-article-studio" data-theme="${escapeAttribute(theme.id)}" style="${样式.root}">\n${html}\n</section>\n`;
}
