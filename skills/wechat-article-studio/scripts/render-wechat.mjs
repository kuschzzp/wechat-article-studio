#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import { parseMarkdown, renderWechatArticle } from "./lib/markdown.mjs";

function 帮助() {
  console.log(`用法：
node scripts/render-wechat.mjs <文章目录>

功能：
  把 article.md 渲染成 publish.wechat.html。
  如果目录里有 image-host-manifest.json，会自动把本地图片路径替换成线上 URL。
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
const outputPath = path.join(articleDir, "publish.wechat.html");
const manifestPath = path.join(articleDir, "image-host-manifest.json");

async function readManifest() {
  try {
    return JSON.parse(await fs.readFile(manifestPath, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return null;
    throw error;
  }
}

try {
  const markdown = await fs.readFile(articlePath, "utf8");
  const manifest = await readManifest();
  const html = renderWechatArticle(parseMarkdown(markdown), { articleDir, manifest });
  await fs.writeFile(outputPath, html, "utf8");
  console.log(`已生成：${path.relative(process.cwd(), outputPath)}`);
  if (manifest) {
    console.log("已使用 image-host-manifest.json 替换线上图片地址。");
  } else {
    console.log("未发现 image-host-manifest.json，图片仍使用本地路径。");
  }
} catch (error) {
  console.error(`渲染公众号排版失败：${error.message}`);
  process.exit(1);
}
