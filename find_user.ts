import { Client } from 'pg';

async function findUser() {
    const client = new Client({
        host: 'localhost',
        port: 5432,
        user: 'postgres',
        password: 'Kizora@123',
        database: 'quickcart',
    });

    try {
        await client.connect();
        const res = await client.query("SELECT id FROM users WHERE email = 'sanjivani.bhongade@kizora.com'");
        console.log(JSON.stringify(res.rows[0]));
    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

findUser();
