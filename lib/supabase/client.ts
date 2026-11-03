"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

let client: SupabaseClient | null | undefined;

// 환경변수가 없으면 null을 돌려주고, 앱은 로그인 없이 localStorage 모드로 동작한다.
export function getSupabase(): SupabaseClient | null {
  if (client !== undefined) return client;
  client = url && publishableKey ? createBrowserClient(url, publishableKey) : null;
  return client;
}

export function isSupabaseConfigured(): boolean {
  return Boolean(url && publishableKey);
}
