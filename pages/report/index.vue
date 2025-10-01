<template>
    <div>

        <div class="py-8" v-if="pending"  ref="table">
            <div class="mt-8 lg:mt-0 print:block lg:flex justify-between px-8 items-center">
                <div class="ml-auto print:ml-0 print:hidden"></div>
                <div >
                    <h3 class="text-center font-bold text-lg lg:text-2xl print:text-lg">สรุปจำนวนผู้ขอรับเงินช่วยเหลือผู้ประสบอันเนื่องมาจากการกระทำของกองกำลังจากนอกประเทศ ปี 2568
                    </h3>
                </div>
                <div  class="print:text-right absolute right-4 top-4 print:fixed print:ml-0 print:right-0 lg:top-0 lg:right-0 lg:relative lg:block lg:ml-auto date-title text-xs lg:text-base">
                    <div class="font-bold">ข้อมูล ณ วันที่</div>
                    <div>{{ formatDateTH(new Date()) }}</div>
                </div>
            </div>
            <div class="max-w-screen-2xl mx-auto mt-8 px-4 rounded-lg">
                <div class="overflow-x-auto print:overflow-visible" >
                    <table class="w-full border border-black" ref="mainTable">
                        <thead class="text-center border border-black">
                            <tr class="bg-zinc-300/70 font-bold border-b-2 border-black">
                                <th class="border border-zinc-700">

                                </th>
                                <th class=" border-zinc-700">
                                    จังหวัด
                                </th>
                                <th class="border border-b-0 border-zinc-700">
                                    ครั้งที่
                                </th>
                                <th class="border border-zinc-700">
                                    วันที่
                                </th>
                                <th class="border border-zinc-700">
                                    จำนวน <br />ก.ช.ก.จ
                                </th>
                                <th class="border border-zinc-700">
                                    ไม่ผ่าน <br />Linkage
                                </th>
                                <th class="border border-zinc-700">
                                    ส่งออมสิน
                                </th>
                                <th class="border border-zinc-700">
                                    วันที่โอนเงิน
                                </th>
                                <th class="border border-zinc-700">
                                    ครั้งที่
                                </th>
                                <th class="border border-zinc-700">
                                    โอนสำเร็จ
                                </th>
                                <th class="border border-zinc-700">
                                    โอนไม่สำเร็จ
                                </th>
                                <th class="border border-zinc-700">
                                    ส่งคืนจังหวัด <br /> ตรวจสอบ
                                </th>
                                <th class="border border-zinc-700">
                                    จังหวัดส่งคืน <br /> ผลตรวจสอบ
                                </th>
                                <th class="border border-zinc-700">
                                    สละสิทธิ์
                                </th>
                                <th class="border border-zinc-700 bg-red-400">
                                    ข้อมูล <br /> คงค้าง
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr class="bg-zinc-200/70 font-semibold">
                                <td class="border-r border-0 border-zinc-500 text-center" rowspan="2">
                                    จังหวัด :
                                </td>
                                <td class="border-r border-zinc-500">

                                </td>
                                <td class="border-r border-zinc-500"></td>
                                <td class="border-r border-zinc-500">

                                </td>
                                <td class="border-r border-t-0 border-zinc-500 text-right">
                                   Sum:
                                </td>
                                <td class="border-r border-t-0 border-zinc-500 text-right">
                                    Sum:
                                </td>
                                <td class="border-r border-t-0 border-zinc-500 text-right">
                                    Sum:
                                </td>
                                <td class="border-r border-zinc-500 text-right" colspan="2">
                                    Count (Unique):
                                </td>
                                <td class="border-r border-zinc-500 text-right"> 
                                    Sum:
                                </td>
                                <td class="border-r border-zinc-500 text-right">
                                    Sum:
                                </td>
                                <td class="border-r border-zinc-500 text-right">
                                    Sum:
                                </td>
                                <td class="border-r border-zinc-500 text-right">
                                    Sum:
                                </td>
                                <td class="border-r border-zinc-500 text-right">
                                    Sum:
                                </td>
                                <td class="border border-b-0 border-zinc-500 text-right">
                                    Sum:
                                </td>
                            </tr>
                            <tr class="bg-zinc-200/70 font-semibold">
                              
                                <td class="border-r border-zinc-500">

                                </td>
                                <td class="border-r border-zinc-500"></td>
                                <td class="border-r border-zinc-500">

                                </td>
                                <td class="border-r border-b-2  border-zinc-500 text-right">
                                    {{ dataHead.reduce((total, current) => total + current.person_qty, 0).toLocaleString() }}
                                </td>
                                <td class="border-r border-b-2  border-zinc-500 text-right">
                                    {{ dataHead.reduce((total, current) => total + current.failed_linkage, 0).toLocaleString() }}
                                </td>
                                <td class="border-r border-b-2  border-zinc-500 text-right">
                                    {{ dataHead.reduce((total, current) => total + current.send_bank, 0).toLocaleString() }}
                                </td>
                                <td class="border-r border-b-2 border-zinc-500 text-right" colspan="2">
                                    {{ dataHead.reduce((total, current) => total + current.count_payment_date, 0).toLocaleString() }}
                                </td>
                                <td class="border-r border-b-2 border-zinc-500 text-right"> 
                                    {{ dataHead.reduce((total, current) => total + current.successful_payments, 0).toLocaleString() }}
                                </td>
                                <td class="border-r border-b-2 border-zinc-500 text-right">
                                    {{ dataHead.reduce((total, region) => {
                                    const subTotal = region.sub.filter(i => i.status_confirm == 'ยืนยันแล้ว').reduce((subTotal, item) => subTotal + item.unsuccessful_payments, 0);
                                    return total + subTotal;
                                    }, 0).toLocaleString() }}
                                </td>
                                <td class="border-r border-b-2 border-zinc-500 text-right">
                                    {{ dataHead.reduce((total, region) => {
                                    const subTotal = region.sub.filter(i => i.status_confirm == 'ยืนยันแล้ว').reduce((subTotal, item) => subTotal + item.count_back_to_province, 0);
                                    return total + subTotal;
                                    }, 0).toLocaleString() }}
                                </td>
                                <td class="border-r border-b-2 border-zinc-500 text-right">
                                {{ dataHead.reduce((total, region) => {
                                    const subTotal = region.sub.filter(i => i.status_confirm == 'ยืนยันแล้ว').reduce((subTotal, item) => subTotal + item.send_from_province, 0);
                                    return total + subTotal;
                                    }, 0).toLocaleString() }}
                                </td>
                                
                                <td class="border-r border-b-2 border-zinc-500 text-right">
                                    0
                                </td>
                                <td class="border-r border-b-2 border-zinc-500 text-right">
                                    {{ dataHead.reduce((total, region) => {
                                    const subTotal = region.sub.filter(i => i.status_confirm == 'ยืนยันแล้ว').reduce((subTotal, item) => subTotal + item.outstanding, 0);
                                    return total + subTotal;
                                    }, 0).toLocaleString() }}
                                </td>
                            </tr>
                            <template v-for="(head, index) in dataHead" :key="head.p_no" >
                                <tr class="bg-zinc-100 font-bold">
                                    <td class="border border-t-0 border-zinc-500" colspan="2">
                                        <button @click="toggleSub(index)" class="flex items-center space-x-2">
                                            <UIcon :name="head.showSub ? 'i-mdi-chevron-down' : 'i-mdi-chevron-up'" />
                                            <span class="text-sm">{{ head.p_name }}</span>
                                        </button>

                                    </td>
                                    <td class="border border-t-0 border-zinc-500 text-right">

                                    </td>
                                    <td class="border border-t-0 border-zinc-500"></td>
                                    <td class="border border-t-0 border-zinc-500 text-right">
                                        {{ head.person_qty.toLocaleString() }}
                                    </td>
                                    <td class="border border-t-0 border-zinc-500 text-right">
                                        {{ head.failed_linkage.toLocaleString() }}
                                    </td>
                                    <td class="border border-t-0 border-zinc-500 text-right">
                                        {{ (head.send_bank).toLocaleString() }} 
                                    </td>
                                    <td class="border border-t-0 border-zinc-500"></td>
                                    <td class="border border-t-0 border-zinc-500 text-right">
                                        {{ head.count_payment_date.toLocaleString() }} 
                                    </td>
                                    <td class="border border-t-0 border-zinc-500 text-right">
                                        {{ head.sub.reduce((total, current) => total + current.successful_payments, 0).toLocaleString() }} 
                                    </td>
                                    <td class="border border-t-0 border-zinc-500 text-right">
                                        {{ head.sub.filter(i => i.status_confirm == 'ยืนยันแล้ว').reduce((total, current) => total + current.unsuccessful_payments, 0).toLocaleString() }} 
                                    </td>
                                    <td class="border border-t-0 border-zinc-500 text-right" >
                                        {{ head.sub.filter(i => i.status_confirm == 'ยืนยันแล้ว').reduce((total, current) => total + current.count_back_to_province, 0).toLocaleString() }}
                                        
                                    </td>
                                    <td class="border border-t-0 border-zinc-500 text-right">
                                        {{ head.sub.filter(i => i.status_confirm == 'ยืนยันแล้ว').reduce((total, current) => total + current.send_from_province, 0).toLocaleString() }}
                                    </td>
                                    <td class="border border-t-0 border-zinc-500 text-right">
                                        {{ head.retreat.toLocaleString() }}
                                    </td>
                                    <td class="border border-t-0 border-zinc-500 text-right">
                                        {{ head.sub.filter(i => i.status_confirm == 'ยืนยันแล้ว').reduce((total, current) => total + current.outstanding, 0).toLocaleString() }}
                                    </td>
                                </tr>

                                <template v-if="head.showSub">
                                    <template v-for="(sub, subIndex) in head.sub" :key="sub.sub_id">
                                        <tr class="bg-zinc-100/70" :class="{ 'border-b-2 border-black': subIndex == head.sub.length -1 }">
                                            <td class="border border-zinc-500">

                                            </td>
                                            <td class="border border-zinc-500 font-bold">
                                                {{ sub.p_name }}
                                            </td>
                                            <td class="border bg-white border-zinc-500 text-center">
                                                {{ sub.commit_no }}
                                            </td>
                                            <td class="border bg-white border-zinc-500 text-right">
                                                {{ formatDateTH(sub.commit_date) }}
                                            </td>
                                            <td class="border bg-white border-zinc-500 text-right">
                                                {{ sub.person_qty.toLocaleString() }}
                                            </td>
                                            <td class="border bg-white border-zinc-500 text-right">
                                                {{ sub.failed_linkage.toLocaleString() }}
                                            </td>
                                            <td class="border bg-white border-zinc-500 text-right">
                                                {{ (sub.send_bank).toLocaleString() }} 
                                            </td>
                                            <td class="border bg-white border-zinc-500 text-right">
                                                {{ sub.latest_payment_date ? formatDateTH(sub.latest_payment_date) : '' }}
                                            </td>
                                            <td class="border bg-white border-zinc-500 text-right">
                                                {{ sub.payment_sequence.toLocaleString() }}
                                            </td>
                                            <td class="border bg-white border-zinc-500 text-right text-blue-500">
                                                {{ sub.successful_payments.toLocaleString() }}
                                            </td>
                                            <td class="border bg-white border-zinc-500 text-right">
                                                {{ sub.status_confirm == 'ยืนยันแล้ว' ? sub.unsuccessful_payments.toLocaleString() : 0 }} 
                                            </td>
                                            <td class="border bg-white border-zinc-500 text-right" :class="{ 'text-red-600': sub.status_confirm == 'ยืนยันแล้ว' && sub.count_back_to_province > 0}">
                                                {{ sub.status_confirm == 'ยืนยันแล้ว' ? sub.count_back_to_province.toLocaleString() : 0 }}

                                            </td>
                                            <td class="border bg-white border-zinc-500 text-right " :class="{ 'text-red-600': sub.send_from_province > 0}">
                                                {{ sub.send_from_province.toLocaleString() }}
                                            </td>
                                            <td class="border bg-white border-zinc-500 text-right">
                                                {{ sub.retreat.toLocaleString() }}
                                            </td>
                                            <td class="border border-zinc-500 text-right" :class="{ 'bg-red-400': sub.status_confirm == 'ยืนยันแล้ว' && sub.outstanding > 0, 'bg-[#90db92]': sub.status_confirm == 'ยืนยันแล้ว' &&  sub.outstanding == 0}">
                                                {{ sub.status_confirm == 'ยืนยันแล้ว' ? sub.outstanding.toLocaleString() : 0 }}
                                            </td>
                                        </tr>
                                    </template>
                                </template>
                            </template>
                            <tr v-if="dataHead.length == 0">
                                <td colspan="19" class="border border-zinc-500">
                                    ไม่พบข้อมูล
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
        <div v-else class="min-h-screen flex items-center justify-center">
            <h3 class="text-center font-bold text-[50px]">กำลังประมวลผล...</h3>
        </div>
        
        <NuxtLoadingIndicator />
        <div class="text-center print:hidden">
            <UButton @click="downloadBreakPDF" label="ปริ้น" class="mr-4" />
            <UButton label="กลับ" to="/summary" />
        </div>
    </div>
</template>


<script setup lang="ts">
  import {
      format
  } from 'date-fns'
  import "@fontsource/sarabun"; // Import the Google Font
  import { th } from "date-fns/locale";
  useSeoMeta({
    title: 'สรุปจำนวนผู้ขอรับเงินช่วยเหลือผู้ประสบอันเนื่องมาจากการกระทำของกองกำลังจากนอกประเทศ ปี 2568'
  })
  const route = useRoute()

  // Helper function to format date with Buddhist Era year
  const formatDateTH = (date: Date | string, formatString: string = 'dd MMM yyyy') => {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    const formatted = format(dateObj, formatString, { locale: th })
    const buddhistYear = dateObj.getFullYear() + 543
    return formatted.replace(dateObj.getFullYear().toString(), buddhistYear.toString())
  }

  interface Sub {
      sub_id: number;
      subField: string;
      anotherSubField: string;
  }

  interface Head {
      p_no: number;
      anotherField: string;
      sub: Sub[];
      showSub: boolean;
  }

  const dataHead = ref < Head[] > ([])
  const pending = ref(false)
  const table = ref()
  const isMobile = ref(false)
  const mainTable = ref()

  const checkMobile = () => {
    isMobile.value = window.innerWidth <= 768; // กำหนดค่าตามขนาดหน้าจอที่คุณต้องการ
  }

  const downloadBreakPDF = () => {
    generatePDF(dataHead.value)
  };


  onMounted(() => {
      checkMobile()
      window.addEventListener('resize', checkMobile);
      query()
  })
  
  const query = async () => {
      const res = await $fetch(`/api/?phase=${route.query.phase}&${route.query.paymentDateStart ? '' : `startDate=${route.query?.startDate}&endDate=${route.query?.endDate}&`}${route.query.pcode ? `pcode=${route.query.pcode}`: ''}${route.query.paymentDateStart ? `&paymentDateStart=${route.query.paymentDateStart}`: ''}${route.query.paymentDateStart ? `&paymentDateEnd=${route.query.paymentDateEnd}`: ''}`)
      dataHead.value = res ?? []
      pending.value = true
  }

  const toggleSub = (index: number) => {
      // เปลี่ยนสถานะการแสดงหรือซ่อนของ Sub
      dataHead.value[index].showSub = !dataHead.value[index].showSub;
  }
  onMounted(() => {
  // ตั้งค่าก่อนพิมพ์
      window.onbeforeprint = function () {
          document.body.style.transform = 'scale(0.75)'; // ลดขนาดเป็น 90%
          document.body.style.transformOrigin = 'top left'; // ตั้งต้นการปรับขนาด
      };

      // คืนค่าหลังจากพิมพ์เสร็จ
      window.onafterprint = function () {
          document.body.style.transform = ''; // คืนค่าเป็นปกติ
      };
  });

  onBeforeUnmount(() => {
      // ล้างฟังก์ชันเมื่อ component ถูกถอดออก
      window.onbeforeprint = null;
      window.onafterprint = null;
  });

  onUnmounted(() => {
      window.addEventListener('resize', checkMobile);
  })
</script>

<style>

    .timestamp {
        display: none; /* ซ่อนไว้เมื่อแสดงผลบนหน้าจอ */
    }


    table {
        border-collapse: collapse;
    }
    table tr td, table tr th {
        @apply p-2 whitespace-nowrap;
        font-size: 14px;
    }

    
    @media print {

        .timestamp {
            display: block;
            position: fixed; /* ใช้ fixed เพื่อให้ยึดตำแหน่งบนหน้ากระดาษ */
            top: 0;
            right: 0; /* กำหนดให้ชิดขวาสุด */
            margin-right: 0.5cm; /* เพิ่มระยะห่างเล็กน้อยจากขอบ */
            font-size: 12px;
            padding: 10px;
            background-color: #fff; /* ใส่พื้นหลังสีขาวเพื่อให้ timestamp ชัดเจน */
            z-index: 1000;
        }

        .date-title {
            @apply fixed right-4 top-4;
        }

        tr {
            page-break-inside: avoid; /* หลีกเลี่ยงการแบ่งแถวระหว่างหน้า */
        }

        thead {
            display: table-header-group; /* ทำให้หัวตารางปรากฏในทุกหน้า */
        }

        tfoot {
            display: table-footer-group; /* ทำให้ส่วนท้ายตารางปรากฏในทุกหน้า (ถ้ามี) */
        }
        body {
            -webkit-print-color-adjust: exact; /* Ensure colors are printed */
            margin: 0 !important;
        }
        table {
            border: 1px solid black; /* Ensures the table is visible */
            page-break-inside: auto; /* Avoid page breaks inside rows */
            table-layout: auto; /* บังคับให้เซลล์มีขนาดเท่ากัน */
            border-collapse: collapse; /* ใช้ขอบรวมกัน */
            box-shadow: none; /* ลบเงาของตาราง */
        }

        th {
            position: sticky;
            top: 0; /* Stick header to the top */
            z-index: 1; /* Ensure header is above other content */
        }
        th, td {
            padding: 0;
        }

        /* Landscape orientation */
        @page {
            size: A4 ; /* Set to portrait */
            margin: 1cm; /* Set margins for print */
        }
    }
</style>