import { Router } from 'express';
import crypto from 'crypto';
import { readProducts, writeProducts } from '../store.js';
import { requireAdmin } from '../middleware/requireAdmin.js';

const router = Router();
const CATEGORIES = ['Doll', 'Bouquet', 'Gifts', 'Combo'];

function slugify(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function validateProductInput(body, { partial = false } = {}) {
  const errors = [];
  const out = {};

  if (!partial || body.name !== undefined) {
    if (typeof body.name !== 'string' || !body.name.trim()) {
      errors.push('name is required.');
    } else {
      out.name = body.name.trim();
    }
  }

  if (!partial || body.category !== undefined) {
    if (!CATEGORIES.includes(body.category)) {
      errors.push(`category must be one of ${CATEGORIES.join(', ')}.`);
    } else {
      out.category = body.category;
    }
  }

  if (!partial || body.price !== undefined) {
    const price = Number(body.price);
    if (!Number.isFinite(price) || price < 0) {
      errors.push('price must be a non-negative number.');
    } else {
      out.price = price;
    }
  }

  if (!partial || body.image !== undefined) {
    if (typeof body.image !== 'string' || !body.image.trim()) {
      errors.push('image is required.');
    } else {
      out.image = body.image.trim();
    }
  }

  if (body.description !== undefined) {
    out.description = String(body.description).trim();
  }

  if (body.trending !== undefined) {
    out.trending = Boolean(body.trending);
  }

  return { errors, data: out };
}

router.get('/', async (req, res) => {
  const products = await readProducts();
  res.json(products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
});

router.get('/:id', async (req, res) => {
  const products = await readProducts();
  const product = products.find((p) => p.id === req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found.' });
  res.json(product);
});

router.post('/', requireAdmin, async (req, res) => {
  const { errors, data } = validateProductInput(req.body || {});
  if (errors.length) return res.status(400).json({ error: errors.join(' ') });

  const products = await readProducts();
  let id = slugify(data.name);
  if (!id) id = crypto.randomUUID();
  let uniqueId = id;
  let suffix = 2;
  while (products.some((p) => p.id === uniqueId)) {
    uniqueId = `${id}-${suffix++}`;
  }

  const product = {
    id: uniqueId,
    name: data.name,
    category: data.category,
    price: data.price,
    image: data.image,
    description: data.description || '',
    trending: data.trending || false,
    createdAt: new Date().toISOString(),
  };

  products.push(product);
  await writeProducts(products);
  res.status(201).json(product);
});

router.put('/:id', requireAdmin, async (req, res) => {
  const { errors, data } = validateProductInput(req.body || {}, { partial: true });
  if (errors.length) return res.status(400).json({ error: errors.join(' ') });

  const products = await readProducts();
  const index = products.findIndex((p) => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Product not found.' });

  products[index] = { ...products[index], ...data };
  await writeProducts(products);
  res.json(products[index]);
});

router.delete('/:id', requireAdmin, async (req, res) => {
  const products = await readProducts();
  const index = products.findIndex((p) => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Product not found.' });

  const [removed] = products.splice(index, 1);
  await writeProducts(products);
  res.json(removed);
});

export default router;
