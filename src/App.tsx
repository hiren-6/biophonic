import React, { useState } from 'react';
import { Radio, Play, Headphones, Brain, Eye, Zap, ArrowRight, Check } from 'lucide-react';
import { TherapeuticArea } from './types';
import { MainPlayer } from './components/MainPlayer';

function App() {
  const [currentPage, setCurrentPage] = useState<'landing' | 'personalization' | 'player'>('landing');
  const [isEntering, setIsEntering] = useState(false);
  const [selectedAreas, setSelectedAreas] = useState<TherapeuticArea[]>([]);

  const therapeuticOptions = [
    {
      id: 'neurology' as TherapeuticArea,
      name: 'Neurology',
      icon: Brain,
      description: 'CNS disorders, neurodegeneration, brain health',
      color: 'from-blue-500 to-cyan-500',
      bgGradient: 'from-blue-500/10 to-cyan-500/10'
    },
    {
      id: 'ophthalmology' as TherapeuticArea,
      name: 'Ophthalmology',
      icon: Eye,
      description: 'Eye diseases, vision disorders, retinal therapies',
      color: 'from-purple-500 to-pink-500',
      bgGradient: 'from-purple-500/10 to-pink-500/10'
    },
    {
      id: 'car-ts' as TherapeuticArea,
      name: 'CAR-Ts',
      icon: Zap,
      description: 'Cell therapy, immunotherapy, oncology',
      color: 'from-green-500 to-emerald-500',
      bgGradient: 'from-green-500/10 to-emerald-500/10'
    }
  ];

  const handleEnterApp = () => {
    setIsEntering(true);
    setTimeout(() => {
      setCurrentPage('personalization');
      setIsEntering(false);
    }, 600);
  };

  const toggleTherapeuticArea = (areaId: TherapeuticArea) => {
    setSelectedAreas(prev => 
      prev.includes(areaId) 
        ? prev.filter(id => id !== areaId)
        : [...prev, areaId]
    );
  };

  const handleStartListening = () => {
    if (selectedAreas.length > 0) {
      setCurrentPage('player');
    }
  };

  // Main Player Page
  if (currentPage === 'player') {
    return (
      <MainPlayer 
        selectedAreas={selectedAreas}
        onBack={() => setCurrentPage('personalization')}
      />
    );
  }

  // Personalization Page
  if (currentPage === 'personalization') {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col">
        {/* Header */}
        <header className="w-full px-6 py-8 flex justify-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl flex items-center justify-center backdrop-blur-sm bg-white/5 border border-white/10 shadow-lg">
              <Radio className="w-6 h-6 text-white" />
            </div>
            <div className="text-white">
              <div className="text-xl font-bold drop-shadow-lg">BioPhonic</div>
              <div className="text-xs text-gray-300 -mt-1 drop-shadow-md">Audio Summaries</div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 pb-20 max-w-2xl mx-auto w-full">
          {/* Title Section */}
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-white mb-4">
              Personalize Your News
            </h1>
            <p className="text-gray-300 text-lg leading-relaxed max-w-md">
              Select the therapeutic areas you're interested in. You can choose multiple areas.
            </p>
          </div>

          {/* Therapeutic Area Options */}
          <div className="w-full space-y-4 mb-12">
            {therapeuticOptions.map((option) => {
              const isSelected = selectedAreas.includes(option.id);
              const IconComponent = option.icon;
              
              return (
                <button
                  key={option.id}
                  onClick={() => toggleTherapeuticArea(option.id)}
                  className={`w-full p-6 rounded-2xl border-2 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${
                    isSelected
                      ? `border-white/30 bg-gradient-to-r ${option.bgGradient} backdrop-blur-sm shadow-xl`
                      : 'border-white/10 bg-white/5 backdrop-blur-sm hover:border-white/20 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    {/* Icon */}
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br ${option.color} shadow-lg`}>
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 text-left">
                      <h3 className="text-xl font-semibold text-white mb-1">
                        {option.name}
                      </h3>
                      <p className="text-gray-400 text-sm">
                        {option.description}
                      </p>
                    </div>
                    
                    {/* Selection Indicator */}
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                      isSelected
                        ? 'border-white bg-white'
                        : 'border-gray-400'
                    }`}>
                      {isSelected && (
                        <Check className="w-4 h-4 text-slate-900" />
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Start Listening Button */}
          <button
            onClick={handleStartListening}
            disabled={selectedAreas.length === 0}
            className={`group relative px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full text-white font-semibold text-lg shadow-xl shadow-purple-500/25 transition-all duration-300 flex items-center space-x-3 ${
              selectedAreas.length > 0
                ? 'hover:shadow-2xl hover:shadow-purple-500/40 hover:scale-105 hover:-translate-y-1 active:scale-95'
                : 'opacity-50 cursor-not-allowed'
            }`}
          >
            <span>Start Listening</span>
            <Play className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
            
            {/* Button glow effect */}
            {selectedAreas.length > 0 && (
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-xl"></div>
            )}
          </button>

          {/* Selection Counter */}
          {selectedAreas.length > 0 && (
            <div className="mt-6 text-center">
              <p className="text-gray-400 text-sm">
                {selectedAreas.length} area{selectedAreas.length !== 1 ? 's' : ''} selected
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Landing Page
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* Header */}
      <header className="w-full px-6 py-8 flex justify-center">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl flex items-center justify-center backdrop-blur-sm bg-white/5 border border-white/10 shadow-lg">
            <Radio className="w-6 h-6 text-white" />
          </div>
          
          <div className="text-white">
            <div className="text-xl font-bold drop-shadow-lg">BioPhonic</div>
            <div className="text-xs text-gray-300 -mt-1 drop-shadow-md">Audio Summaries</div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-20">
        {/* Audio Animation */}
        <div className="relative mb-12">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-80 h-80 rounded-full border border-blue-400/20 animate-ping animation-delay-0"></div>
            <div className="absolute w-64 h-64 rounded-full border border-purple-400/30 animate-ping animation-delay-75"></div>
            <div className="absolute w-48 h-48 rounded-full border border-blue-400/40 animate-ping animation-delay-150"></div>
          </div>
          
          <div className="relative w-40 h-40 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl shadow-purple-500/25">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full animate-pulse"></div>
            <Headphones className="w-28 h-28 text-white relative z-10" />
            
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex space-x-1.5">
                <div className="w-1.5 bg-white/60 rounded-full animate-audio-bar-1" style={{height: '10px'}}></div>
                <div className="w-1.5 bg-white/60 rounded-full animate-audio-bar-2" style={{height: '14px'}}></div>
                <div className="w-1.5 bg-white/60 rounded-full animate-audio-bar-3" style={{height: '8px'}}></div>
                <div className="w-1.5 bg-white/60 rounded-full animate-audio-bar-4" style={{height: '12px'}}></div>
                <div className="w-1.5 bg-white/60 rounded-full animate-audio-bar-5" style={{height: '10px'}}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Title and Description */}
        <div className="text-center mb-8 max-w-sm">
          <h1 className="text-3xl font-bold text-white mb-3">
            Biopharma news summaries delivered in audio podcast style!  
          </h1>
          <p className="text-gray-300 text-lg leading-relaxed">
            Listen on the go, daily in the morning!
          </p>
        </div>

        {/* Enter Button */}
        <button
          onClick={handleEnterApp}
          disabled={isEntering}
          className={`group relative w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full text-white font-semibold text-lg shadow-xl shadow-purple-500/25 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/40 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center ${
            isEntering ? 'animate-pulse' : 'hover:-translate-y-1'
          }`}
        >
          <Play className={`w-6 h-6 transition-transform duration-300 ${isEntering ? 'animate-spin' : 'group-hover:scale-110'}`} />
          
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-xl"></div>
        </button>

        {/* Feature indicators */}
        <div className="flex items-center space-x-8 mt-12 text-gray-400 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>Twice Daily</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse animation-delay-75"></div>
            <span>AI Powered</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse animation-delay-150"></div>
            <span>Personalized</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;