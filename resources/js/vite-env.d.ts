/// <reference types="vite/client" />

declare module 'mapbox-gl';
declare module 'react-map-gl';

interface ImportMetaEnv {
  readonly VITE_MAPBOX_PUBLIC_TOKEN: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
} 