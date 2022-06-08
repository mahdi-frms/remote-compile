const pg = require('pg');

function db() {

    this.pool = new pg.Pool({
        host: 'localhost',
        database: process.env.DBNAME,
        user: process.env.DBUSER,
        password: process.env.DBPASS,
    });

    this.query = async (queryString, values) => {
        let client = await this.pool.connect();
        const result = await client.query(queryString, values);
        await client.release();
        return result;
    }
    this.execute = async (queryString, values) => {
        let client = await this.pool.connect();
        await client.query(queryString, values);
        await client.end();
    }
}

exports.db = new db();