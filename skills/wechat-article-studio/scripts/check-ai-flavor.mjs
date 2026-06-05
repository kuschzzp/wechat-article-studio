#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import { scanHumanizer, scoreHumanizer, summarizeHumanizer } from "./lib/humanizer-zh.mjs";

function 帮助() {
  console.log(`用法：
node scripts/check-ai-flavor.mjs <文章目录或 Markdown 文件> [--strict]

检查：
  扫描 article.md 或指定 Markdown 文件中的 AI 写作痕迹。
  --strict 会在评分低于 45 分或发现高风险项时返回失败。
`);
}

if (process.argv.includes("--help") || process.argv.includes("-h")) {
  帮助();
  process.exit(0);
}

const target = process.argv[2];
const strict = process.argv.includes("--strict");
if (!target) {
  帮助();
  process.exit(1);
}

const resolved = path.resolve(target);
let articlePath = resolved;

try {
  const stat = await fs.stat(resolved);
  if (stat.isDirectory()) articlePath = path.join(resolved, "article.md");
} catch (error) {
  console.error(`读取失败：${error.message}`);
  process.exit(1);
}

try {
  const markdown = await fs.readFile(articlePath, "utf8");
  const findings = scanHumanizer(markdown);
  const score = scoreHumanizer(findings);

  console.log(`检查文件：${path.relative(process.cwd(), articlePath)}`);
  console.log(`AI 味扫描评分：${score}/50`);

  const summary = summarizeHumanizer(findings);
  if (summary.length) {
    console.log("\n问题概览：");
    for (const item of summary) {
      console.log(`- [${item.level}] ${item.name}：${item.count} 处`);
    }

    console.log("\n前 12 条命中：");
    for (const finding of findings.slice(0, 12)) {
      console.log(`- 第 ${finding.line} 行 [${finding.level}] ${finding.name}：${finding.pattern}`);
      console.log(`  片段：${finding.excerpt}`);
      console.log(`  建议：${finding.advice}`);
    }
  } else {
    console.log("\n没有扫描到明显 AI 写作痕迹。");
  }

  const hasHigh = findings.some((finding) => finding.level === "高");
  if (strict && (score < 45 || hasHigh)) {
    console.error("\nstrict 模式未通过：请先处理高风险项，并尽量把评分提高到 45 分以上。");
    process.exit(1);
  }
} catch (error) {
  console.error(`检查失败：${error.message}`);
  process.exit(1);
}
