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
  正文参考链接是否使用 [说明](https://...) 格式
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

function markdownLinkRanges(text) {
  const ranges = [];
  const pattern = /!?\[[^\]]*]\((https?:\/\/[^)\s]+)(?:\s+"[^"]*")?\)/g;
  let match;
  while ((match = pattern.exec(text)) !== null) {
    ranges.push([match.index, match.index + match[0].length]);
  }
  return ranges;
}

function isInsideRange(index, ranges) {
  return ranges.some(([start, end]) => index >= start && index < end);
}

function findLinkFormatIssues(markdownText) {
  const masked = maskFencedCode(markdownText);
  const ranges = markdownLinkRanges(masked);
  const issues = [];
  const nakedUrlPattern = /https?:\/\/[^\s<>)]+/g;
  let match;
  while ((match = nakedUrlPattern.exec(masked)) !== null) {
    if (isInsideRange(match.index, ranges)) continue;
    issues.push(`第 ${lineNumberAt(masked, match.index)} 行发现裸 URL，请改成 [说明](${match[0]}) 格式。`);
  }

  const markdownLinkPattern = /\[[^\]]+]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
  while ((match = markdownLinkPattern.exec(masked)) !== null) {
    if (masked[match.index - 1] === "!") continue;
    const url = match[1];
    if (!/^https?:\/\//i.test(url)) {
      issues.push(`第 ${lineNumberAt(masked, match.index)} 行链接缺少 http/https 协议：${match[0]}`);
    }
  }

  return issues;
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

const linkFormatIssues = findLinkFormatIssues(markdown);
for (const issue of linkFormatIssues) {
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
