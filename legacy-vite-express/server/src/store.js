import { readFile, writeFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, '..', 'data', 'products.json');

let writeQueue = Promise.resolve();

export async function readProducts() {
  const raw = await readFile(DATA_FILE, 'utf-8');
  return JSON.parse(raw);
}

// Serialize writes so concurrent admin edits never clobber each other.
export function writeProducts(products) {
  writeQueue = writeQueue.then(() =>
    writeFile(DATA_FILE, JSON.stringify(products, null, 2), 'utf-8')
  );
  return writeQueue;
}
