import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

/**
 * PATRÓN CREACIONAL: SINGLETON
 *
 * Propósito: Garantizar que la aplicación utilice una única instancia del Pool de conexiones
 * a la base de datos PostgreSQL, evitando la creación de múltiples pools que agotarían
 * los recursos del servidor.
 *
 * Justificación de no sobreingeniería: En aplicaciones Node.js con bases de datos,
 * instanciar el Pool repetidas veces en diferentes archivos causa problemas de memoria
 * y conexiones excedidas (max connections limit). Este patrón soluciona un problema real.
 */
class DatabaseSingleton {
    constructor() {
        if (!DatabaseSingleton.instance) {
            this.pool = new Pool({
                user: process.env.DB_USER || 'postgres',
                host: process.env.DB_HOST || 'localhost',
                database: process.env.DB_NAME || 'sia_db',
                password: process.env.DB_PASSWORD || 'admin',
                port: process.env.DB_PORT || 5432
            });

            DatabaseSingleton.instance = this;
        }

        return DatabaseSingleton.instance;
    }

    async query(text, params) {
        return this.pool.query(text, params);
    }

    async getClient() {
        return this.pool.connect();
    }

    async transaction(callback) {
        const client = await this.getClient();

        try {
            await client.query('BEGIN');
            const result = await callback(client);
            await client.query('COMMIT');
            return result;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
}

const dbInstance = new DatabaseSingleton();
Object.freeze(dbInstance);

export default dbInstance;
