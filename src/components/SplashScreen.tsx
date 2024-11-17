import { useEffect, useState } from 'react';

export default function SplashScreen() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + 1;
      });
    }, 20);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 bg-gray-900 flex flex-col items-center justify-center z-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-indigo-400 mb-8 animate-pulse">
          Forex Analyzer Pro
        </h1>
        
        <div className="w-64 h-2 bg-gray-800 rounded-full mb-4 overflow-hidden">
          <div 
            className="h-full bg-indigo-500 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        <div className="text-gray-400 text-sm">
          {progress < 100 ? 'Chargement...' : 'Prêt !'}
        </div>
      </div>

      <div className="absolute bottom-8 left-0 right-0 text-center">
        <div className="text-gray-500 text-sm">
          Powered by OpenAI
        </div>
      </div>
    </div>
  );
}