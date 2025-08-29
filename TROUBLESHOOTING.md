# การแก้ไขปัญหาข้อมูลปี 2568

## ปัญหาที่พบ
หน้า `onepage-2568.vue` แสดงข้อมูลปี 2567 แทนที่จะเป็นปี 2568

## สาเหตุที่เป็นไปได้
1. **การเชื่อมต่อฐานข้อมูลผิด** - API อาจเชื่อมต่อกับฐานข้อมูล `DPM_HELP67` แทน `DPM_HELP68`
2. **Cache ข้อมูล** - ข้อมูลเก่าถูก cache ไว้
3. **การ query ข้อมูลผิด** - SQL query อาจไม่ถูกต้อง

## วิธีแก้ไข

### 1. ตรวจสอบ Console Log
เปิด Developer Tools (F12) และดู Console เพื่อตรวจสอบ:
- Database config ที่ใช้
- Connection status
- Query results

### 2. ทดสอบ API โดยตรง
ทดสอบ API endpoints โดยตรง:

```bash
# ทดสอบ API 2568
curl "http://localhost:3000/api/onepage-2568?phase=1.0"

# ทดสอบ API แบบรวม
curl "http://localhost:3000/api/onepage-unified?phase=1.0&year=2568"
```

### 3. ใช้ไฟล์ทดสอบ
ใช้ไฟล์ `onepage-2568-test.vue` ที่สร้างขึ้นใหม่:
- ใช้ API แบบรวม (`/api/onepage-unified`)
- มี debug info แสดงบนหน้าเว็บ
- แสดงข้อมูลปีและฐานข้อมูลที่ใช้

### 4. ตรวจสอบฐานข้อมูล
ตรวจสอบว่าฐานข้อมูล `DPM_HELP68` มีข้อมูลหรือไม่:

```sql
-- ตรวจสอบข้อมูลในฐานข้อมูล 2568
SELECT COUNT(*) FROM sf_help_request WHERE t_step_status != 'ปฏิเสธคำขอ';
```

### 5. แก้ไขไฟล์ Config
หากยังมีปัญหา ให้ตรวจสอบไฟล์ `server/config/database.ts`:

```typescript
export const getDbConfig = (year?: string) => {
  console.log('Requested year:', year); // เพิ่ม debug log
  if (year === '2568') {
    console.log('Using DPM_HELP68 database');
    return dbConfig68;
  }
  console.log('Using DPM_HELP67 database (default)');
  return dbConfig67;
};
```

## ไฟล์ที่เกี่ยวข้อง

### API Files
- `server/api/onepage-2568.get.ts` - API สำหรับปี 2568
- `server/api/onepage-unified.get.ts` - API แบบรวม
- `server/config/database.ts` - การตั้งค่าฐานข้อมูล

### Frontend Files
- `pages/onepage-2568.vue` - หน้าหลักปี 2568
- `pages/onepage-2568-test.vue` - หน้าทดสอบ

## การทดสอบ

### ขั้นตอนการทดสอบ
1. รันเซิร์ฟเวอร์: `npm run dev`
2. เปิดหน้า `/onepage-2568-test` เพื่อดู debug info
3. ตรวจสอบ Console log
4. เปรียบเทียบข้อมูลกับหน้า `/onepage-2568`

### สิ่งที่ต้องตรวจสอบ
- [ ] Database config แสดง `DPM_HELP68`
- [ ] Connection successful
- [ ] Query results มีข้อมูล
- [ ] Year field ใน response เป็น `2568`
- [ ] ข้อมูลที่แสดงไม่เหมือนกับปี 2567

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
console.log('Query result:', result);
```

### 3. ตรวจสอบ Database Connection
ทดสอบการเชื่อมต่อฐานข้อมูลโดยตรง:

```typescript
const config = getDbConfig('2568');
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
