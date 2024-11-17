import { sql } from '@vercel/postgres';
import { User } from '@/types';

export async function createUser({ email, username }: { email: string, username: string }) {
  try {
    const result = await sql`
      INSERT INTO users (email, username, role)
      VALUES (${email}, ${username}, 'user')
      RETURNING *
    `;
    return result.rows[0];
  } catch (error) {
    console.error('Error creating user:', error);
    throw new Error('Failed to create user');
  }
}

export async function getUserByEmail(email: string) {
  try {
    const result = await sql`
      SELECT * FROM users WHERE email = ${email}
    `;
    return result.rows[0];
  } catch (error) {
    console.error('Error getting user:', error);
    throw new Error('Failed to get user');
  }
}

export const db = sql;