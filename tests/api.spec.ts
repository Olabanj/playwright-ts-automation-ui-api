import { test, expect } from '@playwright/test';
import { JsonPlaceholderClient } from './support/jsonPlaceholderClient';

test.describe('JSONPlaceholder API', () => {
  const client = new JsonPlaceholderClient();

  test.beforeAll(async () => {
    await client.init();
  });

  test.afterAll(async () => {
    await client.dispose();
  });

  test('Get a request return a product via api', async () => {
    const response = await client.getPosts();
    expect(response.status()).toBe(200);
    expect(response.ok()).toBeTruthy();

    const responseBody = await response.json();
    expect(responseBody.length).toBeGreaterThan(0);
    expect(responseBody[0].userId).toBe(1);
    expect(responseBody[0].id).toBe(1);
  });

  test('create a product via api', async () => {
    const response = await client.createPost({
      title: 'New Product',
      body: 'This is a new product',
      userId: 1,
    });
    expect(response.status()).toBe(201);
    expect(response.ok()).toBeTruthy();

    const responseBody = await response.json();
    expect(responseBody.title).toBe('New Product');
    expect(responseBody.body).toBe('This is a new product');
    expect(responseBody.userId).toBe(1);
  });

  test('update a product via api', async () => {
    const response = await client.updatePost(1, {
      title: 'Updated Product',
      body: 'This is an updated product',
      userId: 1,
    });
    expect(response.status()).toBe(200);
    expect(response.ok()).toBeTruthy();

    const responseBody = await response.json();
    expect(responseBody.title).toBe('Updated Product');
    expect(responseBody.body).toBe('This is an updated product');
    expect(responseBody.userId).toBe(1);
  });

  test('delete a product via api', async () => {
    const response = await client.deletePost(1);
    expect(response.status()).toBe(200);
    expect(response.ok()).toBeTruthy();
  });

  test('update a partial product via api', async () => {
    const response = await client.patchPost(1, {
      title: 'Partially Updated Product',
    });
    expect(response.status()).toBe(200);
    expect(response.ok()).toBeTruthy();

    const responseBody = await response.json();
    expect(responseBody.title).toBe('Partially Updated Product');
  });

  test('get a single product via api', async () => {
    const response = await client.getPost(1);
    expect(response.status()).toBe(200);
    expect(response.ok()).toBeTruthy();

    const responseBody = await response.json();
    expect(responseBody.userId).toBe(1);
    expect(responseBody.id).toBe(1);
  });

  test('get a single product that does not exist via api', async () => {
    const response = await client.getPost(9999);
    expect(response.status()).toBe(404);
    expect(response.ok()).toBeFalsy();
  });

  test('get a single product with invalid id via api', async () => {
    const response = await client.getPost('invalid');
    expect(response.status()).toBe(404);
    expect(response.ok()).toBeFalsy();
  });

  test('get a single product with invalid endpoint via api', async () => {
    const response = await client.get('/invalid');
    expect(response.status()).toBe(404);
    expect(response.ok()).toBeFalsy();
  });

  test('get a single a with a single comment via api', async () => {
    const response = await client.getComment(1);
    expect(response.status()).toBe(200);
    expect(response.ok()).toBeTruthy();

    const responseBody = await response.json();
    expect(responseBody.postId).toBe(1);
    expect(responseBody.id).toBe(1);
  });
});
