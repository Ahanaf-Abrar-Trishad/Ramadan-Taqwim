// build.ts — Build script for Ramadan BD
import { copyFileSync, mkdirSync, cpSync, existsSync } from 'fs';
import { join } from 'path';

const ROOT = import.meta.dir;
const DIST = join(ROOT, 'dist');

// 1. Clean & create dist
if (existsSync(DIST)) {
  try {
    const { rmSync } = await import('fs');
    rmSync(DIST, { recursive: true, force: true });
  } catch {
    // If dist is locked, try removing contents individually
    const { readdirSync, rmSync } = await import('fs');
    try {
      for (const entry of readdirSync(DIST)) {
        try { rmSync(join(DIST, entry), { recursive: true, force: true }); } catch {}
      }
    } catch {}
  }
}
mkdirSync(DIST, { recursive: true });
mkdirSync(join(DIST, 'styles'), { recursive: true });

// 2. Bundle TS → JS
const result = await Bun.build({
  entrypoints: [join(ROOT, 'src/main.ts')],
  outdir: DIST,
  minify: true,
  target: 'browser',
  format: 'esm',
});

if (!result.success) {
  console.error('Build failed:');
  for (const log of result.logs) {
    console.error(log);
  }
  process.exit(1);
}

// 3. Copy static files
copyFileSync(join(ROOT, 'index.html'), join(DIST, 'index.html'));
copyFileSync(join(ROOT, 'src/styles/global.css'), join(DIST, 'styles/global.css'));
copyFileSync(join(ROOT, 'src/styles/components.css'), join(DIST, 'styles/components.css'));
copyFileSync(join(ROOT, 'src/styles/pages.css'), join(DIST, 'styles/pages.css'));

// 4. Copy public assets
cpSync(join(ROOT, 'public'), DIST, { recursive: true });

console.log('✓ Build complete → dist/');
for (const output of result.outputs) {
  console.log(`  ${output.path} (${(output.size / 1024).toFixed(1)} KB)`);
}
