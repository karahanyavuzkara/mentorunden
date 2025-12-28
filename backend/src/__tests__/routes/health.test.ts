import request from 'supertest';
import express from 'express';
import healthRoutes from '../../routes/health';

const app = express();
app.use(express.json());
app.use('/health', healthRoutes);

describe('Health Check Endpoint', () => {
  it('should return 200 and status ok', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);

    expect(response.body).toEqual({ status: 'ok' });
  });
});

