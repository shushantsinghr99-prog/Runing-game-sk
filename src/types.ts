export type ImageSize = '1K' | '2K' | '4K';
export type AspectRatio = '1:1' | '16:9' | '9:16' | '4:3' | '3:4';

export interface LogoRequest {
  companyName: string;
  tagline: string;
  industry: string;
  style: string;
  colorPalette: string;
  description: string;
  imageSize: ImageSize;
  aspectRatio: AspectRatio;
}

export interface LogoItem {
  id: string;
  companyName: string;
  tagline?: string;
  imageUrl: string;
  prompt: string;
  industry: string;
  style: string;
  imageSize: ImageSize;
  aspectRatio: AspectRatio;
  createdAt: number;
}

export type AnimationEffect =
  | '3d-tilt'
  | 'neon-pulse'
  | 'metallic-sweep'
  | 'orbital-matrix'
  | 'disintegration'
  | 'tactical-radar'
  | 'glitch-cyber';

export interface MotionConfig {
  effect: AnimationEffect;
  speed: number; // 0.5 to 2
  glowIntensity: number; // 0 to 100
  particleDensity: number; // 0 to 100
  backdrop: 'studio-dark' | 'grid-cyber' | 'military-camo' | 'spotlight' | 'checkerboard';
  soundFx: boolean;
  autoRotate: boolean;
}

export interface VideoGenConfig {
  prompt: string;
  aspectRatio: '16:9' | '9:16';
  resolution: '720p' | '1080p';
}

export type VideoStatus = 'idle' | 'starting' | 'polling' | 'ready' | 'error';
