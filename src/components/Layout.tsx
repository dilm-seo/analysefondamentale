import React from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/router';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: session } = useSession();
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-900">
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-indigo-400">Forex Analyzer Pro</h1>
            <div>
              {session ? (
                <div className="flex items-center gap-4">
                  <span className="text-gray-300">{session.user?.email}</span>
                  <button
                    onClick={() => signOut()}
                    className="text-sm bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-500 transition-colors"
                  >
                    Déconnexion
                  </button>
                </div>
              ) : (
                <Link
                  href="/auth/signin"
                  className="text-sm bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-500 transition-colors"
                >
                  Connexion
                </Link>
              )}
            </div>
          </div>
          <nav className="mt-4">
            <div className="flex space-x-4">
              {['news', 'analysis', 'settings'].map((tab) => (
                <Link
                  key={tab}
                  href={`/${tab}`}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    router.pathname === `/${tab}`
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </Link>
              ))}
            </div>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;