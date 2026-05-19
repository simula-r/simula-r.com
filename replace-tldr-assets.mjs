import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const tldrPath = resolve(__dirname, 'src/layouts/whiteboard.tldr');
const publicDir = resolve(__dirname, 'public');

// Build set of files that actually exist in /public
const publicFiles = new Set(readdirSync(publicDir));
console.log(`Found ${publicFiles.size} files in /public`);

console.log('Reading whiteboard.tldr...');
const raw = readFileSync(tldrPath, 'utf-8');

console.log('Parsing JSON...');
const data = JSON.parse(raw);

// Pass 1: process asset records
// - exact match in /public → replace base64 src with /filename
// - no match → mark for deletion
// - duplicate name → keep first, mark rest for deletion (remap their shapes)
const deletedAssetIds = new Set();
const seenNames = new Map(); // name → kept asset id (for dedup remapping)
const assetIdRemap = new Map(); // duplicate id → kept id

let replaced = 0;
let deleted = 0;
let dupes = 0;

for (const record of data.records) {
  if (
    record.typeName !== 'asset' ||
    (record.type !== 'image' && record.type !== 'video')
  ) continue;

  const name = record.props?.name;

  if (!publicFiles.has(name)) {
    deletedAssetIds.add(record.id);
    deleted++;
    console.log(`  No match — deleting: ${name}`);
    continue;
  }

  if (seenNames.has(name)) {
    // Duplicate: remap shapes to the first asset and delete this one
    assetIdRemap.set(record.id, seenNames.get(name));
    deletedAssetIds.add(record.id);
    dupes++;
    console.log(`  Duplicate — removing: ${name} (${record.id})`);
    continue;
  }

  seenNames.set(name, record.id);
  record.props.src = `/${name}`;
  replaced++;
  console.log(`  Replaced: ${name}`);
}

// Pass 2: update shape records that reference remapped or deleted assets
let shapesRemapped = 0;
let shapesDeleted = 0;

const filteredRecords = data.records.filter((record) => {
  if (record.typeName === 'asset' && deletedAssetIds.has(record.id)) {
    return false;
  }

  if (
    record.typeName === 'shape' &&
    (record.type === 'image' || record.type === 'video')
  ) {
    const assetId = record.props?.assetId;
    if (assetIdRemap.has(assetId)) {
      record.props.assetId = assetIdRemap.get(assetId);
      shapesRemapped++;
    } else if (deletedAssetIds.has(assetId)) {
      shapesDeleted++;
      return false;
    }
  }

  return true;
});

data.records = filteredRecords;

console.log(`
Summary:
  Assets replaced:      ${replaced}
  Assets deleted:       ${deleted} (no match in /public)
  Duplicates removed:   ${dupes}
  Shapes remapped:      ${shapesRemapped}
  Shapes deleted:       ${shapesDeleted} (referenced deleted assets)
`);

console.log('Writing file...');
writeFileSync(tldrPath, JSON.stringify(data), 'utf-8');
console.log('Done.');
