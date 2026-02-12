import { Pool } from 'pg';

// Conexion a PostgreSQL
let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
      // Configuración SSL para producción
      ssl: process.env.NODE_ENV === 'production' && process.env.DISABLE_SSL !== 'true'
        ? { rejectUnauthorized: false }
        : false,
    });

    pool.on('error', (err: Error) => {
      console.error('Error en pool de PostgreSQL', err);
    });
  }

  return pool;
}

// Funcion para hacer queries
export async function query<T = any>(
  text: string,
  params?: any[]
): Promise<T[]> {
  const pool = getPool();
  const result = await pool.query(text, params);
  return result.rows;
}

// Cerrar la conexion
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

