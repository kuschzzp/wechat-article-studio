import { temppicProvider } from "./temppic.mjs";

export const providers = {
  temppic: temppicProvider,
};

export function getProvider(name) {
  const provider = providers[name];
  if (!provider) {
    const names = Object.keys(providers).join(", ");
    throw new Error(`未知图床 provider：${name}。可用 provider：${names}`);
  }
  return provider;
}

export async function uploadWithRotation(filePath, providerNames = ["temppic"]) {
  const errors = [];
  for (const name of providerNames) {
    const provider = getProvider(name);
    try {
      const uploaded = await provider.upload(filePath);
      const probed = await provider.probe(uploaded.url);
      if (!probed.ok || !/^image\//i.test(probed.contentType)) {
        throw new Error(`URL 检查失败：HTTP ${probed.status} ${probed.contentType}`);
      }
      return { ...uploaded, probe: probed };
    } catch (error) {
      errors.push(`${name}: ${error.message}`);
    }
  }
  throw new Error(`所有图床都失败：${errors.join("；")}`);
}
