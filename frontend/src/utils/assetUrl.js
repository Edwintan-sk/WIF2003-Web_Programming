import { API_BASE_URL } from './axiosInstance';

export const getAssetUrl = (assetPath) => {
  if (!assetPath) return null;
  if (/^https?:\/\//i.test(assetPath)) return assetPath;

  try {
    const apiUrl = new URL(API_BASE_URL);
    return new URL(assetPath, apiUrl.origin).toString();
  } catch {
    return assetPath;
  }
};
