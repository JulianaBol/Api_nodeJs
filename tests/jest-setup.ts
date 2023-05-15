import SetupServer from '@src/server';
import supertest from 'supertest';

beforeAll(
    () => {
    const server = new SetupServer();
    server.initServer();
    global.testRequest = supertest(server.getApp());
    }
);
