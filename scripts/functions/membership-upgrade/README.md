# membership-upgrade API

## 接口说明
用于 membership-upgrade 相关操作。

## 基础信息
- **Function Name**: `membership-upgrade`
- **Method**: `POST`
- **Path**: `/v1/membership-upgrade`

## 请求参数 (Request)

### Headers
| Name | Required | Description |
| --- | --- | --- |
| x-request-id | No | 请求追踪 ID |
| x-user-id | Yes | 用户 ID |

### Body
```json
{}
```

## 响应数据 (Response)

### 成功响应 (200 OK)
```json
{
  "code": "OK",
  "data": {},
  "requestId": "req_123456789"
}
```

### 错误响应 (4xx/5xx)
```json
{
  "code": "UNAUTHORIZED",
  "message": "未登录",
  "details": {},
  "requestId": "req_123456789",
  "retryable": false
}
```
