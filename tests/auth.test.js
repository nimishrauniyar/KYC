process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-that-is-long-enough';

jest.setTimeout(30000);

const request = require('supertest');

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/app');
const { connectDatabase } = require('../src/config/db');
const User = require('../src/models/User');
const { ROLES } = require('../src/constants/roles');

let mongo;
beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await connectDatabase(mongo.getUri());
}, 30000);
afterEach(async () => { await User.deleteMany({}); });
afterAll(async () => { await mongoose.disconnect(); await mongo.stop(); });


describe('authentication', () => {
  const credentials = { name: 'Asha Patel', email: 'asha@example.com', password: 'secure-pass-1' };

  test('signs up a customer and returns a JWT', async () => {
    const response = await request(app).post('/api/v1/auth/signup').send(credentials).expect(201);
    expect(response.body.token).toEqual(expect.any(String));
    expect(response.body.user).toMatchObject({ name: credentials.name, email: credentials.email, role: ROLES.CUSTOMER });
    expect(response.body.user.password).toBeUndefined();
  });

  test('logs in and protects the current-user endpoint', async () => {
    await request(app).post('/api/v1/auth/signup').send(credentials).expect(201);
    const login = await request(app).post('/api/v1/auth/login').send({ email: credentials.email, password: credentials.password }).expect(200);
    await request(app).get('/api/v1/auth/me').set('Authorization', `Bearer ${login.body.token}`).expect(200);
    await request(app).get('/api/v1/auth/me').expect(401);
  });
});
