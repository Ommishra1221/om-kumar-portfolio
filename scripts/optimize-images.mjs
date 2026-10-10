/**
 * Image pipeline for the portfolio's public assets.
 *
 * Re-run after replacing the source portrait:
 *   pnpm optimize:images
 *
 * Produces:
 *   client/public/om-kumar-mishra-portrait.webp   (640px, hero portrait)
 *   client/public/og-cover.png                    (1200x630 social preview)
 *   client/public/om-monogram-touch-icon.png      (180x180 home-screen icon)
 */
import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = path.join(root, "client", "public");
const source = path.join(publicDir, "om-kumar-mishra-portrait.png");
const monogram = path.join(publicDir, "om-monogram-favicon.ico");

const kb = (bytes) => `${(bytes / 1024).toFixed(1)} kB`;

/** Hero portrait: the source is 1254x1254 and displayed at ~320px, so 640px is plenty for 2x. */
async function portrait() {
  const out = path.join(publicDir, "om-kumar-mishra-portrait.webp");
  const info = await sharp(source)
    .resize(640, 640, { fit: "cover" })
    .webp({ quality: 84, effort: 5 })
    .toFile(out);

  return { out, size: info.size };
}

/** Longest-edge PNG inside the monogram .ico (the container wraps PNG frames). */
function largestIcoFrame(buffer) {
  const count = buffer.readUInt16LE(4);
  let best = null;

  for (let index = 0; index < count; index += 1) {
    const entry = 6 + index * 16;
    const size = buffer.readUInt32LE(entry + 8);
    const offset = buffer.readUInt32LE(entry + 12);
    const frame = buffer.subarray(offset, offset + size);

    const isPng = frame.subarray(0, 8).toString("hex") === "89504e470d0a1a0a";
    if (isPng && (!best || size > best.size)) best = { size, frame };
  }

  return best?.frame ?? null;
}

/**
 * Render an SVG that only contains SVG text and report how many pixels got ink.
 * librsvg needs a matching system font, so this decides whether the headline can
 * be baked into the cover at all rather than assuming it worked.
 */
async function svgTextInk(svg) {
  const { data, info } = await sharp(Buffer.from(svg)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let ink = 0;
  for (let index = 3; index < data.length; index += info.channels) {
    if (data[index] > 8) ink += 1;
  }
  return ink;
}

/** Open Graph cover: brand background + schematic + portrait + name. */
async function ogCover() {
  const width = 1200;
  const height = 630;
  const headline = `
      <text x="64" y="250" fill="#e3f2ff" font-family="Consolas, monospace" font-size="66" font-weight="700" letter-spacing="2">OM KUMAR</text>
      <text x="64" y="326" fill="#e3f2ff" font-family="Consolas, monospace" font-size="66" font-weight="700" letter-spacing="2">MISHRA</text>
      <text x="64" y="392" fill="#00d4ff" font-family="Consolas, monospace" font-size="30" letter-spacing="4">JAVA BACKEND DEVELOPER</text>
      <text x="64" y="436" fill="#5d87a8" font-family="Consolas, monospace" font-size="24" letter-spacing="3">SPRING BOOT · REST APIs · SQL</text>`;

  const probe = await svgTextInk(
    `<svg width="900" height="500" xmlns="http://www.w3.org/2000/svg">${headline}</svg>`
  );
  const textRenders = probe > 200;

  const frame = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${height}" fill="#030608"/>
      <g stroke="#173955" stroke-width="1" opacity="0.55">
        ${Array.from({ length: 29 }, (_, i) => `<line x1="${i * 42}" y1="0" x2="${i * 42}" y2="${height}"/>`).join("")}
        ${Array.from({ length: 15 }, (_, i) => `<line x1="0" y1="${i * 42}" x2="${width}" y2="${i * 42}"/>`).join("")}
      </g>
      <path d="M60 470 H330" stroke="#00d4ff" stroke-width="2" opacity="0.75"/>
      <path d="M60 500 H230" stroke="#ff6b00" stroke-width="2" opacity="0.6"/>
      <circle cx="330" cy="470" r="5" fill="#00d4ff"/>
      <circle cx="230" cy="500" r="5" fill="#ff6b00"/>
      <rect x="26" y="26" width="${width - 52}" height="${height - 52}" fill="none" stroke="#00d4ff" stroke-opacity="0.35" stroke-width="2"/>
      <circle cx="150" cy="180" r="88" fill="none" stroke="#00d4ff" stroke-opacity="0.22" stroke-width="2"/>
      <circle cx="150" cy="180" r="132" fill="none" stroke="#ff6b00" stroke-opacity="0.18" stroke-width="2"/>
      ${textRenders ? headline : ""}
    </svg>`;

  const portraitBuffer = await sharp(source).resize(430, 430, { fit: "cover" }).toBuffer();
  const out = path.join(publicDir, "og-cover.png");

  const info = await sharp(Buffer.from(frame))
    .composite([{ input: portraitBuffer, left: 712, top: 132 }])
    // Quantising keeps the cover small enough to fetch quickly in a link card.
    .png({ palette: true, colours: 128, effort: 8, compressionLevel: 9 })
    .toFile(out);

  return { out, size: info.size, textRendered: textRenders };
}

/** Home-screen icon, rasterised from the largest PNG frame inside the .ico. */
async function touchIcon() {
  const frame = largestIcoFrame(await readFile(monogram));
  if (!frame) throw new Error("no PNG frame found inside the monogram .ico");

  const out = path.join(publicDir, "om-monogram-touch-icon.png");
  const info = await sharp(frame)
    .resize(180, 180, { fit: "contain", background: { r: 3, g: 6, b: 8, alpha: 1 } })
    .png({ compressionLevel: 9 })
    .toFile(out);

  return { out, size: info.size };
}

await mkdir(publicDir, { recursive: true });

const results = await Promise.allSettled([portrait(), ogCover(), touchIcon()]);

const labels = ["portrait webp", "og cover", "touch icon"];
results.forEach((result, index) => {
  const label = labels[index];
  if (result.status === "fulfilled") {
    const extra = "textRendered" in result.value ? `, headline rendered: ${result.value.textRendered}` : "";
    console.log(`✓ ${label} — ${path.relative(root, result.value.out)} (${kb(result.value.size)}${extra})`);
  } else {
    console.error(`✗ ${label} — ${result.reason?.message ?? result.reason}`);
  }
});

if (results.some((result) => result.status === "rejected")) process.exitCode = 1;
