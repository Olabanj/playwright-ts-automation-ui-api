import { faker } from '@faker-js/faker';

export type GeneratedProduct = {
  title: string;
  body: string;
  userId: number;
};

export function generateProduct(): GeneratedProduct {
  return {
    title: faker.commerce.productName(),
    body: faker.commerce.productDescription(),
    userId: faker.number.int({ min: 1, max: 10 }),
  };
}
