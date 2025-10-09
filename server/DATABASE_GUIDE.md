# คู่มือการใช้งาน Dynamic Database

## ภาพรวม

ระบบนี้รองรับการเชื่อมต่อกับหลาย database โดยที่แต่ละ database มีโครงสร้างตารางเหมือนกัน แต่มีข้อมูลคนละชุด เมื่อมี database ใหม่ เพียงแค่เพิ่มชื่อ database เข้าไปใน whitelist และส่งชื่อ database มาจาก frontend ก็สามารถใช้งานได้ทันที ไม่ต้องแก้โค้ด API

## Database ที่รองรับปัจจุบัน

- `DPM_HELP67` (ค่าเริ่มต้น)
- `DPM_HELP68`
- `DPM_HELP68_FLOOD`

## วิธีเพิ่ม Database ใหม่

1. เปิดไฟล์ `server/config/database.ts`
2. เพิ่มชื่อ database เข้าไปใน array `ALLOWED_DATABASES`:

```typescript
const ALLOWED_DATABASES = [
  'DPM_HELP67',
  'DPM_HELP68',
  'DPM_HELP68_FLOOD',
  'DPM_HELP69', // เพิ่ม database ใหม่ที่นี่
];
```

3. บันทึกไฟล์ เท่านี้ก็เสร็จแล้ว!

## การใช้งาน API

### 1. ดึงรายการ Database ที่อนุญาต

```javascript
// GET /api/databases
const response = await fetch('/api/databases');
const data = await response.json();
// Response: {
//   success: true,
//   databases: ['DPM_HELP67', 'DPM_HELP68', 'DPM_HELP68_FLOOD'],
//   count: 3
// }
```

### 2. เรียกใช้ API โดยระบุ database

ทุก API endpoint รองรับ query parameter `database` เพื่อเลือก database ที่ต้องการ:

```javascript
// ตัวอย่าง: ดึงข้อมูล onepage จาก DPM_HELP68
const response = await fetch('/api/onepage-unified?database=DPM_HELP68&phase=1');

// ตัวอย่าง: ดึงข้อมูล province จาก DPM_HELP67
const response = await fetch('/api/province?database=DPM_HELP67');

// ตัวอย่าง: ดึงข้อมูล report จาก DPM_HELP68_FLOOD
const response = await fetch('/api/index?database=DPM_HELP68_FLOOD&pcode=10');
```

### 3. ค่าเริ่มต้นของแต่ละ API

หากไม่ส่ง parameter `database` มา แต่ละ API จะใช้ค่าเริ่มต้นดังนี้:

| API Endpoint | Default Database |
|--------------|------------------|
| `/api/onepage` | `DPM_HELP67` |
| `/api/onepage-2568` | `DPM_HELP68` |
| `/api/onepage-unified` | `DPM_HELP67` |
| `/api/province` | `DPM_HELP67` |
| `/api/index` | `DPM_HELP68` |
| `/api/get-detail` | `DPM_HELP67` |
| `/api/get-last-payment` | `DPM_HELP68` |

## ตัวอย่างการใช้งานใน Frontend

### Vue 3 / Nuxt 3

```vue
<script setup>
import { ref, onMounted } from 'vue'

const selectedDatabase = ref('DPM_HELP68')
const databases = ref([])
const reportData = ref(null)

// ดึงรายการ database ที่อนุญาต
onMounted(async () => {
  const response = await fetch('/api/databases')
  const data = await response.json()
  databases.value = data.databases
})

// ดึงข้อมูล report จาก database ที่เลือก
const fetchReport = async () => {
  const response = await fetch(`/api/onepage-unified?database=${selectedDatabase.value}&phase=1`)
  reportData.value = await response.json()
}
</script>

<template>
  <div>
    <select v-model="selectedDatabase" @change="fetchReport">
      <option v-for="db in databases" :key="db" :value="db">
        {{ db }}
      </option>
    </select>
    
    <div v-if="reportData">
      <h2>Database: {{ reportData.database }}</h2>
      <p>จำนวนคำขอทั้งหมด: {{ reportData.countRequest }}</p>
      <p>โอนเงินสำเร็จ: {{ reportData.allTransfer }}</p>
    </div>
  </div>
</template>
```

## ความปลอดภัย (Security)

### Whitelist System

ระบบใช้ whitelist เพื่อป้องกันการเข้าถึง database ที่ไม่ได้รับอนุญาต:

- เฉพาะ database ที่อยู่ใน `ALLOWED_DATABASES` เท่านั้นที่สามารถเข้าถึงได้
- หากส่งชื่อ database ที่ไม่อยู่ใน whitelist มา จะได้รับ error ทันที
- ป้องกันการโจมตีแบบ SQL Injection และ unauthorized database access

### Connection Pooling

ระบบมี connection pooling แบบ dynamic:

- แต่ละ database จะมี connection pool ของตัวเอง
- Pool จะถูกสร้างครั้งแรกที่มีการเรียกใช้
- Pool จะถูกนำกลับมาใช้ซ้ำในการเรียก API ครั้งต่อไป
- ช่วยเพิ่มประสิทธิภาพและลดภาระของ database server

## Architecture

```
Frontend (Vue/Nuxt)
    ↓
    ├─→ GET /api/databases (ดึงรายการ database)
    │
    ├─→ GET /api/onepage?database=DPM_HELP68
    ├─→ GET /api/province?database=DPM_HELP67
    ├─→ GET /api/index?database=DPM_HELP68_FLOOD
    └─→ ... (API อื่นๆ)
         ↓
    server/config/database.ts
         ├─→ validateDatabaseName() (ตรวจสอบ whitelist)
         ├─→ getDbConfig() (สร้าง config)
         ├─→ createConnection() (สร้าง/ใช้ pool)
         └─→ getPool() (คืน pool ที่มีอยู่)
              ↓
    SQL Server (192.168.213.42)
         ├─→ DPM_HELP67
         ├─→ DPM_HELP68
         ├─→ DPM_HELP68_FLOOD
         └─→ ... (databases อื่นๆ)
```

## ไฟล์ที่เกี่ยวข้อง

- `server/config/database.ts` - Configuration และ connection management
- `server/api/databases.get.ts` - API สำหรับดึงรายการ database
- `server/api/*.get.ts` - API endpoints ทั้งหมดที่รองรับ dynamic database

## การทดสอบ

### ทดสอบดึงรายการ database

```bash
curl http://localhost:3000/api/databases
```

### ทดสอบเรียก API กับ database ต่างๆ

```bash
# DPM_HELP67
curl "http://localhost:3000/api/onepage?database=DPM_HELP67&phase=1"

# DPM_HELP68
curl "http://localhost:3000/api/onepage?database=DPM_HELP68&phase=1"

# DPM_HELP68_FLOOD
curl "http://localhost:3000/api/onepage?database=DPM_HELP68_FLOOD&phase=1"
```

### ทดสอบ validation (ควรได้ error)

```bash
curl "http://localhost:3000/api/onepage?database=INVALID_DB&phase=1"
# Expected: Error message about database not allowed
```

## สรุป

ระบบ dynamic database ช่วยให้:
- ✅ ไม่ต้องแก้โค้ด API เมื่อมี database ใหม่
- ✅ แค่เพิ่มชื่อใน whitelist เท่านั้น
- ✅ Frontend เลือก database ได้ตาม use case
- ✅ มีความปลอดภัยจาก whitelist system
- ✅ มีประสิทธิภาพจาก connection pooling
- ✅ มีการจัดการ error ที่ชัดเจน

หากมีคำถามหรือพบปัญหา กรุณาติดต่อทีมพัฒนา

