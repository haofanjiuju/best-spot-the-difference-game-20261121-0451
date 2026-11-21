// Spot the Difference — Harbor Lights (Node 22, standard library only).
//
// The entry is the static game in game/ (plain HTML + ES modules, no
// libraries, no network): three hand-drawn scenes — harbour dusk, garden,
// night market — each hiding 7/8/9 differences, with a title screen,
// timer, score and win screen. This file is only the packager the grader
// runs: it stages game/ and screenshots/ into the output directory and
// writes dossier.json, the summary the judge reads, using the vendored
// make.fun helper. Run it locally with:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// (outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output).
// Serve the staged game with `node serve.ts`, then open http://localhost:8080.

import { copyFileSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

// Directory holding this file, and where the staged entry goes.
const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const targetDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Walk a directory tree by hand and copy every file into the mirror path.
function mirrorTree(sourceDir, destDir) {
  mkdirSync(destDir, { recursive: true });
  for (const entryName of readdirSync(sourceDir)) {
    const from = join(sourceDir, entryName);
    const to = join(destDir, entryName);
    if (statSync(from).isDirectory()) {
      mirrorTree(from, to);
    } else {
      copyFileSync(from, to);
    }
  }
}

mkdirSync(targetDir, { recursive: true });
mirrorTree(join(repoRoot, 'game'), join(targetDir, 'game'));
mkdirSync(join(targetDir, 'screenshots'), { recursive: true });
const shotsDir = join(repoRoot, 'screenshots');
if (existsSync(shotsDir)) mirrorTree(shotsDir, join(targetDir, 'screenshots'));

// The scorer's own caps (reference/gate.json): text_max_bytes is the only
// one that shapes the bytes; the rest refuse an entry the scorer would
// refuse anyway — more than 4 screenshots or one over 256 KiB, more than
// 993 files in game/ or 48 MiB of game files in all, or a path under
// game/ longer than 1000 bytes (game/ counts beside /output's own
// 1000-entry cap, its screenshots/ and dossier.json).
writeFileSync(
  join(targetDir, 'dossier.json'),
  buildDossier(targetDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);
