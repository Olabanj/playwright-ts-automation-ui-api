import { z } from 'zod';

export const ProductSchema = z.object({
  id: z.number().int().positive(),
  sku: z.string().min(1),
  title: z.string().min(1),
  price: z.number().positive(),
  category: z.enum(['electronics', 'clothing', 'home', 'toys']),
  inStock: z.boolean(),
  createdAt: z.string().datetime(),
  manufacturer: z.object({
    name: z.string().min(1),
    contactEmail: z.string().email(),
  }),
  discountPercent: z.number().min(0).max(100).optional(),
});

export type Product = z.infer<typeof ProductSchema>;
