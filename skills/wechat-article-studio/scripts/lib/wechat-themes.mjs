export const DEFAULT_WECHAT_THEME_ID = "wechat-green";

function previewVars(vars) {
  return {
    bg: vars.bg,
    paper: vars.paper,
    ink: vars.ink,
    muted: vars.muted,
    line: vars.line,
    accent: vars.accent,
    accentStrong: vars.accentStrong,
    soft: vars.soft,
    codeBg: vars.codeBg,
    codeInk: vars.codeInk,
    shadow: vars.shadow,
  };
}

export const WECHAT_THEMES = [
  {
    id: "wechat-green",
    label: "公众号绿",
    description: "接近常见微信公众号编辑器的绿色技术模板，清爽、稳妥，适合大多数技术文章。",
    preview: previewVars({
      bg: "#f5fbf7",
      paper: "#ffffff",
      ink: "#202124",
      muted: "#647067",
      line: "#dce8df",
      accent: "#35b378",
      accentStrong: "#22895b",
      soft: "rgba(53, 179, 120, 0.09)",
      codeBg: "#f7faf8",
      codeInk: "#1f2933",
      shadow: "0 16px 42px rgba(29, 84, 55, 0.12)",
    }),
    styles: {
      root: "padding: 0 10px; line-height: 1.6; word-spacing: 0px; word-break: break-word; word-wrap: break-word; text-align: left; font-family: Optima-Regular, Optima, PingFangSC-light, PingFangTC-light, 'PingFang SC', Cambria, Cochin, Georgia, Times, 'Times New Roman', serif; font-size: 15px; letter-spacing: 0.04em; color: #595959;",
      h1: "margin: 1.2em 0 1em; padding: 0; font-weight: bold; color: #35b378; font-size: 24px; line-height: 1.35;",
      h1Span: "display: inline;",
      h2: "margin: 1.4em 0 0.7em; padding: 0.35em 0 0.25em; color: #35b378; font-weight: bold; font-size: 22px; line-height: 1.35; border-bottom: 1px solid rgba(53,179,120,0.45);",
      h2Span: "display: inline-block; padding-right: 0.2em;",
      p: "font-size: 16px; padding-top: 8px; padding-bottom: 8px; line-height: 26px; color: #111111; margin: 1em 4px;",
      figure: "margin: 18px 0; display: flex; flex-direction: column; justify-content: center; align-items: center;",
      img: "display: block; margin: 0 auto; max-width: 100%; border-radius: 4px;",
      figcaption: "margin-top: 6px; text-align: center; color: #888888; font-size: 14px; line-height: 1.5;",
      ul: "margin-top: 8px; margin-bottom: 8px; padding-left: 25px; color: #111111; list-style-type: disc;",
      liSection: "margin: 8px 0; line-height: 26px; text-align: left; color: #111111; font-weight: 500;",
      code: "font-size: 14px; word-wrap: break-word; padding: 2px 4px; border-radius: 4px; margin: 0 2px; background-color: rgba(27,31,35,.05); font-family: Operator Mono, Consolas, Monaco, Menlo, monospace; word-break: break-all; color: #35b378;",
      link: "color: #22895b; text-decoration: underline; text-underline-offset: 3px;",
      pre: "margin: 12px 0; overflow-x: auto;",
      preCode: "overflow-x: auto; padding: 16px; color: #333333; background: #f8f8f8; display: block; font-family: Operator Mono, Consolas, Monaco, Menlo, monospace; border-radius: 0; font-size: 12px; line-height: 1.7; white-space: pre-wrap;",
      quote: "margin: 14px 4px; padding: 10px 14px; border-left: 3px solid #35b378; background: rgba(53,179,120,0.08); color: #333333; font-size: 16px; line-height: 26px;",
    },
  },
  {
    id: "tech-comic",
    label: "技术漫画",
    description: "暖纸底、墨绿色和珊瑚色搭配，更像一篇带漫画分镜的技术随笔。",
    preview: previewVars({
      bg: "#f6f1e8",
      paper: "#fffaf1",
      ink: "#263238",
      muted: "#66736f",
      line: "#d8cdbb",
      accent: "#087f7a",
      accentStrong: "#055f5b",
      soft: "rgba(215, 102, 81, 0.1)",
      codeBg: "#1f2933",
      codeInk: "#e6edf3",
      shadow: "0 18px 46px rgba(42, 33, 20, 0.14)",
    }),
    styles: {
      root: "padding: 0 10px; line-height: 1.72; word-break: break-word; word-wrap: break-word; text-align: left; font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif; font-size: 15px; letter-spacing: 0.02em; color: #263238;",
      h1: "margin: 1.1em 0 1em; padding: 0.25em 0 0.35em; font-weight: 800; color: #055f5b; font-size: 25px; line-height: 1.36; border-bottom: 3px solid #d76651;",
      h1Span: "display: inline;",
      h2: "margin: 1.55em 0 0.75em; padding: 0.2em 0 0.2em 0.72em; color: #055f5b; font-weight: 800; font-size: 21px; line-height: 1.38; border-left: 5px solid #d76651; background: rgba(8,127,122,0.07);",
      h2Span: "display: inline;",
      p: "font-size: 16px; padding-top: 7px; padding-bottom: 7px; line-height: 28px; color: #263238; margin: 0.95em 2px;",
      figure: "margin: 20px 0; display: flex; flex-direction: column; justify-content: center; align-items: center;",
      img: "display: block; margin: 0 auto; max-width: 100%; border-radius: 8px; border: 1px solid rgba(8,127,122,0.18);",
      figcaption: "margin-top: 7px; text-align: center; color: #66736f; font-size: 13px; line-height: 1.55;",
      ul: "margin-top: 8px; margin-bottom: 10px; padding-left: 24px; color: #263238; list-style-type: disc;",
      liSection: "margin: 8px 0; line-height: 27px; text-align: left; color: #263238; font-weight: 500;",
      code: "font-size: 14px; word-wrap: break-word; padding: 2px 5px; border-radius: 5px; margin: 0 2px; background-color: rgba(8,127,122,0.1); font-family: Operator Mono, Consolas, Monaco, Menlo, monospace; word-break: break-all; color: #055f5b;",
      link: "color: #055f5b; text-decoration: underline; text-decoration-color: #d76651; text-underline-offset: 3px;",
      pre: "margin: 14px 0; overflow-x: auto;",
      preCode: "overflow-x: auto; padding: 15px 16px; color: #e6edf3; background: #1f2933; display: block; font-family: Operator Mono, Consolas, Monaco, Menlo, monospace; border-radius: 8px; font-size: 12px; line-height: 1.7; white-space: pre-wrap;",
      quote: "margin: 15px 2px; padding: 11px 14px; border-left: 4px solid #d76651; background: rgba(215,102,81,0.1); color: #4a4038; font-size: 16px; line-height: 27px;",
    },
  },
  {
    id: "clean-white",
    label: "清爽白底",
    description: "留白更多、蓝色强调，适合教程、工具清单和偏正式的技术说明。",
    preview: previewVars({
      bg: "#f5f7fb",
      paper: "#ffffff",
      ink: "#1f2937",
      muted: "#64748b",
      line: "#e5e7eb",
      accent: "#2563eb",
      accentStrong: "#1d4ed8",
      soft: "rgba(37, 99, 235, 0.08)",
      codeBg: "#111827",
      codeInk: "#f9fafb",
      shadow: "0 16px 38px rgba(15, 23, 42, 0.1)",
    }),
    styles: {
      root: "padding: 0 10px; line-height: 1.68; word-break: break-word; word-wrap: break-word; text-align: left; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif; font-size: 15px; letter-spacing: 0.01em; color: #1f2937;",
      h1: "margin: 1.15em 0 1em; padding: 0 0 0.45em; font-weight: 800; color: #111827; font-size: 25px; line-height: 1.34; border-bottom: 2px solid #2563eb;",
      h1Span: "display: inline;",
      h2: "margin: 1.45em 0 0.7em; padding: 0 0 0.25em; color: #1d4ed8; font-weight: 800; font-size: 21px; line-height: 1.38; border-bottom: 1px solid #dbeafe;",
      h2Span: "display: inline;",
      p: "font-size: 16px; padding-top: 7px; padding-bottom: 7px; line-height: 27px; color: #1f2937; margin: 0.9em 2px;",
      figure: "margin: 20px 0; display: flex; flex-direction: column; justify-content: center; align-items: center;",
      img: "display: block; margin: 0 auto; max-width: 100%; border-radius: 6px; border: 1px solid #e5e7eb;",
      figcaption: "margin-top: 7px; text-align: center; color: #64748b; font-size: 13px; line-height: 1.5;",
      ul: "margin-top: 8px; margin-bottom: 10px; padding-left: 24px; color: #1f2937; list-style-type: disc;",
      liSection: "margin: 7px 0; line-height: 27px; text-align: left; color: #1f2937; font-weight: 500;",
      code: "font-size: 14px; word-wrap: break-word; padding: 2px 5px; border-radius: 5px; margin: 0 2px; background-color: #eff6ff; font-family: Operator Mono, Consolas, Monaco, Menlo, monospace; word-break: break-all; color: #1d4ed8;",
      link: "color: #1d4ed8; text-decoration: underline; text-underline-offset: 3px;",
      pre: "margin: 14px 0; overflow-x: auto;",
      preCode: "overflow-x: auto; padding: 15px 16px; color: #f9fafb; background: #111827; display: block; font-family: Operator Mono, Consolas, Monaco, Menlo, monospace; border-radius: 6px; font-size: 12px; line-height: 1.7; white-space: pre-wrap;",
      quote: "margin: 15px 2px; padding: 11px 14px; border-left: 4px solid #2563eb; background: #eff6ff; color: #1f2937; font-size: 16px; line-height: 27px;",
    },
  },
  {
    id: "ink-note",
    label: "墨色笔记",
    description: "黑白主调，边线清楚，适合观点更强、节奏更像专栏的文章。",
    preview: previewVars({
      bg: "#eee9df",
      paper: "#fffdf8",
      ink: "#1c1c1c",
      muted: "#6f675c",
      line: "#cbc2b3",
      accent: "#111111",
      accentStrong: "#000000",
      soft: "rgba(28, 28, 28, 0.06)",
      codeBg: "#252525",
      codeInk: "#f3eee5",
      shadow: "0 20px 44px rgba(28, 25, 20, 0.13)",
    }),
    styles: {
      root: "padding: 0 10px; line-height: 1.72; word-break: break-word; word-wrap: break-word; text-align: left; font-family: Georgia, 'Times New Roman', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', serif; font-size: 15px; letter-spacing: 0.02em; color: #1c1c1c;",
      h1: "margin: 1.1em 0 1em; padding: 0 0 0.42em; font-weight: 800; color: #111111; font-size: 25px; line-height: 1.35; border-bottom: 2px solid #111111;",
      h1Span: "display: inline;",
      h2: "margin: 1.55em 0 0.72em; padding: 0 0 0.2em; color: #111111; font-weight: 800; font-size: 21px; line-height: 1.38;",
      h2Span: "display: inline; border-bottom: 2px solid #111111;",
      p: "font-size: 16px; padding-top: 7px; padding-bottom: 7px; line-height: 28px; color: #1c1c1c; margin: 0.95em 2px;",
      figure: "margin: 20px 0; display: flex; flex-direction: column; justify-content: center; align-items: center;",
      img: "display: block; margin: 0 auto; max-width: 100%; border-radius: 2px; border: 1px solid #cbc2b3;",
      figcaption: "margin-top: 7px; text-align: center; color: #6f675c; font-size: 13px; line-height: 1.55;",
      ul: "margin-top: 8px; margin-bottom: 10px; padding-left: 24px; color: #1c1c1c; list-style-type: disc;",
      liSection: "margin: 8px 0; line-height: 27px; text-align: left; color: #1c1c1c; font-weight: 500;",
      code: "font-size: 14px; word-wrap: break-word; padding: 2px 5px; border-radius: 2px; margin: 0 2px; background-color: rgba(28,28,28,0.08); font-family: Operator Mono, Consolas, Monaco, Menlo, monospace; word-break: break-all; color: #111111;",
      link: "color: #111111; text-decoration: underline; text-decoration-thickness: 1px; text-underline-offset: 3px;",
      pre: "margin: 14px 0; overflow-x: auto;",
      preCode: "overflow-x: auto; padding: 15px 16px; color: #f3eee5; background: #252525; display: block; font-family: Operator Mono, Consolas, Monaco, Menlo, monospace; border-radius: 2px; font-size: 12px; line-height: 1.7; white-space: pre-wrap;",
      quote: "margin: 15px 2px; padding: 11px 14px; border-left: 4px solid #111111; background: rgba(28,28,28,0.06); color: #1c1c1c; font-size: 16px; line-height: 27px;",
    },
  },
];

export function listWechatThemes() {
  return WECHAT_THEMES;
}

export function getWechatTheme(themeId = DEFAULT_WECHAT_THEME_ID, options = {}) {
  const theme = WECHAT_THEMES.find((item) => item.id === themeId);
  if (theme) return theme;
  if (options.strict) {
    throw new Error(`未知公众号主题：${themeId}`);
  }
  return WECHAT_THEMES.find((item) => item.id === DEFAULT_WECHAT_THEME_ID) || WECHAT_THEMES[0];
}

export function getPreviewThemeOptions() {
  return WECHAT_THEMES.map(({ id, label, description, preview }) => ({ id, label, description, preview }));
}
