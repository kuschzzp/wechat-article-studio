#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import { extractMarkdownImages, isRemoteUrl, normalizeImagePath } from "./lib/markdown.mjs";
import { uploadWithRotation } from "./image-hosts/index.mjs";

function 参数值(name, fallback = "") {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] || fallback : fallback;
}

function 有参数(name) {
  return process.argv.includes(name);
}

function 帮助() {
  console.log(`用法：
node scripts/upload-images.mjs <文章目录> --provider temppic
node scripts/upload-images.mjs <文章目录> --provider temppic --dry-run
node scripts/upload-images.mjs <文章目录> --provider temppic --manifest-only

功能：
  读取 article.md 中引用的本地图片，上传到临时图床，写入 image-host-manifest.json。
  默认会把 article.md 中的本地图片路径替换成上传后的线上 URL。
  --dry-run 只列出将要上传的图片，不真正联网。
  --manifest-only 只写 manifest，不替换 article.md。
`);
}

if (有参数("--help") || 有参数("-h")) {
  帮助();
  process.exit(0);
}

const target = process.argv[2];
if (!target) {
  帮助();
  process.exit(1);
}

const providerArg = 参数值("--provider", "temppic");
const providerNames = providerArg.split(",").map((item) => item.trim()).filter(Boolean);
const dryRun = 有参数("--dry-run");
const manifestOnly = 有参数("--manifest-only") || 有参数("--keep-local");
const articleDir = path.resolve(target);
const articlePath = path.join(articleDir, "article.md");
const manifestPath = path.join(articleDir, "image-host-manifest.json");

function replaceMarkdownImageUrls(markdown, manifest) {
  const urlByLocalPath = new Map(manifest.images.map((image) => [normalizeImagePath(image.localPath), image.url]));
  return markdown.replace(/!\[([^\]]*)]\(([^)]+)\)/g, (match, alt, src) => {
    if (isRemoteUrl(src)) return match;
    const normalized = normalizeImagePath(src);
    const url = urlByLocalPath.get(normalized);
    return url ? `![${alt}](${url})` : match;
  });
}

try {
  const markdown = await fs.readFile(articlePath, "utf8");
  const images = extractMarkdownImages(markdown)
    .filter((image) => !isRemoteUrl(image.src))
    .map((image) => ({ ...image, src: normalizeImagePath(image.src) }));

  const uniqueImages = [];
  const seen = new Set();
  for (const image of images) {
    if (seen.has(image.src)) continue;
    seen.add(image.src);
    uniqueImages.push(image);
  }

  if (!uniqueImages.length) {
    console.log("正文里没有需要上传的本地图片。");
    process.exit(0);
  }

  console.log(`待上传图片：${uniqueImages.length} 张`);
  for (const image of uniqueImages) {
    console.log(`- ${image.src}`);
  }

  if (dryRun) {
    console.log(`dry-run 模式结束，没有上传。正式运行时会${manifestOnly ? "只写 manifest，不替换 article.md" : "把 article.md 图片路径替换成线上 URL"}。`);
    process.exit(0);
  }

  const manifest = {
    provider: providerNames.join(","),
    uploadedAt: new Date().toISOString(),
    articleUpdated: !manifestOnly,
    images: [],
  };

  for (const image of uniqueImages) {
    const filePath = path.join(articleDir, image.src);
    await fs.access(filePath);
    console.log(`上传中：${image.src}`);
    const uploaded = await uploadWithRotation(filePath, providerNames);
    manifest.images.push({
      localPath: image.src,
      id: uploaded.id,
      url: uploaded.url,
      expiresAt: uploaded.expiresAt,
      provider: uploaded.provider,
      metadata: uploaded.metadata,
    });
    console.log(`已上传：${uploaded.url}`);
  }

  await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  console.log(`已写入：${path.relative(process.cwd(), manifestPath)}`);
  if (!manifestOnly) {
    const updatedMarkdown = replaceMarkdownImageUrls(markdown, manifest);
    await fs.writeFile(articlePath, updatedMarkdown, "utf8");
    console.log("已把 article.md 中的本地图片路径替换成线上 URL。");
  } else {
    console.log("manifest-only 模式：article.md 仍保留本地图片路径。");
  }
  console.log("临时图床可能过期，发布前请重新检查 URL。");
} catch (error) {
  console.error(`上传失败：${error.message}`);
  process.exit(1);
}
