#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";

function 参数值(name, fallback = "") {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] || fallback : fallback;
}

function 有参数(name) {
  return process.argv.includes(name);
}

function 今天() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function slugify(value) {
  const slug = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "article";
}

function 帮助() {
  console.log(`用法：
node scripts/scaffold-article.mjs --title "文章标题" --slug short-topic

可选参数：
  --date YYYY-MM-DD   指定日期，默认今天
  --force             目录存在时补齐缺失文件
`);
}

if (有参数("--help") || 有参数("-h")) {
  帮助();
  process.exit(0);
}

const title = 参数值("--title", "未命名公众号文章");
const slug = slugify(参数值("--slug", title));
const date = 参数值("--date", 今天());
const force = 有参数("--force");
const articleDir = path.resolve(`${date}-${slug}`);

async function writeIfMissing(filePath, content) {
  try {
    await fs.writeFile(filePath, content, { flag: "wx" });
    console.log(`已创建：${path.relative(process.cwd(), filePath)}`);
  } catch (error) {
    if (error.code === "EEXIST") {
      console.log(`已存在，未覆盖：${path.relative(process.cwd(), filePath)}`);
      return;
    }
    throw error;
  }
}

try {
  if (!force) {
    try {
      await fs.mkdir(articleDir);
    } catch (error) {
      if (error.code !== "EEXIST") throw error;
      console.log(`目录已存在，将补齐缺失文件：${path.relative(process.cwd(), articleDir)}`);
    }
  } else {
    await fs.mkdir(articleDir, { recursive: true });
  }
  await fs.mkdir(path.join(articleDir, "images"), { recursive: true });

  await writeIfMissing(path.join(articleDir, "writing-notes.md"), `# 本文章编写思路文档

## 选题

项目或事件：${title}

文章主线：

## 读者

这篇文章写给谁：

读者已经知道什么：

读者可能卡在哪里：

## 一句话观点

一句人话说清楚这篇文章的判断：

## 事实依据

本文查阅时间：

已核对的信息：

- 来源 1：
- 来源 2：

不写死的信息：

- 版本号、Star 数、价格、发布时间等变化快的信息，发布当天再刷新。

## 表达方式

这篇文章用什么比喻或漫画场景：

要保留的作者判断：

## 正文结构

1. 开场痛点：
2. 它是什么：
3. 它怎么工作：
4. 实用场景：
5. 注意事项：
6. 试用方式：
7. 作者判断：

## 标题备选

- ${title}

推荐标题：

## 人性化检查

- 删除填充短语：此外、值得注意的是、为了实现这一目标。
- 删除宏大意义：标志着、至关重要、不断演变的格局、彰显。
- 打破公式结构：不仅……而且……、不是……而是……、三段式形容词。
- 检查模糊归因：专家认为、行业报告显示、多个来源表示。
- 保留作者判断、具体事实和必要怀疑。
- 质量评分：直接性 /10，节奏 /10，信任度 /10，真实性 /10，精炼度 /10，总分 /50。
`);

  await writeIfMissing(path.join(articleDir, "article.md"), `# ${title}

![封面图：补充说明](images/01-cover.png)

在这里写正文。
`);

  await writeIfMissing(path.join(articleDir, "image-brief.md"), `# 文章配图设计文案

## 总体风格

短漫画风格，适合技术公众号。画面要轻松、清楚、有一点作者自己的观察。

统一要求：

- 所有实际配图必须使用 image-gen 生成。
- 调用 image-gen 时按图片序号串行生成：先完成并保存 01，再生成 02，禁止并发。
- 图片默认不强塞文字；可根据场景克制使用短标题、标牌、按钮词、气泡词或图解标签。
- 精确长文案优先放正文或后期叠字，不交给 image-gen 硬生成；避免 logo、水印、品牌名、伪代码和密集小字。
- 主角、色彩和线条风格尽量统一。

## 图片数量

至少 2 张。漫画风格文章按节奏决定张数。

## 01 封面图

建议文件名：\`images/01-cover.png\`

用途：

画面：

构图：

核心情绪：

文字设计：

image-gen 提示词：

\`\`\`text
用途：微信公众号技术文章短漫画封面。
资产类型：16:9 横向插画。
主要画面：
场景背景：
主体角色：
风格：现代中文技术短漫画，软墨线，扁平色块，轻微纸张纹理，手机尺寸下也清楚。
构图：
配色：
文字设计：默认不加文字；如果场景需要，只使用 1-3 个短词作为标题、标牌、按钮词、气泡词或图解标签。
避免：真实品牌界面、密集小字、长句、精确文案、logo、水印、伪代码、恐怖气氛、动物角色。
\`\`\`

## 02 正文图

建议文件名：\`images/02-scene.png\`

用途：

画面：

构图：

核心情绪：

文字设计：

image-gen 提示词：

\`\`\`text
用途：微信公众号文章正文短漫画配图。
资产类型：16:9 横向插画。
主要画面：
场景背景：
主体角色：
风格：现代中文技术短漫画，软墨线，扁平色块，轻微纸张纹理，手机尺寸下也清楚。
构图：
配色：
文字设计：默认不加文字；如果场景需要，只使用 1-3 个短词作为标题、标牌、按钮词、气泡词或图解标签。
避免：真实品牌界面、密集小字、长句、精确文案、logo、水印、伪代码、恐怖气氛、动物角色。
\`\`\`
`);

  await writeIfMissing(path.join(articleDir, "publish-checklist.md"), `# 发布注意事项文档

## 发布前必须刷新

本文事实核对时间：

发布当天需要再检查：

- 最新版本或发布时间：
- 官方文档是否变化：
- 安装命令或使用方式是否变化：
- Star / fork 数量如果要写，必须当天刷新：

## 链接

- [官方来源：标题](https://example.com/)
- [文档：标题](https://example.com/)
- [Release 或论文：标题](https://example.com/)

链接规则：使用 Markdown 标准链接，不写裸 URL。

## 风险表述

不要写：

- “一定有效。”
- “完全解决。”

可以写：

- “在官方测试条件下……”
- “更像……不是……”

## 去 AI 味复核

- 是否删除“此外、至关重要、标志着、彰显、不断演变的格局”。
- 是否避免“这不仅是……更是……”。
- 是否删掉模糊归因。
- 是否有真实作者判断。
- AI 味扫描评分：

## 配图

- 封面图：
- 正文图：

## 排版建议

- 标题：
- 摘要：
- 首屏：
- 图片说明：

## 图床与外链

- 图床 provider：
- 图床过期时间：
- 正文图片是否已替换成线上 URL：
- 无图床可用时的本地路径 fallback：
`);

  console.log(`文章目录已准备好：${path.relative(process.cwd(), articleDir)}`);
} catch (error) {
  console.error(`创建失败：${error.message}`);
  process.exit(1);
}
