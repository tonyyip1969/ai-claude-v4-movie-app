'use client';

import { useEffect, useRef } from 'react';

interface HLSPlayerProps {
  src: string;
  onError?: (error: string) => void;
  onLoad?: () => void;
}

export default function HLSPlayer({ src, onError, onLoad }: HLSPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<import('hls.js').default | null>(null);

  useEffect(() => {
    if (!src || !videoRef.current) return;

    const video = videoRef.current;
    const proxyUrl = `/api/hls-proxy?url=${encodeURIComponent(src)}`;

    const initializePlayer = async () => {
      try {
        // Check if HLS.js is supported
        if (typeof window !== 'undefined') {
          const Hls = (await import('hls.js')).default;
          
          if (Hls.isSupported()) {
            // Clean up previous instance
            if (hlsRef.current) {
              hlsRef.current.destroy();
            }

            const hls = new Hls({
              xhrSetup: (xhr: XMLHttpRequest) => {
                // Add any custom headers if needed
                xhr.setRequestHeader('Accept', 'application/vnd.apple.mpegurl');
              },
            });

            hlsRef.current = hls;

            hls.on(Hls.Events.MEDIA_ATTACHED, () => {
              console.log('HLS: Media attached');
            });

            hls.on(Hls.Events.MANIFEST_PARSED, () => {
              console.log('HLS: Manifest parsed');
              onLoad?.();
            });

            hls.on(Hls.Events.ERROR, (event: string, data: unknown) => {
              console.error('HLS Error:', data);
              if (
                typeof data === 'object' &&
                data !== null &&
                'fatal' in data &&
                'type' in data &&
                typeof (data as { fatal: unknown }).fatal === 'boolean' &&
                typeof (data as { type: unknown }).type === 'string'
              ) {
                const typedData = data as { 
                  type: string; 
                  fatal: boolean; 
                  details?: string;
                  response?: { code: number; text: string }; 
                };
                
                // Handle non-fatal errors
                if (!typedData.fatal) {
                  console.warn('Non-fatal HLS error:', typedData.details || 'unknown');
                  return;
                }
                
                // Handle fatal errors
                switch (typedData.type) {
                  case Hls.ErrorTypes.NETWORK_ERROR:
                    // Try to recover from network error
                    console.log('Fatal network error encountered, trying to recover...');
                    hls.startLoad();
                    onError?.('Network error occurred, retrying...');
                    break;
                  
                  case Hls.ErrorTypes.MEDIA_ERROR:
                    // Try to recover from media error
                    console.log('Fatal media error encountered, trying to recover...');
                    hls.recoverMediaError();
                    onError?.('Media error occurred, retrying...');
                    break;
                    
                  default:
                    onError?.('Fatal error occurred');
                    break;
                }
              }
            });

            hls.loadSource(proxyUrl);
            hls.attachMedia(video);
          } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            // Native HLS support (Safari)
            video.src = proxyUrl;
            video.addEventListener('loadedmetadata', () => {
              onLoad?.();
            });
            video.addEventListener('error', () => {
              onError?.('Video playback error');
            });
          } else {
            onError?.('HLS is not supported in this browser');
          }
        }
      } catch (error) {
        console.error('Error initializing player:', error);
        onError?.('Failed to initialize video player');
      }
    };

    initializePlayer();

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [src, onError, onLoad]);

  return (
    <video
      ref={videoRef}
      controls
      style={{ width: '100%', height: '100%' }}
      playsInline
    >
      Your browser does not support the video tag.
    </video>
  );
}