import pg from 'pg'

function db() {

    this.pool = new pg.Pool({
        host: process.env.DBHOST,
        database: process.env.DBNAME,
        user: process.env.DBUSER,
        password: process.env.DBPASS,
    });

    this.query = async (queryString, values) => {
        let client = await this.pool.connect();
        try {
            return await client.query(queryString, values);
        }
        finally {
            await client.release();
        }
    }
    this.execute = async (queryString, values) => {
        let client = await this.pool.connect();
        try {
            await client.query(queryString, values);
        }
        finally {
            await client.end();
        }
    }
}

let dbObj = new db()

export { dbObj as db };