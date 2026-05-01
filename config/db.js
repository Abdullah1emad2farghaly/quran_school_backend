import mysql from 'mysql2/promise';

const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'quran_school',

    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 10,
});


export default db;