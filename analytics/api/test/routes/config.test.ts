import request from 'supertest';
import app from '../../src/index';

describe('GET /config', () => {
  it('shows enabled connectors', async () => {
    process.env.GITLAB_BASE_URL = 'http://gitlab';
    process.env.GITLAB_PROJECT_ID = '1';
    process.env.OP_BASE_URL = undefined;
    const res = await request(app).get('/config');
    expect(res.status).toBe(200);
    expect(res.body.gitlab).toBe(true);
    expect(res.body.openproject).toBe(false);
    expect(res.body.gitlabProjectId).toBe('1');
  });
});
