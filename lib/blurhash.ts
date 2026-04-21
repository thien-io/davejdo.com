import { decode, encode } from "blurhash";

export async function encodeImageToBlurhash(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const canvas = new OffscreenCanvas(32, 32);
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(bitmap, 0, 0, 32, 32);
  const { data } = ctx.getImageData(0, 0, 32, 32);
  return encode(data, 32, 32, 4, 4);
}

const TRANSPARENT_PNG =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

export function blurhashToDataURL(
  hash: string,
  width: number,
  height: number
): string {
  try {
    const pixels = decode(hash, width, height);
    if (typeof document === "undefined") return TRANSPARENT_PNG;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d")!;
    const imageData = ctx.createImageData(width, height);
    imageData.data.set(pixels);
    ctx.putImageData(imageData, 0, 0);
    return canvas.toDataURL("image/png");
  } catch {
    return TRANSPARENT_PNG;
  }
}
