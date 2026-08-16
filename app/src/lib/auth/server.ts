import type { SupabaseClient, User } from "@supabase/supabase-js";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type AuthenticatedContext = {
  supabase: SupabaseClient;
  user: User;
};

type AuthFailure = {
  supabase: null;
  user: null;
  status: 401 | 503;
};

export async function getAuthenticatedContext(): Promise<AuthenticatedContext | AuthFailure> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return { supabase: null, user: null, status: 503 };

  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return { supabase: null, user: null, status: 401 };

  return { supabase, user: data.user };
}
