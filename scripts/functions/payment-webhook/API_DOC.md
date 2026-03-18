# Payment Webhook API Doc

## 接口说明
用于接收支付服务商的回调事件（如支付成功）。包含签名验证与幂等性检查机制，验证成功后将为对应用户充值并记录账单。

## 基础信息
- **Function Name**: `payment-webhook`
- **Method**: `POST`
- **Path**: `/v1/webhook/payment`

## 请求参数 (Request)

### Headers
| Name | Required | Description |
| --- | --- | --- |
| x-webhook-signature | Yes | Webhook 签名，使用 `WEBHOOK_SECRET` 进行 HMAC-SHA256 校验 |
| x-request-id | No | 请求追踪 ID |

### Body
```json
{
  "eventId": "evt_98765",
  "eventType": "payment.success",
  "data": {
    "userId": "user_123",
    "amount": 50.0,
    "currency": "USD",
    "transactionId": "txn_xyz987"
  }
}
```
| Name | Type | Required | Description |
| --- | --- | --- | --- |
| eventId | string | Yes | 事件唯一标识 |
| eventType | string | Yes | 事件类型，当前仅处理 `payment.success` |
| data.userId | string | Yes | 用户 ID |
| data.amount | number | Yes | 支付金额 |
| data.transactionId | string | No | 交易 ID（若缺失则使用 eventId），用于幂等处理 |
| data.currency | string | No | 货币类型，默认 USD |

## 响应数据 (Response)

### 成功响应 (200 OK)
处理成功或事件被忽略（如非 payment.success 类型）：
```json
{
  "code": "OK",
  "data": {
    "received": true,
    "status": "COMPLETED",
    "rechargeId": "ledger_abc123"
  },
  "requestId": "req_123456789"
}
```
*注：当为幂等重复请求时，`status` 为 `ALREADY_PROCESSED`；当忽略事件时，`ignored` 为 `true`。*

### 错误响应 (4xx/5xx)
```json
{
  "code": "UNAUTHORIZED",
  "message": "无效的签名",
  "details": {},
  "requestId": "req_123456789",
  "retryable": false
}
```

## 错误码说明
| Code | HTTP Status | Description |
| --- | --- | --- |
| OK | 200 | Webhook 已接收并处理成功（或安全忽略） |
| UNAUTHORIZED | 401 | 签名校验失败 |
| BAD_REQUEST | 400 | 缺少 eventId 或支付数据无效 |
| NOT_FOUND | 404 | 支付关联的用户资料不存在 |
| INTERNAL_ERROR | 500 | 内部系统错误 |