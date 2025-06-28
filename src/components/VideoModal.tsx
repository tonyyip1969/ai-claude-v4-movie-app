'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, HelpCircle } from 'lucide-react';
import VideoPlayer from './VideoPlayer';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  src: string;
  poster?: string;
  title?: string;
}

export default function VideoModal({ isOpen, onClose, src, poster, title }: VideoModalProps) {
  const [showHelp, setShowHelp] = useState(false);

  // Prevent body scroll when modal is open and focus the video
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      
      // Focus the video player after a short delay to ensure it's rendered
      const timer = setTimeout(() => {
        const videoPlayer = document.querySelector('[data-video-player]') as HTMLElement;
        if (videoPlayer) {
          videoPlayer.focus();
        }
      }, 100);
      
      return () => {
        document.body.style.overflow = 'unset';
        clearTimeout(timer);
      };
    }
  }, [isOpen]);

  // Handle escape key and help toggle
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      } else if (e.key === 'h' || e.key === 'H') {
        e.preventDefault();
        setShowHelp(prev => !prev);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeydown, true); // Use capture phase
      return () => document.removeEventListener('keydown', handleKeydown, true);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const modalContent = (
    <div
      className="fixed inset-0 bg-black z-[9999]"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 9999,
        backgroundColor: 'black'
      }}
      onClick={(e) => {
        // Close on backdrop click (but not on video click)
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      {/* Video Player */}
      <div className="w-full h-full flex items-center justify-center">
        <VideoPlayer
          src={src}
          poster={poster}
          title={title}
          className="max-w-full max-h-full"
          onEscape={onClose}
        />
      </div>
      
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors backdrop-blur-sm"
        style={{
          position: 'absolute',
          top: '1rem',
          right: '1rem',
          zIndex: 10000
        }}
        aria-label="Close video"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Help Toggle Button */}
      <button
        onClick={() => setShowHelp(prev => !prev)}
        className="absolute top-20 right-4 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors backdrop-blur-sm"
        style={{
          position: 'absolute',
          top: '4.5rem',
          right: '1rem',
          zIndex: 10000
        }}
        aria-label="Toggle keyboard shortcuts help"
      >
        <HelpCircle className="w-6 h-6" />
      </button>

      {/* Keyboard Shortcuts Help */}
      {showHelp && (
        <div className="absolute top-4 right-4 bg-black/90 text-white text-sm px-4 py-3 rounded-lg backdrop-blur-sm max-w-lg"
             style={{
               position: 'absolute',
               top: '7.5rem',
               right: '1rem',
               zIndex: 10000
             }}>
          <div className="text-xs opacity-75 mb-2 font-medium">Keyboard Shortcuts:</div>
          <div className="grid grid-cols-3 gap-x-4 gap-y-1 text-xs">
            <div><span className="font-mono bg-white/20 px-1.5 py-0.5 rounded text-xs">SPACE/K</span> Play/Pause</div>
            <div><span className="font-mono bg-white/20 px-1.5 py-0.5 rounded text-xs">ESC</span> Close</div>
            <div><span className="font-mono bg-white/20 px-1.5 py-0.5 rounded text-xs">H</span> Toggle Help</div>
            <div><span className="font-mono bg-white/20 px-1.5 py-0.5 rounded text-xs">F</span> Fullscreen</div>
            <div><span className="font-mono bg-white/20 px-1.5 py-0.5 rounded text-xs">←/J</span> -10s</div>
            <div><span className="font-mono bg-white/20 px-1.5 py-0.5 rounded text-xs">→/L</span> +10s</div>
            <div><span className="font-mono bg-white/20 px-1.5 py-0.5 rounded text-xs">0-9</span> Jump %</div>
            <div><span className="font-mono bg-white/20 px-1.5 py-0.5 rounded text-xs">Ctrl+←</span> -1min</div>
            <div><span className="font-mono bg-white/20 px-1.5 py-0.5 rounded text-xs">Ctrl+→</span> +1min</div>
            <div><span className="font-mono bg-white/20 px-1.5 py-0.5 rounded text-xs">↑/↓</span> Volume</div>
            <div><span className="font-mono bg-white/20 px-1.5 py-0.5 rounded text-xs">M</span> Mute</div>
            <div><span className="font-mono bg-white/20 px-1.5 py-0.5 rounded text-xs">+/-</span> Speed ±0.25x</div>
            <div><span className="font-mono bg-white/20 px-1.5 py-0.5 rounded text-xs">R</span> Reset Speed</div>
            <div><span className="font-mono bg-white/20 px-1.5 py-0.5 rounded text-xs">Shift+1-5</span> Speed Presets</div>
          </div>
          <div className="text-xs opacity-60 mt-2">
            Speed Presets: Shift+1 (0.5x), Shift+2 (0.75x), Shift+3 (1.25x), Shift+4 (1.5x), Shift+5 (2x)
          </div>
        </div>
      )}
    </div>
  );

  // Render to body to completely bypass layout issues
  return createPortal(modalContent, document.body);
}
