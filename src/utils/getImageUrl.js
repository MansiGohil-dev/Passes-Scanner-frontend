// Robust helper to construct backend image URLs
export function getImageUrl(imagePath) {
  const base = import.meta.env.VITE_API_BASE_URL;
  if (!base) throw new Error('VITE_API_BASE_URL is not set');
  if (!imagePath) return '';
  // Remove leading slash from imagePath if present
  const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
  // Remove trailing slash from base if present
  const cleanBase = base.endsWith('/') ? base.slice(0, -1) : base;
  // If imagePath is already a full URL, return as is
  if (/^https?:\/\//i.test(imagePath)) return imagePath;
  // Remove leading 'uploads/' or 'Uploads/' from imagePath if present
  const uploadsRegex = /^uploads\//i;
  const finalPath = uploadsRegex.test(cleanPath) ? cleanPath.replace(uploadsRegex, '') : cleanPath;
  return `${cleanBase}/uploads/${finalPath}`;
}
