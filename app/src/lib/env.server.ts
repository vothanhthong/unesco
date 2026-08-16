import { getPublicSupabaseConfig, type PublicSupabaseConfig } from "@/lib/env";

export interface ServerSupabaseConfig extends PublicSupabaseConfig {
  secretKey: string;
}

export function getServerSupabaseConfig(): ServerSupabaseConfig | null {
  const publicConfig = getPublicSupabaseConfig();
  const secretKey =
    process.env.SUPABASE_SECRET_KEY?.trim() ??
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!publicConfig && !secretKey) return null;

  if (!publicConfig || !secretKey) {
    throw new Error(
      "Server Supabase configuration is incomplete: SUPABASE_SECRET_KEY is required for persistence."
    );
  }

  return { ...publicConfig, secretKey };
}
