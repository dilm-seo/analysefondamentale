import { useState } from 'react';
import { useHistoryStore, AnalysisRecord } from '@/stores/historyStore';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import toast from 'react-hot-toast';

export default function History() {
  const { analyses, deleteAnalysis, clearHistory } = useHistoryStore();
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisRecord | null>(null);
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  const handleDelete = (id: string) => {
    deleteAnalysis(id);
    if (selectedAnalysis?.id === id) {
      setSelectedAnalysis(null);
    }
    toast.success('Analyse supprimée');
  };

  const handleClearHistory = () => {
    clearHistory();
    setSelectedAnalysis(null);
    setShowConfirmClear(false);
    toast.success('Historique effacé');
  };

  const formatDate = (date: string) => {
    return format(new Date(date), 'dd MMMM yyyy à HH:mm', { locale: fr });
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Historique des Analyses</h1>
          <button
            onClick={() => setShowConfirmClear(true)}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-500 transition-colors"
          >
            Effacer l'historique
          </button>
        </div>

        {showConfirmClear && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
              <h2 className="text-xl font-bold text-white mb-4">Confirmer la suppression</h2>
              <p className="text-gray-300 mb-6">
                Êtes-vous sûr de vouloir effacer tout l'historique ? Cette action est irréversible.
              </p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setShowConfirmClear(false)}
                  className="px-4 py-2 text-gray-300 hover:text-white"
                >
                  Annuler
                </button>
                <button
                  onClick={handleClearHistory}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-500"
                >
                  Confirmer
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Liste des analyses */}
          <div className="lg:col-span-1 bg-gray-800 rounded-lg p-4 h-[calc(100vh-12rem)] overflow-y-auto">
            {analyses.length === 0 ? (
              <p className="text-gray-400 text-center py-8">Aucune analyse enregistrée</p>
            ) : (
              <div className="space-y-4">
                {analyses.map((analysis) => (
                  <div
                    key={analysis.id}
                    className={`p-4 rounded-lg cursor-pointer transition-colors ${
                      selectedAnalysis?.id === analysis.id
                        ? 'bg-indigo-600'
                        : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                    onClick={() => setSelectedAnalysis(analysis)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="text-sm text-gray-300">
                        {formatDate(analysis.timestamp)}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(analysis.id);
                        }}
                        className="text-gray-400 hover:text-red-400"
                      >
                        ×
                      </button>
                    </div>
                    <div className="text-xs text-gray-400">
                      Modèle: {analysis.model} • Coût: ${analysis.cost}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Contenu de l'analyse sélectionnée */}
          <div className="lg:col-span-2 bg-gray-800 rounded-lg p-6 h-[calc(100vh-12rem)] overflow-y-auto">
            {selectedAnalysis ? (
              <>
                <div className="mb-6">
                  <div className="text-sm text-gray-400 mb-2">
                    {formatDate(selectedAnalysis.timestamp)}
                  </div>
                  <div className="text-sm text-gray-400">
                    Modèle: {selectedAnalysis.model} • Coût: ${selectedAnalysis.cost}
                  </div>
                </div>
                <div
                  className="prose prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: selectedAnalysis.content }}
                />
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                Sélectionnez une analyse pour voir son contenu
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}