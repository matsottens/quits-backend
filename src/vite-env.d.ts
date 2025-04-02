/// <reference types="vite/client" />

interface ImportMeta {
  readonly env: {
    readonly VITE_SUPABASE_URL: string;
    readonly VITE_SUPABASE_ANON_KEY: string;
    readonly VITE_SUPABASE_CLIENT_ID: string;
    readonly VITE_SUPABASE_CLIENT_SECRET: string;
    readonly VITE_GOOGLE_CLIENT_ID: string;
    readonly VITE_GOOGLE_CLIENT_SECRET: string;
    readonly VITE_GOOGLE_REDIRECT_URI: string;
    readonly VITE_API_URL: string;
    readonly VITE_ENABLE_EMAIL_SCANNING: string;
    readonly VITE_ENABLE_MANUAL_SUBSCRIPTION: string;
    readonly VITE_ENV: string;
    readonly [key: string]: string | undefined;
  };
} 