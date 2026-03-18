# Training Settlement API

## 接口说明
用于结算一个模拟交易训练会话。汇总该会话的所有交易流水计算总盈亏，更新用户资金和会话状态，并记录账单。

## 基础信息
- **Function Name**: `training-settlement`
- **Method**: `POST`
- **Path**: `/v1/training-settlement`

## 请求参数 (Request)

### Headers
| Name | Required | Description |
| --- | --- | --- |
| x-request-id | No | 请求追踪 ID |
| x-user-id | Yes | 用户 ID |

### Body (JSON)
| Name | Type | Required | Description |
| --- | --- | --- | --- |
| sessionId | string | Yes | 会话 ID |
| reason | string | No | 结算原因: `completed` (默认) 或 `aborted` |

## 响应数据 (Response)

### 成功响应 (200 OK)
```json
{
  "code": "OK",
  "data": {
    "sessionId": "session-id",
    "endingBalance": 1100.50,
    "realizedPnl": 100.50,
    "ledgerId": "ledger-id"
  },
  "requestId": "test-req-id"
}
```

### 错误响应 (4xx/5xx)
```json
{
  "code": "TRAINING_SETTLEMENT_CONFLICT",
  "message": "会话已结算",
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
| BAD_REQUEST | 400 | 缺少必要参数 |
| TRAINING_SESSION_NOT_FOUND | 404 | 会话不存在或不属于该用户 |
| TRAINING_SETTLEMENT_CONFLICT | 409 | 会话状态不是 active，无法重复结算 |
| INTERNAL_ERROR | 500 | 内部错误 |