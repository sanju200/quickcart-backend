import { Client } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Manual env load if needed
dotenv.config();

async function fixData() {
    const client = new Client({
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '5432'),
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('Connected to DB');
        
        console.log('Updating Categories...');
        const resCat = await client.query(`
            UPDATE categories 
            SET 
                title = COALESCE(title, 'Default Title'),
                category = COALESCE(category, 'Default Category'),
                icon = COALESCE(icon, 'default-icon'),
                "bgColor" = COALESCE("bgColor", '#ffffff')
            WHERE title IS NULL OR category IS NULL OR icon IS NULL OR "bgColor" IS NULL
        `);
        console.log('Categories updated:', resCat.rowCount);
        
        console.log('Updating Products...');
        const resProd = await client.query(`
            UPDATE products 
            SET 
                name = COALESCE(name, 'Default Product'),
                weight = COALESCE(weight, '0kg'),
                image = COALESCE(image, '')
            WHERE name IS NULL OR weight IS NULL OR image IS NULL
        `);
        console.log('Products updated:', resProd.rowCount);
        
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

fixData();
