#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import { parseMarkdown, renderWechatArticle } from "./lib/markdown.mjs";
import { DEFAULT_WECHAT_THEME_ID, getWechatTheme, listWechatThemes } from "./lib/wechat-themes.mjs";

function 帮助() {
  console.log(`用法：
node scripts/render-wechat.mjs <文章目录>
node scripts/render-wechat.mjs <文章目录> --theme tech-comic
node scripts/render-wechat.mjs --list-themes

功能：
  把 article.md 渲染成 publish.wechat.html。
  如果目录里有 image-host-manifest.json，会自动把本地图片路径替换成线上 URL。
  默认主题：${DEFAULT_WECHAT_THEME_ID}
`);
}

if (process.argv.includes("--help") || process.argv.includes("-h")) {
  帮助();
  process.exit(0);
}

if (process.argv.includes("--list-themes")) {
  for (const theme of listWechatThemes()) {
    console.log(`${theme.id}\t${theme.label}\t${theme.description}`);
  }
  process.exit(0);
}

const target = process.argv[2];
if (!target) {
  帮助();
  process.exit(1);
}

function readThemeId() {
  const inline = process.argv.find((arg) => arg.startsWith("--theme="));
  if (inline) return inline.slice("--theme=".length);
  const index = process.argv.indexOf("--theme");
  if (index >= 0) return process.argv[index + 1] || "";
  return DEFAULT_WECHAT_THEME_ID;
}

const articleDir = path.resolve(target);
const articlePath = path.join(articleDir, "article.md");
const outputPath = path.join(articleDir, "publish.wechat.html");
const manifestPath = path.join(articleDir, "image-host-manifest.json");
const themeId = readThemeId();

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
  const theme = getWechatTheme(themeId, { strict: true });
  const html = renderWechatArticle(parseMarkdown(markdown), { articleDir, manifest, themeId: theme.id, strictTheme: true });
  await fs.writeFile(outputPath, html, "utf8");
  console.log(`已生成：${path.relative(process.cwd(), outputPath)}`);
  console.log(`使用主题：${theme.id}（${theme.label}）`);
  if (manifest) {
    console.log("已使用 image-host-manifest.json 替换线上图片地址。");
  } else {
    console.log("未发现 image-host-manifest.json，图片仍使用 article.md 中的原始路径。");
  }
} catch (error) {
  console.error(`渲染公众号排版失败：${error.message}`);
  process.exit(1);
}
