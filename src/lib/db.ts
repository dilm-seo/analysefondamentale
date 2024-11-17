import { sql } from '@vercel/postgres';

export const db = {
  async query(text: string, params: any[] = []) {
    try {
      return await sql.query(text, params);
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  },

  async execute(text: string, params: any[] = []) {
    try {
      return await sql.query(text, params);
    } catch (error) {
      console.error('Database execution error:', error);
      throw error;
    }
  }
};