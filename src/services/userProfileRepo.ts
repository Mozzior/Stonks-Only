import type { Models } from "appwrite";
import {
  appwrite,
  appwriteConfig,
  assertAppwriteCoreConfigured,
  ID,
  Query,
} from "../utils/appwrite";
import { fail, ok, type BackendResult } from "../utils/backendError";
import type {
  BalanceLedgerPayload,
  MembershipStatus,
  MembershipTier,
  UserProfile,
} from "../types/training";

const {
  databaseId,
  userProfileCollectionId,
  trainingBalanceLedgerCollectionId,
} = appwriteConfig;

function getUserProfileRepoConfig() {
  assertAppwriteCoreConfigured();
  if (!databaseId) {
    throw new Error("Missing Appwrite config: VITE_APPWRITE_DATABASE_ID");
  }
  if (!userProfileCollectionId) {
    throw new Error("Missing Appwrite config: VITE_APPWRITE_USER_PROFILE_COLLECTION_ID");
  }
  if (!trainingBalanceLedgerCollectionId) {
    throw new Error(
      "Missing Appwrite config: VITE_APPWRITE_TRAINING_BALANCE_LEDGER_COLLECTION_ID",
    );
  }
  return {
    databaseId,
    userProfileCollectionId,
    trainingBalanceLedgerCollectionId,
  };
}

type AppwriteDocumentData = Models.Document & Record<string, unknown>;

function toUserProfile(doc: Models.Document): UserProfile {
  const source = doc as AppwriteDocumentData;
  return {
    user_id: String(source.user_id ?? ""),
    display_name: (source.display_name as string | null) ?? null,
    avatar_url: (source.avatar_url as string | null) ?? null,
    training_balance: Number(source.training_balance ?? 0),
    currency: String(source.currency ?? "USD"),
    membership_tier:
      (source.membership_tier as UserProfile["membership_tier"]) ?? "free",
    membership_status:
      (source.membership_status as UserProfile["membership_status"]) ?? "inactive",
    membership_expires_at:
      (source.membership_expires_at as string | null) ?? null,
    created_at: String(source.created_at ?? doc.$createdAt),
    updated_at: String(source.updated_at ?? doc.$updatedAt),
  };
}

async function getProfileDocument(
  userId: string,
): Promise<BackendResult<Models.Document | null>> {
  try {
    const config = getUserProfileRepoConfig();
    const result = await appwrite.databases.listDocuments(
      config.databaseId,
      config.userProfileCollectionId,
      [Query.equal("user_id", [userId]), Query.limit(1)],
    );
    return ok(result.documents[0] ?? null);
  } catch (error) {
    return fail(error);
  }
}

export async function getProfile(
  userId: string,
): Promise<BackendResult<UserProfile | null>> {
  const profileDoc = await getProfileDocument(userId);
  if (profileDoc.error) {
    return { data: null, error: profileDoc.error };
  }
  return ok(profileDoc.data ? toUserProfile(profileDoc.data) : null);
}

export async function refreshProfile(
  userId: string,
): Promise<BackendResult<UserProfile | null>> {
  return getProfile(userId);
}

export async function getOrCreateProfile(
  userId: string,
  defaults?: Partial<UserProfile>,
): Promise<BackendResult<UserProfile | null>> {
  const existing = await getProfileDocument(userId);
  if (existing.error) {
    return { data: null, error: existing.error };
  }
  if (existing.data) return ok(toUserProfile(existing.data));

  try {
    const config = getUserProfileRepoConfig();
    const created = await appwrite.databases.createDocument(
      config.databaseId,
      config.userProfileCollectionId,
      ID.unique(),
      {
        user_id: userId,
        display_name: defaults?.display_name ?? null,
        avatar_url: defaults?.avatar_url ?? null,
        training_balance: defaults?.training_balance ?? 100000,
        currency: defaults?.currency ?? "USD",
        membership_tier: defaults?.membership_tier ?? "free",
        membership_status: defaults?.membership_status ?? "inactive",
        membership_expires_at: defaults?.membership_expires_at ?? null,
      },
    );
    return ok(toUserProfile(created));
  } catch (error) {
    return fail(error);
  }
}

export async function updateProfileBasic(
  userId: string,
  payload: { display_name?: string | null; avatar_url?: string | null },
): Promise<BackendResult<UserProfile>> {
  const existing = await getProfileDocument(userId);
  if (existing.error || !existing.data) {
    return existing.error
      ? { data: null, error: existing.error }
      : fail(new Error("Profile not found"));
  }

  try {
    const config = getUserProfileRepoConfig();
    const updated = await appwrite.databases.updateDocument(
      config.databaseId,
      config.userProfileCollectionId,
      existing.data.$id,
      {
        display_name:
          payload.display_name === undefined ? undefined : payload.display_name,
        avatar_url:
          payload.avatar_url === undefined ? undefined : payload.avatar_url,
      },
    );
    return ok(toUserProfile(updated));
  } catch (error) {
    return fail(error);
  }
}

export async function updateTrainingBalance(
  userId: string,
  balance: number,
): Promise<BackendResult<UserProfile>> {
  const existing = await getProfileDocument(userId);
  if (existing.error || !existing.data) {
    return existing.error
      ? { data: null, error: existing.error }
      : fail(new Error("Profile not found"));
  }

  try {
    const config = getUserProfileRepoConfig();
    const updated = await appwrite.databases.updateDocument(
      config.databaseId,
      config.userProfileCollectionId,
      existing.data.$id,
      { training_balance: balance },
    );
    return ok(toUserProfile(updated));
  } catch (error) {
    return fail(error);
  }
}

export async function updateMembership(
  userId: string,
  tier: MembershipTier,
  status: MembershipStatus,
  expiresAt?: string | null,
): Promise<BackendResult<UserProfile>> {
  const existing = await getProfileDocument(userId);
  if (existing.error || !existing.data) {
    return existing.error
      ? { data: null, error: existing.error }
      : fail(new Error("Profile not found"));
  }

  try {
    const config = getUserProfileRepoConfig();
    const updated = await appwrite.databases.updateDocument(
      config.databaseId,
      config.userProfileCollectionId,
      existing.data.$id,
      {
        membership_tier: tier,
        membership_status: status,
        membership_expires_at: expiresAt ?? null,
      },
    );
    return ok(toUserProfile(updated));
  } catch (error) {
    return fail(error);
  }
}

export async function appendBalanceLedger(
  payload: BalanceLedgerPayload,
): Promise<BackendResult<{ id: string }>> {
  try {
    const config = getUserProfileRepoConfig();
    const created = await appwrite.databases.createDocument(
      config.databaseId,
      config.trainingBalanceLedgerCollectionId,
      ID.unique(),
      payload,
    );
    return ok({ id: created.$id });
  } catch (error) {
    return fail(error);
  }
}

export async function listBalanceLedger(
  userId: string,
  limit = 50,
): Promise<BackendResult<Array<Record<string, unknown>>>> {
  try {
    const config = getUserProfileRepoConfig();
    const result = await appwrite.databases.listDocuments(
      config.databaseId,
      config.trainingBalanceLedgerCollectionId,
      [
        Query.equal("user_id", [userId]),
        Query.orderDesc("$createdAt"),
        Query.limit(limit),
      ],
    );
    return ok(
      result.documents.map((doc: Models.Document) => ({
        id: doc.$id,
        created_at:
          (doc as AppwriteDocumentData).created_at ?? doc.$createdAt,
        ...doc,
      })),
    );
  } catch (error) {
    return fail(error);
  }
}
