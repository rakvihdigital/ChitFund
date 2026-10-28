// Checks that every translatable string in the customer-facing site has a translation in each language.
//   node scripts/i18n-check.mjs          report missing, unused and placeholder-mismatched entries
//   node scripts/i18n-check.mjs --keys   print every key as JSON (to start a new language)
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const LANGUAGES = ['kn', 'ta', 'te', 'ml', 'hi'];
// The staff panel is English only
const SKIP = [join(ROOT, 'src/app/admin')];

const files = [];
const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (SKIP.some((skip) => path.startsWith(skip))) continue;
    if (statSync(path).isDirectory()) walk(path);
    else if (/\.(tsx?|jsx?)$/.test(name)) files.push(path);
  }
};
walk(join(ROOT, 'src'));

const unescape = (text) => text.replace(/\\(['"`\\])/g, '$1').replace(/\\n/g, '\n');
const keys = new Map();
const CALL = /\b(?:t|msg)\(\s*(['"`])((?:\\.|(?!\1)[^\\])*)\1/g;
const TRANS = /<Trans\s+text=(['"])((?:\\.|(?!\1)[^\\])*)\1/g;
for (const file of files) {
  const source = readFileSync(file, 'utf8');
  for (const pattern of [CALL, TRANS]) {
    for (const match of source.matchAll(pattern)) {
      if (match[1] === '`' && match[2].includes('${')) continue;
      const key = unescape(match[2]);
      if (!keys.has(key)) keys.set(key, file.replace(ROOT, ''));
    }
  }
}

if (process.argv.includes('--keys')) {
  console.log(JSON.stringify([...keys.keys()].sort(), null, 2));
  process.exit(0);
}

const placeholders = (text) => [...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort().join(',');
let problems = 0;
for (const language of LANGUAGES) {
  let dictionary = {};
  try { dictionary = JSON.parse(readFileSync(join(ROOT, `src/lib/translations/${language}.json`), 'utf8')); }
  catch (error) { console.log(`${language}: cannot read dictionary (${error.message})`); problems++; continue; }
  const missing = [...keys.keys()].filter((key) => !dictionary[key]?.trim());
  const mismatched = [...keys.keys()].filter((key) => dictionary[key] && placeholders(dictionary[key]) !== placeholders(key));
  const unused = Object.keys(dictionary).filter((key) => !keys.has(key));
  for (const key of missing) console.log(`${language}: missing   ${JSON.stringify(key)}  (${keys.get(key)})`);
  for (const key of mismatched) console.log(`${language}: placeholders differ  ${JSON.stringify(key)}`);
  for (const key of unused) console.log(`${language}: unused    ${JSON.stringify(key)}`);
  problems += missing.length + mismatched.length;
  console.log(`${language}: ${keys.size - missing.length}/${keys.size} translated${unused.length ? `, ${unused.length} unused` : ''}`);
}
process.exit(problems ? 1 : 0);
