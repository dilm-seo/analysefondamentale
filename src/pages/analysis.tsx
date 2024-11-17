import { useState, useEffect } from 'react';
import { useNewsStore } from '@/stores/newsStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { analysisService } from '@/services/analysisService';
import toast from 'react-hot-toast';
import Layout from '@/components/Layout';
import PromoPopup from '@/components/PromoPopup';

export default function Analysis() {
  const { news, fetchNews, isLoading } = useNewsStore();
  const { apiKey, model, systemPrompt } = useSettingsStore();
  const [analysis, setAnalysis] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showPromo, setShowPromo] = useState(false);

  useEffect(() => {
    fetchNews().catch(() => {
      toast.error('Erreur lors du chargement des actualités');
    });
  }, [fetchNews]);

  const handleAnalyze = async () => {
    if (!apiKey) {
      toast.error('Veuillez configurer votre clé API dans les paramètres');
      return;
    }

    if (news.length === 0) {
      toast.error('Aucune actualité à analyser');
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await analysisService.analyzeNews(news, apiKey, model, systemPrompt);
      setAnalysis(result);
      toast.success('Analyse terminée');
      setShowPromo(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur lors de l\'analyse');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* Section Analyse */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Analyse du Marché</h2>
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || news.length === 0}
              className={`bg-indigo-600 text-white px-6 py-3 rounded-lg transition-colors ${
                isAnalyzing || news.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-500'
              }`}
            >
              {isAnalyzing ? 'Analyse en cours...' : 'Analyser les actualités'}
            </button>
          </div>

          {analysis && (
            <div className="prose prose-invert max-w-none">
              {analysis.split('\n').map((line, i) => (
                <p key={i} className="text-gray-300">
                  {line}
                </p>
              ))}
            </div>
          )}
        </div>

        {/* Section Actualités */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-white mb-6">Actualités Disponibles</h2>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {news.length === 0 ? (
                <p className="text-gray-400 text-center">Aucune actualité disponible</p>
              ) : (
                news.map((item, index) => (
                  <div key={index} className="bg-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                      <span className="text-sm text-gray-400">{item.source}</span>
                    </div>
                    <p className="text-gray-300 mb-3">{item.description}</p>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-400">
                        {new Date(item.pubDate).toLocaleString('fr-FR')}
                      </span>
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-400 hover:text-indigo-300 transition-colors"
                      >
                        Lire plus →
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      <PromoPopup isOpen={showPromo} onClose={() => setShowPromo(false)} />
    </Layout>
  );
}