#!/usr/bin/env node
/**
 * Generate public/og-default.png (1200×630) — the social preview card used
 * on /, /about, /work, and /404. Case studies derive their own OG from the
 * hero image (see src/layouts/CaseStudyLayout.astro), so this file is only
 * the non-case-study fallback.
 *
 * Re-run whenever the role, employer, or bio line changes:
 *   node scripts/generate-og-default.mjs
 *
 * Placeholder-quality by design — a portfolio OG card usually deserves a
 * real design pass. This keeps the social previews from being empty until
 * that design exists.
 */
import sharp from 'sharp';

const W = 1200;
const H = 630;
const BG = { r: 242, g: 237, b: 230, alpha: 1 }; // #F2EDE6 — site bg (--theme-bg)

// Avatar block — rounded square, left-aligned.
const AVATAR_SIZE = 320;
const AVATAR_RADIUS = 40;
const AVATAR_X = 96;
const AVATAR_Y = Math.round((H - AVATAR_SIZE) / 2);

const roundedMask = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${AVATAR_SIZE}" height="${AVATAR_SIZE}">
    <rect width="${AVATAR_SIZE}" height="${AVATAR_SIZE}" rx="${AVATAR_RADIUS}" ry="${AVATAR_RADIUS}" fill="#fff"/>
  </svg>`
);

const avatarBuf = await sharp('src/assets/images/avatar.jpg')
  .resize(AVATAR_SIZE, AVATAR_SIZE, { fit: 'cover', position: 'center' })
  .composite([{ input: roundedMask, blend: 'dest-in' }])
  .png()
  .toBuffer();

// Text block — right of the avatar. Fonts use system-available families
// because Sharp's SVG rasterizer can't load WOFF2 @font-face reliably.
// `Helvetica Neue` is universal on macOS; the `sans-serif` fallback covers
// Linux/Windows build environments. An accent bar sits above the name to
// echo the site's `--color-accent` brand color.
const TEXT_X = AVATAR_X + AVATAR_SIZE + 64;
const textSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <rect x="${TEXT_X}" y="180" width="56" height="4" rx="2" fill="#0059ff"/>
  <text x="${TEXT_X}" y="240" style="font: 700 84px 'Helvetica Neue', Helvetica, Arial, sans-serif; fill: #1a1a1a; letter-spacing: -0.03em;">Ari Zilnik</text>
  <text x="${TEXT_X}" y="300" style="font: 500 36px 'Helvetica Neue', Helvetica, Arial, sans-serif; fill: #3a3a3a; letter-spacing: -0.01em;">Head of Design at Join</text>
  <text x="${TEXT_X}" y="390" style="font: 400 26px 'Helvetica Neue', Helvetica, Arial, sans-serif; fill: #5a5a5a;">Products, teams, and systems</text>
  <text x="${TEXT_X}" y="425" style="font: 400 26px 'Helvetica Neue', Helvetica, Arial, sans-serif; fill: #5a5a5a;">in construction, fintech,</text>
  <text x="${TEXT_X}" y="460" style="font: 400 26px 'Helvetica Neue', Helvetica, Arial, sans-serif; fill: #5a5a5a;">and developer tools.</text>
  <text x="${W - 96}" y="${H - 80}" text-anchor="end" style="font: 500 22px 'Helvetica Neue', Helvetica, Arial, sans-serif; fill: #0059ff; letter-spacing: 0.02em;">ari.design</text>
</svg>
`;

await sharp({
  create: { width: W, height: H, channels: 4, background: BG },
})
  .composite([
    { input: avatarBuf, left: AVATAR_X, top: AVATAR_Y },
    { input: Buffer.from(textSvg), left: 0, top: 0 },
  ])
  .png({ compressionLevel: 9 })
  .toFile('public/og-default.png');

console.log('Wrote public/og-default.png (1200×630)');
