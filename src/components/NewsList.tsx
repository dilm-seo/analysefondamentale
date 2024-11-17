import { useEffect } from 'react';
import { useNewsStore } from '@/stores/newsStore';
import { translationService } from '@/services/translationService';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { useSettingsStore } from '@/stores/settingsStore';

export default function NewsList() {
  const { news, fetchNews, isLoading, limit, setLimit } = useNewsStore();
  const { feeds } = useSettingsStore();
  const [translatedNews, setTranslatedNews] = useState<Record<string, string>>({});
  const [isTranslating, setIsTranslating] = useState(false);

  // Récupérer les actualités au chargement et quand les feeds changent
  useEffect(() => {
    fetchNews().catch(() => {
      toast.error('Erreur lors du chargement des actualités');
    });
  }, [fetchNews, feeds]);

  // Rafraîchir les actualités toutes les 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      fetchNews().catch(() => {
        console.error('Erreur lors du rafraîchissement automatique');
      });
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [fetchNews]);

  const handleTranslateAll = async () => {
    if (isTranslating) return;
    setIsTranslating(true);

    try {
      let count = 0;
      const newsToTranslate = news.slice(0, limit);
      const total = newsToTranslate.length * 2; // Titre + Description pour chaque news

      for (const item of newsToTranslate) {
        const newsId = `${item.source}-${news.indexOf(item)}`;
        
        // Traduire le titre
        const translatedTitle = await translationService.translateText(item.title);
        setTranslatedNews(prev => ({ 
          ...prev, 
          [`${newsId}-title`]: translatedTitle 
        }));
        count++;
        toast.success(`Traduction en cours... ${Math.round((count/total) * 100)}%`, { duration: 500 });

        // Traduire la description
        const translatedDesc = await translationService.translateText(item.description);
        setTranslatedNews(prev => ({ 
          ...prev, 
          [`${newsId}-desc`]: translatedDesc 
        }));
        count++;
        toast.success(`Traduction en cours... ${Math.round((count/total) * 100)}%`, { duration: 500 });

        // Attendre un peu entre chaque traduction
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      toast.success('Toutes les actualités ont été traduites');
    } catch (error) {
      toast.error('Erreur lors de la traduction');
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-white">Actualités Forex</h2>
          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="bg-gray-700 text-white rounded-lg px-3 py-1 text-sm border border-gray-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          >
            <option value={10}>10 news</option>
            <option value={20}>20 news</option>
            <option value={30}>30 news</option>
            <option value={50}>50 news</option>
          </select>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleTranslateAll}
            disabled={isTranslating || news.length === 0}
            className={`flex items-center gap-1 bg-indigo-600 text-white px-3 py-1 text-sm rounded-lg transition-colors ${
              isTranslating || news.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-500'
            }`}
          >
            <span>🌐</span>
            {isTranslating ? 'Traduction...' : 'Tout traduire'}
          </button>
          <button
            onClick={() => fetchNews()}
            disabled={isLoading}
            className={`flex items-center gap-1 bg-indigo-600 text-white px-3 py-1 text-sm rounded-lg transition-colors ${
              isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-500'
            }`}
          >
            <span className={isLoading ? 'animate-spin' : ''}>↻</span>
            {isLoading ? 'Chargement...' : 'Actualiser'}
          </button>
        </div>
      </div>

      {news.slice(0, limit).map((item, index) => {
        const newsId = `${item.source}-${index}`;
        return (
          <div key={newsId} className="bg-gray-800 rounded-lg p-4">
            <div className="flex justify-between items-start mb-3">
              <h2 className="text-lg font-semibold text-white">
                {translatedNews[`${newsId}-title`] || item.title}
              </h2>
              <span className="text-sm text-gray-400">{item.source}</span>
            </div>
            
            <p className="text-gray-300 mb-3 text-sm">
              {translatedNews[`${newsId}-desc`] || item.description}
            </p>

            <div className="flex justify-between items-center text-xs text-gray-400">
              <span>{new Date(item.pubDate).toLocaleString('fr-FR')}</span>
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
        );
      })}

      {news.length === 0 && !isLoading && (
        <div className="text-center py-8 text-gray-400">
          Aucune actualité disponible. Vérifiez vos sources dans les paramètres.
        </div>
      )}
    </div>
  );
}