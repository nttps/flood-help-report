<template>
  <div class="min-h-screen bg-gray-50 p-4">
    <div class="max-w-full mx-auto">
      <!-- ส่วนหัว -->
      <div class="bg-white rounded-lg shadow-sm p-4 mb-4">
        <h1 class="text-xl font-bold text-center mb-2">
          บัญชีการจัดทำเช็คช่วยเหลือผู้ประสบภัยฉบับนี้และผู้ประสบภัยหน่วยงานในช่วงฤดูฝน ปี 2568
        </h1>
        <p class="text-center text-gray-600 text-sm">ข้อมูลการดำเนินการจัดทำเช็คการช่วยเหลือผู้ประสบภัยได้รับอนุมัติแล้ว</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-20">
        <div class="text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p class="text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p class="text-red-600 mb-4">{{ error }}</p>
        <UButton @click="fetchData" color="red" variant="outline">
          <Icon name="heroicons:arrow-path" />
          ลองอีกครั้ง
        </UButton>
      </div>

      <!-- ตาราง -->
      <div v-else class="bg-white rounded-lg shadow-sm overflow-x-auto">
        <table class="w-full border-collapse text-xs">
          <!-- Header -->
          <thead>
            <!-- แถวที่ 1: ผลกระทบ, ความเสียหาย, และผลการดำเนินงานสะสม -->
            <tr class="bg-blue-100">
              <th colspan="5" class="border border-gray-400 p-2 text-center font-bold bg-blue-100">
                ผลกระทบ
              </th>
              <th rowspan="1" class="border border-gray-400 p-1 text-center font-bold bg-blue-100 min-w-[80px]">
                ความเสียหาย
              </th>
              
              <!-- ผลการดำเนินงานสะสม ณ วันที่ต่างๆ (แต่ละวันมี 2 คอลัมน์) - Dynamic จาก API -->
              <th v-for="(date, index) in dates" :key="`date-${index}`" colspan="2" class="border border-gray-400 p-1 text-center font-bold bg-blue-50 text-xs">
                ผลการดำเนินงานสะสม<br>ณ วันที่ {{ formatDateThai(date) }}
              </th>
            </tr>
            
            <!-- แถวที่ 2: จังหวัด, อำเภอ, ตำบล, หมู่บ้าน, ชุมชน, ครัวเรือน และคีย์ลงระบบ/โอนเงิน -->
            <tr class="bg-blue-50">
              <th class="border border-gray-400 p-1 text-center font-bold min-w-[100px] sticky left-0 bg-blue-50 z-20">
                จังหวัด
              </th>
              <th class="border border-gray-400 p-1 text-center font-bold min-w-[80px] sticky left-[100px] bg-blue-50 z-20">
                อำเภอ/เขต
              </th>
              <th class="border border-gray-400 p-1 text-center font-bold min-w-[60px]">
                ตำบล
              </th>
              <th class="border border-gray-400 p-1 text-center font-bold min-w-[60px]">
                หมู่บ้าน
              </th>
              <th class="border border-gray-400 p-1 text-center font-bold min-w-[60px]">
                ชุมชน
              </th>
              <!-- ความเสียหาย มี rowspan="2" จากแถวบน -->
              <th class="border border-gray-400 p-1 text-center font-bold min-w-[70px]">
                ครัวเรือน
              </th>
              
              <!-- คีย์ลงระบบแล้ว และ โอนเงินเรียบร้อย สำหรับแต่ละวัน (Dynamic) -->
              <template v-for="i in dates.length" :key="`row2-${i}`">
                <th class="border border-gray-400 p-1 text-center font-medium text-xs min-w-[90px]">
                  คีย์ลงระบบแล้ว<br>(ครัวเรือน)
                </th>
                <th class="border border-gray-400 p-1 text-center font-medium text-xs min-w-[90px]">
                  โอนเงินเรียบร้อย<br>(ครัวเรือน)
                </th>
              </template>
            </tr>
          </thead>

          <!-- Body -->
          <tbody>
            <!-- แถวข้อมูลจังหวัด -->
            <tr v-for="(item, index) in mockData" :key="index" :class="item.isTotal ? 'bg-amber-50 font-bold' : 'hover:bg-gray-50'">
              <!-- จังหวัด -->
              <td class="border border-gray-400 p-1 sticky left-0 z-10" 
                  :class="[item.isTotal ? 'bg-amber-50 font-bold' : 'bg-white', { 'font-bold': item.province }]">
                {{ item.province }}
              </td>
              <!-- อำเภอ/เขต -->
              <td class="border border-gray-400 p-1 sticky left-[100px] z-10" 
                  :class="[item.isTotal ? 'bg-amber-50 font-bold' : 'bg-white']">
                {{ item.district }}
              </td>
              <!-- ตำบล -->
              <td class="border border-gray-400 p-1 text-center" :class="{ 'bg-amber-50': item.isTotal }">
                {{ item.subdistrict }}
              </td>
              <!-- หมู่บ้าน -->
              <td class="border border-gray-400 p-1 text-center" :class="{ 'bg-amber-50': item.isTotal }">
                {{ item.village }}
              </td>
              <!-- ชุมชน -->
              <td class="border border-gray-400 p-1 text-center" :class="{ 'bg-amber-50': item.isTotal }">
                {{ item.community }}
              </td>
              <!-- ครัวเรือน (คอลัมน์ที่อยู่ซ้าย) -->
              <td class="border border-gray-400 p-1 text-right" :class="{ 'bg-amber-50': item.isTotal }">
                {{ item.totalHouseholds ? item.totalHouseholds.toLocaleString() : '' }}
              </td>
              
              <!-- ผลการดำเนินงานสะสม ณ วันที่ต่างๆ (Dynamic จากจำนวนวันจริง) -->
              <!-- คีย์ลงระบบแล้ว (ครัวเรือน) และ โอนเงินเรียบร้อย (ครัวเรือน) -->
              <template v-for="dayIndex in dates.length" :key="`day-${dayIndex}`">
                <!-- คีย์ลงระบบแล้ว (ครัวเรือน) -->
                <td class="border border-gray-400 p-1 text-right text-xs" :class="{ 'bg-amber-50': item.isTotal }">
                  {{ item.data[dayIndex - 1]?.keyed > 0 ? item.data[dayIndex - 1].keyed.toLocaleString() : '' }}
                </td>
                <!-- โอนเงินเรียบร้อย (ครัวเรือน) -->
                <td class="border border-gray-400 p-1 text-right text-xs" :class="{ 'bg-amber-50': item.isTotal }">
                  {{ item.data[dayIndex - 1]?.transferred > 0 ? item.data[dayIndex - 1].transferred.toLocaleString() : '' }}
                </td>
              </template>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- ส่วนท้าย -->
      <div class="mt-6 flex justify-between items-center">
        <UButton 
          color="gray" 
          variant="outline" 
          size="lg"
          @click="goBack"
        >
          <Icon name="heroicons:arrow-left" />
          กลับหน้าค้นหา
        </UButton>
        
        <UButton 
          color="primary" 
          size="lg"
        >
          พิมพ์รายงาน
          <Icon name="heroicons:printer" />
        </UButton>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
const router = useRouter()
const route = useRoute()

useSeoMeta({
  title: 'ผลการดำเนินการจัดทำเช็ค'
})

// รับ parameter จาก URL
const database = route.query.database as string || 'DPM_HELP68_FLOOD_PLUS'
const pcode = route.query.pcode as string

// State สำหรับข้อมูล
const mockData = ref<any[]>([])
const dates = ref<string[]>([])
const loading = ref(true)
const error = ref('')

// ฟังก์ชันดึงข้อมูลจาก API
const fetchData = async () => {
  try {
    loading.value = true
    error.value = ''
    
    const queryParams: any = {
      database: database
    }
    
    if (pcode) {
      queryParams.pcode = pcode
    }
    
    const { data, error: fetchError } = await useFetch('/api/processing-summary', {
      query: queryParams
    })
    
    if (fetchError.value) {
      throw new Error(fetchError.value.message)
    }
    
    if (data.value) {
      const response = data.value as any
      dates.value = response.dates || []
      mockData.value = response.data || []
    }
  } catch (err: any) {
    error.value = err.message || 'เกิดข้อผิดพลาดในการดึงข้อมูล'
    console.error('[Frontend Error]:', err)
  } finally {
    loading.value = false
  }
}

// เรียกใช้เมื่อ component mount
onMounted(() => {
  fetchData()
})

// ฟังก์ชันแปลงวันที่เป็นรูปแบบไทย
const formatDateThai = (dateStr: string) => {
  if (!dateStr) return ''
  
  const date = new Date(dateStr)
  const day = date.getDate()
  const month = date.getMonth() + 1 // เดือนเริ่มจาก 0
  const year = date.getFullYear() + 543 // แปลงเป็น พ.ศ.
  
  // แปลงตัวเลขเป็นเลขไทย
  const thaiNumerals = ['๐', '๑', '๒', '๓', '๔', '๕', '๖', '๗', '๘', '๙']
  const thaiDay = day.toString().split('').map(d => thaiNumerals[parseInt(d)]).join('')
  const thaiMonth = month.toString().split('').map(d => thaiNumerals[parseInt(d)]).join('')
  const thaiYear = year.toString().split('').map(d => thaiNumerals[parseInt(d)]).join('')
  
  // ชื่อเดือนย่อ
  const monthNames = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 
                      'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']
  
  return `${thaiDay} ${monthNames[month - 1]} ${thaiYear}`
}

// ฟังก์ชันสร้างข้อมูลเปล่าสำหรับ 13 วัน (1-13 ธ.ค.)
const createEmptyData = () => {
  return Array(13).fill(null).map(() => ({
    keyed: 0,      // คีย์ลงระบบแล้ว (ครัวเรือน)
    transferred: 0  // โอนเงินเรียบร้อย (ครัวเรือน)
  }))
}

// Mock Data สำรอง (ถ้า API ล้มเหลว)
const mockDataBackup = ref([
  // === จังหวัดสิงห์บุรี ===
  { 
    province: 'สิงห์บุรี', 
    district: 'เมืองสิงห์บุรี', 
    subdistrict: '15', 
    village: '120', 
    community: '45',
    totalDamage: 315000000,
    totalHouseholds: 10500,
    isTotal: false, 
    data: [
      { keyed: 10500, transferred: 9500 },
      { keyed: 10500, transferred: 10200 },
      { keyed: 10500, transferred: 10500 },
      ...Array(10).fill(null).map(() => ({ keyed: 10500, transferred: 10500 }))
    ]
  },
  { 
    province: '', 
    district: 'บางระจัน', 
    subdistrict: '12', 
    village: '98', 
    community: '32',
    totalDamage: 246000000,
    totalHouseholds: 8200,
    isTotal: false, 
    data: [
      { keyed: 8200, transferred: 7500 },
      { keyed: 8200, transferred: 8000 },
      { keyed: 8200, transferred: 8200 },
      ...Array(10).fill(null).map(() => ({ keyed: 8200, transferred: 8200 }))
    ]
  },
  { 
    province: '', 
    district: 'พรหมบุรี', 
    subdistrict: '10', 
    village: '75', 
    community: '28',
    totalDamage: 135210000,
    totalHouseholds: 4507,
    isTotal: false, 
    data: [
      { keyed: 4507, transferred: 4000 },
      { keyed: 4507, transferred: 4300 },
      { keyed: 4507, transferred: 4507 },
      ...Array(10).fill(null).map(() => ({ keyed: 4507, transferred: 4507 }))
    ]
  },
  // รวมจังหวัดสิงห์บุรี
  { 
    province: '', 
    district: 'รวม 3 อำเภอ', 
    subdistrict: '45', 
    village: '341', 
    community: '127',
    totalDamage: 696210000,
    totalHouseholds: 23207,
    isTotal: true, 
    data: [
      { keyed: 23207, transferred: 21000 },
      { keyed: 23207, transferred: 22500 },
      { keyed: 23207, transferred: 23207 },
      ...Array(10).fill(null).map(() => ({ keyed: 23207, transferred: 23207 }))
    ]
  },

  // === จังหวัดเพชรบูรณ์ ===
  { 
    province: 'เพชรบูรณ์', 
    district: 'เมืองเพชรบูรณ์', 
    subdistrict: '20', 
    village: '156', 
    community: '67',
    totalDamage: 915000000,
    totalHouseholds: 30500,
    isTotal: false, 
    data: [
      { keyed: 28000, transferred: 25000 },
      { keyed: 30500, transferred: 28000 },
      { keyed: 30500, transferred: 30500 },
      ...Array(10).fill(null).map(() => ({ keyed: 30500, transferred: 30500 }))
    ]
  },
  { 
    province: '', 
    district: 'หล่มสัก', 
    subdistrict: '15', 
    village: '122', 
    community: '54',
    totalDamage: 759000000,
    totalHouseholds: 25300,
    isTotal: false, 
    data: [
      { keyed: 23000, transferred: 20000 },
      { keyed: 25300, transferred: 23500 },
      { keyed: 25300, transferred: 25300 },
      ...Array(10).fill(null).map(() => ({ keyed: 25300, transferred: 25300 }))
    ]
  },
  { 
    province: '', 
    district: 'วิเชียรบุรี', 
    subdistrict: '18', 
    village: '143', 
    community: '62',
    totalDamage: 762000000,
    totalHouseholds: 25400,
    isTotal: false, 
    data: [
      { keyed: 24000, transferred: 22000 },
      { keyed: 25400, transferred: 24500 },
      { keyed: 25400, transferred: 25400 },
      ...Array(10).fill(null).map(() => ({ keyed: 25400, transferred: 25400 }))
    ]
  },
  // รวมจังหวัดเพชรบูรณ์
  { 
    province: '', 
    district: 'รวม 3 อำเภอ', 
    subdistrict: '53', 
    village: '997', 
    community: '543',
    totalDamage: 2436000000,
    totalHouseholds: 81200,
    isTotal: true, 
    data: [
      { keyed: 75000, transferred: 67000 },
      { keyed: 81200, transferred: 76000 },
      { keyed: 81200, transferred: 81200 },
      ...Array(10).fill(null).map(() => ({ keyed: 81200, transferred: 81200 }))
    ]
  },

  // เพิ่มจังหวัดอื่นๆ ตามต้องการ...
])

// ฟังก์ชันกลับไปหน้าค้นหา
const goBack = () => {
  router.push('/processing-summary')
}
</script>

<style scoped>
/* Sticky columns */
.sticky {
  position: sticky;
  z-index: 10;
}

/* ให้ตารางสามารถ scroll ได้แนวนอน */
table {
  min-width: 3000px;
  font-family: 'Sarabun', sans-serif;
}

/* Style สำหรับตาราง */
table thead th {
  background: linear-gradient(to bottom, #dbeafe 0%, #bfdbfe 100%);
  white-space: normal;
  vertical-align: middle;
}

table tbody td {
  white-space: nowrap;
}

/* แถวรวมจังหวัด */
tr.bg-amber-50 {
  background-color: #fffbeb !important;
}

tr.bg-amber-50 td {
  font-weight: 600 !important;
  color: #92400e;
}

/* Hover effect */
tbody tr:not(.bg-amber-50):hover {
  background-color: #f9fafb;
}

/* Print styles */
@media print {
  .no-print {
    display: none;
  }
  
  table {
    page-break-inside: auto;
  }
  
  tr {
    page-break-inside: avoid;
    page-break-after: auto;
  }
}
</style>