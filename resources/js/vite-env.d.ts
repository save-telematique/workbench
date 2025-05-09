/// <reference types="vite/client" />

import { PageProps } from "./types";

declare global {
  interface Window {
    route: (name: string, params?: Record<string, unknown>) => string;
  }

  // Allow accessing page props with TypeScript support
  declare function usePage<T>(): { props: PageProps<T> };
}

// Support for Laravel resources in Inertia props
declare module '@inertiajs/react' {
  export function usePage<CustomProps extends Record<string, unknown> = Record<string, unknown>>(): {
    props: PageProps<CustomProps>;
  };
}

declare module 'mapbox-gl';

interface ImportMetaEnv {
  readonly VITE_MAPBOX_PUBLIC_TOKEN: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
} 