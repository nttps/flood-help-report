<template>
    <div class="font-kanit w-[980px] mx-auto bg-[#F1F1F1] relative bg-[url('~/assets/images/bg-bottom.jpg')] bg-bottom bg-no-repeat bg-cover">
        <!-- <img src="~/assets/images/bg-bottom.jpg" class="absolute bottom-0 w-full left-0 right-0" alt=""> -->
        <header class="flex bg-primary px-10 py-2 space-x-8 justify-between items-center text-white rounded-b-3xl">
            <div>
                <img src="~/assets/images/logo.png" class="h-[140px]" alt="">
            </div>
            <div class="text-2xl pt-6">
                <h3 class="text-center mb-6">จำนวนคำร้องขอรับเงินช่วยเหลือผู้ประสบภัยในช่วงฤดูฝน ปี พ.ศ.2567</h3>
                <div class="flex justify-between">
                    <div>ในระดับจังหวัด</div>
                    <div class="text-lg font-[300] text-right">
                        <div class="mb-1">ตามมติคณะรัฐมนตรี 17 กันยายน 2567</div>
                        <div class="rounded-full bg-[#FFB800] inline-flex items-center py-1 px-4">
                            <UIcon name="disaster-clock" class="text-primary mr-2" />
                            <div>
                                09:00 น.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>

        <main class="px-8 mt-2" v-if="pending">
            <section class="bg-primary rounded-2xl p-3">
               <div class="flex gap-2">
                    <div class="bg-secondary py-4 rounded-xl w-3/5 flex flex-col justify-center items-center">
                        <div class="font-semibold text-2xl mb-2">จำนวนคำร้องที่ขอรับการช่วยเหลือ</div>
                        <div class="text-white text-lg">{{ format(new Date(), 'dd MMMM yyyy', { locale: th }).replace((new Date().getFullYear()).toString(), (new Date().getFullYear() + 543).toString()) }} (ในแต่ละจังหวัด)</div>
                        <div class="text-white text-lg">คำร้องทั้งหมด <span class="text-4xl">{{ report.countRequest.toLocaleString() }}</span> คำร้อง  </div>
                    </div>
                    <div class="bg-secondary rounded-xl w-2/5 flex flex-col justify-center items-center">
                        <div class="text-2xl font-semibold mb-2">{{ report.topRequest.p_name }}</div>
                        <div class="text-2xl">{{ report.topRequest?.top_count?.toLocaleString() }}</div>
                    </div>
               </div>
               <div class="flex text-primary my-5 items-center">
                    <div class="w-1/3 text-center">
                        <div>ครัวเรือนที่ได้รับเงินแล้ว</div>
                        <div><span class="text-3xl">{{ report.allTransfer?.toLocaleString() }}</span> ครัวเรือน</div>
                    </div>
                    <div class="w-1/3 text-center">
                        <div>จำนวนเงินที่โอนแล้ว</div>
                        <div><span class="text-3xl">{{ report.allMoneyTransfer?.toLocaleString() }}</span> บาท</div>
                    </div>
                    <div class="w-1/3 text-center">
                        <div>จังหวัดที่ได้รับเงินแล้ว</div>
                        <div>/ จังหวัดที่กรอกคำร้อง</div>
                        <div class="text-3xl">{{report.provinceRetrieveMoney?.toLocaleString() }}/{{ report.provinceRequest?.toLocaleString() }}</div>

                    </div>
               </div>
               <div class="grid grid-cols-5 gap-2">
                    <div class="bg-[#FFE196] rounded-xl p-4 text-center text-lg" v-for="d in report.allRequest.slice(0, 5)" :key="d">
                        <div>{{d.p_name}}</div>
                        <div>{{d.top_count.toLocaleString()}}</div>
                    </div>
               </div>
            </section>
            <section class="rounded-2xl bg-white/10 backdrop-blur-3xl px-8 py-4">
                <div class="grid grid-cols-5 gap-2 items-center">
                    <div class="mb-5 text-white" v-for="a in report.allRequest.slice(5)" :key="a">
                        {{ `${a.p_name} (${a.top_count.toLocaleString()})` }}
                    </div>
               </div>
            </section>
        </main>
        <!-- Show loading spinner while data is loading -->
        <div class="flex justify-center items-center h-screen bg-white/10 backdrop-blur-3xl" v-else>
            <div class="relative inline-flex flex-col items-center">
                <!-- Spinner -->
                <div class="animate-spin rounded-full h-16 w-16 border-t-4 border-[#051445] border-solid border-transparent"></div>

                <!-- Loading Text -->
                <span class="text-primary font-semibold text-lg">กำลังประมวลผล...</span>
            </div>
        </div>
        <footer>
            <div class="flex bg-primary px-10 py-4 space-x-8 justify-between items-center text-white rounded-t-3xl">
                <div class="text-lg pt-4 pb-2">
                    <div class="mb-2">ศูนย์เทคโนโลยีสารสนเทศและการสื่อสาร กรมป้องกันและบรรเทาสาธาธารณภัย</div>
                    <div class="mb-4">ตรวจสอบสถานะคำร้องตนเองได้ที่ : <span class="font-semibold"><a target="_blank" href="https://flood67.disoster.go.th">https://flood67.disoster.go.th</a></span></div>
                    <div class="flex justify-between items-center">
                        <a href="https://www.facebook.com/DDPMNews" target="_blank" class="flex items-center">
                            <UIcon name="disaster-facebook" size="40" />
                            <div class="ml-2">: กรมป้องกันและบรรเทาสาธาธารณภัย DDPM </div>
                        </a>
                        <a href="https://line.me/R/ti/p/@1784DDPM" target="_blank" class="flex items-center">
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
</template>

<script setup>
    import { format } from 'date-fns';
    import { th } from 'date-fns/locale';


    const { data: report, status } = await useFetch('/api/onepage', {
        cacheKey: 'ddpm-onepage',
        cacheTime: 1000 * 60 * 5,
    })
    const pending = computed(() => status.value === 'success')

</script>

<style lang="scss" scoped>
    .text-primary {
        @apply text-[#FFB800];
    }
    .bg-primary {
        @apply bg-[#051445];
    }

    .bg-secondary {
        @apply bg-[#FFB800];
    }
</style>