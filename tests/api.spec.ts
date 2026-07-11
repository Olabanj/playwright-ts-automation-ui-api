import { test, expect } from './fixtures/api.fixtures';
import { generateProduct } from './support/testDataFactory';

test.describe('JSONPlaceholder API', () => {
  test('Get a request return a product via api', { tag: '@smoke' }, async ({ apiClient }) => {
    const response = await apiClient.getPosts();
    expect(response.status()).toBe(200);
    expect(response.ok()).toBeTruthy();

    const responseBody = await response.json();
    expect(responseBody.length).toBeGreaterThan(0);
    expect(responseBody[0].userId).toBe(1);
    expect(responseBody[0].id).toBe(1);
  });

  test('create a product via api', { tag: '@smoke' }, async ({ apiClient }) => {
    const newProduct = generateProduct();
    const response = await apiClient.createPost(newProduct);
    expect(response.status()).toBe(201);
    expect(response.ok()).toBeTruthy();

    const responseBody = await response.json();
    expect(responseBody.title).toBe(newProduct.title);
    expect(responseBody.body).toBe(newProduct.body);
    expect(responseBody.userId).toBe(newProduct.userId);
  });

  test('update a product via api', async ({ apiClient }) => {
    const response = await apiClient.updatePost(1, {
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

  test('delete a product via api', async ({ apiClient }) => {
    const response = await apiClient.deletePost(1);
    expect(response.status()).toBe(200);
    expect(response.ok()).toBeTruthy();
  });

  test('update a partial product via api', async ({ apiClient }) => {
    const response = await apiClient.patchPost(1, {
      title: 'Partially Updated Product',
    });
    expect(response.status()).toBe(200);
    expect(response.ok()).toBeTruthy();

    const responseBody = await response.json();
    expect(responseBody.title).toBe('Partially Updated Product');
  });

  test('get a single product via api', { tag: '@smoke' }, async ({ apiClient }) => {
    const response = await apiClient.getPost(1);
    expect(response.status()).toBe(200);
    expect(response.ok()).toBeTruthy();

    const responseBody = await response.json();
    expect(responseBody.userId).toBe(1);
    expect(responseBody.id).toBe(1);
  });

  test('get a single product that does not exist via api', async ({ apiClient }) => {
    const response = await apiClient.getPost(9999);
    expect(response.status()).toBe(404);
    expect(response.ok()).toBeFalsy();
  });

  test('get a single product with invalid id via api', async ({ apiClient }) => {
    const response = await apiClient.getPost('invalid');
    expect(response.status()).toBe(404);
    expect(response.ok()).toBeFalsy();
  });

  test('get a single product with invalid endpoint via api', async ({ apiClient }) => {
    const response = await apiClient.get('/invalid');
    expect(response.status()).toBe(404);
    expect(response.ok()).toBeFalsy();
  });

  test('get a single a with a single comment via api', async ({ apiClient }) => {
    const response = await apiClient.getComment(1);
    expect(response.status()).toBe(200);
    expect(response.ok()).toBeTruthy();

    const responseBody = await response.json();
    expect(responseBody.postId).toBe(1);
    expect(responseBody.id).toBe(1);
  });
});

// Chained requests: each step's output becomes the next step's input.
// test.describe.serial forces these to run in order, and the `let` variables
// declared at the describe level carry data forward between them — a plain
// test.describe would let Playwright run/order them independently, with no
// shared state guaranteed.
test.describe.serial('Chained lookup: post → author → author\'s posts → comments', () => {
  let firstPost: { id: number; userId: number; title: string };
  let author: { id: number; email: string };

  test('1) get the first post from the list', async ({ apiClient }) => {
    const response = await apiClient.getPosts();
    expect(response.status()).toBe(200);

    const posts = await response.json();
    firstPost = posts[0];
    expect(firstPost.id).toBeDefined();
    expect(firstPost.userId).toBeDefined();
  });

  test("2) look up that post's author using its userId", async ({ apiClient }) => {
    const response = await apiClient.get(`/users/${firstPost.userId}`);
    expect(response.status()).toBe(200);

    author = await response.json();
    expect(author.id).toBe(firstPost.userId);
    expect(author.email).toMatch(/@/);
  });

  test("3) get all posts by that author and confirm the first post is among them", async ({
    apiClient,
  }) => {
    const response = await apiClient.get(`/posts?userId=${author.id}`);
    expect(response.status()).toBe(200);

    const authorPosts = await response.json();
    expect(authorPosts.length).toBeGreaterThan(0);
    expect(authorPosts.some((post: { id: number }) => post.id === firstPost.id)).toBe(true);
  });

  test('4) get comments on the first post and confirm each references it', async ({
    apiClient,
  }) => {
    const response = await apiClient.get(`/posts/${firstPost.id}/comments`);
    expect(response.status()).toBe(200);

    const comments = await response.json();
    expect(comments.length).toBeGreaterThan(0);
    for (const comment of comments) {
      expect(comment.postId).toBe(firstPost.id);
    }
  });
});

// Chained requests using the id a POST call actually returns, rather than a
// hardcoded id. Note: JSONPlaceholder is a fake API that doesn't persist
// writes — GET/PUT against the id this POST returns will 404/500 since
// nothing was really saved, so this chain only continues through the
// operations JSONPlaceholder fakes successfully (PATCH, DELETE). Against a
// real API, the same pattern would also support GET/PUT immediately after.
test.describe.serial('Chained lifecycle: create → patch → delete using the created id', () => {
  let createdId: number;

  test('1) create a post and capture the id the server assigned', async ({ apiClient }) => {
    const newProduct = generateProduct();
    const response = await apiClient.createPost(newProduct);
    expect(response.status()).toBe(201);

    const body = await response.json();
    createdId = body.id;
    expect(createdId).toBeDefined();
    expect(body.title).toBe(newProduct.title);
  });

  test('2) partially update the created post using its id', async ({ apiClient }) => {
    const updatedTitle = generateProduct().title;
    const response = await apiClient.patchPost(createdId, { title: updatedTitle });
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.title).toBe(updatedTitle);
  });

  test('3) delete the created post using its id', async ({ apiClient }) => {
    const response = await apiClient.deletePost(createdId);
    expect(response.status()).toBe(200);
  });
});
