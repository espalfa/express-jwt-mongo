const request = require('supertest');
const app = require("../../server");
const mongoose = require("mongoose");
const db = require("../models");
const config = require("../config/auth.config");
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
const User = db.user;
const Phone = db.phone;


afterAll((done) => {
    mongoose.connection.db.dropDatabase(() => {
        mongoose.connection.close(() => done())
    });
});

describe('Routes Testing', function () {
    test('responds to /api/auth/signup', async () => {

        const userToCreate = {
            name: "Sultan",
            email: "sultan@gmail.com",
            password: "123456",
            phones: [
                {
                    number: "123456789",
                    ddd: "11"
                },
                {
                    number: "987654321",
                    ddd: "22"
                },
                {
                    "number": "123498765",
                    ddd: "33"
                }
            ]
        }
        await request(app).post('/api/auth/signup').send(userToCreate).then(async (response) => {
            expect(response.header['content-type']).toBe('application/json; charset=utf-8');
            expect(response.statusCode).toBe(200);
            // Check the response
            expect(response.body.id).toBeDefined();
            expect(response.body.creation_date).toBeDefined();
            expect(response.body.update_date).toEqual(response.body.creation_date);
            expect(response.body.last_login).toEqual(response.body.creation_date);
            expect(response.body.token).toBeDefined();

            // Check the data in the database
            const newUser = await User.findOne({ _id: response.body.id });
            expect(newUser).toBeTruthy();
            expect(newUser.name).toBe(userToCreate.name);
            expect(newUser.email).toBe(userToCreate.email);
            expect(newUser.phones).toBeDefined();
        });
    });

    test('responds to /api/auth/signin', async () => {
        const date = new Date();
        const userToCreate = {
            name: "Sultan",
            email: "sultan@gmail.com",
            password: "123456",
            phones: [],
            creation_date: date,
            update_date: date,
            last_login: date,
            token: 'token'
        }
        const phonesToCreate = [
            {
                number: "123456789",
                ddd: "11"
            },
            {
                number: "987654321",
                ddd: "22"
            },
            {
                "number": "123498765",
                ddd: "33"
            }
        ]
        const phones = await Phone.insertMany(phonesToCreate);
        userToCreate.phones = phones.map(phone => phone._id);
        const userCreated = await User.create(userToCreate);
        const userLogin = {
            email: 'sultan@gmail.com',
            password: '123456'
        }
        await request(app).post('/api/auth/signin').send(userLogin).then(async (response) => {
            expect(response.header['content-type']).toBe('application/json; charset=utf-8');
            expect(response.statusCode).toBe(200);
            // Check the response
            expect(response.body.id).toBeDefined();
            expect(response.body.creation_date).toBeDefined();
            expect(new Date(response.body.update_date).getTime()).toBeGreaterThan(new Date(response.body.creation_date).getTime());
            expect(new Date(response.body.last_login).getTime()).toBeGreaterThan(new Date(response.body.creation_date).getTime());
            expect(response.body.token).toBeDefined();

            // Check the data in the database
            const newUser = await User.findOne({ _id: response.body.id });
            expect(newUser).toBeTruthy();
            expect(new Date(newUser.last_login).getTime()).toBeGreaterThan(new Date(userToCreate.last_login).getTime());
            expect(newUser.token).not.toBe(userToCreate.token);
        });
    });

    test('responds to /api/user/search', async () => {
        const date = new Date();
        const userToCreate = {
            name: "Sultan",
            email: "sultan@gmail.com",
            password: bcrypt.hashSync("123456", 8),
            phones: [],
            creation_date: date,
            update_date: date,
            last_login: date,
            token: 'token'
        }
        const phonesToCreate = [
            {
                number: "123456789",
                ddd: "11"
            },
            {
                number: "987654321",
                ddd: "22"
            },
            {
                "number": "123498765",
                ddd: "33"
            }
        ]
        const phones = await Phone.insertMany(phonesToCreate);
        userToCreate.phones = phones.map(phone => phone._id);
        const userCreated = await User.create(userToCreate);
        const token = jwt.sign({ id: userCreated.id }, config.secret, {
            expiresIn: 1800 // 30 minutes
        });
        await User.findByIdAndUpdate(userCreated._id, { token: token });
        await request(app).get('/api/user/search/'+ userCreated._id)
            .set('authorization', 'Bearer ' + token) //set header for this test
            .set('Content-Type', 'application/json') //set header for this test
            .query({ user_id: userCreated._id }).then(async (response) => {
                expect(response.header['content-type']).toBe('application/json; charset=utf-8');
                expect(response.statusCode).toBe(200);
                // Check the response
                expect(response.body.user._id).toBeDefined();
                expect(response.body.user.name).toBeDefined();
                expect(response.body.user.password).toBeDefined();
                expect(response.body.user.phones).toBeDefined();
                expect(response.body.user.creation_date).toBeDefined();
                expect(response.body.user.update_date).toBeDefined();
                expect(response.body.user.last_login).toBeDefined();
                expect(response.body.user.token).toBeDefined();
            });
    });
});