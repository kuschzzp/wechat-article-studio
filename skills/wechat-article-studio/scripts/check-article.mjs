#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import { extractMarkdownImages, isRemoteUrl, normalizeImagePath } from "./lib/markdown.mjs";
import { scanHumanizer, scoreHumanizer } from "./lib/humanizer-zh.mjs";

function 帮助() {
  console.log(`用法：
node scripts/check-article.mjs <文章目录>

检查：
  必备文件是否存在
  article.md 是否引用至少 2 张图片
  本地图片路径是否存在
  正文图片是否默认使用图床 URL
  正文和发布清单里的来源是否使用纯文本 URL，而不是 Markdown 超链接
  正文 Markdown 是否有基本文章结构
  preview.html 中的 Markdown 快照是否和 article.md 一致
  article.md 是否有明显 AI 写作痕迹
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
const 必备文件 = ["writing-notes.md", "article.md", "publish-checklist.md", "image-brief.md"];
const 错误 = [];
const 警告 = [];

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function readIfExists(filePath) {
  try {
    return await fs.readFile(filePath, "utf8");
  } catch (error) {
    if (error.code === "ENOENT") return "";
    throw error;
  }
}

function maskFencedCode(markdownText) {
  return markdownText.replace(/```[\s\S]*?```/g, (match) => " ".repeat(match.length));
}

function lineNumberAt(text, index) {
  return text.slice(0, index).split("\n").length;
}

function findReferenceLinkIssues(markdownText, fileLabel) {
  const masked = maskFencedCode(markdownText);
  const issues = [];
  const markdownLinkPattern = /\[([^\]]*)]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
  let match;
  while ((match = markdownLinkPattern.exec(masked)) !== null) {
    if (masked[match.index - 1] === "!") continue;
    issues.push(`${fileLabel} 第 ${lineNumberAt(masked, match.index)} 行发现 Markdown 超链接。公众号外部来源请改成纯文本，例如：${match[1]}：${match[2]}`);
  }

  return issues;
}

function isMarkdownControlLine(trimmed) {
  return /^#{1,6}\s+/.test(trimmed)
    || /^!\[[^\]]*]\([^)]+\)/.test(trimmed)
    || /^[-*]\s+/.test(trimmed)
    || /^>\s?/.test(trimmed)
    || /^```/.test(trimmed);
}

function getMarkdownStructure(markdownText) {
  const masked = maskFencedCode(markdownText);
  const lines = masked.split("\n");
  const structure = {
    h1: 0,
    h2: 0,
    listItems: 0,
    quotes: 0,
    paragraphs: 0,
    maxShortParagraphRun: 0,
  };
  let shortParagraphRun = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      continue;
    }
    if (/^#\s+/.test(trimmed)) structure.h1 += 1;
    if (/^##\s+/.test(trimmed)) structure.h2 += 1;
    if (/^[-*]\s+/.test(trimmed)) structure.listItems += 1;
    if (/^>\s?/.test(trimmed)) structure.quotes += 1;

    if (!isMarkdownControlLine(trimmed)) {
      structure.paragraphs += 1;
      if (trimmed.length <= 24 && /[。！？.!?]$/.test(trimmed)) {
        shortParagraphRun += 1;
        structure.maxShortParagraphRun = Math.max(structure.maxShortParagraphRun, shortParagraphRun);
      } else {
        shortParagraphRun = 0;
      }
      continue;
    }

    shortParagraphRun = 0;
  }

  return structure;
}

function isGenericImageAlt(alt) {
  const normalized = String(alt || "").replace(/\s+/g, "");
  if (!normalized) return true;
  return /^(封面图|正文图|痛点图|方法图|配图|插图|图片|图\d+|第\d+张图)$/.test(normalized);
}

function findStructureWarnings(markdownText, images) {
  const structure = getMarkdownStructure(markdownText);
  const warnings = [];
  const isLongArticle = structure.paragraphs >= 35 || markdownText.length >= 1200;

  if (structure.h1 !== 1) {
    warnings.push(`正文 H1 数量为 ${structure.h1} 个。通常建议 article.md 只有 1 个主标题。`);
  }
  if (isLongArticle && structure.h2 === 0) {
    warnings.push("正文较长但没有二级标题，读起来容易像一整段口播稿。建议补 3-5 个 `##` 小节。");
  } else if (isLongArticle && structure.h2 < 3) {
    warnings.push(`正文较长但只有 ${structure.h2} 个二级标题。建议补到 3 个以上，但不必强行套满模板。`);
  }
  if (isLongArticle && structure.listItems === 0 && structure.quotes === 0) {
    warnings.push("正文较长但没有列表或引用块。建议至少用一次列表或引用，给读者一个可扫描的停靠点。");
  }
  if (isLongArticle && !/^##\s+我的想法\s*$/m.test(markdownText)) {
    warnings.push("建议用 `## 我的想法` 作为观点收束段；如果文章很短或已有更自然的收尾，可以人工忽略。");
  }
  if (structure.maxShortParagraphRun >= 8) {
    warnings.push(`发现连续 ${structure.maxShortParagraphRun} 个短句段落。短段落可以保留，但建议把解释性内容合并，避免整篇过碎。`);
  }

  for (const image of images) {
    if (isGenericImageAlt(image.alt)) {
      warnings.push(`图片 alt 偏泛：\`${image.alt || "(空)"}\`。建议写成画面描述，例如 \`封面图：创作者面对空白文档和一堆教程\`，但不会渲染为图注。`);
    }
  }

  return warnings;
}

for (const file of 必备文件) {
  if (!(await exists(path.join(articleDir, file)))) {
    错误.push(`缺少必备文件：${file}`);
  }
}

const articlePath = path.join(articleDir, "article.md");
const markdown = await readIfExists(articlePath);
if (!markdown.trim()) {
  错误.push("article.md 为空。");
}

const linkFormatIssues = findReferenceLinkIssues(markdown, "article.md");
for (const issue of linkFormatIssues) {
  错误.push(issue);
}

const publishChecklist = await readIfExists(path.join(articleDir, "publish-checklist.md"));
const checklistLinkIssues = findReferenceLinkIssues(publishChecklist, "publish-checklist.md");
for (const issue of checklistLinkIssues) {
  错误.push(issue);
}

const humanizerFindings = scanHumanizer(markdown);
const humanizerScore = scoreHumanizer(humanizerFindings);
const highHumanizerCount = humanizerFindings.filter((finding) => finding.level === "高").length;
if (humanizerScore < 45 || highHumanizerCount > 0) {
  警告.push(`AI 味扫描评分 ${humanizerScore}/50，高风险命中 ${highHumanizerCount} 处。可运行 check-ai-flavor.mjs 查看详情。`);
}

const images = extractMarkdownImages(markdown);
if (images.length < 2) {
  错误.push(`正文图片数量不足：当前 ${images.length} 张，至少需要 2 张。`);
}

for (const warning of findStructureWarnings(markdown, images)) {
  警告.push(warning);
}

const localImages = images.filter((image) => !isRemoteUrl(image.src));
const manifest = await readIfExists(path.join(articleDir, "image-host-manifest.json"));
if (localImages.length > 0) {
  警告.push(`正文仍有 ${localImages.length} 张图片使用本地路径。默认流程应上传图床并替换为线上 URL；只有无图床可用时才保留本地路径。`);
}
if (manifest && localImages.length > 0) {
  警告.push("已发现 image-host-manifest.json，但正文仍有本地图片路径。可重新运行 upload-images.mjs，或确认是否使用了 --manifest-only。");
}

for (const image of images) {
  if (isRemoteUrl(image.src)) continue;
  const localPath = path.join(articleDir, normalizeImagePath(image.src));
  if (!(await exists(localPath))) {
    错误.push(`正文引用的图片不存在：${image.src}`);
  }
}

const imageBrief = await readIfExists(path.join(articleDir, "image-brief.md"));
if (imageBrief && !/image-gen|提示词/.test(imageBrief)) {
  警告.push("image-brief.md 里没有看到 image-gen 或提示词说明。");
}

const preview = await readIfExists(path.join(articleDir, "preview.html"));
if (!preview) {
  警告.push("未发现 preview.html，可运行 build-preview.mjs 生成。");
} else {
  const match = preview.match(/<script type="application\/json" id="markdown-source">([\s\S]*?)<\/script>/);
  if (match) {
    try {
      const snapshot = JSON.parse(match[1]);
      if (snapshot !== markdown) {
        错误.push("preview.html 内嵌 Markdown 快照和 article.md 不一致。");
      }
    } catch {
      警告.push("preview.html 中的 Markdown 快照无法解析。");
    }
  } else {
    警告.push("preview.html 不是由当前脚本生成，无法自动比对 Markdown 快照。");
  }
}

console.log(`检查目录：${path.relative(process.cwd(), articleDir)}`);
console.log(`正文图片：${images.length} 张`);
console.log(`AI 味扫描评分：${humanizerScore}/50`);

if (警告.length) {
  console.log("\n警告：");
  for (const item of 警告) console.log(`- ${item}`);
}

if (错误.length) {
  console.log("\n错误：");
  for (const item of 错误) console.log(`- ${item}`);
  process.exit(1);
}

console.log("\n检查通过。");
