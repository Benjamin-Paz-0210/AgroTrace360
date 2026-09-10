const ANCHO_IN = 13.333;
const ALTO_IN = 7.5;

function esperar(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

async function esperarImagenes(nodo: HTMLElement) {
  const imgs = [...nodo.querySelectorAll("img")];
  await Promise.all(
    imgs.map(
      (img) =>
        img.complete
          ? Promise.resolve()
          : new Promise<void>((resolve) => {
              img.addEventListener("load", () => resolve(), { once: true });
              img.addEventListener("error", () => resolve(), { once: true });
            }),
    ),
  );
  await document.fonts.ready;
  await new Promise<void>((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
  );
}

export async function capturarLaminas(
  count: number,
  irA: (i: number) => Promise<void>,
  nodo: HTMLDivElement,
  onPaso?: (i: number) => void,
) {
  const { toJpeg } = await import("html-to-image");
  await esperar(160);
  const fotos: string[] = [];
  for (let i = 0; i < count; i++) {
    onPaso?.(i);
    await irA(i);
    await esperarImagenes(nodo);
    await esperar(180);
    fotos.push(
      await toJpeg(nodo, {
        quality: 0.92,
        pixelRatio: 2,
        backgroundColor: "#22170f",
        cacheBust: true,
      }),
    );
  }
  return fotos;
}

export async function guardarPdf(fotos: string[]) {
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "in",
    format: [ANCHO_IN, ALTO_IN],
  });
  fotos.forEach((foto, i) => {
    if (i > 0) pdf.addPage([ANCHO_IN, ALTO_IN], "landscape");
    pdf.addImage(foto, "JPEG", 0, 0, ANCHO_IN, ALTO_IN, undefined, "FAST");
  });
  pdf.save("AgroTrace-360-pitch.pdf");
}

export async function guardarPpt(fotos: string[]) {
  const mod = await import("pptxgenjs");
  const PptxGenJS = mod.default;
  const pptx = new PptxGenJS();
  pptx.defineLayout({ name: "WIDE16", width: ANCHO_IN, height: ALTO_IN });
  pptx.layout = "WIDE16";
  pptx.title = "AgroTrace 360";
  pptx.author = "Equipo FIIS UNAS";
  for (const foto of fotos) {
    const slide = pptx.addSlide();
    slide.background = { color: "22170f" };
    slide.addImage({ data: foto, x: 0, y: 0, w: ANCHO_IN, h: ALTO_IN });
  }
  await pptx.writeFile({ fileName: "AgroTrace-360-pitch.pptx" });
}
