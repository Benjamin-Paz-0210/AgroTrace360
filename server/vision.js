import sharp from "sharp";

const SIZE = 16;

export async function extraerHuella(filePath) {
  const { data } = await sharp(filePath)
    .rotate()
    .resize(SIZE, SIZE, { fit: "cover", position: "centre" })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const grid = Array.from(data, (v) => v / 255);
  const hist = new Array(24).fill(0);
  const n = SIZE * SIZE;
  for (let i = 0; i < data.length; i += 3) {
    hist[data[i] >> 5] += 1;
    hist[8 + (data[i + 1] >> 5)] += 1;
    hist[16 + (data[i + 2] >> 5)] += 1;
  }
  return {
    grid,
    hist: hist.map((c) => c / n),
  };
}

export function vectorHuella(huella) {
  return [...(huella.grid || []), ...(huella.hist || [])];
}

export function similitud(a, b) {
  const va = vectorHuella(a);
  const vb = vectorHuella(b);
  const n = Math.min(va.length, vb.length);
  if (!n) return 0;
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < n; i += 1) {
    dot += va[i] * vb[i];
    na += va[i] * va[i];
    nb += vb[i] * vb[i];
  }
  if (!na || !nb) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}
