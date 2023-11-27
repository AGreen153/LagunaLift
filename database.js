// import mysql from 'mysql2'
// import dotenv from 'dotenv'
// dotenv.config();

// const pool = mysql.createPool({
//     host: process.env.MYSQL_HOST,
//     port: process.env.MYSQL_PORT,
//     user: process.env.MYSQL_USER, 
//     password: process.env.MYSQL_PASSWORD,
//     database: process.env.MYSQL_DATABASE
// }).promise()


// export async function getEmployees() {
//     const result = await pool.query("SELECT id, first_name, last_name, position, photo, facebook, twitter, instagram FROM employees");
//     const rows = result[0];
//     return rows;
// }

// export async function getEmployee(id) {
//     const result = await pool.query(`SELECT * FROM employees WHERE id = ?`, [id]);
//     const rows = result[0];
//     return rows[0];
// }

// export async function getProducts() {
//     const result = await pool.query("SELECT id, category, product_title, price, img1, img2, img3, img4, img5 FROM products");
//     const rows = result[0];
//     return rows;
// }

// export async function getProduct(id) {
//     const result = await pool.query(`SELECT * FROM products WHERE id = ?`, [id]);
//     const rows = result[0];
//     return rows[0];
// }