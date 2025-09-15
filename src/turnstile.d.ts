declare global {
  interface Window {
    turnstile: {
      ready: (callback: () => void) => void;
      render: (
        container: string | HTMLElement,
        options: {
          sitekey: string;
          action?: string;
          cData?: string;
          callback?: (token: string) => void;
          "error-callback"?: (errorCode: string) => void;
          "expired-callback"?: (token: string) => void;
          "timeout-callback"?: () => void;
          theme?: "light" | "dark" | "auto";
          language?: string;
          tabindex?: number;
          retry?: "auto" | "never";
          "retry-interval"?: number;
          appearance?: "always" | "execute" | "interaction-only";
          size?: "normal" | "compact" | "invisible";
        }
      ) => string;
      execute: (containerOrWidgetId?: string | HTMLElement) => void;
      reset: (containerOrWidgetId?: string | HTMLElement) => void;
      remove: (containerOrWidgetId?: string | HTMLElement) => void;
      getResponse: (
        containerOrWidgetId?: string | HTMLElement
      ) => string | undefined;
    };
  }
}

export {};
