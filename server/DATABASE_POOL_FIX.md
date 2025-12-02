# Database Connection Pool Timeout Fix

## ปัญหาที่พบ (Problem)

เกิด `TimeoutError: operation timed out for an unknown reason` ซ้ำๆ เนื่องจาก:

1. **ไม่มี `acquireTimeoutMillis`** - Pool จะรอตลอดไปจนกว่าจะได้ connection
2. **Pool configuration ไม่เหมาะสม** - Max connections สูงเกินไป (100) และไม่มี minimum connections
3. **ขาด timeout management** - Connection และ request timeout ยาวเกินไป (5 นาที)
4. **ขาด connection lifecycle management** - ไม่มีการจัดการ idle connections อย่างเหมาะสม

## การแก้ไข (Solutions)

### 1. ปรับ Pool Configuration

**เดิม:**
```javascript
pool: {
  max: 100,
  min: 0,
  idleTimeoutMillis: 30000
}
```

**ใหม่:**
```javascript
pool: {
  max: 50,                      // ลด max connections
  min: 2,                       // เก็บ minimum 2 connections ไว้พร้อม
  idleTimeoutMillis: 60000,     // 60 วินาที ก่อนปิด idle connection
  acquireTimeoutMillis: 20000,  // 20 วินาที timeout เมื่อรอ connection
  createTimeoutMillis: 10000,   // 10 วินาที timeout สำหรับการสร้าง connection
  destroyTimeoutMillis: 5000,   // 5 วินาที timeout สำหรับการทำลาย connection
  reapIntervalMillis: 10000,    // ตรวจสอบ idle connections ทุก 10 วินาที (Tarn supported)
  createRetryIntervalMillis: 200,
  propagateCreateError: true
}
```

**หมายเหตุ:** ใช้ `reapIntervalMillis` แทน `evictionRunIntervalMillis` เพราะ Tarn (pool manager) รองรับ option นี้

### 2. ปรับ Connection และ Request Timeouts

**เดิม:**
```javascript
connectionTimeout: 300000,  // 5 นาที
requestTimeout: 300000,     // 5 นาที
```

**ใหม่:**
```javascript
connectionTimeout: 30000,   // 30 วินาที
requestTimeout: 60000,      // 60 วินาที
```

### 3. เพิ่ม Connection Pool Monitoring

เพิ่ม function `logPoolState()` เพื่อ log pool state ทุกครั้งที่ใช้งาน:

```javascript
const logPoolState = (dbName: string, pool: sql.ConnectionPool) => {
  const poolInfo = {
    database: dbName,
    size: pool.size,
    available: pool.available,
    pending: pool.pending,
    borrowed: pool.borrowed,
    connected: pool.connected
  };
  console.log(`[Pool State] ${dbName}:`, JSON.stringify(poolInfo));
};
```

### 4. ปรับปรุง Error Handling

- เพิ่ม error handler สำหรับ pool
- ตรวจสอบ pool connection status ก่อนใช้งาน
- ลบ disconnected pools ออกจาก Map
- Log errors อย่างละเอียดขึ้น

### 5. เพิ่ม Health Check Endpoint

สร้าง endpoint `/api/health` เพื่อ monitor pool states:

```bash
curl http://localhost:3000/api/health
```

Response:
```json
{
  "success": true,
  "timestamp": "2024-12-02T...",
  "uptime": 3600,
  "memory": { ... },
  "databases": {
    "allowed": ["DPM_HELP67", "DPM_HELP68", "DPM_HELP68_FLOOD", "DPM_HELP68_FLOOD_PLUS"],
    "count": 4
  },
  "pools": {
    "DPM_HELP68_FLOOD": {
      "connected": true,
      "size": 5,
      "available": 3,
      "pending": 0,
      "borrowed": 2
    }
  },
  "poolStats": {
    "totalPools": 1,
    "activePools": 1,
    "totalConnections": 5,
    "availableConnections": 3,
    "borrowedConnections": 2,
    "pendingRequests": 0
  }
}
```

## วิธีใช้งาน (Usage)

### 1. Monitor Pool State

```bash
# ดู health check
curl http://localhost:3000/api/health

# หรือเปิดใน browser
http://localhost:3000/api/health
```

### 2. อ่าน Logs

ตรวจสอบ logs เพื่อดู pool state:

```
[Pool] Creating new connection pool for DPM_HELP68_FLOOD
[Pool] Successfully created pool for DPM_HELP68_FLOOD
[Pool State] DPM_HELP68_FLOOD: {"database":"DPM_HELP68_FLOOD","size":2,"available":2,"pending":0,"borrowed":0,"connected":true}
```

### 3. ตรวจสอบ Pool Metrics

สังเกตค่าเหล่านี้ใน logs:
- `size`: จำนวน connections ทั้งหมดใน pool
- `available`: จำนวน connections ที่ว่าง
- `borrowed`: จำนวน connections ที่ถูกใช้งานอยู่
- `pending`: จำนวน requests ที่รอ connection

## การป้องกันปัญหา (Prevention)

### 1. Connection Leaks

ตรวจสอบว่า:
- ✅ ไม่มี queries ที่ค้างไม่จบ
- ✅ ไม่มี long-running transactions
- ✅ Pool มี connections พอสำหรับ concurrent requests

### 2. Pool Exhaustion

หาก `pending` สูงหรือ `available` เป็น 0 บ่อยๆ:
- พิจารณาเพิ่ม `pool.max`
- ตรวจสอบว่ามี queries ที่ช้าหรือไม่
- พิจารณา optimize queries

### 3. Monitoring Alerts

ตั้ง alerts สำหรับ:
- `pending > 5` - มี requests รอ connection มาก
- `available < 2` - connections เหลือน้อย
- `borrowedConnections / totalConnections > 0.8` - pool ใกล้เต็ม

## การทดสอบ (Testing)

### 1. Test Timeout Handling

```bash
# ทดสอบว่า timeout ทำงานถูกต้อง
curl "http://localhost:3000/api/onepage-unified?database=DPM_HELP68_FLOOD"
```

### 2. Test Pool Reuse

```bash
# เรียก API หลายครั้ง ควรเห็น "Reusing existing pool"
for i in {1..5}; do
  curl "http://localhost:3000/api/onepage-unified?database=DPM_HELP68_FLOOD"
  sleep 1
done
```

### 3. Load Testing

```bash
# ทดสอบ concurrent requests
ab -n 100 -c 10 "http://localhost:3000/api/onepage-unified?database=DPM_HELP68_FLOOD"
```

## ผลลัพธ์ที่คาดหวัง (Expected Results)

- ✅ ไม่มี TimeoutError อีกต่อไป
- ✅ Pool reuse ทำงานได้ดี
- ✅ Connections ถูก release กลับ pool อย่างถูกต้อง
- ✅ Idle connections ถูกปิดตาม schedule
- ✅ Error handling ชัดเจนและมีประโยชน์

## Rollback (หากจำเป็น)

หากพบปัญหา สามารถ rollback ได้โดย:

```bash
git checkout HEAD -- server/config/database.ts
git checkout HEAD -- server/api/health.get.ts
```

## เพิ่มเติม (Additional Notes)

- Pool configuration อาจต้องปรับตาม load จริง
- Monitor memory usage ในระหว่างใช้งาน production
- พิจารณาใช้ connection pooling ที่ database level ด้วย (เช่น PgBouncer สำหรับ PostgreSQL)

## การอ้างอิง (References)

- [node-mssql Pool Options](https://tediousjs.github.io/node-mssql/#pool)
- [Tarn.js Pool Management](https://github.com/vincit/tarn.js)

