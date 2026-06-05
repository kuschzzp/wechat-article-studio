const 规则 = [
  {
    level: "高",
    name: "宏大意义或行业升华",
    patterns: ["标志着", "见证了", "至关重要", "关键转折点", "不断演变的格局", "技术格局", "彰显", "体现了", "证明了", "奠定基础", "不可磨灭"],
    advice: "改成具体功能、事实、来源或使用边界。",
  },
  {
    level: "高",
    name: "宣传广告腔",
    patterns: ["充满活力", "丰富的", "深刻的", "开创性的", "令人叹为观止", "必游之地", "无缝", "直观", "强大", "赋能"],
    advice: "少用形容词，改写成可验证的功能或例子。",
  },
  {
    level: "中",
    name: "常见 AI 连接词和抽象词",
    patterns: ["此外", "然而", "深入探讨", "强调", "展示", "增强", "培养", "关键性的", "复杂性", "宝贵的"],
    advice: "能删就删，不能删就换成更直接的说法。",
  },
  {
    level: "高",
    name: "模糊归因",
    patterns: ["行业报告显示", "专家认为", "观察者指出", "一些批评者认为", "多个来源", "业内人士"],
    advice: "补具体来源、日期和原始说法；补不上就删。",
  },
  {
    level: "高",
    name: "聊天助手痕迹",
    patterns: ["当然", "好问题", "希望这对你有帮助", "希望这对您有帮助", "如果你想让我", "如果您想让我", "你说得完全正确", "您说得完全正确", "请告诉我"],
    advice: "正文不要保留对话痕迹。",
  },
  {
    level: "高",
    name: "知识截止免责声明",
    patterns: ["截至我的知识更新", "根据我最后的训练", "基于可用信息", "虽然具体细节有限", "现成资料中没有广泛记录"],
    advice: "联网核对后写具体日期和来源；不确定项放发布清单。",
  },
  {
    level: "中",
    name: "公式化结构",
    patterns: ["不仅", "更是", "不只是", "不仅仅是", "未来展望", "尽管存在这些挑战"],
    advice: "检查是否在机械升华或硬凑结构。像“不是……而是……”和“从 X 到 Y”这类结构只做人工复核，不自动扣分。",
    regex: true,
  },
];

function 行列(text, index) {
  const before = text.slice(0, index);
  const lines = before.split("\n");
  return { line: lines.length, column: lines.at(-1).length + 1 };
}

function 摘要(text, index, length) {
  const start = Math.max(0, index - 18);
  const end = Math.min(text.length, index + length + 18);
  return text.slice(start, end).replace(/\s+/g, " ");
}

function 句子列表(text) {
  return text
    .replace(/```[\s\S]*?```/g, "")
    .split(/(?<=[。！？!?])\s*/g)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

export function scanHumanizer(text) {
  const findings = [];

  for (const rule of 规则) {
    for (const pattern of rule.patterns) {
      if (rule.regex) {
        const regex = new RegExp(pattern, "g");
        let match;
        while ((match = regex.exec(text)) !== null) {
          const position = 行列(text, match.index);
          findings.push({
            level: rule.level,
            name: rule.name,
            pattern,
            line: position.line,
            column: position.column,
            excerpt: 摘要(text, match.index, match[0].length),
            advice: rule.advice,
          });
        }
      } else {
        let index = text.indexOf(pattern);
        while (index !== -1) {
          const position = 行列(text, index);
          findings.push({
            level: rule.level,
            name: rule.name,
            pattern,
            line: position.line,
            column: position.column,
            excerpt: 摘要(text, index, pattern.length),
            advice: rule.advice,
          });
          index = text.indexOf(pattern, index + pattern.length);
        }
      }
    }
  }

  const sentences = 句子列表(text);
  for (let i = 0; i < sentences.length - 2; i += 1) {
    const lengths = sentences.slice(i, i + 3).map((sentence) => sentence.length);
    const max = Math.max(...lengths);
    const min = Math.min(...lengths);
    if (min >= 18 && max - min <= 6) {
      const index = text.indexOf(sentences[i]);
      const position = 行列(text, Math.max(index, 0));
      findings.push({
        level: "低",
        name: "连续句子节奏接近",
        pattern: "相近句长",
        line: position.line,
        column: position.column,
        excerpt: sentences.slice(i, i + 3).join(" "),
        advice: "打断其中一句，改成长短交错的节奏。",
      });
    }
  }

  findings.sort((a, b) => a.line - b.line || a.column - b.column);
  return findings;
}

export function scoreHumanizer(findings) {
  let score = 50;
  for (const finding of findings) {
    if (finding.level === "高") score -= 3;
    else if (finding.level === "中") score -= 2;
    else score -= 1;
  }
  return Math.max(0, score);
}

export function summarizeHumanizer(findings) {
  const summary = new Map();
  for (const finding of findings) {
    const key = `${finding.level}:${finding.name}`;
    summary.set(key, (summary.get(key) || 0) + 1);
  }
  return [...summary.entries()].map(([key, count]) => {
    const [level, name] = key.split(":");
    return { level, name, count };
  });
}
