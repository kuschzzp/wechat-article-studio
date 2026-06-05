import fs from "node:fs/promises";
import path from "node:path";

function mimeFromPath(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".webp") return "image/webp";
  if (ext === ".gif") return "image/gif";
  return "image/png";
}

function toIso(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export const temppicProvider = {
  name: "temppic",

  async upload(filePath) {
    const fileName = path.basename(filePath);
    const buffer = await fs.readFile(filePath);
    const mime = mimeFromPath(filePath);
    const form = new FormData();
    form.append("file", new Blob([buffer], { type: mime }), fileName);

    const response = await fetch("https://temppic.sinancode.com/api/upload?locale=zh", {
      method: "POST",
      headers: {
        accept: "*/*",
        origin: "https://temppic.sinancode.com",
        referer: "https://temppic.sinancode.com/zh",
      },
      body: form,
    });

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(`temppic 返回了非 JSON 响应：HTTP ${response.status}`);
    }

    if (!response.ok || !data.success || !data.uuid) {
      throw new Error(`temppic 上传失败：${text.slice(0, 240)}`);
    }

    return {
      provider: this.name,
      id: data.uuid,
      url: `https://temppic.sinancode.com/s/${data.uuid}.png`,
      expiresAt: toIso(data.metadata?.expiresAt),
      metadata: data.metadata || {},
    };
  },

  async probe(url) {
    const response = await fetch(url, { method: "GET" });
    return {
      ok: response.ok,
      status: response.status,
      contentType: response.headers.get("content-type") || "",
    };
  },

  async delete(id) {
    const response = await fetch(`https://temppic.sinancode.com/api/file/${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: {
        accept: "*/*",
        origin: "https://temppic.sinancode.com",
        referer: `https://temppic.sinancode.com/zh/files/${encodeURIComponent(id)}`,
      },
    });

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { success: response.ok, message: text };
    }

    return { success: Boolean(response.ok && data.success), message: data.message || "" };
  },
};
