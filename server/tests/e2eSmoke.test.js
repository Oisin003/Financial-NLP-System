import request from 'supertest';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { jest } from '@jest/globals';
import { sequelize } from '../models/User.js';

// Mock background NLP so smoke test only verifies API flow.
const processDocumentNLPMock = jest.fn();

jest.unstable_mockModule('../routes/documents/nlpProcessing.js', () => ({
  processDocumentNLP: processDocumentNLPMock
}));

const authRoutes = (await import('../routes/auth.js')).default;
const documentRoutes = (await import('../routes/documents.js')).default;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);

describe('E2E smoke flow', () => {
  beforeAll(async () => {
    // Start from a clean test database.
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    // Clean uploaded files created by this smoke test.
    const uploadDir = path.join(__dirname, '../uploads/documents');
    if (fs.existsSync(uploadDir)) {
      for (const file of fs.readdirSync(uploadDir)) {
        fs.unlinkSync(path.join(uploadDir, file));
      }
    }

    await sequelize.close();
  });

  test('register -> login -> upload -> list -> nlp status', async () => {
    // 1) Register a user.
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'smokeuser',
        email: 'smoke@example.com',
        password: 'Smoke@123'
      });

    expect(registerResponse.status).toBe(201);
    expect(registerResponse.body.token).toBeDefined();

    // 2) Login to confirm credentials work.
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'smoke@example.com',
        password: 'Smoke@123'
      });

    expect(loginResponse.status).toBe(200);
    const token = loginResponse.body.token;
    expect(token).toBeDefined();

    // 3) Upload a PDF.
    const pdfBuffer = Buffer.from('%PDF-1.4 smoke test content');
    const uploadResponse = await request(app)
      .post('/api/documents/upload')
      .set('Authorization', `Bearer ${token}`)
      .attach('document', pdfBuffer, {
        filename: 'smoke.pdf',
        contentType: 'application/pdf'
      });

    expect(uploadResponse.status).toBe(201);
    expect(uploadResponse.body.document.id).toBeDefined();

    const documentId = uploadResponse.body.document.id;

    // 4) List documents for the logged-in user.
    const listResponse = await request(app)
      .get('/api/documents')
      .set('Authorization', `Bearer ${token}`);

    expect(listResponse.status).toBe(200);
    expect(Array.isArray(listResponse.body.documents)).toBe(true);
    expect(listResponse.body.documents.length).toBeGreaterThan(0);

    // 5) NLP result should be pending because processing is async.
    const nlpResponse = await request(app)
      .get(`/api/documents/${documentId}/nlp`)
      .set('Authorization', `Bearer ${token}`);

    expect(nlpResponse.status).toBe(202);
    expect(nlpResponse.body).toEqual(
      expect.objectContaining({
        nlpProcessed: false
      })
    );

    // Confirm background processor was queued.
    expect(processDocumentNLPMock).toHaveBeenCalledTimes(1);
  });
});
