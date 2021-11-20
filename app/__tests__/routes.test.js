const request = require('supertest');
const express = require('express');
const router = require('../routes/auth.routes');

const app = new express();
app.use('/', router);

describe('Routes Testing', function () {
    test('responds to /api/auth/signup', async () => {
        
        const newUser = {
            "name": "Sultan",
            "email": "sultan@gmail.com",
            "password": "123456",
            "phones": [
              {
                "number": "123456789",
                "ddd": "11"
              },
              {
                "number": "987654321",
                "ddd": "22"
              },
              {
                "number": "123498765",
                "ddd": "33"
              }
            ]
        }
        try {
            const res = await request(app).post('/api/services').send(newUser);
            expect(res.header['content-type']).toBe('application/json; charset=utf-8');
            expect(res.statusCode).toBe(200);
        } catch (err) {
            // write test for failure here
            console.log(`Error ${err}`);
        }
    });
});