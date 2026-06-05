#!/usr/bin/env node

const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const rootDir = path.resolve(__dirname, "..");
const requiredFiles = [
  "README.md",
  "README.zh-CN.md",
  "ROADMAP.md",
  "LICENSE",
  "package.json",
  ".codex-plugin/plugin.json",
  "skills/wechat-article-studio/SKILL.md",
  "skills/wechat-article-studio/agents/openai.yaml",
  "skills/wechat-article-studio/references/workflow.md",
  "skills/wechat-article-studio/references/image-prompts.md",
  "skills/wechat-article-studio/references/humanizer-zh.md",
  "skills/wechat-article-studio/assets/previews/index.html"
];

const scriptFiles = [
  "skills/wechat-article-studio/scripts/scaffold-article.mjs",
  "skills/wechat-article-studio/scripts/build-preview.mjs",
  "skills/wechat-article-studio/scripts/render-wechat.mjs",
  "skills/wechat-article-studio/scripts/upload-images.mjs",
  "skills/wechat-article-studio/scripts/check-article.mjs",
  "skills/wechat-article-studio/scripts/check-ai-flavor.mjs",
  "skills/wechat-article-studio/scripts/lib/markdown.mjs",
  "skills/wechat-article-studio/scripts/lib/humanizer-zh.mjs",
  "skills/wechat-article-studio/scripts/lib/wechat-themes.mjs",
  "skills/wechat-article-studio/scripts/image-hosts/index.mjs",
  "skills/wechat-article-studio/scripts/image-hosts/temppic.mjs"
];

function fail(message) {
  console.error(`检查失败：${message}`);
  process.exitCode = 1;
}

function warn(message) {
  console.warn(`检查提示：${message}`);
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath);
    } else if (entry.isFile() && entry.name === ".DS_Store") {
      warn(`发现已忽略的 .DS_Store：${path.relative(rootDir, fullPath)}`);
    }
  }
}

for (const file of requiredFiles) {
  const fullPath = path.join(rootDir, file);
  if (!fs.existsSync(fullPath)) {
    fail(`缺少必备文件：${file}`);
  }
}

for (const file of scriptFiles) {
  const fullPath = path.join(rootDir, file);
  if (!fs.existsSync(fullPath)) {
    fail(`缺少脚本：${file}`);
    continue;
  }
  const result = spawnSync(process.execPath, ["--check", fullPath], { encoding: "utf8" });
  if (result.status !== 0) {
    fail(`${file} 语法检查未通过\n${result.stderr || result.stdout}`);
  }
}

walk(path.join(rootDir, "skills"));

if (!process.exitCode) {
  console.log("检查通过。");
}
