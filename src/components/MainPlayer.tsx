import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  Radio,
  ChevronDown,
  List
} from 'lucide-react';
import { TherapeuticArea, AudioContent } from '../types';
import { getAudioContentByAreas } from '../data/mockData';

interface MainPlayerProps {
  selectedAreas: TherapeuticArea[];
  onBack: () => void;
}

export const MainPlayer: React.FC<MainPlayerProps> = ({
  selectedAreas,
  onBack
}) => {
  const [playlist, setPlaylist] = useState<AudioContent[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const isChangingTrack = useRef(false);

  // Initialize playlist
  useEffect(() => {
    const audioContent = getAudioContentByAreas(selectedAreas);
    setPlaylist(audioContent);
  }, [selectedAreas]);

  // Reset audio state when track changes
  const resetAudioState = useCallback(() => {
    setCurrentTime(0);
    setDuration(0);
    setAudioError(false);
    setIsLoading(true);
  }, []);

  // Handle track change
  const changeTrack = useCallback((newIndex: number) => {
    if (isChangingTrack.current) return;
    
    isChangingTrack.current = true;
    const audio = audioRef.current;
    
    if (audio) {
      audio.pause();
      setIsPlaying(false);
    }
    
    resetAudioState();
    setCurrentTrackIndex(newIndex);
    
    // Reset the flag after a short delay
    setTimeout(() => {
      isChangingTrack.current = false;
    }, 100);
  }, [resetAudioState]);

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      if (!isChangingTrack.current) {
        setCurrentTime(audio.currentTime);
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoading(false);
      setAudioError(false);
    };

    const handleCanPlay = () => {
      setIsLoading(false);
      setAudioError(false);
      
      // Auto-play if we were playing before track change
      if (isPlaying && !isChangingTrack.current) {
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            console.error('Auto-play failed:', error);
            setIsPlaying(false);
          });
        }
      }
    };

    const handleLoadStart = () => {
      if (!isChangingTrack.current) {
        setIsLoading(true);
      }
    };

    const handleError = (e: Event) => {
      console.error('Audio error:', e);
      setAudioError(true);
      setIsLoading(false);
      setIsPlaying(false);
    };

    const handleEnded = () => {
      if (!isChangingTrack.current) {
        handleNext();
      }
    };

    const handleWaiting = () => {
      setIsLoading(true);
    };

    const handlePlaying = () => {
      setIsLoading(false);
      setIsPlaying(true);
    };

    const handlePause = () => {
      if (!isChangingTrack.current) {
        setIsPlaying(false);
      }
    };

    // Add event listeners
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('error', handleError);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('playing', handlePlaying);
    audio.addEventListener('pause', handlePause);

    // Set initial volume
    audio.volume = volume;

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('playing', handlePlaying);
      audio.removeEventListener('pause', handlePause);
    };
  }, [currentTrackIndex, volume, isPlaying]);

  const currentTrack = playlist[currentTrackIndex];

  const togglePlayPause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || isLoading || audioError || isChangingTrack.current) return;

    if (isPlaying) {
      audio.pause();
    } else {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.error('Play failed:', error);
          setAudioError(true);
        });
      }
    }
  }, [isPlaying, isLoading, audioError]);

  const handleNext = useCallback(() => {
    if (playlist.length === 0 || isChangingTrack.current) return;
    
    const nextIndex = (currentTrackIndex + 1) % playlist.length;
    changeTrack(nextIndex);
  }, [playlist.length, currentTrackIndex, changeTrack]);

  const handlePrevious = useCallback(() => {
    if (isChangingTrack.current) return;
    
    if (currentTime > 3) {
      // Restart current track if more than 3 seconds played
      const audio = audioRef.current;
      if (audio) {
        audio.currentTime = 0;
      }
    } else {
      // Go to previous track
      const prevIndex = currentTrackIndex === 0 ? playlist.length - 1 : currentTrackIndex - 1;
      changeTrack(prevIndex);
    }
  }, [currentTime, currentTrackIndex, playlist.length, changeTrack]);

  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio || isLoading || audioError || isChangingTrack.current) return;

    const newTime = parseFloat(e.target.value);
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  }, [isLoading, audioError]);

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newVolume = parseFloat(e.target.value);
    audio.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  }, []);

  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isMuted) {
      audio.volume = volume;
      setIsMuted(false);
    } else {
      audio.volume = 0;
      setIsMuted(true);
    }
  }, [isMuted, volume]);

  const formatTime = useCallback((time: number) => {
    if (!isFinite(time) || isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  const getTherapeuticAreaColor = useCallback((area?: string) => {
    switch (area) {
      case 'neurology':
        return 'from-blue-500 to-cyan-500';
      case 'ophthalmology':
        return 'from-purple-500 to-pink-500';
      case 'car-ts':
        return 'from-green-500 to-emerald-500';
      default:
        return 'from-blue-400 to-purple-500';
    }
  }, []);

  const selectTrack = useCallback((index: number) => {
    if (index !== currentTrackIndex) {
      changeTrack(index);
    }
    setShowPlaylist(false);
  }, [currentTrackIndex, changeTrack]);

  const getTrackImage = useCallback((track: AudioContent) => {
    if (track.therapeuticArea === 'neurology') return '/images/Update 1.png';
    if (track.therapeuticArea === 'ophthalmology') return '/images/Update 2.png';
    if (track.therapeuticArea === 'car-ts') return '/images/Update 3.png';
    return null;
  }, []);

  // Calculate progress percentage for dynamic styling
  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;
  const volumePercentage = (isMuted ? 0 : volume) * 100;

  if (!currentTrack) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading audio content...</p>
        </div>
      </div>
    );
  }

  const trackImage = getTrackImage(currentTrack);

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col relative overflow-hidden">
      {/* Background Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${getTherapeuticAreaColor(currentTrack.therapeuticArea)} opacity-10`}></div>
      <div className="absolute inset-0 bg-slate-900/80"></div>

      {/* Audio Element with key to force re-render on track change */}
      <audio 
        key={currentTrack.id}
        ref={audioRef} 
        src={currentTrack.audioUrl} 
        preload="auto"
        crossOrigin="anonymous"
      />

      {/* Header */}
      <header className="relative z-10 w-full px-6 py-6 flex items-center justify-between">
        <button
          onClick={onBack}
          className="p-2 text-white/70 hover:text-white transition-colors"
        >
          <ChevronDown className="w-6 h-6" />
        </button>
        
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
            <Radio className="w-5 h-5 text-white" />
          </div>
          <div className="text-white">
            <div className="text-lg font-bold">BioPhonic</div>
          </div>
        </div>

        <button
          onClick={() => setShowPlaylist(!showPlaylist)}
          className="p-2 text-white/70 hover:text-white transition-colors"
        >
          <List className="w-6 h-6" />
        </button>
      </header>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-8 pb-8">
        {/* Album Art */}
        <div className="relative mb-8">
          <div className="w-80 h-80 bg-gradient-to-br from-white/10 to-white/5 rounded-3xl backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-2xl overflow-hidden">
            {trackImage ? (
              <div className="relative w-full h-full">
                <img 
                  src={trackImage} 
                  alt={currentTrack.title}
                  className="w-full h-full object-contain rounded-3xl bg-white"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-3xl"></div>
                <div className="absolute bottom-6 left-6 right-6">
                  <h1 className="text-white text-xl font-bold mb-1 drop-shadow-lg line-clamp-2">
                    {currentTrack.title}
                  </h1>
                  <div className="text-white/90 text-sm font-semibold capitalize drop-shadow-md">
                    {currentTrack.therapeuticArea?.replace('-', ' ')}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center p-6">
                <div className={`w-20 h-20 bg-gradient-to-br ${getTherapeuticAreaColor(currentTrack.therapeuticArea)} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                  <Radio className="w-12 h-12 text-white" />
                </div>
                <h1 className="text-white text-xl font-bold mb-2 line-clamp-2">
                  {currentTrack.title}
                </h1>
                <div className="text-white/90 text-sm font-semibold capitalize">
                  {currentTrack.therapeuticArea?.replace('-', ' ')}
                </div>
              </div>
            )}
            
            {/* Loading/Error indicator */}
            {(isLoading || audioError) && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-3xl">
                {audioError ? (
                  <div className="text-white text-center">
                    <div className="text-red-400 mb-2">⚠</div>
                    <div className="text-sm">Audio Error</div>
                  </div>
                ) : (
                  <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full"></div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Track Info (when no image) */}
        {!trackImage && (
          <div className="text-center mb-8 max-w-md">
            <h1 className="text-2xl font-bold text-white mb-2">
              {currentTrack.title}
            </h1>
            <p className="text-gray-300 text-lg">
              {currentTrack.description}
            </p>
            <div className={`inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r ${getTherapeuticAreaColor(currentTrack.therapeuticArea)} text-white text-sm font-medium mt-3`}>
              {currentTrack.therapeuticArea.replace('-', ' ').toUpperCase()}
            </div>
          </div>
        )}

        {/* Progress Bar */}
        <div className="w-full max-w-md mb-6">
          <div className="relative">
            <div className="w-full h-2 bg-white/20 rounded-lg"></div>
            <div 
              className="absolute top-0 left-0 h-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg transition-all duration-150 ease-out"
              style={{ width: `${progressPercentage}%` }}
            ></div>
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              disabled={isLoading || audioError}
              className="absolute top-0 left-0 w-full h-2 progress-slider"
              style={{ background: 'transparent' }}
            />
          </div>
          <div className="flex justify-between text-sm text-gray-300 mt-2">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Main Controls */}
        <div className="flex items-center justify-center space-x-8 mb-8">
          <button
            onClick={handlePrevious}
            disabled={isLoading || audioError}
            className="p-4 text-white hover:text-blue-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <SkipBack className="w-8 h-8" />
          </button>

          <button
            onClick={togglePlayPause}
            disabled={isLoading || audioError}
            className="p-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full text-white hover:scale-105 transition-transform shadow-2xl shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="animate-spin w-10 h-10 border-2 border-white border-t-transparent rounded-full"></div>
            ) : isPlaying ? (
              <Pause className="w-10 h-10" />
            ) : (
              <Play className="w-10 h-10 ml-1" />
            )}
          </button>

          <button
            onClick={handleNext}
            disabled={isLoading || audioError}
            className="p-4 text-white hover:text-blue-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <SkipForward className="w-8 h-8" />
          </button>
        </div>

        {/* Volume Control */}
        <div className="flex items-center justify-center space-x-3">
          <button onClick={toggleMute} className="text-white/60 hover:text-white transition-colors">
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
          <div className="relative w-32">
            <div className="w-full h-1 bg-white/20 rounded-lg"></div>
            <div 
              className="absolute top-0 left-0 h-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg transition-all duration-150 ease-out"
              style={{ width: `${volumePercentage}%` }}
            ></div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="absolute top-0 left-0 w-full h-1 volume-slider"
              style={{ background: 'transparent' }}
            />
          </div>
        </div>

        {/* Track Counter */}
        <div className="mt-6 text-center">
          <p className="text-gray-400 text-sm">
            {currentTrackIndex + 1} of {playlist.length}
          </p>
        </div>
      </div>

      {/* Playlist Overlay */}
      {showPlaylist && (
        <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-sm z-20 flex flex-col">
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Playlist ({playlist.length})</h2>
              <button
                onClick={() => setShowPlaylist(false)}
                className="p-2 text-white/60 hover:text-white transition-colors"
              >
                <ChevronDown className="w-6 h-6" />
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-3">
              {playlist.map((track, index) => (
                <button
                  key={track.id}
                  onClick={() => selectTrack(index)}
                  disabled={isChangingTrack.current}
                  className={`w-full p-4 rounded-xl text-left transition-all duration-200 disabled:opacity-50 ${
                    index === currentTrackIndex
                      ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/30'
                      : 'bg-white/5 hover:bg-white/10 border border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${getTherapeuticAreaColor(track.therapeuticArea)} flex items-center justify-center flex-shrink-0`}>
                      <Radio className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-semibold truncate">{track.title}</h3>
                      <p className="text-gray-400 text-sm truncate">{track.description}</p>
                    </div>
                    <div className="text-gray-400 text-sm">
                      {formatTime(track.duration)}
                    </div>
                    {index === currentTrackIndex && (
                      <div className="text-blue-400">
                        <Radio className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};