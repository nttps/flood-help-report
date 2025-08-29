# Database API Configuration

## การปรับปรุงโครงสร้างฐานข้อมูล

### ปัญหาที่พบ
- มีไฟล์ API หลายไฟล์ที่ใช้ฐานข้อมูลต่างกัน (`DPM_HELP67` และ `DPM_HELP68`)
- การจัดการ connection แยกกันทำให้ยากต่อการบำรุงรักษา

### วิธีแก้ไข

#### 1. ไฟล์ Config ใหม่
สร้างไฟล์ `server/config/database.ts` เพื่อจัดการการเชื่อมต่อฐานข้อมูลแบบรวมศูนย์

#### 2. API Endpoints ที่ปรับปรุงแล้ว

##### `/api/onepage.get.ts` (สำหรับปี 2567)
- ใช้ฐานข้อมูล `DPM_HELP67` เป็นค่าเริ่มต้น
- URL: `/api/onepage?phase=1`

##### `/api/onepage-2568.get.ts` (สำหรับปี 2568)
- ใช้ฐานข้อมูล `DPM_HELP68`
- URL: `/api/onepage-2568?phase=1`

##### `/api/onepage-unified.get.ts` (API ใหม่แบบรวม)
- สามารถเลือกฐานข้อมูลได้ตามพารามิเตอร์ `year`
- URL: `/api/onepage-unified?phase=1&year=2568`
- URL: `/api/onepage-unified?phase=1&year=2567` (หรือไม่ใส่ year)

### การใช้งาน

#### วิธีที่ 1: ใช้ API แยก (แนะนำสำหรับการใช้งานปัจจุบัน)
```javascript
// สำหรับปี 2567
fetch('/api/onepage?phase=1')

// สำหรับปี 2568
fetch('/api/onepage-2568?phase=1')
```

#### วิธีที่ 2: ใช้ API แบบรวม (แนะนำสำหรับการพัฒนาต่อ)
```javascript
// สำหรับปี 2567
fetch('/api/onepage-unified?phase=1')

// สำหรับปี 2568
fetch('/api/onepage-unified?phase=1&year=2568')
```

### ข้อดีของการปรับปรุง
1. **ลดการซ้ำซ้อน**: ไม่ต้องเขียน config ซ้ำในหลายไฟล์
2. **ง่ายต่อการบำรุงรักษา**: แก้ไข config ที่เดียว
3. **ความยืดหยุ่น**: สามารถเพิ่มปีใหม่ได้ง่าย
4. **ความชัดเจน**: รู้ชัดเจนว่าแต่ละ API ใช้ฐานข้อมูลไหน

### การเพิ่มปีใหม่
หากต้องการเพิ่มปีใหม่ (เช่น 2569) ให้แก้ไขไฟล์ `server/config/database.ts`:

```typescript
export const dbConfig69 = {
  user: 'dalert',
  password: '@min#DSS',
  database: 'DPM_HELP69',
  server: '192.168.213.42',
  port: 1433,
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
  connectionTimeout: 300000,
  requestTimeout: 300000,
};

export const getDbConfig = (year?: string) => {
  if (year === '2569') {
    return dbConfig69;
  }
  if (year === '2568') {
    return dbConfig68;
  }
  return dbConfig67; // Default to 2567
};
```
