import { sql } from '@vercel/postgres';
import { VercelPoolClient } from '@vercel/postgres';

export const db = {
  async query(text: string, params: any[] = []): Promise<{ rows: any[] }> {
    try {
      const result = await sql.query(text, params);
      return {
        rows: result.rows
      };
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  },

  async transaction<T>(callback: (client: VercelPoolClient) => Promise<T>): Promise<T> {
    const client = await sql.connect();
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
};