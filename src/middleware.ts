import { withAuth } from 'next-auth/middleware';

export default withAuth({
  callbacks: {
    authorized({ req, token }) {
      if (req.nextUrl.pathname.startsWith('/api/')) {
        return !!token;
      }
      return true;
    },
  },
});

export const config = {
  matcher: ['/api/:path*'],
};