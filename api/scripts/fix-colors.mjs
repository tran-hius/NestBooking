// fix-colors.mjs — replace emerald → sky/blue using Node.js (native UTF-8)
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(__dirname, '..', 'client', 'src');

// Walk all .tsx files
function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap(e =>
    e.isDirectory() ? walk(path.join(dir, e.name)) : path.join(dir, e.name)
  ).filter(f => f.endsWith('.tsx'));
}

const REPLACEMENTS = [
  // emerald shade → sky shade (all 50-950)
  ['emerald-50',  'sky-50'],
  ['emerald-100', 'sky-100'],
  ['emerald-200', 'sky-200'],
  ['emerald-300', 'sky-300'],
  ['emerald-400', 'sky-400'],
  ['emerald-500', 'sky-500'],
  ['emerald-600', 'sky-600'],
  ['emerald-700', 'sky-700'],
  ['emerald-800', 'sky-800'],
  ['emerald-900', 'sky-900'],
  ['emerald-950', 'sky-950'],
  // gradient from/to
  ['from-emerald-', 'from-blue-'],
  ['to-emerald-',   'to-blue-'],
  // hex colors
  ['#10b981', '#0ea5e9'],
  ['#059669', '#0284c7'],
  ['#064e3b', '#0c4a6e'],
  // type strings
  ['"emerald"', '"sky"'],
  ["'emerald'", "'sky'"],
];

let totalFiles = 0;
let changedFiles = 0;

for (const file of walk(SRC)) {
  totalFiles++;
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  for (const [from, to] of REPLACEMENTS) {
    content = content.split(from).join(to);
  }

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    changedFiles++;
    console.log(`✅ Fixed: ${path.relative(SRC, file)}`);
  }
}

console.log(`\nDone: ${changedFiles} / ${totalFiles} files changed.`);
