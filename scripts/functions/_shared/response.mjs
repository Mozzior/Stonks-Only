export function json(statusCode, body, headers = {}) {
  return {
    statusCode,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...headers,
    },
    body: JSON.stringify(body),
  };
}

export function ok(data, requestId = "") {
  return json(200, { code: "OK", data, requestId });
}

export function fail(
  statusCode,
  code,
  message,
  requestId = "",
  details = {},
  retryable = false,
) {
  return json(statusCode, { code, message, details, requestId, retryable });
}

export function parseBody(req) {
  try {
    if (!req || !req.body) return {};
    return typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  } catch {
    return {};
  }
}

export function requestId(req) {
  return (
    req?.headers?.["x-request-id"] ||
    req?.headers?.["X-Request-Id"] ||
    `req_${Date.now()}`
  );
}

/**
 * 日志处理工具类 Logger
 * 统一处理日志格式，注入请求上下文
 */
export class Logger {
  constructor(context, reqId) {
    this.context = context;
    this.reqId = reqId;
  }

  _format(level, message, data = {}) {
    return JSON.stringify({
      level,
      timestamp: new Date().toISOString(),
      reqId: this.reqId,
      message,
      data,
    });
  }

  info(message, data) {
    if (this.context?.log) {
      this.context.log(this._format("INFO", message, data));
    } else {
      console.log(this._format("INFO", message, data));
    }
  }

  error(message, error, data = {}) {
    const errorDetails =
      error instanceof Error
        ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
          }
        : error;

    const logData = { ...data, error: errorDetails };

    if (this.context?.error) {
      this.context.error(this._format("ERROR", message, logData));
    } else {
      console.error(this._format("ERROR", message, logData));
    }
  }

  warn(message, data) {
    if (this.context?.log) {
      this.context.log(this._format("WARN", message, data));
    } else {
      console.warn(this._format("WARN", message, data));
    }
  }
}

/**
 * 全局执行器 withHandler
 * 处理请求打点、耗时统计、全局 try-catch，并返回标准化 ok/fail 结果
 * @param {Function} handler - 业务逻辑执行器: async ({req, res, log, error}, logger) => { ... }
 */
export function withHandler(handler) {
  return async (context) => {
    const { req, res } = context;
    const reqId = requestId(req);
    const logger = new Logger(context, reqId);
    const startTime = Date.now();

    try {
      logger.info("Request started", {
        method: req?.method,
        path: req?.path,
        url: req?.url,
      });

      // 传递完整的 context 和封装好的 logger 给业务函数
      const result = await handler(context, logger);

      const duration = Date.now() - startTime;
      logger.info("Request completed", { duration });

      // 如果 handler 直接返回了 json/ok/fail 的结果 (包含 statusCode)，则直接透传
      if (
        result &&
        typeof result === "object" &&
        "statusCode" in result &&
        "body" in result
      ) {
        // 解析 body 以便使用 res.json，确保 Appwrite 能正确处理
        let parsedBody;
        try {
          parsedBody = JSON.parse(result.body);
        } catch (e) {
          parsedBody = result.body;
          return res.send(parsedBody, result.statusCode, result.headers);
        }
        return res.json(parsedBody, result.statusCode, result.headers);
      }

      // 否则将结果封装成 ok
      const okResponse = ok(result, reqId);
      return res.json(
        JSON.parse(okResponse.body),
        okResponse.statusCode,
        okResponse.headers,
      );
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error("Request failed", error, { duration });

      const statusCode = error.statusCode || 500;
      const code = error.code || "INTERNAL_ERROR";
      const message = error.message || "An unexpected error occurred";

      const failResponse = fail(
        statusCode,
        code,
        message,
        reqId,
        error.details || {},
      );
      return res.json(
        JSON.parse(failResponse.body),
        failResponse.statusCode,
        failResponse.headers,
      );
    }
  };
}
