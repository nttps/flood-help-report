<template>
    <div>
        <div class="fixed right-8 bottom-8 lg:right-[300px] lg:top-1/2 lg:-translate-y-1/2 z-[9999]">
            <div class="rounded-full w-20 p-2 bg-secondary lg:bg-primary text-center">
                <button @click="downloadPDF" class="text-white">
                    ปริ้น
                </button>
            </div>
        </div>
        <div class="font-kanit lg:w-[980px] mx-auto bg-[#F1F1F1] relative bg-[url('~/assets/images/bg-bottom.jpg')] bg-bottom bg-no-repeat bg-cover" ref="htmlContent" >
            <!-- <img src="~/assets/images/bg-bottom.jpg" class="absolute bottom-0 w-full left-0 right-0" alt=""> -->
            <header class="flex bg-primary px-5 lg:px-10 py-2 space-x-4 items-center text-white rounded-b-3xl">
                <div class="min-w-max lg:w-1/6">
                    <img src="~/assets/images/logo.png" class="h-[100px] lg:h-[120px] min-w-max" alt="">
                </div>
                <div class="lg:pt-6 lg:w-5/6">
                    <h3 class="lg:mb-3 text-center text-lg lg:text-2xl ">จำนวนคำร้องขอรับเงินช่วยเหลือผู้ประสบภัยในช่วงฤดูฝน ปี พ.ศ.2567 <br class="hidden lg:block" /> ในระดับจังหวัด ตามมติคณะรัฐมนตรี 17 กันยายน 2567</h3>
                    <div class="text-right">
                        <div class="rounded-full bg-[#FFB800] text-[#051445] py-2 px-4 ml-auto inline-flex items-center justify-center" >
                            ณ วันที่ {{ format(new Date(), 'dd/MM/yyyy', { locale: th }).replace((new Date().getFullYear()).toString(), (new Date().getFullYear() + 543).toString()) }}
                        </div>
                    </div>
                </div>
            </header>
            <main class="px-4 lg:px-8 mt-2" v-if="pending">
                <section class="bg-primary rounded-2xl p-3">
                <div class="flex flex-wrap lg:flex-nowrap gap-4 lg:gap-2">
                    <div class="bg-secondary py-8 rounded-xl w-full lg:w-3/5 text-center">
                        <div class="font-semibold text-2xl mb-2">จำนวนคำร้องที่ขอรับการช่วยเหลือ</div>
                        <div class="text-lg">{{ format(new Date(), 'dd MMMM yyyy', { locale: th }).replace((new Date().getFullYear()).toString(), (new Date().getFullYear() + 543).toString()) }} (ในแต่ละจังหวัด)</div>
                        <div class="text-lg">คำร้องทั้งหมด <span class="text-4xl">{{ report.countRequest.toLocaleString() }}</span> คำร้อง  </div>
                    </div>
                    <div class="bg-secondary py-8 rounded-xl w-full lg:w-2/5 text-center">
                        <div class="font-semibold text-2xl mb-2">จำนวนคำร้องสูงสุด</div>
                        <div class="text-2xl font-semibold mb-2">{{ report.topRequest.p_name }}</div>
                        <div class="text-2xl">{{ report.topRequest?.top_count?.toLocaleString() }}</div>
                    </div>
                </div>
                <div class="flex flex-wrap lg:flex-nowrap text-primary mt-5 items-center">
                        <div class="w-full mb-4 lg:w-1/3 text-center">
                            <div>ครัวเรือนที่ได้รับเงินแล้ว</div>
                            <div><span class="text-3xl">{{ report.allTransfer?.toLocaleString() }}</span> ครัวเรือน</div>
                        </div>
                        <div class="w-full mb-4 lg:w-1/3 text-center">
                            <div>จำนวนเงินที่โอนแล้ว</div>
                            <div><span class="text-3xl">{{ report.allMoneyTransfer?.toLocaleString() }}</span> บาท</div>
                        </div>
                        <div class="w-full mb-4 lg:w-1/3 text-center">
                            <div>จังหวัดที่ได้รับเงินแล้ว <br class="hidden lg:block" />/ จังหวัดที่กรอกคำร้อง</div>
                            <div class="text-3xl">{{report.provinceRetrieveMoney?.toLocaleString() }}/{{ report.provinceRequest?.toLocaleString() }}</div>

                        </div>
                </div>
                <div class="lg:grid flex flex-wrap lg:grid-cols-5 lg:gap-2 justify-center ">
                        <div class="w-1/3 p-1 lg:p-0 lg:w-auto" v-for="d in report.allRequest.slice(1, 6)" :key="d">
                            <div class="bg-[#FFE196] rounded-xl py-2 lg:p-4 text-center text-lg " >
                                <div>{{d.p_name}}</div>
                                <div>{{d.top_count.toLocaleString()}}</div>
                            </div>
                        </div>
                </div>
                </section>
                <section class="rounded-2xl bg-white/10 backdrop-blur-3xl px-2 lg:px-8 py-4">
                    <div class="grid grid-cols-3 lg:grid-cols-5 lg:gap-2 lg:items-center">
                        <div class="mb-5 text-white break-words lg:py-0" v-for="a in report.allRequest.slice(6)" :key="a">
                            {{ `${a.p_name} (${a.top_count.toLocaleString()})` }}
                        </div>
                </div>
                </section>
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

<script setup scoped>
    import { format } from 'date-fns';
    import { th } from 'date-fns/locale';
    import html2canvas from 'html2canvas';
    import { jsPDF } from 'jsPDF';

    const { data: report, status } = await useFetch('/api/onepage', {
        cacheKey: 'ddpm-onepage',
        cacheTime: 1000 * 60 * 5,
    })
    const pending = computed(() => status.value === 'success')

    const htmlContent = ref(null)
    const downloadPDF = () => {

        htmlContent.value.classList.add('desktop-view');

        // ใช้ dom-to-image เพื่อสร้างภาพจาก htmlContent
        html2canvas(htmlContent.value, {
            useCORS: true,  // เปิดใช้ CORS สำหรับฟอนต์จากภายนอก
            scale: 2,       // เพิ่มความละเอียดของการเรนเดอร์
            logging: true   // เปิดการบันทึกการทำงานของ html2canvas
        }).then((canvas) => {

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = Math.min(pageWidth / imgWidth, pageHeight / imgHeight);

            const x = (pageWidth - (imgWidth * ratio)) / 2; // จัดกลางแนวนอน
            const y = (pageHeight - (imgHeight * ratio)) / 2; // ห่างจากขอบบน

            pdf.addImage(imgData, 'PNG', x, y, imgWidth * ratio, imgHeight * ratio);

            pdf.save('จำนวนคำร้องขอรับเงินช่วยเหลือผู้ประสบภัยในช่วงฤดูฝน ปี พ.ศ.2567 ในระดับจังหวัด ตามมติคณะรัฐมนตรี 17 กันยายน 2567.pdf');

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
</style>