import path from "node:path";

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

export function renderInline(text) {
  const tokens = [];
  let rest = String(text);
  let codeIndex = 0;

  rest = rest.replace(/`([^`]+)`/g, (_, code) => {
    const key = `@@CODE_${codeIndex}@@`;
    tokens.push({ key, html: `<code>${escapeHtml(code)}</code>` });
    codeIndex += 1;
    return key;
  });

  rest = escapeHtml(rest);
  rest = rest.replace(/\[([^\]]+)]\((https?:\/\/[^)]+)\)/g, (_, label, url) => {
    return `<a href="${escapeAttribute(url)}">${label}</a>`;
  });
  rest = rest.replace(/(^|[\s(])((https?:\/\/)[^\s<)]+)/g, (_, prefix, url) => {
    return `${prefix}<a href="${escapeAttribute(url)}">${escapeHtml(url)}</a>`;
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

const 微信样式 = {
  root: "padding: 0 10px; line-height: 1.6; word-break: break-word; word-wrap: break-word; text-align: left; font-family: Optima-Regular, Optima, PingFangSC-light, PingFangTC-light, 'PingFang SC', Cambria, Cochin, Georgia, Times, 'Times New Roman', serif; font-size: 15px; letter-spacing: 0.03em; color: #595959;",
  h1: "margin: 1.2em 0 1em; padding: 0; font-weight: bold; color: #35b378; font-size: 24px; line-height: 1.35;",
  h2: "margin: 1.2em 0 0.4em; padding: 0.45em 0; color: #35b378; font-weight: bold; font-size: 22px; line-height: 1.35;",
  p: "font-size: 16px; padding-top: 8px; padding-bottom: 8px; line-height: 26px; color: #111; margin: 1em 4px;",
  figure: "margin: 18px 0; display: flex; flex-direction: column; justify-content: center; align-items: center;",
  img: "display: block; margin: 0 auto; max-width: 100%; border-radius: 4px;",
  figcaption: "margin-top: 6px; text-align: center; color: #888; font-size: 14px; line-height: 1.5;",
  ul: "margin-top: 8px; margin-bottom: 8px; padding-left: 25px; color: #111; list-style-type: disc;",
  liSection: "margin: 8px 0; line-height: 26px; text-align: left; color: #111; font-weight: 500;",
  code: "font-size: 14px; word-wrap: break-word; padding: 2px 4px; border-radius: 4px; margin: 0 2px; background-color: rgba(27,31,35,.05); font-family: Operator Mono, Consolas, Monaco, Menlo, monospace; word-break: break-all; color: #35b378;",
  pre: "margin: 12px 0; overflow-x: auto;",
  preCode: "overflow-x: auto; padding: 16px; color: #333; background: #f8f8f8; display: block; font-family: Operator Mono, Consolas, Monaco, Menlo, monospace; border-radius: 0; font-size: 12px; line-height: 1.7; white-space: pre-wrap;",
  quote: "margin: 14px 4px; padding: 10px 14px; border-left: 3px solid #35b378; background: rgba(53,179,120,0.08); color: #333; font-size: 16px; line-height: 26px;",
};

function renderWechatInline(text) {
  return renderInline(text).replaceAll("<code>", `<code style="${微信样式.code}">`);
}

export function renderWechatArticle(blocks, options = {}) {
  const articleDir = options.articleDir || "";
  const manifest = options.manifest || null;
  const html = blocks.map((block) => {
    if (block.type === "heading") {
      if (block.level === 1) {
        return `<h1 data-tool="wechat-article-studio" style="${微信样式.h1}"><span>${renderWechatInline(block.text)}</span></h1>`;
      }
      return `<h2 data-tool="wechat-article-studio" style="${微信样式.h2}"><span>${renderWechatInline(block.text)}</span></h2>`;
    }
    if (block.type === "paragraph") {
      return `<p data-tool="wechat-article-studio" style="${微信样式.p}">${renderWechatInline(block.text)}</p>`;
    }
    if (block.type === "image") {
      const src = resolveImageSrc(block.src, articleDir, manifest);
      return [
        `<figure data-tool="wechat-article-studio" style="${微信样式.figure}">`,
        `<img src="${escapeAttribute(src)}" alt="${escapeAttribute(block.alt)}" style="${微信样式.img}">`,
        block.alt ? `<figcaption style="${微信样式.figcaption}">${escapeHtml(block.alt)}</figcaption>` : "",
        "</figure>",
      ].join("");
    }
    if (block.type === "list") {
      const items = block.items.map((item) => {
        return `<li><section style="${微信样式.liSection}">${renderWechatInline(item)}</section></li>`;
      }).join("");
      return `<ul data-tool="wechat-article-studio" style="${微信样式.ul}">${items}</ul>`;
    }
    if (block.type === "quote") {
      return `<blockquote data-tool="wechat-article-studio" style="${微信样式.quote}">${block.text.split("\n").map(renderWechatInline).join("<br>")}</blockquote>`;
    }
    if (block.type === "code") {
      return `<pre data-tool="wechat-article-studio" style="${微信样式.pre}"><code style="${微信样式.preCode}">${escapeHtml(block.text)}</code></pre>`;
    }
    return "";
  }).join("\n");

  return `<section id="nice" data-tool="wechat-article-studio" style="${微信样式.root}">\n${html}\n</section>\n`;
}
