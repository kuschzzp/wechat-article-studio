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
  {
    id: "minimal-black",
    label: "简约黑",
    description: "黑白正文、边框章节标题、轻量图片阴影，适合偏克制的技术分析文章。",
    preview: previewVars({
      bg: "#f4f1eb",
      paper: "#ffffff",
      ink: "#000000",
      muted: "#666666",
      line: "#111111",
      accent: "#000000",
      accentStrong: "#ff6441",
      soft: "#f8f8f8",
      codeBg: "#f8f8f8",
      codeInk: "#333333",
      shadow: "0 10px 28px rgba(0, 0, 0, 0.1)",
    }),
    styles: {
      root: "color: black; line-height: 1.6; word-spacing: 0px; letter-spacing: 0px; word-break: break-word; word-wrap: break-word; text-align: left; font-family: Optima-Regular, Optima, PingFangSC-light, PingFangTC-light, 'PingFang SC', Cambria, Cochin, Georgia, Times, 'Times New Roman', serif; font-size: 14px; padding: 10px;",
      h1: "margin-top: 30px; margin-bottom: 15px; padding: 0px; font-weight: bold; color: black; font-size: 24px;",
      h1Span: "display: inline;",
      h2: "margin-top: 70px; margin-bottom: 30px; padding: 12px 0; font-size: 22px; text-align: center; position: relative; font-weight: bold; color: black; line-height: 1.1em; border: 1px solid #000;",
      h2Prefix: "<span style=\"float: left; display: block; width: 90%; border-top: 1px solid #000; height: 1px; line-height: 1px; margin-left: -5px; margin-top: -17px;\"> </span><span style=\"display: block; width: 3px; margin: 0 0 0 5%; height: 3px; line-height: 3px; overflow: hidden; background-color: #000; box-shadow: 3px 0 #000, 0 3px #000, -3px 0 #000, 0 -3px #000;\"> </span>",
      h2Span: "display: block; -webkit-box-reflect: below 0em -webkit-gradient(linear,left top,left bottom, from(rgba(0,0,0,0)),to(rgba(255,255,255,0.1)));",
      h2Suffix: "<span style=\"display: block; width: 3px; margin: 0 0 0 95%; height: 3px; line-height: 3px; overflow: hidden; background-color: #000; box-shadow: 3px 0 #000, 0 3px #000, -3px 0 #000, 0 -3px #000;\"> </span><span style=\"float: right; display: block; width: 90%; border-bottom: 1px solid #000; height: 1px; line-height: 1px; margin-right: -5px; margin-top: 16px;\"> </span>",
      p: "padding-top: 8px; padding-bottom: 8px; margin: 0; line-height: 26px; color: black; font-size: 14px;",
      figure: "margin: 0; margin-top: 10px; margin-bottom: 10px; display: flex; flex-direction: column; justify-content: center; align-items: center;",
      img: "display: block; margin: 10px auto 0 auto; max-width: 100%; box-shadow: rgba(170, 170, 170, 0.48) 0px 0px 6px 0px; border-radius: 4px;",
      figcaption: "margin-top: 5px; text-align: center; color: #888; font-size: 12px;",
      ul: "margin-top: 8px; margin-bottom: 8px; padding-left: 25px; color: black; list-style-type: square;",
      liSection: "margin-top: 5px; margin-bottom: 5px; line-height: 26px; text-align: left; color: rgb(1,1,1); font-weight: 500;",
      code: "font-size: 14px; word-wrap: break-word; padding: 2px 4px; border-radius: 4px; margin: 0 2px; background-color: rgba(27,31,35,.05); font-family: Operator Mono, Consolas, Monaco, Menlo, monospace; word-break: break-all; color: #ff6441;",
      link: "color: #ff6441; text-decoration: underline; text-underline-offset: 3px;",
      pre: "margin-top: 10px; margin-bottom: 10px; box-shadow: rgba(170, 170, 170, 0.48) 0px 0px 6px 0px; max-width: 100%; border-radius: 4px; margin-left: auto; margin-right: auto;",
      preCode: "overflow-x: auto; padding: 16px; color: #333; background: #f8f8f8; display: -webkit-box; font-family: Operator Mono, Consolas, Monaco, Menlo, monospace; border-radius: 0px; font-size: 12px; -webkit-overflow-scrolling: touch; white-space: pre-wrap; line-height: 1.7;",
      quote: "margin: 12px 0; padding: 10px 14px; border-left: 4px solid #000; background: #f8f8f8; color: black; font-size: 14px; line-height: 26px;",
    },
  },
  {
    id: "blue-grid",
    label: "蓝色网格",
    description: "浅蓝网格底纹、蓝色章节线和圆点列表，适合偏清爽的技术教程文章。",
    preview: previewVars({
      bg: "#eef7ff",
      paper: "#ffffff",
      ink: "#2b2b2b",
      muted: "#5f6f7f",
      line: "#cde8fb",
      accent: "#40B8FA",
      accentStrong: "#3594F7",
      soft: "rgba(64, 184, 250, 0.12)",
      codeBg: "#f8f8f8",
      codeInk: "#333333",
      shadow: "0 12px 32px rgba(53, 148, 247, 0.14)",
    }),
    styles: {
      root: "font-size: 16px; padding: 0 10px; word-spacing: 0px; word-break: break-word; word-wrap: break-word; text-align: left; line-height: 1.25; color: #2b2b2b; font-family: Optima-Regular, Optima, PingFangTC-Light, PingFangSC-light, PingFangTC-light; letter-spacing: 2px; background-image: linear-gradient(90deg, rgba(50, 0, 0, 0.04) 3%, rgba(0, 0, 0, 0) 3%), linear-gradient(360deg, rgba(50, 0, 0, 0.04) 3%, rgba(0, 0, 0, 0) 3%); background-size: 20px 20px; background-position: center center;",
      h1: "margin-top: 30px; margin-bottom: 15px; padding: 0px; font-weight: bold; color: black; font-size: 25px;",
      h1Span: "display: inline-block; font-weight: bold; color: #40B8FA;",
      h2: "margin-top: 30px; margin-bottom: 15px; padding: 0px; font-weight: bold; color: black; font-size: 22px; display: block; border-bottom: 4px solid #40B8FA;",
      h2Prefix: "<span style=\"display: inline-block; width: 16px; height: 16px; border: 3px solid #40B8FA; border-radius: 50%; margin-right: 9px; margin-bottom: -2px; box-sizing: border-box;\"> </span>",
      h2Span: "display: inline-block; color: #40B8FA; font-size: 20px;",
      h2Suffix: "<span style=\"display: flex; box-sizing: border-box; width: 200px; height: 10px; border-top-left-radius: 20px; background: rgba(64, 184, 250, .5); color: rgb(255, 255, 255); font-size: 16px; letter-spacing: 0.544px; justify-content: flex-end; float: right; margin-top: -10px; overflow-wrap: break-word;\"> </span>",
      p: "padding-top: 8px; padding-bottom: 8px; line-height: 26px; color: #2b2b2b; margin: 10px 0px; letter-spacing: 2px; font-size: 14px; word-spacing: 2px;",
      figure: "margin: 0; margin-top: 10px; margin-bottom: 10px; display: flex; flex-direction: column; justify-content: center; align-items: center;",
      img: "max-width: 100%; border-radius: 6px; display: block; margin: 20px auto; object-fit: contain; box-shadow: 2px 4px 7px #999;",
      figcaption: "margin-top: 5px; text-align: center; display: block; font-size: 13px; color: #2b2b2b;",
      ul: "margin-top: 8px; margin-bottom: 8px; padding-left: 25px; font-size: 15px; color: #595959; list-style-type: circle;",
      liSection: "margin-top: 5px; margin-bottom: 5px; line-height: 26px; text-align: left; font-size: 14px; font-weight: normal; color: #595959;",
      code: "font-size: 14px; word-wrap: break-word; margin: 0 2px; font-family: Operator Mono, Consolas, Monaco, Menlo, monospace; word-break: break-all; color: #3594F7; background: rgba(59, 170, 250, .1); padding: 0 2px; border-radius: 2px; height: 21px; line-height: 22px;",
      link: "color: #3594F7; text-decoration: underline; text-underline-offset: 3px;",
      pre: "margin-top: 10px; margin-bottom: 10px;",
      preCode: "overflow-x: auto; padding: 16px; color: #333; background: #f8f8f8; display: -webkit-box; font-family: Operator Mono, Consolas, Monaco, Menlo, monospace; border-radius: 0px; font-size: 12px; -webkit-overflow-scrolling: touch; white-space: pre-wrap; line-height: 1.7; letter-spacing: 0px;",
      quote: "margin: 12px 0; padding: 10px 14px; border-left: 4px solid #40B8FA; background: rgba(64, 184, 250, .1); color: #2b2b2b; font-size: 14px; line-height: 26px; letter-spacing: 1px;",
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
