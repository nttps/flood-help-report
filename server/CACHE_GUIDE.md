# Cache Implementation Guide

## 📋 ภาพรวม (Overview)

ระบบ cache แบบ in-memory ที่ช่วยลดการ query database และเพิ่มประสิทธิภาพของ API

## 🎯 คุณสมบัติ (Features)

- ✅ In-memory caching พร้อม TTL (Time To Live)
- ✅ Automatic cache expiration
- ✅ Cache statistics และ monitoring
- ✅ Pattern-based cache clearing
- ✅ Cache headers สำหรับ HTTP caching
- ✅ Auto-cleanup ทุก 5 นาที

## 📁 โครงสร้างไฟล์ (File Structure)

```
server/
├── utils/
│   └── cache.ts              # Centralized cache manager
└── api/
    ├── province.get.ts       # API ที่ใช้ cache
    └── cache/
        ├── stats.get.ts      # ดู cache statistics
        └── clear.post.ts     # ล้าง cache
```

## 🚀 วิธีใช้งาน (Usage)

### 1. Import Cache Functions

```typescript
import { getCache, setCache, deleteCache } from '~/server/utils/cache';
```

### 2. ใช้ Cache ใน API

```typescript
// ตัวอย่างใน province.get.ts
const cacheKey = `provinces:${database}`;
const CACHE_TTL = 10 * 60 * 1000; // 10 นาที

// ดึงจาก cache
const cachedData = getCache(cacheKey, CACHE_TTL);
if (cachedData) {
  return cachedData;
}

// Query จาก database และบันทึกลง cache
const data = await fetchFromDatabase();
setCache(cacheKey, data);
return data;
```

### 3. Cache Functions

#### `getCache(key, ttl?)`
ดึงข้อมูลจาก cache
- **Parameters:**
  - `key`: Cache key (string)
  - `ttl`: Time to live in ms (default: 10 นาที)
- **Returns:** Cached data หรือ null

#### `setCache(key, data)`
บันทึกข้อมูลลง cache
- **Parameters:**
  - `key`: Cache key (string)
  - `data`: ข้อมูลที่ต้องการ cache

#### `deleteCache(key)`
ลบ cache entry
- **Parameters:**
  - `key`: Cache key (string)
- **Returns:** boolean (true ถ้าลบสำเร็จ)

#### `deleteCachePattern(pattern)`
ลบ cache ที่ match pattern
- **Parameters:**
  - `pattern`: Pattern (รองรับ * wildcard)
- **Returns:** Array of deleted keys

**ตัวอย่าง:**
```typescript
deleteCachePattern('provinces:*')  // ลบทุก cache ที่ขึ้นต้นด้วย provinces:
```

#### `clearAllCache()`
ลบ cache ทั้งหมด
- **Returns:** จำนวน entries ที่ถูกลบ

#### `getCacheStats()`
ดูสถิติของ cache
- **Returns:** Object with cache statistics

## 📊 API Endpoints

### 1. ดู Cache Statistics
```bash
GET /api/cache/stats
```

**Response:**
```json
{
  "success": true,
  "totalEntries": 3,
  "totalSize": "15234 bytes",
  "entries": [
    {
      "key": "provinces:DPM_HELP68",
      "age": "120s",
      "size": "5078 bytes",
      "timestamp": "2024-12-02T10:30:00.000Z"
    }
  ],
  "timestamp": "2024-12-02T10:32:00.000Z"
}
```

### 2. ล้าง Cache
```bash
POST /api/cache/clear?type=provinces
POST /api/cache/clear?type=provinces&database=DPM_HELP68
POST /api/cache/clear?type=all
```

**Parameters:**
- `type`: (required) `provinces` | `all`
- `database`: (optional) ชื่อ database เฉพาะ

**Response:**
```json
{
  "success": true,
  "message": "Cache cleared successfully",
  "cleared": {
    "count": 2,
    "keys": ["provinces:DPM_HELP68", "provinces:DPM_HELP68_FLOOD"],
    "type": "provinces"
  },
  "timestamp": "2024-12-02T10:35:00.000Z"
}
```

## 🎨 Cache Strategy แต่ละ API

### Provinces API (`/api/province`)
- **Cache Key:** `provinces:{database}`
- **TTL:** 10 นาที
- **เหตุผล:** ข้อมูลจังหวัดไม่ค่อยเปลี่ยนแปลง

## 📈 Monitoring

### ดู Cache Logs

```bash
# Cache HIT
[Cache HIT] provinces:DPM_HELP68 (age: 45s, ttl: 600s)

# Cache MISS
[Cache MISS] provinces:DPM_HELP68

# Cache SAVE
[Cache SAVE] provinces:DPM_HELP68 (size: 5078 bytes)

# Cache DELETE
[Cache DELETE] provinces:DPM_HELP68

# Cache EXPIRED
[Cache EXPIRED] provinces:DPM_HELP68

# Auto Cleanup
[Cache CLEAN] Removed 3 expired entries
```

### HTTP Cache Headers

API จะส่ง cache headers กลับไปด้วย:

```http
Cache-Control: public, max-age=600
X-Cache: HIT
```

- `X-Cache: HIT` - ข้อมูลมาจาก cache
- `X-Cache: MISS` - ข้อมูลมาจาก database

## ⚙️ Configuration

### ปรับ TTL

```typescript
// ใน API file
const CACHE_TTL = 15 * 60 * 1000; // 15 นาที
```

### ปรับ Auto-Cleanup Interval

```typescript
// ใน server/utils/cache.ts
setInterval(() => {
  cleanExpiredCache();
}, 3 * 60 * 1000); // ทุก 3 นาที
```

## 🔧 Best Practices

### 1. Cache Naming Convention
```typescript
// ✅ ดี - ชัดเจน มี namespace
const key = `provinces:${database}`;
const key = `users:${userId}:profile`;

// ❌ ไม่ดี - ไม่ชัดเจน
const key = `data1`;
const key = `temp`;
```

### 2. เลือก TTL ที่เหมาะสม
- **Static data** (จังหวัด, ประเทศ): 10-30 นาที
- **Frequently updated** (dashboard stats): 1-5 นาที
- **Rarely changed** (configurations): 30-60 นาที

### 3. ตั้ง Cache Headers
```typescript
setResponseHeaders(event, {
  'Cache-Control': 'public, max-age=600',
  'X-Cache': cachedData ? 'HIT' : 'MISS'
});
```

### 4. ล้าง Cache เมื่อมีการอัพเดท
```typescript
// เมื่อมีการ update จังหวัด
await updateProvince(data);
deleteCache(`provinces:${database}`);
```

## 🧪 Testing

### ทดสอบ Cache Hit
```bash
# Request ครั้งแรก - ควรเป็น MISS
curl -I http://localhost:3000/api/province?database=DPM_HELP68

# Request ครั้งที่สอง - ควรเป็น HIT
curl -I http://localhost:3000/api/province?database=DPM_HELP68
```

ดูที่ header `X-Cache: HIT` หรือ `X-Cache: MISS`

### ทดสอบ Cache Expiration
```bash
# Set TTL สั้นๆ เพื่อทดสอบ
const CACHE_TTL = 10 * 1000; // 10 วินาที

# Request และรอ 15 วินาที
curl http://localhost:3000/api/province?database=DPM_HELP68
sleep 15
curl http://localhost:3000/api/province?database=DPM_HELP68
# ครั้งที่สองควรเป็น MISS เพราะ expired
```

### ทดสอบ Clear Cache
```bash
# ล้าง cache
curl -X POST "http://localhost:3000/api/cache/clear?type=provinces"

# ตรวจสอบ stats
curl http://localhost:3000/api/cache/stats
```

## 📊 Performance Metrics

### ประโยชน์ของ Cache

**ก่อนใช้ Cache:**
- Response time: ~200-500ms
- Database queries: ทุก request

**หลังใช้ Cache:**
- Response time (HIT): ~5-20ms (เร็วขึ้น 10-100 เท่า)
- Response time (MISS): ~200-500ms
- Cache hit rate: 80-95% (ขึ้นอยู่กับ traffic pattern)

## 🚨 Troubleshooting

### Cache ไม่ทำงาน
1. ตรวจสอบ logs ว่ามี `[Cache SAVE]` หรือไม่
2. ตรวจสอบว่า TTL ไม่สั้นเกินไป
3. ตรวจสอบ cache key ว่าถูกต้อง

### Memory Usage สูง
1. ลด TTL
2. เพิ่มความถี่ของ auto-cleanup
3. พิจารณาใช้ Redis แทน in-memory cache

### Cache Stale Data
1. ลด TTL
2. Implement cache invalidation เมื่อมีการอัพเดทข้อมูล
3. เพิ่ม versioning ใน cache key

## 🔮 อนาคต (Future Improvements)

- [ ] Redis integration สำหรับ distributed caching
- [ ] Cache warming (pre-populate cache)
- [ ] Cache compression
- [ ] Cache metrics และ analytics
- [ ] Smart cache invalidation
- [ ] Cache partitioning

## 📚 อ้างอิง (References)

- [HTTP Caching](https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching)
- [Cache-Control Best Practices](https://web.dev/http-cache/)

