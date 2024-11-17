import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useNewsStore } from '@/stores/newsStore';
import toast from 'react-hot-toast';

export default function Home() {
  const { news, fetchNews, isLoading } = useNewsStore();
  const router = useRouter();

  useEffect(() => {
    fetchNews().catch(() => {
      toast.error('Erreur lors du chargement des actualités');
    });
  }, [fetchNews]);

  return (
    <div className="min-h-screen bg-gray-900">
      <header className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold text-indigo-400">Forex Analyzer Pro</h1>
        </div>
      </header>

      <main className="container mx-auto p-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {news.map((item, index) => (
              <div key={index} className="bg-gray-800 rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-semibold text-white">{item.title}</h2>
                  <span className="text-sm text-gray-400">{item.source}</span>
                </div>
                <p className="text-gray-300 mb-4">{item.description}</p>
                <div className="flex justify-between items-center text-sm text-gray-400">
                  <span>{new Date(item.pubDate).toLocaleString()}</span>
                  <a 
                    href={item.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-indigo-400 hover:text-indigo-300"
                  >
                    Lire plus →
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}