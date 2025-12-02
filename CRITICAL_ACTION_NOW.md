# 🚨 CRITICAL ACTION REQUIRED NOW!

## สถานการณ์ปัจจุบัน

```
DPM_HELP68_FLOOD Pool Status:
❌ Pool Size: 100 (ตั้งไว้ 150/250 แต่ยังไม่มีผล)
❌ Available: 0
❌ Pending: 511 requests (!!)
❌ Borrowed: 99
⚠️ Status: CRITICAL

สาเหตุ: Application ยังไม่ได้ RESTART หลังแก้ไข config!
```

---

## ⚡ แก้ไขทันที - 3 ขั้นตอน

### ขั้นตอนที่ 1: RESTART APPLICATION (สำคัญที่สุด!)

#### ถ้ารันใน Docker:
```bash
# ✅ วิธีที่แนะนำ
cd /path/to/flood-help-report
docker-compose down
docker-compose up -d --build

# หรือ restart เฉพาะ service
docker-compose restart web
```

#### ถ้ารันด้วย PM2:
```bash
pm2 restart all
# หรือ
pm2 restart flood-help-report
```

#### ถ้ารันด้วย Node โดยตรง:
```bash
# หยุด process เดิม (Ctrl+C หรือ kill)
# แล้วรันใหม่
npm run build
npm start
```

---

### ขั้นตอนที่ 2: ตรวจสอบว่า Config ใหม่มีผล

```bash
# ตรวจสอบ pool size ใหม่
curl http://YOUR_SERVER:PORT/api/health | jq '.pools.DPM_HELP68_FLOOD'

# ควรเห็น:
# "size": 250  <-- ถ้าเห็น 250 แสดงว่า OK!
```

---

### ขั้นตอนที่ 3: Run Emergency Script

#### Windows:
```powershell
# แก้ไข SERVER_URL ใน emergency-restart.ps1 ก่อน
.\emergency-restart.ps1
```

#### Linux/Mac:
```bash
# แก้ไข SERVER_URL ใน emergency-restart.sh ก่อน
chmod +x emergency-restart.sh
./emergency-restart.sh
```

---

## 🔍 การแก้ไขที่ทำไปแล้ว

### รอบที่ 4 (EMERGENCY - ตอนนี้):

```typescript
// database.ts - Pool Config
pool: {
  max: 250,              // 🔥 เพิ่มเป็น 250! (จาก 150)
  min: 15,               // เพิ่มเป็น 15 warm connections
  idleTimeoutMillis: 45000,     // ลดเป็น 45s - คืนเร็วขึ้น
  acquireTimeoutMillis: 20000,  // ลดเป็น 20s - fail faster
  reapIntervalMillis: 5000,     // ตรวจทุก 5 วินาที
  createRetryIntervalMillis: 100 // retry เร็วขึ้น
}

connectionTimeout: 25000,  // ลดเป็น 25s
requestTimeout: 35000,     // ลดเป็น 35s - บังคับให้ queries จบเร็วขึ้น
```

### Cache Implementation:
- ✅ `/api/province` - 10 นาที
- ✅ `/api/onepage-unified` - 2 นาที (7 queries!)
- ✅ `/api/index` - 3 นาที

---

## 📊 ผลที่คาดหวังหลัง Restart

### Before Restart (ตอนนี้):
```json
{
  "size": 100,
  "available": 0,
  "pending": 511,
  "borrowed": 99
}
```

### After Restart (คาดหวัง):
```json
{
  "size": 250,          // ✅ เพิ่มขึ้น 150%
  "available": 150-200, // ✅ มี connections ว่าง
  "pending": 0-10,      // ✅ ลดลง 98%+
  "borrowed": 50-100    // ✅ ปกติ
}
```

---

## 🔴 ถ้ายังมีปัญหาหลัง Restart

### Scenario A: Pending ยังสูง (> 50)

**สาเหตุ:** Queries ช้ามาก หรือ Traffic สูงเกินไป

**แก้ไข:**
```bash
# 1. ดู slow queries
grep "Slow Query" logs/*.log

# 2. เพิ่ม pool size เป็น 300-400
# แก้ใน database.ts:
max: 400

# 3. Optimize queries หรือเพิ่ม indexes
```

### Scenario B: Pool Size ยังไม่เปลี่ยน

**สาเหตุ:** Build ไม่สมบูรณ์หรือ cache

**แก้ไข:**
```bash
# Docker
docker-compose down
docker system prune -f
docker-compose up -d --build --force-recreate

# Node
rm -rf .nuxt .output node_modules/.cache
npm run build
npm start
```

### Scenario C: Memory หมด

**แก้ไข:**
```bash
# ลด pool size ชั่วคราว
max: 150

# หรือเพิ่ม memory limit (Docker)
# ใน docker-compose.yml:
deploy:
  resources:
    limits:
      memory: 2G
```

---

## 📈 Monitoring หลัง Restart

### Monitor Real-time (Windows):
```powershell
while($true) {
  $h = Invoke-RestMethod "http://YOUR_SERVER:PORT/api/health"
  Write-Host "[$($h.timestamp)] Status: $($h.status) | Pending: $($h.poolStats.pendingRequests) | Available: $($h.poolStats.availableConnections)"
  Start-Sleep -Seconds 3
}
```

### Monitor Real-time (Linux/Mac):
```bash
watch -n 3 'curl -s http://YOUR_SERVER:PORT/api/health | jq ".poolStats"'
```

### Check Logs:
```bash
# Docker
docker-compose logs -f --tail=100

# PM2
pm2 logs --lines 100
```

---

## ✅ Success Criteria

ถือว่าสำเร็จเมื่อ:

- ✅ Pool size = 250 (หรือมากกว่า)
- ✅ Pending requests < 10
- ✅ Available connections > 100
- ✅ Health status = "healthy" หรือ "degraded" (ไม่ใช่ "critical")
- ✅ Cache hit rate > 70%
- ✅ No timeout errors ใน logs

---

## 🆘 Emergency Contacts / Actions

ถ้าทำทุกอย่างแล้วยังไม่ดีขึ้น:

### 1. Check Database Server
```sql
-- Check active connections on SQL Server
SELECT 
    DB_NAME(dbid) as DBName,
    COUNT(dbid) as NumberOfConnections,
    loginame
FROM sys.sysprocesses
WHERE dbid > 0
GROUP BY dbid, loginame
ORDER BY NumberOfConnections DESC
```

### 2. Connection Leak Detection
```bash
# ดู connections ที่ค้างนาน
# Check ใน database server ว่ามี connections ที่รันนานเกิน 60s
```

### 3. Rate Limiting (ถ้าจำเป็น)
พิจารณาเพิ่ม rate limiting ที่ API Gateway หรือ Nginx:
```nginx
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
```

### 4. Scale Horizontally
ถ้า single server ไม่พอ:
- Load balancer + multiple app instances
- Database read replicas
- Redis caching layer

---

## 📋 Post-Incident Checklist

หลังจากแก้ไขเสร็จ:

- [ ] Restart application สำเร็จ
- [ ] Pool size = 250+
- [ ] Pending < 10
- [ ] Monitoring ตั้งค่าแล้ว
- [ ] Cache ทำงานปกติ
- [ ] Slow queries ถูก identified
- [ ] Database indexes ถูก reviewed
- [ ] Documentation updated
- [ ] Team informed
- [ ] Post-mortem scheduled

---

## 📚 เอกสารอ้างอิง

- `TIMEOUT_FIX_SUMMARY.md` - สรุปการแก้ไขทั้งหมด
- `POOL_EXHAUSTION_GUIDE.md` - คู่มือแก้ปัญหา pool
- `CACHE_GUIDE.md` - คู่มือการใช้ cache
- `emergency-restart.ps1` / `emergency-restart.sh` - Scripts สำหรับ recovery

---

**Last Updated:** 2024-12-02 13:20 UTC  
**Severity:** 🔴 CRITICAL  
**Action Required:** ⚡ IMMEDIATE  
**Estimated Recovery Time:** 5-10 minutes after restart

