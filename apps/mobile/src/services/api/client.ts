import { appwriteConfig, appwriteMobile } from "../../lib/appwrite";

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: { message: string; code?: string | number } };

function ok<T>(data: T): ApiResult<T> {
  return { ok: true, data };
}

function fail<T = never>(
  message: string,
  code?: string | number,
): ApiResult<T> {
  return { ok: false, error: { message, code } };
}

let cachedUserId: string | null = null;

export async function getUserId() {
  if (cachedUserId) return cachedUserId;
  try {
    const user = await appwriteMobile.account.get();
    cachedUserId = user.$id;
    return cachedUserId;
  } catch {
    return null;
  }
}

export function resetCachedUserId() {
  cachedUserId = null;
}

export async function executeFunction<TPayload, TResult>(
  functionId: string,
  payload?: TPayload,
): Promise<ApiResult<TResult>> {
  try {
    const userId = await getUserId();
    const headers: Record<string, string> = {
      "content-type": "application/json",
    };
    if (userId) headers["x-user-id"] = userId;

    const execution = await appwriteMobile.functions.createExecution(
      functionId,
      payload ? JSON.stringify(payload) : undefined,
      false,
      "/",
      undefined,
      headers,
    );

    let parsed: unknown = null;
    try {
      parsed = execution.responseBody
        ? JSON.parse(execution.responseBody)
        : null;
    } catch {
      return fail("云函数返回格式解析失败", "PARSE_ERROR");
    }

    if (execution.responseStatusCode >= 400) {
      const msg =
        typeof parsed === "object" && parsed && "message" in parsed
          ? String(
              (parsed as Record<string, unknown>).message || "云函数执行失败",
            )
          : "云函数执行失败";
      return fail(msg, execution.responseStatusCode);
    }

    const data =
      typeof parsed === "object" && parsed && "data" in parsed
        ? ((parsed as Record<string, unknown>).data as TResult)
        : (parsed as TResult);

    return ok(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "网络或服务异常";
    return fail(message);
  }
}

export function requireDataConfig() {
  if (!appwriteConfig.databaseId) {
    return fail("缺少 EXPO_PUBLIC_APPWRITE_DATABASE_ID", "MISSING_DATABASE");
  }
  return ok(true);
}

export { ok, fail };
