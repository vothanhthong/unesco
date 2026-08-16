export interface PublicSupabaseConfig {
  url: string;
  anonKey: string;
}

function normalize(value: string | undefined): string | undefined {
  const normalized = value?.trim();
  return normalized || undefined;
}

export function getPublicSupabaseConfig(): PublicSupabaseConfig | null {
  // Keep public env access static so Next.js inlines these values in browser bundles.
  const url = normalize(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const anonKey =
    normalize(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) ??
    normalize(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  if (!url && !anonKey) {
    return null;
  }

  if (!url || !anonKey) {
    throw new Error(
      "Supabase configuration is incomplete: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY are required."
    );
  }

  return { url, anonKey };
}
