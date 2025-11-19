<template>
    <div class="flex items-center justify-center min-h-screen px-4">
        <UContainer class="bg-zinc-200 p-10 rounded-lg border-2 border-black min-w-[80rem]">
            <h1 class="text-lg lg:text-2xl font-bold mb-4 text-center">ค้นหา จำนวนผู้ขอรับเงินช่วยเหลือ</h1>
            <UForm :state="form" :schema="schema" @submit.prevent="submit">
                <div class="grid grid-cols-1 lg:grid-cols-2 items-center justify-center gap-4 mb-4">
                    <UFormGroup label="เลือกการช่วยเหลือ" size="xl">
                        <USelectMenu v-model="form.database" value-attribute="value" option-attribute="label" placeholder="เลือกการช่วยเหลือ" :options="databases" @update:model-value="onDatabaseChange" />
                    </UFormGroup>
                    <UFormGroup label="จังหวัด" size="xl">
                        <USelectMenu searchable v-model="form.pcode" placeholder="เลือกจังหวัด" value-attribute="pcode" option-attribute="pname" :options="provinces || []"/>
                    </UFormGroup>
                </div>
                <div class="grid grid-cols-1 lg:grid-cols-3 items-center justify-center gap-4">
                    <UFormGroup label="ตั้งแต่วันที่" size="xl" name="startDate">
                        <UPopover :popper="{ placement: 'bottom-start' }">
                            <UButton class="w-full" icon="i-heroicons-calendar-days-20-solid" :label="formatDateTH(form.startDate, 'd MMM yyy')" size="xl" />
                            <template #panel="{ close }">
                                <DatePicker v-model="form.startDate" is-required @close="close" :min-date="dateRange.minDate" :max-date="dateRange.defaultEndDate" />
                            </template>
                        </UPopover>
                    </UFormGroup>
                    <UFormGroup label="ถึงวันที่" name="endDate" size="xl">
                        <UPopover :popper="{ placement: 'bottom-start' }">
                            <UButton class="w-full" icon="i-heroicons-calendar-days-20-solid" :label="formatDateTH(form.endDate, 'd MMM yyy')" size="xl" />
                            <template #panel="{ close }">
                                <DatePicker v-model="form.endDate" is-required @close="close" :min-date="dateRange.minDate" :max-date="dateRange.defaultEndDate" />
                            </template>
                        </UPopover>
                    </UFormGroup>
                   
                    <UFormGroup label="วันที่โอนเงิน" name="paymentDate" size="xl">
                        <UPopover :popper="{ placement: 'bottom-start' }">
                            <UButton class="w-full" icon="i-heroicons-calendar-days-20-solid" :label="form.paymentDate.start && form.paymentDate.end ? formatDateTH(form.paymentDate.start, 'd MMM yyy') + ' - ' + formatDateTH(form.paymentDate.end, 'd MMM yyy'): 'เลือกวันที่โอนเงิน'" size="xl" />
                            <template #panel="{ close }">
                                <DatePicker v-model="form.paymentDate" is-required @close="close" :min-date="dateRange.paymentMinDate" :max-date="lastPaymentDate ? new Date(lastPaymentDate) : new Date(dateRange.paymentMinDate.getTime() + 86400000)"  />
                            </template>
                        </UPopover>
                    </UFormGroup>
                    
                </div>
              <div class="text-center self-end mt-8">
                <UButton type="submit" label="ค้นหา" size="xl" />
              </div>
            </UForm>
        </UContainer>
    </div>
</template>

<script setup lang="ts">
    import { format } from 'date-fns'
    import { z } from "zod";
    import type { FormSubmitEvent } from "#ui/types";


    useSeoMeta({
        title: 'สรุปจำนวนผู้ขอรับเงินช่วยเหลือผู้ประสบอันเนื่องมาจากการกระทำของกองกำลังจากนอกประเทศ ปี 2568'
    })

    // ดึงรายการ database ที่อนุญาต พร้อมข้อมูลช่วงวันที่
    const databases = ref([{
        value: 'DPM_HELP68',
        label: 'การช่วยเหลือผู้ประสบอันเนื่องมาจากการกระทำของกองกำลังจากนอกประเทศ ปี 2568',
        minDate: new Date(2025, 7, 26), // 26 สิงหาคม 2568
        maxDate: new Date(2025, 9, 31), // 31 ตุลาคม 2568
        defaultStartDate: new Date(2025, 7, 26),
        defaultEndDate: new Date(),
        paymentMinDate: new Date(2025, 9, 6) // 6 ตุลาคม 2568
    }, {
        value: 'DPM_HELP68_FLOOD',
        label: 'การช่วยเหลือผู้ประสบภัยในช่วงฤดูฝน ปี พ.ศ.2568',
        minDate: new Date(2025, 9, 10), // 1 พฤศจิกายน 2568
        maxDate: new Date(2026, 0, 31), // 31 มกราคม 2569
        defaultStartDate: new Date(2025, 9, 10),
        defaultEndDate: new Date(new Date(2025, 9, 10).getTime() + 86400000),
        paymentMinDate: new Date(2025, 9, 10) // 11 ตุลาคม 2568
    }, {
        value: 'DPM_HELP68_FLOOD_PLUS',
        label: 'น้ำท่วมขังบริเวณที่อยู่อาศัยประจำเป็นระยะเวลานานในช่วงฤดูฝน ปี 2568',
        minDate: new Date(2025, 9, 10), // 1 พฤศจิกายน 2568
        maxDate: new Date(2026, 0, 31), // 31 มกราคม 2569
        defaultStartDate: new Date(2025, 9, 10),
        defaultEndDate: new Date(new Date(2025, 9, 10).getTime() + 86400000),
        paymentMinDate: new Date(2025, 9, 10) // 11 ตุลาคม 2568
    }])

    const form = reactive({
      database: 'DPM_HELP68_FLOOD', // ค่าเริ่มต้น
      startDate: new Date(2025, 7, 26),
      endDate: new Date(),
      pcode: 'all',
      paymentDate: {
        start: null,
        end: null,
      }
    })

    // Computed properties สำหรับช่วงวันที่ตาม database ที่เลือก
    const selectedDatabase = computed(() => {
      return databases.value.find(db => db.value === form.database) || databases.value[0]
    })

    const dateRange = computed(() => ({
      minDate: selectedDatabase.value.minDate,
      maxDate: selectedDatabase.value.maxDate,
      paymentMinDate: selectedDatabase.value.paymentMinDate,
      defaultEndDate: selectedDatabase.value.defaultEndDate
    }))

    // เรียก API โดยส่ง database parameter
    const { data: lastPaymentDate } = await useFetch(() => `/api/get-last-payment?database=${form.database}`)

    const schema = z.object({
      startDate: z.date({ message: 'กรุณาเลือกวันที่เริ่มต้น'}),
      endDate: z.date({ message: 'กรุณาเลือกวันที่เริ่มต้น' }),

    })

    const { data: provinces, status } = await useFetch(() => `/api/province?database=${form.database}`)



    const router = useRouter()

    // ฟังก์ชันสำหรับเมื่อเปลี่ยน database
    const onDatabaseChange = async (newDatabase: string) => {
      // หา database ที่เลือกใหม่
      const newDbConfig = databases.value.find(db => db.value === newDatabase)
      
      if (newDbConfig) {
        // Reset วันที่ให้เป็นค่าเริ่มต้นของ database ใหม่
        form.startDate = newDbConfig.defaultStartDate
        form.endDate = newDbConfig.defaultEndDate
        
        // Reset วันที่โอนเงิน
        form.paymentDate.start = null
        form.paymentDate.end = null
      }
      
      // Refresh provinces และ lastPaymentDate เมื่อเปลี่ยน database
      await refreshNuxtData()
    }

    type Schema = z.infer<typeof schema>;
    const submit = (event: FormSubmitEvent<Schema>) => {

      const formattedStartDate = format(form.startDate, 'yyyy-MM-dd')
      const formattedEndDate = format(form.endDate, 'yyyy-MM-dd')
      const formattedPaymentDateStart = form.paymentDate.start ? format(form.paymentDate.start, 'yyyy-MM-dd') : ''
      const formattedPaymentDateEnd = form.paymentDate.end ? format(form.paymentDate.end, 'yyyy-MM-dd') : ''


      router.push(`/report?title=${form.database}${form.paymentDate.start ? `` : `&startDate=${formattedStartDate}&endDate=${formattedEndDate}` }${form.pcode ? `&pcode=${form.pcode}`: ''}${form.paymentDate.start ? `&paymentDateStart=${formattedPaymentDateStart}`: ''}${form.paymentDate.end ? `&paymentDateEnd=${formattedPaymentDateEnd}`: ''}`)
    }
</script>

<style scoped>
</style>