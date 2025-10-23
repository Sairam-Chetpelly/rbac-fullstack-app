export const getImageUrl = (path) => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000';
  return `${baseUrl}${path}`;
};