<template>
    <div>

        <div class="py-8" v-if="pending"  ref="table">
            <div class="mt-8 lg:mt-0 print:block lg:flex justify-between px-8 items-center">
                <div class="ml-auto print:ml-0 print:hidden"></div>
                <div >
                    <h3 class="text-center font-bold text-lg lg:text-2xl print:text-lg">สรุปจำนวนผู้ขอรับเงินช่วยเหลือผู้ประสบอุทกภัยในช่วงฤดูฝน ปี 2567
                        ตามมติ
                        ครม.
                    </h3>
                </div>
                <div  class="print:text-right absolute right-4 top-4 print:fixed print:ml-0 print:right-0 lg:top-0 lg:right-0 lg:relative lg:block lg:ml-auto date-title text-xs lg:text-base">
                    <div class="font-bold">ข้อมูล ณ วันที่</div>
                    <div>{{ format(new Date(), 'dd MMM yyyy') }}</div>
                </div>
            </div>
           
            <div class="max-w-screen-2xl mx-auto mt-8 px-4 rounded-lg">
                <div class="overflow-x-auto print:overflow-visible" >
                    <table class="w-full border border-black" ref="mainTable">
                        
                        <thead class="text-center border border-black">
                            <tr class="bg-zinc-300/70 font-bold border-b-2 border-black">
                                <th class="border border-zinc-700">

                                </th>
                                <th class="border border-zinc-700">
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
                                    ครั้ง <br />ที่
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
                                <td class="border border-b-0 border-t-0 border-zinc-500">
                                    จังหวัด :
                                </td>
                                <td class="border border-b-0 border-t-0 border-zinc-500">

                                </td>
                                <td class="border border-b-0 border-zinc-500"></td>
                                <td class="border border-b-0 border-zinc-500">

                                </td>
                                <td class="border border-b-0 border-t-0 border-zinc-500 text-right">
                                   Sum:
                                </td>
                                <td class="border border-b-0 border-t-0 border-zinc-500 text-right">
                                    Sum:
                                </td>
                                <td class="border border-b-0 border-t-0 border-zinc-500 text-right">
                                    Sum:
                                </td>
                                <td class="border border-b-0 border-zinc-500 text-right" colspan="2">
                                    Count (Unique):
                                </td>
                                <td class="border border-b-0 border-zinc-500 text-right"> 
                                    Sum:
                                </td>
                                <td class="border border-b-0 border-zinc-500 text-right">
                                    Sum:
                                </td>
                                <td class="border border-b-0 border-zinc-500 text-right">
                                    Sum:
                                </td>
                                <td class="border border-b-0 border-zinc-500 text-right">
                                    Sum:
                                </td>
                                <td class="border border-b-0 border-zinc-500 text-right">
                                    Sum:
                                </td>
                                <td class="border border-b-0 border-zinc-500 text-right">
                                    Sum:
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
                                        {{ (head.person_qty - head.failed_linkage).toLocaleString() }}  
                                    </td>
                                    <td class="border border-t-0 border-zinc-500"></td>
                                    <td class="border border-t-0 border-zinc-500 text-right">
                                        {{ head.count_payment_date.toLocaleString() }} 
                                    </td>
                                    <td class="border border-t-0 border-zinc-500 text-right">
                                        {{ head.successful_payments.toLocaleString() }} 
                                    </td>
                                    <td class="border border-t-0 border-zinc-500 text-right">
                                        {{ ((head.person_qty - head.failed_linkage) - head.successful_payments).toLocaleString() }}
                                    </td>
                                    <td class="border border-t-0 border-zinc-500 text-right" >
                                        {{ (head.failed_linkage + (head.person_qty - head.failed_linkage - head.successful_payments)).toLocaleString() }}
                                    </td>
                                    <td class="border border-t-0 border-zinc-500 text-right">
                                        {{ head.send_from_province.toLocaleString() }}
                                    </td>
                                    <td class="border border-t-0 border-zinc-500 text-right">
                                        {{ head.retreat.toLocaleString() }}
                                    </td>
                                    <td class="border border-t-0 border-zinc-500 text-right">
                                        {{ head.outstanding.toLocaleString() }}
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
                                                {{ format(sub.commit_date, 'dd MMM yyyy') }}
                                            </td>
                                            <td class="border bg-white border-zinc-500 text-right">
                                                {{ sub.person_qty.toLocaleString() }}
                                            </td>
                                            <td class="border bg-white border-zinc-500 text-right">
                                                {{ sub.failed_linkage.toLocaleString() }}
                                            </td>
                                            <td class="border bg-white border-zinc-500 text-right">
                                                {{  (sub.person_qty - sub.failed_linkage).toLocaleString() }}
                                            </td>
                                            <td class="border bg-white border-zinc-500">
                                                {{ sub.latest_payment_date ? format(sub.latest_payment_date, 'dd MMM yyyy') : '' }}
                                            </td>
                                            <td class="border bg-white border-zinc-500 text-right">
                                                {{ sub.payment_sequence.toLocaleString() }}
                                            </td>
                                            <td class="border bg-white border-zinc-500 text-right text-blue-500">
                                                {{ sub.successful_payments.toLocaleString() }}
                                            </td>
                                            <td class="border bg-white border-zinc-500 text-right">
                                                {{ ((sub.person_qty - sub.failed_linkage) - sub.successful_payments).toLocaleString() }}
                                            </td>
                                            <td class="border bg-white border-zinc-500 text-right" :class="{ 'text-red-600':  (sub.failed_linkage + (sub.person_qty - sub.failed_linkage - sub.successful_payments)) > 0}">
                     
                                                {{ (sub.failed_linkage + (sub.person_qty - sub.failed_linkage - sub.successful_payments)).toLocaleString() }}
                                            </td>
                                            <td class="border bg-white border-zinc-500 text-right " :class="{ 'text-red-600': sub.send_from_province > 0}">
                                                {{ sub.outstanding == 0 ? sub.send_from_province.toLocaleString() : 0 }}
                                                
                                            </td>
                                            <td class="border bg-white border-zinc-500 text-right">
                                                {{ sub.retreat.toLocaleString() }}
                                            </td>
                                            <td class="border border-zinc-500 text-right" :class="{ 'bg-red-400': sub.outstanding > 0, 'bg-[#90db92]': sub.outstanding == 0}">
                                                {{ sub.outstanding.toLocaleString() }}
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
            <UButton @click="downloadPDF" label="ปริ้น" class="mr-4" />
            <UButton label="กลับ" to="/" />
        </div>
    </div>
</template>


<script setup lang="ts">
    import {
        format
    } from 'date-fns'
    import jsPDF from 'jspdf';
    import html2canvas from 'html2canvas';
    import "@fontsource/sarabun"; // Import the Google Font
    import {pdfFonts} from '~/assets/fonts/vfs_fonts.js'

    const route = useRoute()
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


    const downloadPDF = () => {

        const title = "สรุปจำนวนผู้ขอรับเงินช่วยเหลือผู้ประสบอุทกภัยในช่วงฤดูฝน ปี 2567 ตามมติ ครม."; // Define your title
        const timestamp = format(new Date(), 'dd MMM yyyy') ; // Get the current timestamp

        if(isMobile.value) {
            html2canvas(mainTable.value).then((canvas) => {
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF('p', 'mm', 'a4');

                // Define margins
                const marginTop = 15;    // Top margin
                const marginBottom = 15; // Bottom margin
                const marginLeft = 10;   // Left margin
                const marginRight = 10;  // Right margin
                const titleFontSize = 16; // Font size for title
                const timestampFontSize = 10; // Font size for timestamp

                // Calculate page dimensions
                const pageWidth = pdf.internal.pageSize.getWidth() - marginLeft - marginRight;
                const pageHeight = pdf.internal.pageSize.getHeight() - marginTop - marginBottom;

                // Calculate image dimensions
                const imgWidth = canvas.width;
                const imgHeight = canvas.height;
                const ratio = Math.min(pageWidth / imgWidth, pageHeight / imgHeight);

                // Positioning for image
                const x = marginLeft; // Left margin
                const y = marginTop + 20; // Top margin plus space for title

                // Set the font to Sarabun
                pdf.addFileToVFS("Sarabun-Regular.ttf", pdfFonts['THSarabunNew Bold.ttf']);
                pdf.addFont("Sarabun-Regular.ttf", "Sarabun", "normal");
                pdf.setFont("Sarabun");


                 // Calculate the title's position to center it
                const titleWidth = pdf.getStringUnitWidth(title) * titleFontSize / pdf.internal.scaleFactor; 
                const titleX = (pdf.internal.pageSize.getWidth() - titleWidth) / 2; // Center title horizontally
               

                // Add title
                pdf.setFontSize(titleFontSize); // Set font size for title
                pdf.text(title, titleX, marginTop + 10); // Position title
                // Add timestamp
                pdf.setFontSize(timestampFontSize); // Set font size for timestamp
                  // Calculate the timestamp's position to align it to the right
                const timestampWidth = pdf.getStringUnitWidth(`ข้อมูล ณ วันที่: ${timestamp}`) * timestampFontSize / pdf.internal.scaleFactor;
                const timestampX = pageWidth - timestampWidth - marginLeft + 20; // Right-align timestamp
                pdf.text(`ข้อมูล ณ วันที่: ${timestamp}`, timestampX, marginTop); // Position timestamp

                // Add image
                pdf.addImage(imgData, 'PNG', x, y - 5, imgWidth * ratio, imgHeight * ratio);
                pdf.save('สรุปจำนวนผู้ขอรับเงินช่วยเหลือผู้ประสบอุทกภัยในช่วงฤดูฝน ปี 2567 ตามมติ ครม..pdf');
            });
               
        }else{
            html2canvas(table.value, { scale: 4 }).then((canvas) => {
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF('p', 'mm', 'a4');
                const pageWidth = pdf.internal.pageSize.getWidth();
                const pageHeight = pdf.internal.pageSize.getHeight();
                const imgWidth = canvas.width;
                const imgHeight = canvas.height;
                const ratio = Math.min(pageWidth / imgWidth, pageHeight / imgHeight);
                
                pdf.addImage(imgData, 'PNG', 0, 0, imgWidth * ratio, imgHeight * ratio);
                pdf.save('สรุปจำนวนผู้ขอรับเงินช่วยเหลือผู้ประสบอุทกภัยในช่วงฤดูฝน ปี 2567 ตามมติ ครม..pdf');
            });
        }

       
    }

    onMounted(() => {
        checkMobile()
        window.addEventListener('resize', checkMobile);
        query()
    })
    
    const query = async () => {
        const res = await $fetch(`/api/?startDate=${route.query?.startDate}&endDate=${route.query?.endDate}${route.query.pcode ? `&pcode=${route.query.pcode}`: ''}`)
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