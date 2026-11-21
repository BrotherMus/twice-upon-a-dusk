// Hands in Twice Upon a Dusk (Node 22, standard library only). The game is game/: plain static
// files a desktop browser plays offline (game/index.html and its ES modules, no library, no network
// request, every picture painted by code and every sound synthesised). This program copies game/
// and screenshots/ to /output and writes /output/dossier.json with the kit's vendored library.
//
// Play it locally: `node serve.ts`, then open http://localhost:8080.
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const root = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(root, 'game'), join(out, 'game'), { recursive: true });

const shots = join(root, 'screenshots');
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(shots)) {
  for (const name of readdirSync(shots)) {
    if (/\.(png|jpe?g)$/i.test(name)) cpSync(join(shots, name), join(out, 'screenshots', name));
  }
}

// The scorer's caps: only text_max_bytes shapes the dossier; the rest refuse what the gate would.
const dossier = buildDossier(out, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
});
writeFileSync(join(out, 'dossier.json'), dossier);
console.log(`Twice Upon a Dusk handed in to ${out} (dossier ${Buffer.byteLength(dossier)} bytes)`);
