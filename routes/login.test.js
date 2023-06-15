
const request = require('supertest');

const server = require('../server');
const testUtils = require('../test-utils');

const User = require('../models/user');

describe('/login', () => {
  beforeAll(testUtils.connectDB);
  afterAll(testUtils.stopDB);
  afterEach(testUtils.clearDB);

  const freeUser = {
    email: 'checkov@starfleet.org',
    password: 'iH3artIrina',
  };
  const adminUser = {
    email: 'demosthenes@ColMin.gov',
    password: 'p3t3rSux',
  };

  describe('POST / signup', () => {

    it('should return 200 with an email and a password', async () => {
      const response = await request(server).post('/login/signup').send(freeUser);
      expect(response.statusCode).toEqual(200);
    });

    it('should not store the plain text password', async () => {
      await request(server).post("/login/signup").send(freeUser);
        const users = await User.find().lean();
        users.forEach((user) => {
          expect(Object.values(user)).not.toContain(freeUser.password);
        });
    });

    it.each(['email', 'password'])('should return 400 without the %s field', async (key) => {

      const incompleteUser = {
        ...freeUser,
        [key]: undefined,
      }
      const response = await request(server).post('/login/signup').send(incompleteUser);
      expect(response.statusCode).toEqual(400);
      const users = await User.find().lean();
      expect(users.length).toEqual(0);
    });

    it('it should return 409 with a duplicate email', async () => {
      const firstResponse = await request(server).post('/login/signup').send(adminUser);
      expect(firstResponse.statusCode).toEqual(200);
      const secondResponse = await request(server).post('/login/signup').send(adminUser);
      expect(secondResponse.statusCode).toEqual(409);
    });

  });

  describe('POST /', () => {

    beforeEach(async () => {
      await request(server).post('/login/signup').send(freeUser);
    })

    it('should return 200 and a token when password matches', async () => {
      const response = await request(server).post('/login').send(freeUser);
      expect(response.statusCode).toEqual(200);
      expect(typeof response.body.token).toEqual('string');
    });

    it('should return 400 when password is not provided', async () => {
      const response = await request(server).post('/login').send({email: freeUser.email});
      expect(response.statusCode).toEqual(400);
    });

    it('should return 401 when password does not match', async () => {
      const response = await request(server).post('/login').send({
        email: freeUser.email,
        password: adminUser.password
      });
      expect(response.statusCode).toEqual(401);
    });

  });

  describe('PUT / password', () => {
    let response0, token0

    beforeEach(async () => {
      await request(server).post('/login/signup').send(freeUser);
      response0 = await request(server).post('/login').send(freeUser);
      token0 = response0.body.token;
    })

    it('should return 200 and change password for authenticated user', async () => {
      const passwordResponse = await request(server)
        .put('/login/password')
        .set('Authorization', 'Bearer ' + token0)
        .send({ password: `newString` });
      expect(passwordResponse.statusCode).toEqual(200);

      const logoutResponse = await request(server).post('/login/logout').set('Authorization', 'Bearer '+ token0).send();
      expect(logoutResponse.statusCode).toEqual(200);

      const oldLoginResponse = await request(server).post('/login').send({freeUser});
      expect(oldLoginResponse.statusCode).toEqual(401);

      const newLoginResponse = await request(server).post('/login').send({
        email: freeUser.email,
        password: 'newString',
      });
      expect(newLoginResponse.statusCode).toEqual(200);

    });

    it('should return 400 with empty password', async () => {
      const response = await request(server)
        .put("/login/password")
        .set('Authorization', 'Bearer ' + token0)
        .send({ password: '' });
      expect(response.statusCode).toEqual(400);
    });

    it('should return 401 with a bogus token', async () => {
      const response = await request(server)
        .put("/login/password")
        .set('Authorization', 'Bearer BAD')
        .send({ password: 'newPassword' });
      expect(response.statusCode).toEqual(401);
    });

  });

  describe('POST / logout', () => {

    let response0, token0
    beforeEach(async () => {
      await request(server).post('/login/signup').send(adminUser);
      response0 = await request(server).post('/login').send(adminUser);
      token0 = response0.body.token;
    })

    it('should return 200 with a valid token', async () => {
      const response = await request(server)
        .post('/login/logout')
        .set('Authorization', 'Bearer '+ token0)
        .send();
      expect(response.statusCode).toEqual(200);
    });


    it('should return 401 with a bogus token', async () => {
      const response = await request(server)
        .post('/login/logout')
        .set('Authorization', 'Bearer BAD')
        .send();
      expect(response.statusCode).toEqual(401);
    });

  });

  describe('DELETE / :userid', () => {

    let userLoginResponse, userToken, adminLoginResponse, adminToken
    beforeEach(async () => {

      await request(server).post('/login/signup').send(freeUser);
      userLoginResponse = await request(server).post('/login').send(freeUser);
      userToken = userLoginResponse.body.token;

      await request(server).post('/login/signup').send(adminUser);
      adminLoginResponse = await request(server).post('/login').send(adminUser);
      adminToken = adminLoginResponse.body.token;
      await User.updateOne({ email: adminUser.email }, { $push: { roles: 'admin'} });

    })
    afterEach(testUtils.clearDB);

    it('should delete the user and return 200 with an admin token', async () => {
      let usersInDB = await User.find().lean()

      const response = await request(server)
        .delete('/login/' + freeUser.email)
        .set('Authorization', 'Bearer ' + adminToken)
        .send();

      expect(response.statusCode).toEqual(200); //returns 404

      usersInDB = await User.find().lean()
      expect(usersInDB.length).toEqual(1)
    });

    it('should return 401 with a bogus token', async () => {
      const response = await request(server)
        .delete('/login/' + freeUser.email)
        .set('Authorization', 'Bearer BAD')
        .send();
      expect(response.statusCode).toEqual(401);
    });

    it('should return 403 to a user', async () => {
      const response = await request(server)
        .delete('/login/' + adminUser.email)
        .set('Authorization', 'Bearer ' + userToken)
        .send();
      expect(response.statusCode).toEqual(403);
    });

  });

});

/*
/login

POST /signup
- it should return 200 with an email and a password
- it should not store the plain text password
- it should return 400 without an email or a password
- it should return 509 with a duplicate email

POST /
- it should return 200 and a token when password matches
- it should return 400 when password isn't provided
- it should return 401 when password doesn't match

POST /password
- it should return 200 and change password for authenticated user
- it should return 400 with empty password
- it should return 401 with a bogus token

POST /logout
- it should return 200 with a valid token
- it should return 401 with a bogus token

DELETE /:userId
- it should delete the user and return 200 with an admin token
- it should return 401 with a bogus token
- it should return 403 to a user

400- Bad Request (Data sent by client is incomplete or incorrect)
401- Unauthorized (User is not authenticated)
403- Forbidden (User is not authorized)
409- Conflict (Duplicate data already in server)
500- Internal Server Error (Developers made an oopsie)

*/