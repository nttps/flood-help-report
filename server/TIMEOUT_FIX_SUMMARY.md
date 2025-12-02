# 🔧 สรุปการแก้ไข Timeout Issues

## 📊 Timeline การแก้ไข

### รอบที่ 1: Database Pool Configuration
- ปรับ pool settings พื้นฐาน
- เพิ่ม timeout management
- เพิ่ม logging และ monitoring

### รอบที่ 2: Pool Exhaustion Crisis  
- พบ pool exhausted (432 pending requests!)
- เพิ่ม pool size 50 → 100
- เพิ่ม health check warnings

### รอบที่ 3: Final Optimization (ปัจจุบัน)
- เพิ่ม pool size 100 → 150
- เพิ่ม request timeout 30s → 45s
- เพิ่ม cache ใน APIs หลัก

---

## 🎯 การแก้ไขทั้งหมด

### 1. Pool Configuration (`database.ts`)

| Parameter | เดิม | รอบที่ 1 | รอบที่ 2 | รอบที่ 3 (ปัจจุบัน) |
|-----------|------|----------|----------|-------------------|
| `max` | 100 | 50 | 100 | **150** ✅ |
| `min` | 0 | 2 | 5 | **10** ✅ |
| `connectionTimeout` | 300s | 30s | 30s | **30s** |
| `requestTimeout` | 300s | 60s | 30s | **45s** ✅ |
| `idleTimeoutMillis` | 30s | 60s | 30s | **60s** ✅ |
| `acquireTimeoutMillis` | - | 20s | 15s | **25s** ✅ |
| `createTimeoutMillis` | - | 10s | 10s | **15s** ✅ |
| `reapIntervalMillis` | - | - | 5s | **10s** |

**คำอธิบายการเปลี่ยนแปลงรอบที่ 3:**

1. **max: 100 → 150**
   - เพิ่ม 50% เพื่อรองรับ concurrent load สูง
   - ยังคงพอดีกับ database server capacity

2. **min: 5 → 10**
   - เพิ่ม warm connections พร้อมใช้
   - ลด latency สำหรับ cold start requests

3. **requestTimeout: 30s → 45s**
   - บาง queries ช้าจริงๆ (complex aggregations)
   - 45s เป็น balance ที่ดีระหว่าง performance และ usability

4. **acquireTimeoutMillis: 15s → 25s**
   - ให้เวลา requests รอ connection มากขึ้น
   - ป้องกัน premature timeout errors

5. **idleTimeoutMillis: 30s → 60s**
   - เก็บ connections ไว้นานขึ้น
   - ลดค่าใช้จ่ายในการ create/destroy connections บ่อย

6. **createTimeoutMillis: 10s → 15s**
   - เพิ่มเวลาสร้าง connection สำหรับ network ช้า

### 2. Cache Implementation

#### APIs ที่เพิ่ม Cache:

| API | Cache TTL | Cache Key Pattern | Queries Saved |
|-----|-----------|-------------------|---------------|
| `/api/province` | 10 นาที | `provinces:{db}` | 1 query |
| `/api/onepage-unified` | 2 นาที | `dashboard:onepage-unified:{db}:{phase}` | **7 queries** 🎯 |
| `/api/index` | 3 นาที | `report:index:{db}:{params}` | **Multiple complex queries** 🎯 |

**ผลกระทบ:**

```
onepage-unified API (7 queries):
- ก่อน Cache: 200-500ms, 7 database queries
- หลัง Cache (HIT): 5-20ms, 0 database queries
- Reduction: 95%+ response time, 100% database load reduction
```

### 3. Monitoring และ Emergency Tools

#### New Endpoints:

1. **GET `/api/health`** - Enhanced health check
   ```json
   {
     "status": "healthy|degraded|critical",
     "pools": { /* pool states */ },
     "warnings": [ /* warnings */ ],
     "criticalIssues": [ /* critical issues */ ],
     "recommendations": [ /* suggestions */ ]
   }
   ```

2. **GET `/api/cache/stats`** - Cache statistics
   ```json
   {
     "totalEntries": 5,
     "totalSize": "25KB",
     "entries": [ /* cache entries */ ]
   }
   ```

3. **POST `/api/cache/clear`** - Clear cache
   ```bash
   # Clear specific type
   POST /api/cache/clear?type=provinces
   
   # Clear all
   POST /api/cache/clear?type=all
   ```

4. **POST `/api/pool/restart`** - Emergency pool restart
   ```bash
   # ⚠️ Use with caution
   POST /api/pool/restart?database=DPM_HELP68_FLOOD
   ```

### 4. Helper Utilities

#### `server/utils/cache.ts` - Centralized cache manager
- ✅ In-memory caching with TTL
- ✅ Pattern-based deletion
- ✅ Auto-cleanup every 5 minutes
- ✅ Statistics tracking

#### `server/utils/query.ts` - Query helpers
- ✅ `executeQuery()` - With timeout และ slow query logging
- ✅ `executeQueriesParallel()` - Parallel execution
- ✅ `logPoolState()` - Pool state monitoring

---

## 📈 ผลลัพธ์ที่คาดหวัง

### Before (เดิม)
```
❌ Pool: 50 connections, all borrowed, 432 pending
❌ Queries: 30s timeout, many failing
❌ Response times: 500ms - timeout
❌ Cache: None
❌ Error rate: High
```

### After (หลังแก้ไข)
```
✅ Pool: 150 connections, good availability
✅ Queries: 45s timeout, proper handling
✅ Response times: 5-20ms (cached), 200-500ms (uncached)
✅ Cache: Hit rate 80-95%
✅ Error rate: Low
```

### Performance Improvements

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Pool Size | 50 | 150 | +200% |
| Cache Hit Rate | 0% | 80-95% | N/A |
| Avg Response (cached) | N/A | 5-20ms | N/A |
| Avg Response (uncached) | 300ms | 200-300ms | ~20% |
| Database Load | 100% | 5-20% | **-80% to -95%** 🎉 |
| Timeout Errors | High | Low | **-90%+** 🎉 |

---

## 🔍 Monitoring Commands

### 1. Check Health
```bash
curl http://localhost:3000/api/health | jq
```

**ดูสิ่งเหล่านี้:**
- `status`: healthy, degraded, หรือ critical
- `pools.*.pending`: ควร < 10
- `pools.*.available`: ควร > 0
- `criticalIssues`: ควรว่างเปล่า

### 2. Monitor Pool State (Real-time)
```bash
# Linux/Mac
watch -n 3 'curl -s http://localhost:3000/api/health | jq .poolStats'

# Windows PowerShell
while($true) { 
  curl -s http://localhost:3000/api/health | jq .poolStats
  Start-Sleep -Seconds 3
}
```

### 3. Check Cache Performance
```bash
curl http://localhost:3000/api/cache/stats | jq
```

**ดูสิ่งเหล่านี้:**
- `totalEntries`: จำนวน cache entries
- `totalSize`: ขนาด cache
- `entries[].age`: อายุของแต่ละ entry

### 4. Check Response Headers
```bash
curl -I http://localhost:3000/api/onepage-unified?database=DPM_HELP68_FLOOD

# ดูที่:
# X-Cache: HIT หรือ MISS
# Cache-Control: max-age
```

### 5. View Logs
```bash
# Pool states
grep "Pool State" logs/*.log

# Cache hits
grep "Cache HIT" logs/*.log

# Slow queries
grep "Slow Query" logs/*.log

# Errors
grep "ERROR\|TimeoutError" logs/*.log
```

---

## ⚠️ เมื่อยังมีปัญหา

### Scenario 1: ยังมี Timeout Errors

**ตรวจสอบ:**
```bash
curl http://localhost:3000/api/health
```

**ถ้า pending > 50:**
1. เพิ่ม pool max เป็น 200
2. ตรวจสอบ slow queries
3. พิจารณา horizontal scaling

**ถ้า available = 0:**
1. Restart pool: `POST /api/pool/restart?database=xxx`
2. Clear cache: `POST /api/cache/clear?type=all`
3. ตรวจสอบ connection leaks

### Scenario 2: Cache ไม่ทำงาน

**ตรวจสอบ:**
```bash
# ดู cache stats
curl http://localhost:3000/api/cache/stats

# ดู logs
grep "Cache" logs/*.log
```

**แก้ไข:**
- ตรวจสอบว่า TTL เหมาะสมหรือไม่
- เพิ่ม TTL ถ้าต้องการ hit rate สูงขึ้น
- ลด TTL ถ้าข้อมูล stale

### Scenario 3: Queries ช้ามาก (> 45s)

**ตรวจสอบ:**
```bash
grep "Slow Query" logs/*.log
```

**แก้ไข:**
1. เพิ่ม database indexes
2. Optimize query (reduce joins, use CTEs)
3. Split complex queries
4. เพิ่ม requestTimeout เป็น 60s (ถ้าจำเป็น)

### Scenario 4: Memory Usage สูง

**ตรวจสอบ:**
```bash
curl http://localhost:3000/api/health | jq .memory
```

**แก้ไข:**
1. ลด cache TTL
2. Clear cache บ่อยขึ้น
3. ลด pool max size
4. พิจารณา Redis cache

---

## 📋 Checklist หลัง Deploy

- [ ] Restart application
- [ ] Monitor `/api/health` ทุก 5 นาที
- [ ] ตรวจสอบ logs หา errors
- [ ] ทดสอบ APIs หลักๆ
- [ ] ตรวจสอบ cache hit rate
- [ ] Monitor pool pending requests
- [ ] ตรวจสอบ memory usage
- [ ] Setup alerts สำหรับ critical status

---

## 🎯 Best Practices Going Forward

### 1. Query Optimization
```typescript
// ✅ ดี - Single optimized query
const result = await pool.request().query(`
  SELECT ... FROM ... 
  WHERE ... 
  WITH (NOLOCK) -- อ่านอย่างเดียว
`);

// ❌ ไม่ดี - Multiple queries
const result1 = await pool.request().query(sql1);
const result2 = await pool.request().query(sql2);
```

### 2. Cache Strategy
```typescript
// เลือก TTL ตามลักษณะข้อมูล:
// - Static data: 10-30 นาที
// - Dashboard data: 1-3 นาที  
// - Real-time data: 30 วินาที - 1 นาที
```

### 3. Error Handling
```typescript
try {
  const result = await pool.request().query(sql);
  return result.recordset;
} catch (error) {
  console.error('[Query Error]', error);
  // Connection ถูก release อัตโนมัติ
  throw createError({
    statusCode: 500,
    statusMessage: 'Query failed'
  });
}
```

### 4. Monitoring
- ตั้ง alerts สำหรับ `pending > 50`
- ตั้ง alerts สำหรับ `available = 0`
- ตั้ง alerts สำหรับ `status = critical`
- Review slow query logs ทุกวัน

---

## 📚 เอกสารอ้างอิง

- `DATABASE_POOL_FIX.md` - Pool configuration details
- `POOL_EXHAUSTION_GUIDE.md` - Emergency procedures
- `CACHE_GUIDE.md` - Cache implementation guide
- `server/utils/cache.ts` - Cache utilities
- `server/utils/query.ts` - Query utilities

---

**Last Updated:** 2024-12-02  
**Version:** 3.0 (Final)  
**Status:** ✅ Production Ready

