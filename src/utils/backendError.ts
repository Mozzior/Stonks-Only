export interface BackendError {
  message: string;
  code: number | string;
  type: string;
}

export interface BackendResult<T> {
  data: T | null;
  error: BackendError | null;
}

export function ok<T>(data: T): BackendResult<T> {
  return { data, error: null };
}

export function fail<T = never>(error: unknown): BackendResult<T> {
  return { data: null, error: normalizeBackendError(error) };
}

export function normalizeBackendError(error: unknown): BackendError {
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    "code" in error
  ) {
    const appwriteError = error as {
      message?: string;
      code?: number | string;
    };
    return {
      message: appwriteError.message || "Appwrite request failed",
      code: appwriteError.code ?? "APPWRITE_ERROR",
      type: "appwrite",
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      code: "UNKNOWN_ERROR",
      type: "runtime",
    };
  }

  return {
    message: "Unexpected backend error",
    code: "UNEXPECTED_ERROR",
    type: "unknown",
  };
}
