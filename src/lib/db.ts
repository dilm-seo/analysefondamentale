import { sql } from '@vercel/postgres';

export const db = {
  async query(query: string, params: any[] = []) {
    return sql.query(query, params);
  },
  
  async execute(query: string, params: any[] = []) {
    return sql.query(query, params);
  }
};