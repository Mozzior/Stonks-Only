import { getUserId } from "./client";
import { appwrite, appwriteConfig, Query, ID } from "../../utils/appwrite";
import { fail, ok } from "../../utils/backendError";

export async function getProfileMe() {
  try {
    const userId = await getUserId();
    if (!userId) return fail({ message: "Not logged in", code: "UNAUTHORIZED" });

    const response = await appwrite.databases.listDocuments(
      appwriteConfig.databaseId!,
      appwriteConfig.userProfileCollectionId!,
      [Query.equal("user_id", userId), Query.limit(1)]
    );

    if (response.total > 0) {
      return ok(response.documents[0]);
    }
    return ok(null);
  } catch (error) {
    return fail(error);
  }
}

export async function patchProfileMe(payload: Record<string, any>) {
  try {
    const userId = await getUserId();
    if (!userId) return fail({ message: "Not logged in", code: "UNAUTHORIZED" });

    // Find profile first
    const listRes = await appwrite.databases.listDocuments(
      appwriteConfig.databaseId!,
      appwriteConfig.userProfileCollectionId!,
      [Query.equal("user_id", userId), Query.limit(1)]
    );

    let profile;
    if (listRes.total > 0) {
      profile = await appwrite.databases.updateDocument(
        appwriteConfig.databaseId!,
        appwriteConfig.userProfileCollectionId!,
        listRes.documents[0].$id,
        {
          ...payload,
          updated_at: new Date().toISOString(),
        }
      );
    } else {
      // Create if not exists
      profile = await appwrite.databases.createDocument(
        appwriteConfig.databaseId!,
        appwriteConfig.userProfileCollectionId!,
        "unique()",
        {
          user_id: userId,
          training_balance: 10000,
          currency: "USD",
          membership_tier: "free",
          membership_status: "inactive",
          ...payload,
          updated_at: new Date().toISOString(),
        }
      );
    }
    return ok(profile);
  } catch (error) {
    return fail(error);
  }
}

// Client-side avatar upload token generation is not needed with standard Storage.
// We can just use Storage API directly or generate a signed ID if needed.
// For now, returning a mock token to satisfy interface if needed, or better, remove usage.
// Assuming we want to upload file directly to Storage bucket.

export async function requestAvatarUploadToken() {
  // Simplified: No token needed for client-side upload if permissions are set.
  // Or we can return a unique ID to use as file ID.
  return ok({ uploadToken: ID.unique() });
}

export async function commitAvatar(fileId: string) {
  // Just update the profile with the fileId/url
  try {
    const userId = await getUserId();
    if (!userId) return fail({ message: "Not logged in", code: "UNAUTHORIZED" });
    
    // Construct URL (optional, or just save ID)
    const avatarUrl = appwrite.storage.getFileView(
        appwriteConfig.avatarBucketId!,
        fileId
    ).toString();

    return patchProfileMe({
        avatar_file_id: fileId,
        avatar_url: avatarUrl
    });
  } catch (error) {
    return fail(error);
  }
}
