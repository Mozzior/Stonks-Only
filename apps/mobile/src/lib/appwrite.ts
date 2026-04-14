import "react-native-url-polyfill/auto";
import Constants from "expo-constants";
import {
  Account,
  Client,
  Databases,
  Functions,
  ID,
  Query,
  Storage,
} from "react-native-appwrite";
import { buildMobileAppwriteConfig } from "@stonks-only/shared/app-config";

const extra = (Constants.expoConfig?.extra ?? {}) as Record<string, string | undefined>;
const appwriteConfig = buildMobileAppwriteConfig({
  EXPO_PUBLIC_APPWRITE_ENDPOINT: extra.appwriteEndpoint,
  EXPO_PUBLIC_APPWRITE_PROJECT_ID: extra.appwriteProjectId,
  EXPO_PUBLIC_APPWRITE_DATABASE_ID: extra.appwriteDatabaseId,
  EXPO_PUBLIC_APPWRITE_PLATFORM_ID: extra.appwritePlatformId,
});

const { endpoint, projectId, platformId } = appwriteConfig;
const databaseId = appwriteConfig.databaseId;

const client = new Client();

export const hasAppwriteCoreConfig = Boolean(endpoint && projectId);

if (hasAppwriteCoreConfig) {
  client.setEndpoint(endpoint!).setProject(projectId!);

  if (platformId) {
    client.setPlatform(platformId);
  }
}

export const appwriteMobile = {
  client,
  account: new Account(client),
  databases: new Databases(client),
  storage: new Storage(client),
  functions: new Functions(client),
};

export { ID, Query };
