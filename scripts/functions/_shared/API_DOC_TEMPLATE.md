# API Doc Template

## 接口说明
[在此简述接口的功能，例如：用于查询会员状态]

## 基础信息
- **Function Name**: `function-name`
- **Method**: `GET / POST`
- **Path**: `/v1/path`

## 请求参数 (Request)

### Headers
| Name | Required | Description |
| --- | --- | --- |
| x-request-id | No | 请求追踪 ID |
| Authorization | Yes | Bearer Token |

### Query Parameters (如果是 GET 请求)
| Name | Type | Required | Description |
| --- | --- | --- | --- |
| userId | string | Yes | 用户 ID |

### Body (如果是 POST 请求)
```json
{
  "field1": "string",
  "field2": "number"
}
```

## 响应数据 (Response)

### 成功响应 (200 OK)
```json
{
  "code": "OK",
  "data": {
    "result": "..."
  },
  "requestId": "req_123456789"
}
```

### 错误响应 (4xx/5xx)
```json
{
  "code": "INVALID_PARAMS",
  "message": "Missing required field: field1",
  "details": {},
  "requestId": "req_123456789",
  "retryable": false
}
```

## 错误码说明
| Code | HTTP Status | Description |
| --- | --- | --- |
| OK | 200 | 请求成功 |
| INVALID_PARAMS | 400 | 参数错误 |
| UNAUTHORIZED | 401 | 未授权 |
| INTERNAL_ERROR | 500 | 内部错误 |
