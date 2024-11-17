import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/stores/authStore';
import NewsList from '@/components/NewsList';
import toast from 'react-hot-toast';

export default function Home() {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <header className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-indigo-400">Forex Analyzer Pro</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-300">{user.email}</span>
            <button
              onClick={() => {
                useAuthStore.getState().logout();
                toast.success('Déconnexion réussie');
              }}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-500"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </header>
      <main className="container mx-auto p-4">
        <NewsList />
      </main>
    </div>
  );
}