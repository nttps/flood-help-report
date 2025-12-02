# 🚨 Pool Exhaustion Emergency Guide

## ภาพรวมปัญหา

**Pool Exhaustion** เกิดเมื่อ database connection pool หมด connections ที่ว่าง และมี requests จำนวนมากรออยู่

### สัญญาณเตือน

```json
{
  "size": 50,         // Total connections
  "available": 0,     // ⚠️ No available connections!
  "pending": 432,     // 🔥 432 requests waiting!
  "borrowed": 50      // All connections in use
}
```

## 🔥 แก้ไขฉุกเฉิน (Emergency Fix)

### Step 1: ตรวจสอบสถานะ Pool

```bash
curl http://localhost:3000/api/health
```

ดูที่:
- `pools.{database}.pending` - จำนวน requests ที่รอ
- `pools.{database}.available` - จำนวน connections ว่าง
- `criticalIssues` - รายการปัญหาร้ายแรง

### Step 2: Restart Pool (ใช้เมื่อจำเป็นจริงๆ)

```bash
# ⚠️ WARNING: จะตัดการเชื่อมต่อทั้งหมด!
curl -X POST "http://localhost:3000/api/pool/restart?database=DPM_HELP68_FLOOD"
```

### Step 3: Monitor Recovery

```bash
# ดู health ทุก 5 วินาที
watch -n 5 'curl -s http://localhost:3000/api/health | jq .poolStats'
```

## 🔍 การวิเคราะห์สาเหตุ

### 1. Connection Leaks

**อาการ:**
- Pending requests เพิ่มขึ้นเรื่อยๆ
- Available connections ลดลงเรื่อยๆ จนเหลือ 0

**วิธีตรวจสอบ:**
```bash
# ดู pool state ว่า borrowed เพิ่มขึ้นเรื่อยๆ หรือไม่
curl http://localhost:3000/api/health | jq '.pools'
```

**วิธีแก้:**
- ตรวจสอบ code ว่าทุก query ใช้ `pool.request().query()` ถูกต้อง
- ไม่ควรเก็บ request object ไว้นาน
- Ensure queries complete และ connections ถูก release

### 2. Slow Queries

**อาการ:**
- Pending สูงในช่วงที่มี traffic
- Queries ทำงานนานเกิน 30 วินาที

**วิธีตรวจสอบ:**
```bash
# ดู logs หา "[Slow Query]"
grep "Slow Query" logs/*.log
```

**วิธีแก้:**
- Optimize queries ด้วย indexes
- ลด complexity ของ queries
- Split large queries เป็น smaller batches
- ใช้ cache สำหรับ data ที่ไม่ค่อยเปลี่ยน

### 3. High Concurrent Load

**อาการ:**
- Pending สูงในช่วง peak hours
- Pool size ไม่พอสำหรับ traffic

**วิธีตรวจสอบ:**
```bash
# ดู pending requests และ borrowed connections
curl http://localhost:3000/api/health | jq '.poolStats'
```

**วิธีแก้:**
- เพิ่ม pool size (แต่ต้องดูว่า database server รับได้)
- Implement rate limiting
- ใช้ queue system
- Horizontal scaling

## ⚙️ การตั้งค่าที่แก้ไขแล้ว

### Pool Configuration (ใหม่)

```typescript
pool: {
  max: 100,                    // เพิ่มจาก 50 → 100
  min: 5,                      // เพิ่มจาก 2 → 5
  idleTimeoutMillis: 30000,    // ลดจาก 60s → 30s (คืน connections เร็วขึ้น)
  acquireTimeoutMillis: 15000, // ลดจาก 20s → 15s (fail faster)
  reapIntervalMillis: 5000     // ลดจาก 10s → 5s (cleanup บ่อยขึ้น)
}

connectionTimeout: 30000       // ไม่เปลี่ยน
requestTimeout: 30000          // ลดจาก 60s → 30s
```

### เหตุผลการเปลี่ยนแปลง

1. **Increased max (50→100)**: รองรับ concurrent requests ได้มากขึ้น
2. **Increased min (2→5)**: มี connections พร้อมใช้ตลอด
3. **Reduced idleTimeout (60s→30s)**: คืน connections เร็วขึ้น
4. **Reduced acquireTimeout (20s→15s)**: ไม่ให้ requests รอนาน fail เร็วขึ้น
5. **Reduced requestTimeout (60s→30s)**: queries ช้าจะถูก cancel เร็วขึ้น
6. **Increased reapInterval (10s→5s)**: cleanup idle connections บ่อยขึ้น

## 📊 Monitoring

### Health Check Levels

1. **Healthy** ✅
   - Available connections > 0
   - Pending < 10
   - Response: HTTP 200

2. **Degraded** ⚠️
   - Available ≤ 2 OR Pending > 0
   - Response: HTTP 200 with warnings

3. **Critical** 🔥
   - Available = 0 AND Pending > 10
   - Response: HTTP 503 with critical issues

### Example Health Response

```json
{
  "status": "critical",
  "criticalIssues": [
    "DPM_HELP68_FLOOD: Pool exhausted! 432 requests waiting, 0 connections available"
  ],
  "recommendations": [
    "Increase pool size if database server can handle more connections",
    "Optimize slow queries to release connections faster",
    "Implement request queuing or rate limiting"
  ]
}
```

## 🛠️ Tools และ Commands

### ดู Health Status
```bash
curl http://localhost:3000/api/health
```

### ดู Cache Stats
```bash
curl http://localhost:3000/api/cache/stats
```

### Clear Cache (ลด database load)
```bash
curl -X POST "http://localhost:3000/api/cache/clear?type=all"
```

### Restart Pool (Emergency Only!)
```bash
curl -X POST "http://localhost:3000/api/pool/restart?database=DPM_HELP68_FLOOD"
```

### Monitor Logs
```bash
# ดู pool state
tail -f logs/*.log | grep "Pool State"

# ดู slow queries
tail -f logs/*.log | grep "Slow Query"

# ดู errors
tail -f logs/*.log | grep "ERROR"
```

## 📈 Best Practices

### 1. Query Optimization

```typescript
// ❌ ไม่ดี - Multiple sequential queries
const result1 = await pool.request().query(sql1);
const result2 = await pool.request().query(sql2);
const result3 = await pool.request().query(sql3);

// ✅ ดี - Parallel queries (if independent)
const [result1, result2, result3] = await Promise.all([
  pool.request().query(sql1),
  pool.request().query(sql2),
  pool.request().query(sql3)
]);

// ✅ ดีที่สุด - Single optimized query
const result = await pool.request().query(optimizedSql);
```

### 2. Request Timeout

```typescript
// ✅ ตั้ง timeout สำหรับ query ที่อาจช้า
const request = pool.request();
request.timeout = 25000; // 25 seconds
const result = await request.query(sql);
```

### 3. Error Handling

```typescript
try {
  const result = await pool.request().query(sql);
  return result.recordset;
} catch (error) {
  console.error('Query failed:', error);
  // Release connection กลับ pool โดยอัตโนมัติ
  throw error;
}
```

### 4. Cache Strategy

```typescript
// ✅ Cache data ที่ไม่ค่อยเปลี่ยน
const cacheKey = `data:${id}`;
const cached = getCache(cacheKey);
if (cached) return cached;

const data = await fetchFromDB();
setCache(cacheKey, data);
return data;
```

## 🚀 Long-term Solutions

### 1. Database Indexing
- วิเคราะห์ slow queries
- เพิ่ม indexes ที่เหมาะสม
- Optimize table schemas

### 2. Query Optimization
- Reduce joins
- Use CTEs effectively
- Avoid N+1 queries
- Batch operations

### 3. Caching Strategy
- Cache expensive queries
- Implement cache warming
- Use Redis for distributed cache

### 4. Load Balancing
- Horizontal scaling
- Read replicas
- Connection pooling at database level

### 5. Rate Limiting
- Implement request throttling
- Queue non-urgent requests
- Prioritize critical operations

## 📚 References

- [node-mssql Pool Management](https://tediousjs.github.io/node-mssql/#pool)
- [Tarn.js Documentation](https://github.com/vincit/tarn.js)
- [SQL Server Connection Pooling](https://docs.microsoft.com/en-us/sql/connect/odbc/connection-pooling)

## 🆘 Emergency Contacts

เมื่อเกิดปัญหาร้ายแรง:
1. Restart affected pool ด้วย `/api/pool/restart`
2. Clear cache ด้วย `/api/cache/clear?type=all`
3. Monitor recovery ด้วย `/api/health`
4. Review logs for root cause
5. Implement permanent fix

---

**Last Updated:** 2024-12-02
**Version:** 1.0

