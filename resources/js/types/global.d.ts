import { PageProps } from ".";

declare global {
  function route(name: string, params?: Record<string, unknown>): string;
  function usePage<T = Record<string, unknown>>(): { props: PageProps<T> };
}
