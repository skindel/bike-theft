import { copyFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
/**
 * MapLibre 6 resolves its worker module from `import.meta.url`, which Turbopack/webpack
 * rewrite to a non-resolvable value. The worker then silently fails to start: the style
 * loads but no vector tile is ever parsed, so the basemap stays blank. Serving the worker
 * from our own origin and pointing `maplibregl.config.WORKER_URL` at it avoids that.
 */
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const from = join(root, 'node_modules', 'maplibre-gl', 'dist');
const to = join(root, 'public', 'maplibre');
const files = ['maplibre-gl-worker.mjs', 'maplibre-gl-shared.mjs'];
await mkdir(to, { recursive: true });
await Promise.all(files.map((file) => copyFile(join(from, file), join(to, file))));
console.log(`Copied ${files.length} MapLibre worker files to public/maplibre`);
