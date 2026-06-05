export const DEFAULT_WECHAT_THEME_ID = "coral-tab";

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
    id: "coral-tab",
    label: "珊瑚标签",
    description: "黑色正文、珊瑚红章节标签、浅米色斜角尾巴，适合技术短漫画文章的公众号排版。",
    preview: previewVars({
      bg: "#f7f3ef",
      paper: "#ffffff",
      ink: "#000000",
      muted: "#666666",
      line: "#efebe9",
      accent: "rgb(239, 112, 96)",
      accentStrong: "rgb(210, 82, 68)",
      soft: "#efebe9",
      codeBg: "#f8f8f8",
      codeInk: "#333333",
      shadow: "0 14px 36px rgba(44, 31, 28, 0.1)",
    }),
    styles: {
      root: "font-size: 16px; color: black; padding: 0 10px; line-height: 1.6; word-spacing: 0px; letter-spacing: 0px; word-break: break-word; word-wrap: break-word; text-align: left; font-family: Optima-Regular, Optima, PingFangSC-light, PingFangTC-light, 'PingFang SC', Cambria, Cochin, Georgia, Times, 'Times New Roman', serif;",
      h1: "margin-top: 30px; margin-bottom: 15px; padding: 0px; font-weight: bold; color: black; font-size: 24px;",
      h1Span: "display: inline;",
      h2: "margin-top: 30px; margin-bottom: 15px; padding: 0px; font-weight: bold; color: black; border-bottom: 2px solid rgb(239, 112, 96); font-size: 1.3em;",
      h2Span: "display: inline-block; font-weight: bold; background: rgb(239, 112, 96); color: #ffffff; padding: 3px 10px 1px; border-top-right-radius: 3px; border-top-left-radius: 3px; margin-right: 3px;",
      h2Suffix: "<span style=\"display: inline-block; vertical-align: bottom; border-bottom: 36px solid #efebe9; border-right: 20px solid transparent;\"> </span>",
      p: "font-size: 16px; padding-top: 8px; padding-bottom: 8px; margin: 0; line-height: 26px; color: black;",
      figure: "margin: 0; margin-top: 10px; margin-bottom: 10px; display: flex; flex-direction: column; justify-content: center; align-items: center;",
      img: "display: block; margin: 0 auto; max-width: 100%;",
      figcaption: "margin-top: 5px; text-align: center; color: #888; font-size: 14px;",
      ul: "margin-top: 8px; margin-bottom: 8px; padding-left: 25px; color: black; list-style-type: disc;",
      liSection: "margin-top: 5px; margin-bottom: 5px; line-height: 26px; text-align: left; color: rgb(1,1,1); font-weight: 500;",
      code: "font-size: 14px; word-wrap: break-word; padding: 2px 4px; border-radius: 4px; margin: 0 2px; background-color: rgba(27,31,35,.05); font-family: Operator Mono, Consolas, Monaco, Menlo, monospace; word-break: break-all; color: rgb(239, 112, 96);",
      link: "color: rgb(239, 112, 96); text-decoration: underline; text-underline-offset: 3px;",
      pre: "margin-top: 10px; margin-bottom: 10px;",
      preCode: "overflow-x: auto; padding: 16px; color: #333; background: #f8f8f8; display: -webkit-box; font-family: Operator Mono, Consolas, Monaco, Menlo, monospace; border-radius: 0px; font-size: 12px; -webkit-overflow-scrolling: touch; white-space: pre-wrap; line-height: 1.7;",
      quote: "margin: 12px 0; padding: 10px 14px; border-left: 4px solid rgb(239, 112, 96); background: #efebe9; color: black; font-size: 16px; line-height: 26px;",
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
