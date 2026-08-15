import decodeJpeg, { init as initJpegDecode } from "@jsquash/jpeg/decode";
import encodeJpegCodec, { init as initJpegEncode } from "@jsquash/jpeg/encode";
import decodePng, { init as initPngDecode } from "@jsquash/png/decode";
import encodePngCodec, { init as initPngEncode } from "@jsquash/png/encode";
import jpegDecWasm from "@jsquash/jpeg/codec/dec/mozjpeg_dec.wasm?module";
import jpegEncWasm from "@jsquash/jpeg/codec/enc/mozjpeg_enc.wasm?module";
import pngWasm from "@jsquash/png/codec/pkg/squoosh_png_bg.wasm?module";

export type DecodedImage = {
  width: number;
  height: number;
  data: Uint8Array;
};

let codecsReady: Promise<void> | null = null;

function ensureCodecs(): Promise<void> {
  if (!codecsReady) {
    codecsReady = Promise.all([
      initJpegDecode(jpegDecWasm),
      initJpegEncode(jpegEncWasm),
      initPngDecode(pngWasm),
      initPngEncode(pngWasm),
    ]).then(() => undefined);
  }
  return codecsReady;
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength,
  ) as ArrayBuffer;
}

function toDecodedImage(image: {
  width: number;
  height: number;
  data: Uint8Array | Uint8ClampedArray;
}): DecodedImage {
  return {
    width: image.width,
    height: image.height,
    data:
      image.data instanceof Uint8Array
        ? image.data
        : new Uint8Array(
            image.data.buffer,
            image.data.byteOffset,
            image.data.byteLength,
          ),
  };
}

function asImageData(image: DecodedImage): ImageData {
  return {
    width: image.width,
    height: image.height,
    data: new Uint8ClampedArray(image.data),
    colorSpace: "srgb",
  };
}

export async function decodeImage(
  buffer: Uint8Array,
  mime: string,
): Promise<DecodedImage> {
  await ensureCodecs();
  const arrayBuffer = toArrayBuffer(buffer);

  if (mime === "image/png") {
    const decoded = await decodePng(arrayBuffer);
    if (!decoded) {
      throw new Error("Only PNG and JPEG images are supported.");
    }
    return toDecodedImage(decoded);
  }

  if (mime === "image/jpeg") {
    const decoded = await decodeJpeg(arrayBuffer);
    if (!decoded) {
      throw new Error("Only PNG and JPEG images are supported.");
    }
    return toDecodedImage(decoded);
  }

  throw new Error("Only PNG and JPEG images are supported.");
}

export async function encodePng(image: DecodedImage): Promise<Uint8Array> {
  await ensureCodecs();
  return new Uint8Array(await encodePngCodec(asImageData(image)));
}

export async function encodeJpeg(
  image: DecodedImage,
  quality: number,
): Promise<Uint8Array> {
  await ensureCodecs();
  return new Uint8Array(await encodeJpegCodec(asImageData(image), { quality }));
}
