# API Configuration & Utilities

Thư mục `src/api/` chứa tất cả các cấu hình và utilities liên quan đến API calls.

## Cấu trúc thư mục

```
src/api/
├── index.js          # Export tất cả từ thư mục api
├── config.js         # Axios client configuration với interceptors
├── constants.js      # API endpoints, HTTP status codes, error messages
├── types.js          # JSDoc type definitions cho data structures
└── utils.js          # Utility functions cho API operations
```

## Cách sử dụng

### Import từ thư mục api

```javascript
// Import tất cả
import { axiosClient, API_ENDPOINTS, handleApiError, isAuthenticated } from '../api';

// Import theo module
import { axiosClient } from '../api/config';
import { API_ENDPOINTS, HTTP_STATUS } from '../api/constants';
import { handleApiError, getToken } from '../api/utils';
```

### Sử dụng constants

```javascript
import { API_ENDPOINTS, HTTP_STATUS } from '../api/constants';

// Trong API functions
export const getExams = () => axiosClient.get(API_ENDPOINTS.EXAMS);

// Trong error handling
if (error.response?.status === HTTP_STATUS.UNAUTHORIZED) {
  // handle unauthorized
}
```

### Sử dụng utilities

```javascript
import { handleApiError, isAuthenticated, getToken } from '../api/utils';

// Trong components
try {
  const response = await apiCall();
} catch (error) {
  const userMessage = handleApiError(error);
  alert(userMessage);
}

// Check authentication
if (!isAuthenticated()) {
  navigate('/login');
}
```

## Lợi ích

### ✅ **Centralized Configuration**
- Tất cả API config ở một nơi
- Dễ thay đổi base URL, headers, etc.

### ✅ **Type Safety**
- JSDoc types giúp IDE autocomplete
- Giảm lỗi typo trong property names

### ✅ **Consistent Error Handling**
- User-friendly error messages
- Centralized error logging

### ✅ **Reusable Utilities**
- Authentication helpers
- API response formatters
- Query string builders

### ✅ **Maintainability**
- Thay đổi API structure chỉ cần sửa 1 nơi
- Easy to extend với new utilities

## Best Practices

1. **Luôn sử dụng constants** thay vì hardcode strings
2. **Sử dụng handleApiError** cho consistent error messages
3. **Check authentication** trước khi gọi protected APIs
4. **Type hints** với JSDoc comments
5. **Centralize common logic** trong utils

## Mở rộng

Có thể thêm các file khác khi cần:
- `interceptors.js` - Custom request/response interceptors
- `cache.js` - API response caching
- `retry.js` - Request retry logic
- `validation.js` - API response validation