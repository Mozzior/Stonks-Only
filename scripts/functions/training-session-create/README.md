# Training Session Create API

## 接口说明
用于创建一个新的模拟交易训练会话。

## 基础信息
- **Function Name**: `training-session-create`
- **Method**: `POST`
- **Path**: `/v1/training-session-create`

## 请求参数 (Request)

### Headers
| Name | Required | Description |
| --- | --- | --- |
| x-request-id | No | 请求追踪 ID |
| x-user-id | Yes | 用户 ID |

### Body (JSON)
| Name | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | string | No | 交易标的符号 (例如: AAPL) |
| period | string | No | K线周期，默认 `daily` |
| startIndex | number | No | 训练起始K线索引，默认 `0` |
| endIndex | number | No | 训练结束K线索引，默认 `0` |

## 响应数据 (Response)

### 成功响应 (200 OK)
```json
{
  "code": "OK",
  "data": {
    "sessionId": "session-id"
  },
  "requestId": "test-req-id"
}
```

### 错误响应 (4xx/5xx)
```json
{
  "code": "UNAUTHORIZED",
  "message": "未登录",
  "details": {},
  "requestId": "test-req-id",
  "retryable": false
}
```

## 错误码说明
| Code | HTTP Status | Description |
| --- | --- | --- |
| OK | 200 | 请求成功 |
| UNAUTHORIZED | 401 | 未登录或无权限 |
| INTERNAL_ERROR | 500 | 内部错误 |