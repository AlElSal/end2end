const request = require('supertest');
const { server } = require('../server');
const ioClient = require('socket.io-client');

let socket;
let sessionId;

// Setup a helper to connect as a client
const createClient = () => {
    const addr = server.address();
    return ioClient(`http://localhost:${addr.port}`);
};

beforeAll((done) => {
    // Start server on an ephemeral port if not already listening
    if (!server.listening) {
        server.listen(0, done);
    } else {
        done();
    }
});

afterAll((done) => {
    server.close(done);
});

describe('Integration Tests: Client-Server Interaction', () => {

    test('Session Creation (REST API)', async () => {
        const res = await request(server).post('/api/sessions');
        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('sessionId');
        sessionId = res.body.sessionId;
    });

    test('Real-time Code Sync (Socket.io)', (done) => {
        const client1 = createClient();
        const client2 = createClient();
        const testCode = 'console.log("Sync Test");';

        client1.on('connect', () => {
            client1.emit('join-session', sessionId);
        });

        client2.on('connect', () => {
            client2.emit('join-session', sessionId);
        });

        client2.on('init-session', () => {
            // Once client2 has joined, let client1 change code
            client1.emit('code-change', { sessionId, code: testCode });
        });

        client2.on('code-update', (newCode) => {
            expect(newCode).toBe(testCode);
            client1.disconnect();
            client2.disconnect();
            done();
        });
    });

    test('Language Sync (Socket.io)', (done) => {
        const client1 = createClient();
        const client2 = createClient();
        const testLang = 'python';

        client1.on('connect', () => {
            client1.emit('join-session', sessionId);
        });

        client2.on('connect', () => {
            client2.emit('join-session', sessionId);
        });

        client2.on('init-session', () => {
            client1.emit('language-change', { sessionId, language: testLang });
        });

        client2.on('language-update', (newLang) => {
            expect(newLang).toBe(testLang);
            client1.disconnect();
            client2.disconnect();
            done();
        });
    });
});
