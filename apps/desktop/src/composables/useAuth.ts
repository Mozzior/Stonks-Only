import { ref } from "vue";
import type { Models, OAuthProvider } from "appwrite";
import { appwrite, ID } from "../utils/appwrite";
import { fail, ok } from "../utils/backendError";
import type { UserProfile } from "../types/training";
import { getProfileMe, patchProfileMe } from "../services/api/profileApi";
import {
  resetCachedUserId,
  setCachedUserId,
} from "../services/api/client";

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
  const payload: Record<string, any> = {};
  if (fullNameValue.length > 0) {
    payload.display_name = fullNameValue;
  }

  const result = await patchProfileMe(payload);
  if (result.error) {
    profile.value = null;
    return;
  }
  profile.value = (result.data as unknown as UserProfile) ?? null;
};

const syncSession = async () => {
  try {
    const currentSession = await appwrite.account.getSession("current");
    const currentUser = await appwrite.account.get();
    session.value = currentSession;
    user.value = currentUser;
    setCachedUserId(currentUser.$id);
    await ensureProfile(currentUser);
  } catch {
    session.value = null;
    user.value = null;
    profile.value = null;
    resetCachedUserId();
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
  const result = await getProfileMe();
  if (!result.error) {
    profile.value = (result.data as unknown as UserProfile) ?? null;
  }
  return result;
};

export function useAuth() {
  const signIn = async (email: string, password: string) => {
    try {
      resetCachedUserId();
      const signedSession = await appwrite.account.createEmailPasswordSession(
        email,
        password,
      );
      const signedUser = await appwrite.account.get();
      session.value = signedSession;
      user.value = signedUser;
      setCachedUserId(signedUser.$id);
      await ensureProfile(signedUser);
      return ok({ session: signedSession, user: signedUser });
    } catch (error) {
      return fail(error);
    }
  };

  const signInWithProvider = async (
    provider: OAuthProvider,
    successUrl?: string,
    failureUrl?: string,
    scopes?: string[],
  ) => {
    try {
      const success = successUrl || `${window.location.origin}/#/`;
      const failure =
        failureUrl || `${window.location.origin}/#/login?oauth=error`;
      // This will redirect the browser to the provider; on return,
      // syncSession() at startup will populate user/session/profile.
      await appwrite.account.createOAuth2Session(
        provider,
        success,
        failure,
        scopes,
      );
      return ok(null);
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
        setCachedUserId(user.value.$id);
        await ensureProfile(user.value);
      } else {
        session.value = null;
        user.value = null;
        profile.value = null;
        resetCachedUserId();
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
      resetCachedUserId();
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
    signInWithProvider,
    signUp,
    signOut,
    resetPasswordForEmail,
    updatePassword,
  };
}
