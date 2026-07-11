import { test, expect } from '@playwright/test';
import { ProductSchema, Product } from '@schemas/product.schema';

const validProduct: Product = {
  id: 101,
  sku: 'SKU-1001',
  title: 'Wireless Mouse',
  price: 29.99,
  category: 'electronics',
  inStock: true,
  createdAt: '2026-07-08T10:00:00Z',
  manufacturer: {
    name: 'Acme Corp',
    contactEmail: 'support@acme.com',
  },
  // discountPercent omitted — it's optional
};

test('a realistic product payload matches the schema', () => {
  const result = ProductSchema.safeParse(validProduct);

  expect(result.success).toBe(true);
});

test('a product with a discount still matches the schema', () => {
  const result = ProductSchema.safeParse({ ...validProduct, discountPercent: 15 });

  expect(result.success).toBe(true);
});
