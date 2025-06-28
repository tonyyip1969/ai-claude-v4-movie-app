'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VideoPlayerProps {
  src: string;
  poster?: string;
  title?: string;
  className?: string;
  onEscape?: () => void;
}

export default function VideoPlayer({ src, poster, title, className, onEscape }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playbackRate, setPlaybackRate] = useState(1);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    const handlePlay = () => {
      setIsPlaying(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handleVolumeChange = () => {
      setVolume(video.volume);
      setIsMuted(video.muted);
    };

    const handleRateChange = () => {
      setPlaybackRate(video.playbackRate);
    };

    const handleError = () => {
      setError('Failed to load video');
      setIsLoading(false);
    };

    const handleLoadStart = () => {
      setIsLoading(true);
      setError(null);
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('volumechange', handleVolumeChange);
    video.addEventListener('ratechange', handleRateChange);
    video.addEventListener('error', handleError);
    video.addEventListener('loadstart', handleLoadStart);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('volumechange', handleVolumeChange);
      video.removeEventListener('ratechange', handleRateChange);
      video.removeEventListener('error', handleError);
      video.removeEventListener('loadstart', handleLoadStart);
    };
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle keyboard shortcuts when the video player is focused or when it's in a modal
      const videoContainer = video.closest('[data-video-player]');
      const isInModal = !!document.querySelector('[data-video-player]');
      const activeElement = document.activeElement;
      
      // Check if we should handle the keyboard event
      const shouldHandle = isInModal || 
                          videoContainer?.contains(activeElement) || 
                          activeElement === videoContainer;
      
      if (!shouldHandle) return;

      // Handle ESC key differently based on context
      if (e.code === 'Escape') {
        // If we have an onEscape prop (meaning we're in a modal), call it
        // Otherwise, do nothing to let other handlers deal with it
        if (onEscape) {
          e.preventDefault();
          onEscape();
        }
        return;
      }

      // Prevent default browser behavior for these keys (but not Escape, handled above)
      if (['Space', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'KeyK', 'KeyJ', 'KeyL', 'KeyM', 'KeyF', 'KeyR', 'Home', 'End', 'Equal', 'Minus'].includes(e.code) || 
          e.code.match(/^Digit[0-9]$/)) {
        e.preventDefault();
      }

      switch (e.code) {        
        case 'Space':
        case 'KeyK': // K is common for play/pause in many video players
          togglePlay();
          break;
        
        case 'KeyJ': // J for backward 10 seconds (YouTube standard)
        case 'ArrowLeft':
          if (e.ctrlKey) {
            // Ctrl + Left Arrow: Backward 1 minute
            const newTimeBackwardMin = Math.max(0, video.currentTime - 60);
            video.currentTime = newTimeBackwardMin;
            showSeekFeedback(`-1min`);
          } else {
            // Backward 10 seconds
            const newTimeBackward = Math.max(0, video.currentTime - 10);
            video.currentTime = newTimeBackward;
            showSeekFeedback(`-10s`);
          }
          break;
        
        case 'KeyL': // L for forward 10 seconds (YouTube standard)
        case 'ArrowRight':
          if (e.ctrlKey) {
            // Ctrl + Right Arrow: Forward 1 minute
            const newTimeForwardMin = Math.min(video.duration || 0, video.currentTime + 60);
            video.currentTime = newTimeForwardMin;
            showSeekFeedback(`+1min`);
          } else {
            // Forward 10 seconds
            const newTimeForward = Math.min(video.duration || 0, video.currentTime + 10);
            video.currentTime = newTimeForward;
            showSeekFeedback(`+10s`);
          }
          break;
        
        case 'ArrowUp':
          // Volume up
          e.preventDefault();
          const newVolumeUp = Math.min(1, video.volume + 0.1);
          video.volume = newVolumeUp;
          showSeekFeedback(`Volume ${Math.round(newVolumeUp * 100)}%`);
          break;
        
        case 'ArrowDown':
          // Volume down
          e.preventDefault();
          const newVolumeDown = Math.max(0, video.volume - 0.1);
          video.volume = newVolumeDown;
          showSeekFeedback(`Volume ${Math.round(newVolumeDown * 100)}%`);
          break;
        
        case 'KeyM': // M for mute/unmute
          toggleMute();
          showSeekFeedback(isMuted ? 'Unmuted' : 'Muted');
          break;
        
        case 'KeyF': // F for fullscreen
          toggleFullscreen();
          break;
        
        case 'KeyR': // R for reset playback speed
          resetPlaybackSpeed();
          break;
        
        case 'Digit0':
        case 'Numpad0':
          // Go to beginning
          video.currentTime = 0;
          showSeekFeedback('Start');
          break;
        
        case 'Digit1':
        case 'Digit2':
        case 'Digit3':
        case 'Digit4':
        case 'Digit5':
        case 'Digit6':
        case 'Digit7':
        case 'Digit8':
        case 'Digit9':
          if (e.shiftKey) {
            // Speed presets with Shift + number
            const speedPresets: { [key: string]: number } = {
              'Digit1': 0.5,   // Shift + 1: 0.5x
              'Digit2': 0.75,  // Shift + 2: 0.75x
              'Digit3': 1.25,  // Shift + 3: 1.25x
              'Digit4': 1.5,   // Shift + 4: 1.5x
              'Digit5': 2,     // Shift + 5: 2x
            };
            
            if (speedPresets[e.code]) {
              video.playbackRate = speedPresets[e.code];
              showSeekFeedback(`⚡ Speed ${speedPresets[e.code]}x`);
            }
          } else {
            // Jump to percentage of video (1 = 10%, 2 = 20%, etc.)
            const percentage = parseInt(e.code.replace('Digit', '')) / 10;
            video.currentTime = video.duration * percentage;
            showSeekFeedback(`${percentage * 100}%`);
          }
          break;
        
        case 'Home':
          // Jump to beginning
          video.currentTime = 0;
          showSeekFeedback('Start');
          break;
        
        case 'End':
          // Jump to end
          video.currentTime = video.duration - 1;
          showSeekFeedback('End');
          break;
        
        case 'Equal': // + key (usually Shift + =, but we'll handle = for simplicity)
        case 'NumpadAdd':
          // Increase playback speed
          const newSpeedUp = Math.min(2, video.playbackRate + 0.25);
          video.playbackRate = newSpeedUp;
          showSeekFeedback(`🔺 Speed ${newSpeedUp}x`);
          break;
        
        case 'Minus':
        case 'NumpadSubtract':
          // Decrease playback speed
          const newSpeedDown = Math.max(0.25, video.playbackRate - 0.25);
          video.playbackRate = newSpeedDown;
          showSeekFeedback(`🔻 Speed ${newSpeedDown}x`);
          break;
      }
    };

    // Add event listener to document for global keyboard shortcuts
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPlaying, isMuted, playbackRate, onEscape]);

  // Show seek feedback
  const [seekFeedback, setSeekFeedback] = useState<string | null>(null);
  
  const showSeekFeedback = (text: string) => {
    setSeekFeedback(text);
    setTimeout(() => setSeekFeedback(null), 1000);
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const newVolume = parseFloat(e.target.value);
    video.volume = newVolume;
    video.muted = newVolume === 0;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const newTime = parseFloat(e.target.value);
    video.currentTime = newTime;
  };

  const toggleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;

    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      video.requestFullscreen();
    }
  };

  const restart = () => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = 0;
    video.play();
  };

  const resetPlaybackSpeed = () => {
    const video = videoRef.current;
    if (!video) return;

    video.playbackRate = 1;
    showSeekFeedback('🔄 Speed 1x');
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div 
      className={cn(
        "relative bg-black rounded-lg overflow-hidden group",
        "aspect-video w-full",
        className
      )}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      data-video-player
      tabIndex={0}
      onFocus={() => setShowControls(true)}
      style={{ outline: 'none' }}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        poster={poster}
        preload="metadata"
        onClick={togglePlay}
      >
        <source src={src} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="animate-spin w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full"></div>
        </div>
      )}

      {/* Error Overlay */}
      {error && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="text-red-400 mb-2">⚠️</div>
            <p className="text-lg font-medium mb-2">Video Error</p>
            <p className="text-gray-400 text-sm">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Play Button Overlay (when paused) */}
      {!isPlaying && !isLoading && !error && (
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            onClick={togglePlay}
            className="bg-black/50 backdrop-blur-sm rounded-full p-6 border border-white/20 hover:bg-black/70 transition-all duration-300 hover:scale-110 active:scale-95"
          >
            <Play className="w-12 h-12 text-white fill-white" />
          </button>
        </div>
      )}

      {/* Seek Feedback Overlay */}
      {seekFeedback && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-black/70 text-white px-4 py-2 rounded-lg backdrop-blur-sm text-lg font-medium">
            {seekFeedback}
          </div>
        </div>
      )}

      {/* Controls */}
      <div className={cn(
        "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-all duration-300",
        showControls || !isPlaying ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
      )}>
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="relative">
            <input
              type="range"
              min="0"
              max={duration}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${progressPercentage}%, #4b5563 ${progressPercentage}%, #4b5563 100%)`
              }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-300 mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              className="text-white hover:text-primary-400 transition-colors p-1"
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </button>

            {/* Restart */}
            <button
              onClick={restart}
              className="text-white hover:text-primary-400 transition-colors p-1"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            {/* Volume */}
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleMute}
                className="text-white hover:text-primary-400 transition-colors p-1"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>

            {/* Title */}
            {title && (
              <span className="text-white text-sm font-medium ml-4 truncate max-w-xs">
                {title}
              </span>
            )}

            {/* Playback Speed Indicator */}
            {playbackRate !== 1 && (
              <span className="text-primary-400 text-sm font-medium ml-4 bg-primary-500/20 px-2 py-1 rounded">
                {playbackRate}x
              </span>
            )}
          </div>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="text-white hover:text-primary-400 transition-colors p-1"
          >
            <Maximize className="w-5 h-5" />
          </button>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #8b5cf6;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #8b5cf6;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </div>
  );
}
