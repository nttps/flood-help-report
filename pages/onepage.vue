<template>
    <div>
        <div class="fixed right-8 bottom-8 lg:right-[300px] lg:top-1/2 z-[9999]">
            <button @click="downloadPDF" class="rounded-full w-20 p-2 bg-secondary text-[#051445] lg:!bg-[#051445] text-center lg:text-white">
                ปริ้น
            </button>
        </div>
        <div class="font-kanit lg:w-[980px] mx-auto bg-[#F1F1F1] relative bg-[url('~/assets/images/bg-bottom.jpg')] bg-bottom bg-no-repeat bg-cover" ref="htmlContent" >
            <!-- <img src="~/assets/images/bg-bottom.jpg" class="absolute bottom-0 w-full left-0 right-0" alt=""> -->
            <header class="flex bg-primary px-5 lg:px-10 py-2 space-x-4 items-center text-white rounded-b-3xl">
                <div class="min-w-max lg:w-1/6">
                    <img src="~/assets/images/logo.png" class="h-[100px] lg:h-[120px] min-w-max" alt="">
                </div>
                <div class="lg:pt-6 lg:w-5/6">
                    <h3 class="lg:mb-3 text-lg lg:text-2xl ">จำนวนคำร้องขอรับเงินช่วยเหลือผู้ประสบภัยในช่วงฤดูฝน ปี พ.ศ.2567 <br class="hidden lg:block" />  ตามมติคณะรัฐมนตรี 8 ตุลาคม 2567</h3>
                    <div class="text-right">
                        <div class="rounded-full bg-[#FFB800] text-[#051445] py-2 px-4 ml-auto inline-flex items-center justify-center" >
                            ณ วันที่ {{ format(new Date(), 'dd/MM/yyyy', { locale: th }).replace((new Date().getFullYear()).toString(), (new Date().getFullYear() + 543).toString()) }}
                        </div>
                    </div>
                </div>
            </header>
            
            <main class="px-4 lg:px-8 mt-2 transition-all  duration-[2s] opacity-0 " v-if="pending"  v-bind:class="pending ? 'article-list-enter':''">
                <section class="bg-primary rounded-2xl p-3">
                <div class="flex flex-wrap lg:flex-nowrap gap-4 lg:gap-2">
                    <div class="bg-[#082174] text-[#FFB800] py-4 rounded-xl w-full lg:w-2/5 text-center">
                        <UIcon name="disaster-10" size="50" class="mb-2" />
                        <div class="text-2xl mb-2">ผู้ยื่นคำร้องทั้งหมด <br /> (รวมทุกจังหวัด)</div>
                        <div class="text-4xl font-bold">{{ report.countRequest.toLocaleString() }}  </div>
                        <div class="text-2xl mt-3">ครัวเรือน</div>
                    </div>
                    <div class="bg-[#082174] text-[#FFB800] py-4 rounded-xl w-full lg:w-2/5 text-center ">
                        <UIcon name="disaster-5290058" size="50" class="mb-2" />
                        <div class="text-2xl mb-2">โอนเงินช่วยเหลือผ่าน <br /> บัญชี Promptpay สำเร็จ</div>
                        <div class="text-4xl font-bold">{{ report.allTransfer?.toLocaleString() }}  </div>
                        <div class="text-2xl mt-3">ครัวเรือน</div>
                    </div>
                    <div class="bg-[#082174] text-[#FFB800] py-4 rounded-xl w-full lg:w-3/5 text-center">
                        <UIcon name="disaster-10369894" size="50" class="mb-2" />
                        <div class="text-2xl mb-2">จำนวนเงินช่วยเหลือ <br />โอนผ่านบัญชี Promptpay สำเร็จ</div>
                        <div class="text-4xl font-bold">{{ (report.allTransfer * 9000 ).toLocaleString() }}  </div>
                        <div class="text-2xl mt-3">บาท</div>
                    </div>
                </div>
                <div class="flex flex-wrap lg:flex-nowrap justify-center gap-4 lg:gap-2 my-3">
                    <div class="bg-secondary py-8 rounded-xl w-full lg:w-3/5 text-center text-2xl">
                        <div class=" mb-2">จังหวัดที่มีผู้ยื่นคำร้อง <span class="font-bold underline">สูงสุด</span></div>
                        <div class="text-4xl">{{ report.allRequest[0].p_name }}</div>
                        <div class="text-lg">ยื่น: <span class="text-2xl">{{report.allRequest[0].top_count.toLocaleString()}}</span>  </div>
                        <div class="text-lg">( โอนสำเร็จ: <span class="text-2xl">{{report.allRequest[0].total.toLocaleString()}}</span> )  </div>

                    </div>
                    <div class="bg-[#FFE196] py-4 lg:py-8 rounded-xl items-center flex flex-col justify-center w-full lg:w-2/5 text-center " v-for="d in report.allRequest.slice(1, 3)" :key="d">
                        <div class="text-2xl mb-2 ">{{d.p_name}}</div>
                        <div class="text-lg">ยื่น: <span class="text-2xl">{{d.top_count.toLocaleString()}}</span>  </div>
                        <div class="text-lg">( โอนสำเร็จ: <span class="text-2xl">{{ d.total.toLocaleString() ??  0 }} </span> ) </div>
                    </div>
                </div>
                <div class="grid grid-cols-2 lg:grid-cols-4 lg:gap-2 justify-center ">
                        <div class="p-1 lg:p-0 lg:w-auto" v-for="d in report.allRequest.slice(3, 7)" :key="d">
                            <div class="bg-white rounded-xl py-2 lg:p-4 text-center text-lg" >
                                <div class="mb-4 text-xl">{{d.p_name}}</div>
                                <div>{{d.top_count.toLocaleString()}} <span class="font-bold">(<span :class="{ 'text-green-500': d.total > 0}">{{d.total.toLocaleString()}}</span>)</span></div>
                            </div>
                        </div>
                </div>
                </section>
                <section class="rounded-2xl bg-white/10 backdrop-blur-3xl px-2 lg:px-8 py-4">
                    <div class="grid grid-cols-3 lg:grid-cols-5 lg:gap-2 lg:items-center">
                        <div class="mb-5 text-white break-words lg:py-0" v-for="a in report.allRequest.slice(7)" :key="a">
                            {{ a.p_name }}(<span :class="{ 'text-green-500': a.total == a.top_count}">{{ a.top_count.toLocaleString() }}</span>/<span :class="{ 'text-green-500': a.total > 0}">{{ a.total.toLocaleString() }}</span>)
                        </div>
                </div>
                </section>
            </main>
            <main v-else>
                <div class="flex flex-col justify-center items-center bg-white/10 backdrop-blur-3xl h-[80vh]">
                    <UIcon name="line-md-loading-twotone-loop" size="80" />
                    <div class="text-4xl">กำลังประมวลผลข้อมูล</div>
                </div>
            </main>
            <!-- Show loading spinner while data is loading -->
            
            <footer>
                <div class="flex flex-wrap lg:flex-nowrap bg-primary px-5 lg:px-10 py-4 lg:space-x-8 justify-between items-center text-white rounded-t-3xl">
                    <div class="text-lg pt-4 pb-2">
                        <div class="mb-2 text-center lg:text-left">ศูนย์เทคโนโลยีสารสนเทศและการสื่อสาร กรมป้องกันและบรรเทาสาธารณภัย</div>
                        <div class="mb-4 text-center lg:text-left">ตรวจสอบสถานะคำร้องตนเองได้ที่ : <span class="font-semibold"><a target="_blank" href="https://flood67.disaster.go.th/HELP/CheckStatusHelpRequest/Desktop">https://flood67.disaster.go.th</a></span></div>
                        <div class="flex flex-wrap justify-between items-center">
                            <a href="https://www.facebook.com/DDPMNews" target="_blank" class="flex items-center  mb-2">
                                <UIcon name="disaster-facebook" size="40" />
                                <div class="ml-2">: กรมป้องกันและบรรเทาสาธารณภัย DDPM </div>
                            </a>
                            <a href="https://line.me/R/ti/p/@1784DDPM" target="_blank" class="flex items-center ">
                                <UIcon name="disaster-line" size="40" />
                                <div class="ml-2">: @1784DDPM  </div>
                            </a>
                        </div>
                    </div>
                    <div >
                        <a href="www.disaster.go.th" target="_blank" class="flex items-center mb-2">
                            <UIcon name="disaster-url" size="35" />
                            <div class="mx-4">: www.disaster.go.th</div>
                        </a>
                        <a href="https://x.com/@DDPMNews" target="_blank" class="flex items-center mb-2">
                            <UIcon name="disaster-x" size="35" />
                            <div class="mx-4">: @DDPMNews </div>
                        </a>
                        <a href="tel:1784" class="flex items-center mb-2">
                            <UIcon name="disaster-tel" size="35" />
                            <div class="mx-4">: CalICenter 1784</div>
                        </a>
                    </div>
                </div>
            </footer>
        </div>
   </div>
</template>

<script setup >
    import { format } from 'date-fns';
    import { th } from 'date-fns/locale';
    import html2canvas from 'html2canvas';
    import { jsPDF } from 'jspdf';
    import {pdfFonts} from '~/assets/fonts/vfs_fonts.js'

    const { data: report, status } = await useFetch('/api/onepage?database=DPM_HELP67&phase=1&nocache='+ new Date().toISOString(), {
        cache: 'no-store',
        headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        }
    })
    const pending = computed(() => status.value === 'success')

    const htmlContent = ref(null)
    const downloadPDF = () => {
        htmlContent.value.classList.add('desktop-view');
        const isMobile = window.innerWidth < 1024;

        // ใช้ dom-to-image เพื่อสร้างภาพจาก htmlContent
        html2canvas(htmlContent.value, {
            useCORS: true,  // เปิดใช้ CORS สำหรับฟอนต์จากภายนอก
            scale:  2,        // เพิ่มความละเอียดของการเรนเดอร์
            logging: true   // เปิดการบันทึกการทำงานของ html2canvas
        }).then((canvas) => {

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4')

            const pageWidth = pdf.internal.pageSize.getWidth() ; // ปรับขนาดของ pageWidth
            const pageHeight = pdf.internal.pageSize.getHeight() ; // ปรับขนาดของ pageHeight
            const imgWidth = canvas.width; // ปรับขนาด width ของ canvas
            const imgHeight = canvas.height; // ปรับขนาด height ของ canvas

             // คำนวณสัดส่วนที่เหมาะสม
            let ratio = Math.min(pageWidth / imgWidth, pageHeight / imgHeight);

            // ปรับสัดส่วนให้เหมาะสมกับจอมือถือ
            if (isMobile) {
                ratio = Math.min((pageWidth / imgWidth), (pageHeight / imgHeight) * 0.9); // ลดขนาดเพื่อให้ขอบไม่ชิดเกินไป
            }

            const x = (pageWidth - (imgWidth * ratio)) / 2; // จัดกลางแนวนอน
            const y = (pageHeight - (imgHeight * ratio)) / 2; // จัดกลางแนวตั้ง

            pdf.addImage(imgData, 'PNG', x, y, imgWidth * ratio, imgHeight * ratio);

            // Set the font to Sarabun
            pdf.addFileToVFS("Sarabun-Regular.ttf", pdfFonts['THSarabunNew Bold.ttf']);
            pdf.addFont("Sarabun-Regular.ttf", "Sarabun", "normal");
            pdf.setFont("Sarabun");

            const timestampFontSize = 12; // Font size for timestamp
            pdf.setFontSize(timestampFontSize); // Set font size for timestamp

            const timestamp = format(new Date(), 'dd/MM/yyyy HH:mm:ss', { locale: th }); // Get the current timestamp
            const timestampWidth = pdf.getStringUnitWidth(`${timestamp}`) * timestampFontSize / pdf.internal.scaleFactor;

            // ปรับให้ตำแหน่ง y สูงกว่าขอบบน เพื่อไม่ให้ทับกับเนื้อหา
            const timestampY = 10; // ห่างจากขอบบน 10 mm
            const timestampX = pageWidth - timestampWidth - 10; // Right-align timestamp with some padding

            pdf.text(`${timestamp}`, timestampX, timestampY); // Position timestamp
            pdf.save('จำนวนคำร้องขอรับเงินช่วยเหลือผู้ประสบภัยในช่วงฤดูฝน ปี พ.ศ.2567  ตามมติคณะรัฐมนตรี 8 ตุลาคม 2567.pdf');

            htmlContent.value.classList.remove('desktop-view');
        });
    }

</script>

<style lang="scss">
    body{
        line-height: 1;
    }
    .text-primary {
        @apply text-[#FFB800];
    }
    .bg-primary {
        @apply bg-[#051445] ;
    }

    .bg-secondary {
        @apply bg-[#FFB800];
    }

    img {
        @apply inline-block;
    }

    .desktop-view {
        width: 980px !important; /* ปรับให้เหมาะสมกับหน้าจอ PC */
        margin: 0 auto; /* จัดกลางในแนวนอน */
    }
    .article-list-enter{
  opacity: 1 !important;
}
    
</style>