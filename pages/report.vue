<template>
    <div>
        <div class="py-8" v-if="pending"  ref="table">
            <div class="flex px-8 items-end">
                <div class="ml-auto print:ml-0"></div>
                <div>
                    <h3 class="text-center font-bold text-2xl print:text-lg">สรุปจำนวนผู้ขอรับเงินช่วยเหลือผู้ประสบอุทกภัยในช่วงฤดูฝน ปี 2567
                        ตามมติ
                        ครม.
                    </h3>
                </div>
                <div  class="ml-auto date-title">
                    <div class="font-bold">ข้อมูล ณ วันที่</div>
                    <div>{{ format(new Date(), 'dd MMM yyyy') }}</div>
                </div>
            </div>
            <div class="max-w-screen-2xl mx-auto mt-8">
                <table class="w-full">
                    <thead class="text-center">
                        <tr class="bg-zinc-500/70 font-bold border-b-2 border-black">
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
                                ส่ง ปค.
                            </th>
                            <th class="border border-zinc-700">
                                ไม่ผ่าน <br />Linkage
                            </th>
                            <th class="border border-zinc-700">

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
                        <tr class="bg-zinc-400/70 font-semibold">
                            <td class="border border-b-0 border-t-0 border-zinc-500">
                                จังหวัด :
                            </td>
                            <td class="border border-b-0 border-t-0 border-zinc-500">

                            </td>
                            <td class="border border-b-0 border-zinc-500"></td>
                            <td class="border border-b-0 border-zinc-500">

                            </td>
                            <td class="border border-b-0 border-zinc-500 text-right">
                                Sum:
                            </td>
                            <td class="border border-b-0 border-t-0 border-zinc-500 text-right">
                                Count:
                            </td>
                            <td class="border border-b-0 border-t-0 border-zinc-500 text-right">
                                Sum:
                            </td>
                            <td class="border border-b-0 border-t-0 border-zinc-500 text-right">
                                Count:
                            </td>
                            <td class="border border-b-0 border-zinc-500 text-right">
                                Sum:
                            </td>
                            <td class="border border-b-0 border-zinc-500 text-right" colspan="2">
                                Count (Unique):
                            </td>
                            <td class="border border-b-0 border-zinc-500"></td>
                            <td class="border border-b-0 border-zinc-500"></td>
                            <td class="border border-b-0 border-zinc-500 text-right">
                                Sum:
                            </td>
                            <td class="border border-b-0 border-zinc-500 text-right">
                                Sum:
                            </td>
                            <td class="border border-b-0 border-zinc-500 p-2"></td>
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
                        <template v-for="(head, index) in dataHead" :key="head.p_no">
                            <tr class="bg-zinc-400/70 font-bold">
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
                                    {{ head.sub.length }}
                                </td>
                                <td class="border border-t-0 border-zinc-500 text-right">
                                    {{ head.failed_linkage.toLocaleString() }}
                                </td>
                                <td class="border border-t-0 border-zinc-500 text-right">
                                    {{ head.sub.length }}
                                </td>
                                <td class="border border-t-0 border-zinc-500 text-right">
                                    {{ head.send_bank.toLocaleString()}}
                                </td>
                                <td class="border border-t-0 border-zinc-500"></td>

                                <td class="border border-t-0 border-zinc-500 text-right">
                                    {{ head.sub.length.toLocaleString() }}
                                </td>
                                <td class="border border-t-0 border-zinc-500">

                                </td>
                                <td class="border border-t-0 border-zinc-500 text-right">
                                    {{ head.successful_payments.toLocaleString() }}
                                </td>
                                <td class="border border-t-0 border-zinc-500 text-right">
                                    {{ head.unsuccessful_payments.toLocaleString() }}
                                </td>
                                <td class="border border-t-0 border-zinc-500 text-right" >
                                    {{ head.count_back_to_province.toLocaleString() }}
                                </td>
                                <td class="border border-t-0 border-zinc-500">

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
                                <template v-for="sub in head.sub" :key="sub.sub_id">
                                    <tr class="bg-zinc-400/70 last:border--b-2 last:border-black">
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
                                        <td class="border bg-lime-200 border-zinc-500 ">
                                            <UCheckbox class="justify-center" color="gray" disabled
                                                v-bind:model-value="true" />
                                        </td>
                                        <td class="border bg-white border-zinc-500 text-right">
                                            {{ sub.failed_linkage.toLocaleString() }}
                                        </td>
                                        <td class="border bg-lime-200 border-zinc-500">
                                            <UCheckbox class="justify-center" color="gray" disabled
                                                v-bind:model-value="true" />
                                        </td>
                                        <td class="border bg-white border-zinc-500 text-right">
                                            {{ sub.send_bank.toLocaleString() }}
                                        </td>
                                        <td class="border bg-white border-zinc-500">
                                            {{ sub.latest_payment_date ? format(sub.latest_payment_date, 'dd MMM yyyy') : '' }}
                                        </td>
                                        <td class="border bg-white border-zinc-500 text-right">
                                            {{ sub.send.toLocaleString() }}
                                        </td>
                                        <td class="border bg-lime-200 border-zinc-500">
                                            <UCheckbox class="justify-center" color="gray" disabled
                                                v-bind:model-value="true" />
                                        </td>
                                        <td class="border bg-white border-zinc-500 text-right text-blue-500">
                                            {{ sub.successful_payments.toLocaleString() }}
                                        </td>
                                        <td class="border bg-white border-zinc-500 text-right">
                                            {{ sub.unsuccessful_payments.toLocaleString() }}
                                        </td>
                                        <td class="border bg-white border-zinc-500 text-right" :class="{ 'text-red-600': sub.count_back_to_province > 0}">
                                            {{ sub.count_back_to_province.toLocaleString() }}
                                        </td>
                                        <td class="border bg-sky-300 border-zinc-500 text-right">
                                            <UCheckbox class="justify-center" color="gray" disabled
                                                v-bind:model-value="true" />
                                        </td>
                                        <td class="border bg-white border-zinc-500 text-right " :class="{ 'text-red-600': sub.send_from_province > 0}">
                                            {{ sub.send_from_province.toLocaleString() }}
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
                    </tbody>
                </table>
            </div>

        </div>
        <div v-else class="min-h-screen flex items-center justify-center">
            <h3 class="text-center font-bold text-[50px]">กำลังประมวลผล...</h3>
        </div>
        
        <NuxtLoadingIndicator />
        <div class="text-center print:hidden">
            <!-- <UButton @click="downloadPDF" /> -->
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

    const downloadPDF = () => {
      html2canvas(table.value, { scale: 4 }).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const ratio = Math.min(pageWidth / imgWidth, pageHeight / imgHeight);
     
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth * ratio, imgHeight * ratio);
        pdf.save('table.pdf');
      });
    }

    onMounted(() => {
        query()
    })
    
    const query = async () => {
        const res = await $fetch(`/api/?startDate=${route.query.startDate}&endDate=${route.query.endDate}${route.query.pcode ? `&pcode=${route.query.pcode}`: ''}`)
        dataHead.value = res ?? []
        pending.value = true
    }

    const toggleSub = (index: number) => {
        // เปลี่ยนสถานะการแสดงหรือซ่อนของ Sub
        dataHead.value[index].showSub = !dataHead.value[index].showSub;
    }
</script>

<style>
    table {
        border-collapse: collapse;
    }
    table tr td, table tr th {
        @apply p-2;
        font-size: 14px;
    }
    @media print {

        .date-title {
            @apply fixed right-4 top-4;
        }
        table {
            border: 1px solid black; /* Ensures the table is visible */
            page-break-inside: auto; /* Avoid page breaks inside rows */
        }

        th {
            position: sticky;
            top: 0; /* Stick header to the top */
            z-index: 1; /* Ensure header is above other content */
        }
        th, td {
            border: 1px solid black;
            padding: 0;
            word-wrap: break-word; /* ห่อข้อความที่ยาวเกินไป */
        }

        /* Landscape orientation */
        @page {
            size: A4 portrait; /* Set to portrait */
            margin: 1cm; /* Set margins for print */
        }
    }
</style>