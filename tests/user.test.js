// tests/user.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/models/userModel');
require('dotenv').config();

const MONGO_TEST_URI = process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/user-service-test-db';

/**
 * Setup and teardown for tests
 */
beforeAll(async () => {
  await mongoose.connect(MONGO_TEST_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
});

afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.connection.close();
});

beforeEach(async () => {
  // Clear users before each test
  await User.deleteMany({});
});

// Test suite for User Service
describe('User Service API', () => {
  const userData = {
    username: 'testuser',
    email: 'testuser@example.com',
    password: 'Password123!'
  };

  describe('POST /api/users/register', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app)
        .post('/api/users/register')
        .send(userData)
        .expect(201);

      expect(res.body).toHaveProperty('message', 'User registered successfully');
      expect(res.body.user).toHaveProperty('id');
      expect(res.body.user).toHaveProperty('username', userData.username);
      expect(res.body.user).toHaveProperty('email', userData.email);
      expect(res.body).toHaveProperty('token');
    });

    it('should not allow duplicate email or username', async () => {
      // Create user first
      await new User(userData).save();

      const res = await request(app)
        .post('/api/users/register')
        .send(userData)
        .expect(400);

      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toMatch(/exists/i);
    });

    it('should return 400 if required fields are missing', async () => {
      const res = await request(app)
        .post('/api/users/register')
        .send({ email: 'missingusername@example.com' })
        .expect(400);

      expect(res.body).toHaveProperty('errors');
    });
  });

  describe('POST /api/users/login', () => {
    beforeEach(async () => {
      // Register a user for login tests
      await request(app).post('/api/users/register').send(userData);
    });

    it('should login successfully with valid credentials', async () => {
      const res = await request(app)
        .post('/api/users/login')
        .send({ email: userData.email, password: userData.password })
        .expect(200);

      expect(res.body).toHaveProperty('message', 'Login successful');
      expect(res.body.user).toHaveProperty('email', userData.email);
      expect(res.body).toHaveProperty('token');
    });

    it('should fail login with invalid password', async () => {
      const res = await request(app)
        .post('/api/users/login')
        .send({ email: userData.email, password: 'wrongpassword' })
        .expect(401);

      expect(res.body).toHaveProperty('message', 'Invalid email or password');
    });

    it('should fail login with non-existing email', async () => {
      const res = await request(app)
        .post('/api/users/login')
        .send({ email: 'nonexistent@example.com', password: 'Password123!' })
        .expect(401);

      expect(res.body).toHaveProperty('message', 'Invalid email or password');
    });
  });

  describe('GET /api/users/profile', () => {
    let token;

    beforeEach(async () => {
      // Register and login user to get token
      await request(app).post('/api/users/register').send(userData);
      const loginRes = await request(app).post('/api/users/login').send({ email: userData.email, password: userData.password });
      token = loginRes.body.token;
    });

    it('should return user profile with valid token', async () => {
      const res = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body).toHaveProperty('email', userData.email);
      expect(res.body).toHaveProperty('username', userData.username);
      expect(res.body).toHaveProperty('roles');
    });

    it('should return 401 if token is missing', async () => {
      const res = await request(app).get('/api/users/profile').expect(401);

      expect(res.body).toHaveProperty('message');
      expect(res.body.message).toMatch(/missing/i);
    });

    it('should return 401 if token is invalid', async () => {
      const res = await request(app)
        .get('/api/users/profile')
        .set('Authorization', 'Bearer invalidtoken')
        .expect(401);

      expect(res.body).toHaveProperty('message');
      expect(res.body.message).toMatch(/invalid/i);
    });
  });
});