import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import NewsList from './components/NewsList';
import SettingsPanel from './components/SettingsPanel';
import AnalysisPanel from './components/AnalysisPanel';
import SplashScreen from './components/SplashScreen';

export default function App() {
  const [activeTab, setActiveTab] = useState('news');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simuler un temps de chargement minimum
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1F2937',
            color: '#F3F4F6',
          },
        }}
      />

      <header className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-indigo-400">Forex Analyzer Pro</h1>
            <a
              href="https://dilm-trading.fr/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-indigo-500 hover:to-purple-500 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Consultez nos services ↗
            </a>
          </div>
          <nav>
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('news')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'news'
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                Actualités
              </button>
              <button
                onClick={() => setActiveTab('analysis')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'analysis'
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                Analyse
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'settings'
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                Paramètres
              </button>
            </div>
          </nav>
        </div>
      </header>

      <main className="container mx-auto p-4">
        {activeTab === 'news' && <NewsList />}
        {activeTab === 'analysis' && <AnalysisPanel />}
        {activeTab === 'settings' && <SettingsPanel />}
      </main>
    </div>
  );
}