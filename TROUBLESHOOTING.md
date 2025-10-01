# การแก้ไขปัญหาข้อมูลปี 2568

## ปัญหาที่พบ
หน้า `onepage-2568.vue` แสดงข้อมูลปี 2567 แทนที่จะเป็นปี 2568 และข้อมูลสลับกันไปมาระหว่างปี 2567 และ 2568

## สาเหตุที่เป็นไปได้
1. **Connection Pool ร่วมกัน** - การใช้ connection pool เดียวกันสำหรับฐานข้อมูลต่างกัน
2. **การเชื่อมต่อฐานข้อมูลผิด** - API อาจเชื่อมต่อกับฐานข้อมูล `DPM_HELP67` แทน `DPM_HELP68`
3. **Cache ข้อมูล** - ข้อมูลเก่าถูก cache ไว้
4. **การ query ข้อมูลผิด** - SQL query อาจไม่ถูกต้อง

## วิธีแก้ไขที่ทำไปแล้ว

### 1. แยก Connection Pool
สร้าง connection pool แยกสำหรับแต่ละฐานข้อมูล:
- `pool67` สำหรับ `DPM_HELP67`
- `pool68` สำหรับ `DPM_HELP68`

### 2. ปรับปรุง API Files
- `server/api/onepage.get.ts` - ใช้ pool สำหรับปี 2567
- `server/api/onepage-2568.get.ts` - ใช้ pool สำหรับปี 2568
- `server/api/onepage-unified.get.ts` - ใช้ pool ตามปีที่ระบุ

### 3. เพิ่ม Debug Logs
เพิ่ม console.log เพื่อตรวจสอบ:
- Database config ที่ใช้
- Connection status
- Query results
- Pool ที่ใช้

## วิธีตรวจสอบและแก้ไข

### 1. ตรวจสอบ Console Log
เปิด Developer Tools (F12) และดู Console เพื่อตรวจสอบ:
```
=== API Request Debug ===
Requested year: 2568
Selected database config: DPM_HELP68
Successfully connected to database: DPM_HELP68
Using pool for database: DPM_HELP68
```

### 2. ใช้ไฟล์ทดสอบ
- `/onepage-2568` - หน้าหลักปี 2568 (มี debug info)
- `/onepage-2568-test` - หน้าทดสอบที่ใช้ API แบบรวม
- `/compare-years` - หน้าเปรียบเทียบข้อมูลระหว่างปี

### 3. ทดสอบ API โดยตรง
```bash
# ทดสอบ API 2567
curl "http://localhost:3000/api/onepage-unified?phase=1.0&year=2567"

# ทดสอบ API 2568
curl "http://localhost:3000/api/onepage-unified?phase=1.0&year=2568"
```

### 4. ตรวจสอบฐานข้อมูล
ตรวจสอบว่าฐานข้อมูล `DPM_HELP68` มีข้อมูลหรือไม่:
```sql
-- ตรวจสอบข้อมูลในฐานข้อมูล 2568
SELECT COUNT(*) FROM sf_help_request WHERE t_step_status != 'ปฏิเสธคำขอ';
```

## ไฟล์ที่เกี่ยวข้อง

### API Files
- `server/api/onepage.get.ts` - API สำหรับปี 2567
- `server/api/onepage-2568.get.ts` - API สำหรับปี 2568
- `server/api/onepage-unified.get.ts` - API แบบรวม
- `server/config/database.ts` - การตั้งค่าฐานข้อมูลและ connection pools

### Frontend Files
- `pages/onepage-2568.vue` - หน้าหลักปี 2568 (มี debug info)
- `pages/onepage-2568-test.vue` - หน้าทดสอบ
- `pages/compare-years.vue` - หน้าเปรียบเทียบข้อมูล

## การทดสอบ

### ขั้นตอนการทดสอบ
1. รันเซิร์ฟเวอร์: `npm run dev`
2. เปิดหน้า `/compare-years` เพื่อเปรียบเทียบข้อมูล
3. ตรวจสอบ Console log
4. เปรียบเทียบข้อมูลระหว่างปี

### สิ่งที่ต้องตรวจสอบ
- [ ] Database config แสดง `DPM_HELP68` สำหรับปี 2568
- [ ] Connection successful
- [ ] Query results มีข้อมูล
- [ ] Year field ใน response เป็น `2568`
- [ ] ข้อมูลที่แสดงไม่เหมือนกับปี 2567
- [ ] Connection pool แยกกันระหว่างปี

## หากยังมีปัญหา

### 1. ตรวจสอบ Network Tab
ดู Network tab ใน Developer Tools เพื่อตรวจสอบ:
- Request URL
- Response data
- Status code

### 2. เพิ่ม Debug Logs
เพิ่ม console.log ใน API เพื่อ debug:
```typescript
console.log('Database config:', config);
console.log('Pool used:', pool);
console.log('Query result:', result);
```

### 3. ตรวจสอบ Database Connection
ทดสอบการเชื่อมต่อฐานข้อมูลโดยตรง:
```typescript
const config = getDbConfig('2568');
const pool = getPool('2568');
console.log('Connecting to:', config.database);
```

### 4. ใช้ API แบบรวม
หาก API เดิมมีปัญหา ให้ใช้ API แบบรวมแทน:
```javascript
// แทนที่
fetch('/api/onepage-2568?phase=1.0')

// ด้วย
fetch('/api/onepage-unified?phase=1.0&year=2568')
```

### 5. Restart Server
หากยังมีปัญหา ให้ restart เซิร์ฟเวอร์เพื่อ clear connection pools:
```bash
# Stop server (Ctrl+C)
# Start server again
npm run dev
```

## การแก้ไขปัญหา Connection Pool

### ปัญหาที่พบ
- ข้อมูลสลับกันไปมาระหว่างปี 2567 และ 2568
- การใช้ connection pool เดียวกันสำหรับฐานข้อมูลต่างกัน

### วิธีแก้ไข
1. **แยก Connection Pool** - สร้าง pool แยกสำหรับแต่ละฐานข้อมูล
2. **ใช้ Pool ที่ถูกต้อง** - ใช้ `getPool(year)` เพื่อเลือก pool ที่เหมาะสม
3. **เพิ่ม Debug Logs** - เพิ่ม log เพื่อตรวจสอบ pool ที่ใช้

### ผลลัพธ์ที่คาดหวัง
- ข้อมูลปี 2567 มาจาก `DPM_HELP67` เท่านั้น
- ข้อมูลปี 2568 มาจาก `DPM_HELP68` เท่านั้น
- ไม่มีการสลับข้อมูลระหว่างปี
