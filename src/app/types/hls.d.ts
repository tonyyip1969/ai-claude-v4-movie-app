declare module 'hls.js' {
  export default class Hls {
    static isSupported(): boolean;
    static Events: {
      MEDIA_ATTACHED: string;
      MANIFEST_PARSED: string;
      ERROR: string;
    };
    static ErrorTypes: {
      NETWORK_ERROR: string;
      MEDIA_ERROR: string;
    };
    
    constructor(config?: Record<string, unknown>);
    loadSource(src: string): void;
    attachMedia(media: HTMLVideoElement): void;
    destroy(): void;
    on(event: string, callback: (event: string, data: unknown) => void): void;
    
    // Recovery methods
    startLoad(): void;
    recoverMediaError(): void;
  }
}