import { ref } from "vue";
import type { Models } from "appwrite";
import { appwrite, ID } from "../utils/appwrite";
import { fail, ok } from "../utils/backendError";
import type { UserProfile } from "../types/training";
import {
  getOrCreateProfile,
  refreshProfile as fetchProfile,
} from "../services/userProfileRepo";

type AuthUser = Models.User<Models.Preferences>;
type AuthSession = Models.Session;

const user = ref<AuthUser | null>(null);
const session = ref<AuthSession | null>(null);
const profile = ref<UserProfile | null>(null);
const loading = ref(true);

const ensureProfile = async (currentUser: AuthUser | null) => {
  if (!currentUser) {
    profile.value = null;
    return;
  }
  const fullNameValue = currentUser.name?.trim() ?? "";
  const result = await getOrCreateProfile(currentUser.$id, {
    display_name: fullNameValue.length > 0 ? fullNameValue : null,
  });
  if (result.error) {
    profile.value = null;
    return;
  }
  profile.value = result.data ?? null;
};

const syncSession = async () => {
  try {
    const currentSession = await appwrite.account.getSession("current");
    const currentUser = await appwrite.account.get();
    session.value = currentSession;
    user.value = currentUser;
    await ensureProfile(currentUser);
  } catch {
    session.value = null;
    user.value = null;
    profile.value = null;
  } finally {
    loading.value = false;
  }
};

void syncSession();

const refreshProfile = async () => {
  if (!user.value) {
    profile.value = null;
    return { data: null, error: null };
  }
  const result = await fetchProfile(user.value.$id);
  if (!result.error) {
    profile.value = result.data ?? null;
  }
  return result;
};

export function useAuth() {
  const signIn = async (email: string, password: string) => {
    try {
      const signedSession = await appwrite.account.createEmailPasswordSession(
        email,
        password,
      );
      const signedUser = await appwrite.account.get();
      session.value = signedSession;
      user.value = signedUser;
      await ensureProfile(signedUser);
      return ok({ session: signedSession, user: signedUser });
    } catch (error) {
      return fail(error);
    }
  };

  const signUp = async (
    email: string,
    password: string,
    metaData?: { full_name?: string },
  ) => {
    try {
      const name = metaData?.full_name?.trim() || undefined;
      const createdUser = await appwrite.account.create(
        ID.unique(),
        email,
        password,
        name,
      );
      let createdSession: Models.Session | null = null;
      try {
        createdSession = await appwrite.account.createEmailPasswordSession(
          email,
          password,
        );
      } catch {
        createdSession = null;
      }

      if (createdSession) {
        session.value = createdSession;
        user.value = await appwrite.account.get();
        await ensureProfile(user.value);
      } else {
        session.value = null;
        user.value = null;
        profile.value = null;
      }

      return ok({
        user: createdUser,
        session: createdSession,
      });
    } catch (error) {
      return fail(error);
    }
  };

  const signOut = async () => {
    try {
      await appwrite.account.deleteSession("current");
      user.value = null;
      session.value = null;
      profile.value = null;
      return { error: null };
    } catch (error) {
      return { error: fail(error).error };
    }
  };

  const resetPasswordForEmail = async (email: string, redirectTo?: string) => {
    try {
      const data = await appwrite.account.createRecovery(
        email,
        redirectTo || window.location.href,
      );
      return ok(data);
    } catch (error) {
      return fail(error);
    }
  };

  const updatePassword = async (password: string, oldPassword?: string) => {
    try {
      const data = await appwrite.account.updatePassword(password, oldPassword);
      return ok(data);
    } catch (error) {
      return fail(error);
    }
  };

  return {
    user,
    session,
    loading,
    profile,
    refreshProfile,
    syncSession,
    signIn,
    signUp,
    signOut,
    resetPasswordForEmail,
    updatePassword,
  };
}
