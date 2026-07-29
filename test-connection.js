require('dotenv').config({ path: '.env.local' });
console.log('DATABASE_URL length:', process.env.DATABASE_URL?.length);
console.log('Contains newline:', process.env.DATABASE_URL?.includes('\n'));
console.log('Ends with:', JSON.stringify(process.env.DATABASE_URL?.slice(-15)));
const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

client.connect()
  .then(() => {
    console.log('✅ Connected successfully');
    return client.query('SELECT NOW()');
  })
  .then((res) => {
    console.log('Server time:', res.rows[0]);
    client.end();
  })
  .catch((err) => {
    console.error('❌ Connection failed:');
    console.error(err);
    process.exit(1);
  });