import type { MembershipStatus, MembershipTier, UserProfile } from "../types/training";

export function getDisplayName(profile: UserProfile | null, email?: string | null) {
  if (profile?.display_name && profile.display_name.trim()) return profile.display_name;
  if (email && email.includes("@")) return email.split("@")[0];
  return "Trader";
}

export function getAvatarUrl(profile: UserProfile | null) {
  if (profile?.avatar_url && profile.avatar_url.trim()) return profile.avatar_url;
  const uid = profile?.user_id || "trader";
  return `https://i.pravatar.cc/150?u=${encodeURIComponent(uid)}`;
}

export function normalizeTier(
  tier?: string | null,
): MembershipTier {
  if (tier === "pro" || tier === "vip") return tier;
  return "free";
}

export function normalizeStatus(
  status?: string | null,
): MembershipStatus {
  if (status === "active" || status === "expired") return status;
  return "inactive";
}

export function getMembershipTagType(tier: MembershipTier) {
  if (tier === "vip") return "warning";
  if (tier === "pro") return "success";
  return "default";
}

export function mapLegacyTier(input?: string | null): MembershipTier {
  if (input === "elite") return "vip";
  if (input === "rookie") return "free";
  return normalizeTier(input);
}
