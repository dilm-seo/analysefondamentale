import { sql } from '@vercel/postgres';
import { User } from '@/types';

export const dbService = {
  async createUser(email: string, username: string): Promise<User> {
    const result = await sql`
      INSERT INTO users (email, username, role)
      VALUES (${email}, ${username}, 'user')
      RETURNING *
    `;
    const user = result.rows[0];
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      subscription: user.subscription,
      createdAt: user.created_at?.toString(),
      lastLogin: user.last_login?.toString()
    };
  },

  async getUserByEmail(email: string): Promise<User | null> {
    const result = await sql`
      SELECT * FROM users WHERE email = ${email}
    `;
    const user = result.rows[0];
    return user ? {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      subscription: user.subscription,
      createdAt: user.created_at?.toString(),
      lastLogin: user.last_login?.toString()
    } : null;
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
  },

  async getStats() {
    const result = await sql`
      WITH stats AS (
        SELECT 
          COUNT(DISTINCT u.id) as total_users,
          COUNT(DISTINCT CASE WHEN u.last_login > NOW() - INTERVAL '7 days' THEN u.id END) as active_users,
          COUNT(a.id) as total_analyses,
          COALESCE(SUM(a.cost), 0) as total_costs,
          COUNT(CASE WHEN u.subscription = 'free' THEN 1 END) as free_users,
          COUNT(CASE WHEN u.subscription = 'basic' THEN 1 END) as basic_users,
          COUNT(CASE WHEN u.subscription = 'premium' THEN 1 END) as premium_users
        FROM users u
        LEFT JOIN analyses a ON u.id = a.user_id
      )
      SELECT * FROM stats
    `;
    return result.rows[0];
  },

  async getAllUsers() {
    const result = await sql`
      SELECT id, email, username, role, subscription, created_at, last_login
      FROM users
      ORDER BY created_at DESC
    `;
    return result.rows;
  },

  async deleteUser(userId: string) {
    await sql`
      DELETE FROM analyses WHERE user_id = ${userId}
    `;
    await sql`
      DELETE FROM settings WHERE user_id = ${userId}
    `;
    await sql`
      DELETE FROM users WHERE id = ${userId}
    `;
  }
};