import { useState, useEffect } from 'react';
import { useNewsStore } from './stores/newsStore';
import { useSettingsStore } from './stores/settingsStore';
import { analysisService } from './services/analysisService';
import toast from 'react-hot-toast';
import SettingsPanel from './components/SettingsPanel';

export default function App() {
  const { news, fetchNews, isLoading } = useNewsStore();
  const { apiKey, model, systemPrompt } = useSettingsStore();
  const [analysis, setAnalysis] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

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

    setIsAnalyzing(true);
    try {
      const result = await analysisService.analyzeNews(news, apiKey, model, systemPrompt);
      setAnalysis(result);
      toast.success('Analyse terminée');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur lors de l\'analyse');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <header className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-indigo-400">Forex Analyzer Pro</h1>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
          >
            {showSettings ? 'Actualités' : 'Paramètres'}
          </button>
        </div>
      </header>

      <main className="container mx-auto p-4">
        {showSettings ? (
          <SettingsPanel />
        ) : (
          <>
            <div className="mb-6 flex justify-between items-center">
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
              <div className="bg-gray-800 rounded-lg p-6 mb-8">
                <h2 className="text-xl font-bold text-white mb-4">Analyse</h2>
                <div className="prose prose-invert">
                  {analysis.split('\n').map((line, i) => (
                    <p key={i} className="text-gray-300">{line}</p>
                  ))}
                </div>
              </div>
            )}

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
          </>
        )}
      </main>
    </div>
  );
}