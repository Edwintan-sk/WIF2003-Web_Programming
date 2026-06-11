const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

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
