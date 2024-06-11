import mysql from 'mysql2/promise';

export const connectToDb = async () => {
    try {
        const con = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'eygwa',
            database: 'dayratereport',
        });
        return con;
    } catch (error) {
        //console.error('Error creating MySQL connection:', error);
        throw error;
    }
};