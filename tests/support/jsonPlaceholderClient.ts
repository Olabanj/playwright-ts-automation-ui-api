import { request, APIRequestContext, APIResponse } from '@playwright/test';

type PostPayload = {
  title: string;
  body: string;
  userId: number;
};

export class JsonPlaceholderClient {
  private context: APIRequestContext | null = null;

  async init() {
    this.context = await request.newContext({
      baseURL: process.env.API_BASE_URL ?? 'https://jsonplaceholder.typicode.com',
      extraHTTPHeaders: { 'Content-Type': 'application/json' },
    });
  }

  async dispose() {
    await this.context?.dispose();
  }

  private get ctx(): APIRequestContext {
    if (!this.context) {
      throw new Error('JsonPlaceholderClient not initialized — call init() first');
    }
    return this.context;
  }

  getPosts(): Promise<APIResponse> {
    return this.ctx.get('/posts');
  }

  getPost(id: number | string): Promise<APIResponse> {
    return this.ctx.get(`/posts/${id}`);
  }

  createPost(data: PostPayload): Promise<APIResponse> {
    return this.ctx.post('/posts', { data });
  }

  updatePost(id: number, data: PostPayload): Promise<APIResponse> {
    return this.ctx.put(`/posts/${id}`, { data });
  }

  patchPost(id: number, data: Partial<PostPayload>): Promise<APIResponse> {
    return this.ctx.patch(`/posts/${id}`, { data });
  }

  deletePost(id: number): Promise<APIResponse> {
    return this.ctx.delete(`/posts/${id}`);
  }

  getComment(id: number): Promise<APIResponse> {
    return this.ctx.get(`/comments/${id}`);
  }

  get(path: string): Promise<APIResponse> {
    return this.ctx.get(path);
  }
}
