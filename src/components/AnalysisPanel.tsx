import { useState } from 'react';
import { useNewsStore } from '@/stores/newsStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useHistoryStore } from '@/stores/historyStore';
import { analysisService } from '@/services/analysisService';
import toast from 'react-hot-toast';
import PromoPopup from './PromoPopup';

export default function AnalysisPanel() {
  const { news } = useNewsStore();
  const { apiKey, model, systemPrompt } = useSettingsStore();
  const { addAnalysis } = useHistoryStore();
  const [analysis, setAnalysis] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showPromo, setShowPromo] = useState(false);

  // Estimation du coût basée sur le modèle
  const estimatedCost = (() => {
    const pricePerToken = model === 'gpt-4' ? 0.03 : 0.002;
    const estimatedTokens = Math.ceil((news.reduce((acc, item) => 
      acc + item.title.length + item.description.length, 0) / 4));
    return ((estimatedTokens / 1000) * pricePerToken).toFixed(4);
  })();

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
      const formattedResult = formatAnalysisToHtml(result.content);
      setAnalysis(formattedResult);
      
      // Sauvegarder dans l'historique
      addAnalysis({
        content: formattedResult,
        cost: result.cost,
        model
      });
      
      toast.success(`Analyse terminée (Coût: $${result.cost})`);
      setShowPromo(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur lors de l\'analyse');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-white mb-2">Analyse du Marché</h2>
            <p className="text-sm text-gray-400">
              Coût estimé: ${estimatedCost} ({model})
            </p>
          </div>
          <div className="flex gap-4 items-center">
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || news.length === 0}
              className={`bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm transition-colors ${
                isAnalyzing || news.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-500'
              }`}
            >
              {isAnalyzing ? 'Analyse en cours...' : 'Analyser'}
            </button>
          </div>
        </div>

        {analysis && (
          <div 
            className="prose prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: analysis }}
          />
        )}

        {!analysis && !isAnalyzing && (
          <div className="text-center text-gray-400 py-8">
            Cliquez sur "Analyser" pour obtenir une analyse détaillée des actualités
          </div>
        )}

        {isAnalyzing && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-500 border-t-transparent"></div>
          </div>
        )}
      </div>

      <PromoPopup isOpen={showPromo} onClose={() => setShowPromo(false)} />
    </div>
  );
}

function formatAnalysisToHtml(text: string): string {
  return text
    // Titres des sections
    .replace(/SYNTHÈSE DU MARCHÉ:/g, '<h3 class="text-xl font-bold text-white mt-6 mb-4">SYNTHÈSE DU MARCHÉ:</h3>')
    .replace(/OPPORTUNITÉS DE TRADING:/g, '<h3 class="text-xl font-bold text-white mt-6 mb-4">OPPORTUNITÉS DE TRADING:</h3>')
    .replace(/RISQUES PRINCIPAUX:/g, '<h3 class="text-xl font-bold text-white mt-6 mb-4">RISQUES PRINCIPAUX:</h3>')
    .replace(/HORIZON DE TRADING:/g, '<h3 class="text-xl font-bold text-white mt-6 mb-4">HORIZON DE TRADING:</h3>')
    .replace(/Disclamer:/g, '<h3 class="text-xl font-bold text-yellow-400 mt-6 mb-4">⚠️ Disclamer:</h3>')
    
    // Emojis et symboles
    .replace(/💱/g, '<span class="text-2xl">💱</span>')
    .replace(/🔵🔴/g, '<span class="text-2xl">🔵🔴</span>')
    .replace(/🔥/g, '<span class="text-xl">🔥</span>')
    .replace(/❓/g, '<span class="text-xl">❓</span>')
    .replace(/⌚/g, '<span class="text-xl">⌚</span>')
    .replace(/🌐/g, '<span class="text-xl">🌐</span>')

    // Formatage des listes
    .split('\n').map(line => {
      if (line.trim().startsWith('-')) {
        return `<li class="text-white ml-4 mb-2">${line.substring(1)}</li>`;
      }
      if (line.trim().match(/^\d+\./)) {
        return `<div class="bg-gray-700 p-4 rounded-lg mb-4 shadow-lg text-white">${line}</div>`;
      }
      return `<p class="text-white mb-2">${line}</p>`;
    }).join('\n')

    // Mise en évidence des paires de devises
    .replace(/([A-Z]{3}\/[A-Z]{3})/g, '<span class="text-green-400 font-bold">$1</span>')
    
    // Mise en évidence des niveaux de prix
    .replace(/(\d+\.\d+)/g, '<span class="text-yellow-400 font-mono">$1</span>')

    // Mise en évidence des mots clés
    .replace(/(ACHAT|VENTE)/g, '<span class="font-bold text-blue-400">$1</span>')
    .replace(/(haussier|baissier)/gi, '<span class="font-semibold text-purple-400">$1</span>')
    .replace(/(Stop loss|Take profit)/g, '<span class="font-semibold text-red-400">$1</span>')

    // Paragraphes
    .replace(/\n\n/g, '</p><p class="mb-4 text-white">');
}