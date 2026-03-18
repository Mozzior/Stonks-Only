# Training Order Execution API

## 接口说明
用于在指定的模拟交易训练会话中执行买入、卖出或平仓操作，记录交易流水并计算当笔盈亏。

## 基础信息
- **Function Name**: `training-order-exec`
- **Method**: `POST`
- **Path**: `/v1/training-order-exec`

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
| action | string | Yes | 交易动作: `BUY`, `SELL`, 或 `CLOSE` |
| amount | number | No* | 交易数量 (在 `BUY` / `SELL` 时必填，`CLOSE` 时忽略) |
| priceHint | number | No* | 参考成交价 (在 `BUY` / `SELL` 时必填) |
| closePriceHint| number | No | 平仓参考价 (仅在 `CLOSE` 时有效) |
| klineTimestamp| number | No | 触发交易时的 K 线时间戳 |
| orderType | string | No | 订单类型，默认 `MARKET` |

## 响应数据 (Response)

### 成功响应 (200 OK)
```json
{
  "code": "OK",
  "data": {
    "tradeId": "trade-id",
    "seqNo": 2,
    "sessionId": "session-id",
    "action": "CLOSE",
    "side": "FLAT",
    "amount": 10,
    "price": 160,
    "notional": 1600,
    "fee": 1.6,
    "beforePosition": {
      "side": "LONG",
      "amount": 10,
      "entryPrice": 150,
      "plAmount": 0
    },
    "afterPosition": {
      "side": "FLAT",
      "amount": 0,
      "entryPrice": 150,
      "plAmount": 0
    },
    "realizedPnl": 98.4
  },
  "requestId": "test-req-id"
}
```

### 错误响应 (4xx/5xx)
```json
{
  "code": "TRAINING_SESSION_CLOSED",
  "message": "训练会话已结束",
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
| TRAINING_ORDER_INVALID | 400 | 订单参数错误 |
| TRAINING_SESSION_NOT_FOUND | 404 | 会话不存在或不属于该用户 |
| TRAINING_SESSION_CLOSED | 409 | 训练会话已结束，不可再下单 |
| INTERNAL_ERROR | 500 | 内部错误 |