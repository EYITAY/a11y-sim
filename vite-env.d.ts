/// <reference types="vite/client" />

declare interface ImportMetaEnv {
  readonly VITE_ANALYTICS_ADMIN_KEY?: string;
  readonly ANALYTICS_WRITE_KEY?: string;
  readonly GEMINI_API_KEY?: string;
  readonly STRIPE_PUBLISHABLE_KEY?: string;
}

declare interface ImportMeta {
  readonly env: ImportMetaEnv;
}
