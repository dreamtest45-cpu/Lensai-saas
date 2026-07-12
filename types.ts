export interface ImageAsset {
  file: File;
  preview: string;
  base64: string; // full data URL, e.g. "data:image/png;base64,...."
  mimeType: string;
}
