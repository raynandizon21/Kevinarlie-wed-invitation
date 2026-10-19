// src/server/db.ts
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  // Same database as the wedding-invitation project
  database: process.env.DB_NAME || 'rsvp',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

pool
  .getConnection()
  .then((connection) => {
    console.log('Successfully connected to the MySQL database.');
    connection.release();
  })
  .catch((error) => {
    console.error('Error connecting to the MySQL database:', error);
  });

export default pool;
