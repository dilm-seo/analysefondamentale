import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

if (!process.env.NEXTAUTH_SECRET) {
  throw new Error('Please provide NEXTAUTH_SECRET environment variable');
}

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" }
      },
      async authorize(credentials) {
        if (!credentials?.email) {
          throw new Error('Email requis');
        }

        // Simplified auth for demo
        return {
          id: '1',
          email: credentials.email,
          name: credentials.email.split('@')[0],
          role: credentials.email.includes('admin') ? 'admin' : 'user'
        };
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60 // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET
};

export default NextAuth(authOptions);