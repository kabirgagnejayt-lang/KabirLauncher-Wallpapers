import { mkdir, readFile, writeFile, rm, stat } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const root = dirname(dirname(fileURLToPath(import.meta.url)));
const edge = process.env.EDGE_PATH ?? 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const ffmpeg = process.env.FFMPEG_PATH ?? 'ffmpeg';
const width = 720;
const height = 1280;
const resolutions = [
  ['720p', 720, 1280],
  ['1080p', 1080, 1920],
  ['2k', 1440, 2560],
  ['4k', 2160, 3840],
];

const scenes = [
  { slug: 'live-aurora', title: 'Aurora Live', category: 'Space', description: 'A still export of the KabirUI Aurora live wallpaper scene.', start: '#07131D', end: '#17352F', svg: auroraSvg },
  { slug: 'live-orbit', title: 'Orbit Live', category: 'Space', description: 'A still export of the KabirUI Orbit live wallpaper scene.', start: '#080D1A', end: '#171A35', svg: orbitSvg },
  { slug: 'live-flow', title: 'Flow Live', category: 'Abstract', description: 'A still export of the KabirUI Flow live wallpaper scene.', start: '#07141B', end: '#15132B', svg: flowSvg },
];

const catalogPath = join(root, 'wallpapers.json');
const catalog = JSON.parse(await readFile(catalogPath, 'utf8'));
const variantResults = new Map();

for (const scene of scenes) {
  const sceneDirectory = join(root, 'wallpapers', scene.slug);
  await mkdir(sceneDirectory, { recursive: true });
  await writeFile(join(sceneDirectory, 'frame.svg'), scene.svg(), 'utf8');
  const variants = {};

  for (const [label, outputWidth, outputHeight] of resolutions) {
    const output = join(sceneDirectory, `${label}.webp`);
    const png = join(sceneDirectory, `${label}.tmp.png`);
    const source = pathToFileURL(join(sceneDirectory, 'frame.svg')).href;
    await execFileAsync(edge, [
      '--headless', '--disable-gpu', '--no-first-run', `--window-size=${outputWidth},${outputHeight}`,
      `--screenshot=${png}`, source,
    ]);
    await execFileAsync(ffmpeg, [
      '-y', '-hide_banner', '-loglevel', 'error', '-i', png,
      '-frames:v', '1', '-vf', `scale=${outputWidth}:${outputHeight}:flags=lanczos`,
      '-c:v', 'libwebp', '-quality', '88', '-compression_level', '6', output,
    ]);
    await rm(png, { force: true });
    const { size } = await stat(output);
    console.log(`${scene.slug}/${label}.webp ${outputWidth}x${outputHeight} ${size} bytes`);
    const url = `https://kabirui.kabirinvents.com/wallpapers/${scene.slug}/${label}.webp`;
    variants[label] = {
      width: outputWidth,
      height: outputHeight,
      bytes: size,
      mb: Number((size / 1_000_000).toFixed(3)),
      url,
      downloadUrl: url,
    };
  }
  variantResults.set(scene.slug, variants);
}

for (const scene of scenes) {
  const variants = variantResults.get(scene.slug);
  const next = {
    id: Math.max(-1, ...catalog.wallpapers.map((wallpaper) => wallpaper.id)) + 1,
    slug: scene.slug,
    name: scene.title,
    category: scene.category,
    description: scene.description,
    bundled: false,
    preview: variants['720p'].url,
    variants,
  };
  const existingIndex = catalog.wallpapers.findIndex((wallpaper) => wallpaper.slug === scene.slug);
  if (existingIndex >= 0) {
    next.id = catalog.wallpapers[existingIndex].id;
    catalog.wallpapers[existingIndex] = next;
  } else {
    catalog.wallpapers.push(next);
  }
}
catalog.updatedAt = new Date().toISOString();
await writeFile(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`, 'utf8');
console.log(`Updated ${catalogPath} with ${scenes.length} live-scene stills.`);

function starLayer(color, opacity, count = 24) {
  return Array.from({ length: count }, (_, index) => {
    const x = fract(Math.sin(index * 127.1 + 18.3) * 43758.5453) * width;
    const y = fract(Math.sin(index * 311.7 + 4.7) * 24634.6345) * height;
    const twinkle = clamp(0.45 + 0.55 * Math.sin(index * 0.73), 0.15, 1);
    const radius = index % 5 === 0 ? 1.8 : 1.1;
    return `<circle cx="${n(x)}" cy="${n(y)}" r="${radius}" fill="${color}" fill-opacity="${n(opacity * twinkle)}"/>`;
  }).join('\n');
}

function shell(scene, definitions, artwork) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="background" x1="0" y1="0" x2="${width * 0.25}" y2="${height}" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="${scene.start}"/><stop offset="1" stop-color="${scene.end}"/>
    </linearGradient>
${definitions}
  </defs>
  <rect width="${width}" height="${height}" fill="${scene.start}"/>
  <rect width="${width}" height="${height}" fill="url(#background)"/>
  ${artwork}
</svg>
`;
}

function auroraSvg() {
  const stars = starLayer('#B8F6E2', 0.12);
  const artwork = `${stars}
    <path d="M ${-width * .12} ${height * .44}
      C ${width * .16} ${height * .21}, ${width * .38} ${height * .58}, ${width * .62} ${height * .34}
      C ${width * .79} ${height * .15}, ${width * .94} ${height * .2}, ${width * 1.12} ${height * .3}
      L ${width * 1.12} ${height * .57}
      C ${width * .84} ${height * .39}, ${width * .72} ${height * .55}, ${width * .52} ${height * .56}
      C ${width * .27} ${height * .58}, ${width * .16} ${height * .39}, ${-width * .12} ${height * .66} Z"
      fill="url(#aurora-one)"/>
    <path d="M ${-width * .08} ${height * .67 + height * .026}
      C ${width * .2} ${height * .47 - height * .026}, ${width * .41} ${height * .73 + height * .026}, ${width * .66} ${height * .52}
      C ${width * .85} ${height * .36}, ${width} ${height * .5}, ${width * 1.08} ${height * .45}
      L ${width * 1.08} ${height * .68}
      C ${width * .82} ${height * .58}, ${width * .78} ${height * .76}, ${width * .53} ${height * .75}
      C ${width * .28} ${height * .73}, ${width * .17} ${height * .62}, ${-width * .08} ${height * .84} Z"
      fill="url(#aurora-two)"/>`;
  const definitions = `
    <linearGradient id="aurora-one" x1="0" y1="${height * .2}" x2="${width}" y2="${height * .6}" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#25D6B3" stop-opacity="0"/><stop offset=".333" stop-color="#35D6AD" stop-opacity=".6"/>
      <stop offset=".667" stop-color="#4894E8" stop-opacity=".467"/><stop offset="1" stop-color="#25D6B3" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="aurora-two" x1="${width * .1}" y1="${height * .5}" x2="${width}" y2="${height * .75}" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#3D9CEB" stop-opacity="0"/><stop offset=".333" stop-color="#5BD3CC" stop-opacity=".4"/>
      <stop offset=".667" stop-color="#4C88E8" stop-opacity=".4"/><stop offset="1" stop-color="#3D9CEB" stop-opacity="0"/>
    </linearGradient>`;
  return shell(scenes[0], definitions, artwork);
}

function orbitSvg() {
  const cx = width * .53;
  const cy = height * .53;
  const radius = Math.min(width, height) * .235;
  const stars = starLayer('#DCE7FF', 0.2);
  const rings = Array.from({ length: 3 }, (_, index) => {
    const rx = radius * (1.55 + index * .25);
    const ry = radius * (.55 + index * .08);
    const rotation = -24 + index * 37;
    const colors = ['#5DAEE8', '#8B78E8', '#6ADAC7'];
    const opacities = ['.4', '.4', '.333'];
    return `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" transform="rotate(${rotation} ${cx} ${cy})" fill="none" stroke="${colors[index]}" stroke-opacity="${opacities[index]}" stroke-width="${radius * .015}"/>`;
  }).join('\n');
  const orbitAngle = .4;
  const orbiterX = cx + Math.cos(orbitAngle) * radius * 2.1;
  const orbiterY = cy + Math.sin(orbitAngle) * radius * .77;
  const artwork = `${stars}${rings}
    <circle cx="${cx}" cy="${cy}" r="${radius}" fill="url(#planet)"/>
    <circle cx="${orbiterX}" cy="${orbiterY}" r="${radius * .07}" fill="#9DE9E2" filter="url(#orbiter-glow)"/>
    <circle cx="${cx - radius * 2.15}" cy="${cy - radius * .22}" r="${radius * .035}" fill="#B6A5FF"/>`;
  const definitions = `
    <radialGradient id="planet" cx="${cx - radius * .28}" cy="${cy - radius * .35}" r="${radius * 1.5}" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#9AA8E5"/><stop offset=".5" stop-color="#455A99"/><stop offset="1" stop-color="#151A39"/>
    </radialGradient>
    <filter id="orbiter-glow" x="-150%" y="-150%" width="400%" height="400%"><feGaussianBlur stdDeviation="${radius * .07}" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`;
  return shell(scenes[1], definitions, artwork);
}

function flowSvg() {
  const amplitude = height * .045;
  const colors = ['#48D7BF', '#5F73DF', '#5CADD9'];
  const currents = Array.from({ length: 5 }, (_, index) => {
    const base = .37 + index * .115;
    const offset = Math.sin(index * .68) * amplitude;
    const color = colors[index % 3];
    const gradientId = `flow-${index}`;
    const path = `M ${-width * .1} ${height * base + offset}
      C ${width * .23} ${height * (base - .12) - offset}, ${width * .36} ${height * (base + .15) + offset}, ${width * .61} ${height * (base + .02)}
      C ${width * .83} ${height * (base - .12) - offset}, ${width * .98} ${height * (base + .12)}, ${width * 1.1} ${height * (base + .05)}
      L ${width * 1.1} ${height * (base + .14)}
      C ${width * .84} ${height * (base + .22)}, ${width * .78} ${height * (base + .02) + offset}, ${width * .56} ${height * (base + .16)}
      C ${width * .31} ${height * (base + .28)}, ${width * .16} ${height * (base + .06) - offset}, ${-width * .1} ${height * (base + .24)} Z`;
    const definition = `<linearGradient id="${gradientId}" x1="0" y1="${height * (base - .1)}" x2="${width}" y2="${height * (base + .2)}" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#3CD6BC" stop-opacity="0"/><stop offset=".333" stop-color="${color}" stop-opacity=".4"/>
      <stop offset=".667" stop-color="#5F69DC" stop-opacity=".533"/><stop offset="1" stop-color="#3CD6BC" stop-opacity="0"/>
    </linearGradient>`;
    return { path: `<path d="${path}" fill="url(#${gradientId})"/>`, definition };
  });
  const artwork = `${currents.map((item) => item.path).join('\n')}
    ${starLayer('#B9F0EA', 0.07)}`;
  const definitions = currents.map((item) => item.definition).join('\n');
  return shell(scenes[2], definitions, artwork);
}

function fract(value) { return value - Math.floor(value); }
function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
function n(value) { return Number(value.toFixed(3)); }
