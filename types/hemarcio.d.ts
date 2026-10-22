export {};

declare global {
  interface Window {
    HemocioneSDK?: {
      createHemocioneChat: (options: {
        chatUrl: string;
        context?: Record<string, unknown>;
        offset?: { x?: number; y?: number };
      }) => {
        setContext: (context: Record<string, unknown>) => void;
        destroy: () => void;
      };
    };
  }
}
