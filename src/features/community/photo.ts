export const photoMaxBytes = 4 * 1024 * 1024;
export const photoTypes = ['image/jpeg', 'image/png', 'image/webp'];
/**
 * Demo-only check. The image never leaves the browser here, so this is a
 * usability guard rather than an authorization boundary. A server upload must
 * re-validate type and size and strip location metadata before publishing.
 */
export function checkPhoto(file: { type: string; size: number }): string | null {
  if (file.size === 0) return 'That file is empty. Choose another photo.';
  if (!photoTypes.includes(file.type)) return 'Use a JPEG, PNG or WebP image.';
  if (file.size > photoMaxBytes) return 'Keep the photo under 4 MB.';
  return null;
}
export function readPhoto(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('We could not read that photo.'));
    reader.readAsDataURL(file);
  });
}
