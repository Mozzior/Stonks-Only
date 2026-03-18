# Wallet Recharge API Doc

## 接口说明
用于模拟金账户充值，增加用户可用余额并记录充值流水。具备幂等性校验，避免重复充值。

## 基础信息
- **Function Name**: `wallet-recharge`
- **Method**: `POST`
- **Path**: `/v1/wallet/recharge`

## 请求参数 (Request)

### Headers
| Name | Required | Description |
| --- | --- | --- |
| x-user-id | Yes | 用户 ID |
| x-request-id | No | 请求追踪 ID |

### Body
```json
{
  "amount": 100.0,
  "clientTxnId": "txn_client_12345"
}
```
| Name | Type | Required | Description |
| --- | --- | --- | --- |
| amount | number | Yes | 充值金额，需大于 0 |
| clientTxnId | string | Yes | 客户端交易唯一标识（用于幂等） |

## 响应数据 (Response)

### 成功响应 (200 OK)
```json
{
  "code": "OK",
  "data": {
    "rechargeId": "ledger_abc123",
    "status": "COMPLETED",
    "balanceAfter": 150.0
  },
  "requestId": "req_123456789"
}
```

### 错误响应 (4xx/5xx)
```json
{
  "code": "WALLET_INVALID_AMOUNT",
  "message": "充值金额无效",
  "details": {},
  "requestId": "req_123456789",
  "retryable": false
}
```

## 错误码说明
| Code | HTTP Status | Description |
| --- | --- | --- |
| OK | 200 | 充值成功或已幂等处理 |
| UNAUTHORIZED | 401 | 未登录或缺少 x-user-id |
| WALLET_INVALID_AMOUNT | 400 | 充值金额无效 |
| BAD_REQUEST | 400 | 缺少 clientTxnId |
| NOT_FOUND | 404 | 用户资料不存在 |
| INTERNAL_ERROR | 500 | 内部系统错误 |