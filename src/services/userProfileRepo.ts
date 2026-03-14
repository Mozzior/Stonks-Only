import { supabase } from "../utils/supabase";
import type {
  BalanceLedgerPayload,
  MembershipStatus,
  MembershipTier,
  UserProfile,
} from "../types/training";

export async function getProfile(userId: string) {
  return supabase
    .from("user_profile")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle<UserProfile>();
}

export async function refreshProfile(userId: string) {
  return getProfile(userId);
}

export async function getOrCreateProfile(
  userId: string,
  defaults?: Partial<UserProfile>,
) {
  const existing = await getProfile(userId);
  if (existing.error) return existing;
  if (existing.data) return existing;

  return supabase
    .from("user_profile")
    .insert({
      user_id: userId,
      display_name: defaults?.display_name ?? null,
      avatar_url: defaults?.avatar_url ?? null,
      training_balance: defaults?.training_balance ?? 100000,
      currency: defaults?.currency ?? "USD",
      membership_tier: defaults?.membership_tier ?? "free",
      membership_status: defaults?.membership_status ?? "inactive",
      membership_expires_at: defaults?.membership_expires_at ?? null,
    })
    .select("*")
    .single<UserProfile>();
}

export async function updateProfileBasic(
  userId: string,
  payload: { display_name?: string | null; avatar_url?: string | null },
) {
  return supabase
    .from("user_profile")
    .update({
      display_name:
        payload.display_name === undefined ? undefined : payload.display_name,
      avatar_url:
        payload.avatar_url === undefined ? undefined : payload.avatar_url,
    })
    .eq("user_id", userId)
    .select("*")
    .single<UserProfile>();
}

export async function updateTrainingBalance(userId: string, balance: number) {
  return supabase
    .from("user_profile")
    .update({ training_balance: balance })
    .eq("user_id", userId)
    .select("*")
    .single<UserProfile>();
}

export async function updateMembership(
  userId: string,
  tier: MembershipTier,
  status: MembershipStatus,
  expiresAt?: string | null,
) {
  return supabase
    .from("user_profile")
    .update({
      membership_tier: tier,
      membership_status: status,
      membership_expires_at: expiresAt ?? null,
    })
    .eq("user_id", userId)
    .select("*")
    .single<UserProfile>();
}

export async function appendBalanceLedger(payload: BalanceLedgerPayload) {
  return supabase
    .from("training_balance_ledger")
    .insert(payload)
    .select("id")
    .single();
}

export async function listBalanceLedger(userId: string, limit = 50) {
  return supabase
    .from("training_balance_ledger")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
}
