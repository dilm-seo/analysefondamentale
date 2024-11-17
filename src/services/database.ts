import { sql } from '@vercel/postgres';
import { User, SubscriptionTier } from '../types';

export const dbService = {
  async createUser(email: string, username: string): Promise<User> {
    const result = await sql`
      INSERT INTO users (email, username, role)
      VALUES (${email}, ${username}, 'user')
      RETURNING *
    `;
    return result.rows[0];
  },

  async getUserByEmail(email: string): Promise<User | null> {
    const result = await sql`
      SELECT * FROM users WHERE email = ${email}
    `;
    return result.rows[0] || null;
  },

  async updateLastLogin(userId: string): Promise<void> {
    await sql`
      UPDATE users 
      SET last_login = NOW() 
      WHERE id = ${userId}
    `;
  },

  async getAnalyses(userId: string) {
    const result = await sql`
      SELECT * FROM analyses 
      WHERE user_id = ${userId} 
      ORDER BY created_at DESC
    `;
    return result.rows;
  },

  async saveAnalysis(userId: string, content: string, model: string, cost: number) {
    const result = await sql`
      INSERT INTO analyses (user_id, content, model, cost)
      VALUES (${userId}, ${content}, ${model}, ${cost})
      RETURNING *
    `;
    return result.rows[0];
  },

  async getDailyAnalysisCount(userId: string): Promise<number> {
    const result = await sql`
      SELECT COUNT(*) as count 
      FROM analyses 
      WHERE user_id = ${userId} 
      AND DATE(created_at) = CURRENT_DATE
    `;
    return parseInt(result.rows[0].count);
  }
};