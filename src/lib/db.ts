import { sql } from '@vercel/postgres';
import { v4 as uuidv4 } from 'uuid';

export const db = {
  async query(query: string, params: any[] = []) {
    try {
      return await sql.query(query, params);
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  },
  
  async execute(query: string, params: any[] = []) {
    try {
      return await sql.query(query, params);
    } catch (error) {
      console.error('Database execution error:', error);
      throw error;
    }
  },

  generateId() {
    return uuidv4();
  }
};