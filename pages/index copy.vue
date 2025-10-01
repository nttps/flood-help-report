<template>
    <div class="flex items-center justify-center min-h-screen px-4">
        <UContainer class="bg-zinc-200 p-10 rounded-lg border-2 border-black">
            <h1 class="text-lg lg:text-2xl font-bold mb-4 text-center">ค้นหา จำนวนผู้ขอรับเงินช่วยเหลือผู้ประสบอันเนื่องมาจากการกระทำของกองกำลังจากนอกประเทศ ปี 2568</h1>
            <UForm :state="form" :schema="schema" @submit.prevent="submit">
                <div class="grid grid-cols-1 lg:grid-cols-2 items-center justify-center gap-4 mb-4">
                    
                    <!-- <UFormGroup label="มติคณะรัฐมนตรี" size="xl" name="phase" >
                        <USelect placeholder="เลือกมติคณะรัฐมนตรี" v-model="form.phase" :options="[{
                            label: 'มติฯ 8 ต.ค.',
                            value: '1'
                        },
                        {
                            label: 'มติฯ 3 ธ.ค.',
                            value: '2'
                        },
                        {
                            label: 'มติฯ 8 ต.ค.',
                            value: '2'
                        }]" required />
                    </UFormGroup> -->
                    <UFormGroup label="จังหวัด" size="xl">
                        <USelectMenu searchable v-model="form.pcode" placeholder="เลือกจังหวัด" value-attribute="pcode" option-attribute="pname" :options="provinces"/>
                    </UFormGroup>
                </div>
                <div class="grid grid-cols-1 lg:grid-cols-3 items-center justify-center gap-4">
                    <UFormGroup label="ตั้งแต่วันที่" size="xl" name="startDate">
                        <UPopover :popper="{ placement: 'bottom-start' }">
                            <UButton class="w-full" icon="i-heroicons-calendar-days-20-solid" :label="format(form.startDate, 'd MMM yyy', { locale: th})" size="xl" />
                            <template #panel="{ close }">
                                <DatePicker v-model="form.startDate" is-required @close="close" />
                            </template>
                        </UPopover>
                    </UFormGroup>
                    <UFormGroup label="ถึงวันที่" name="endDate" size="xl">
                        <UPopover :popper="{ placement: 'bottom-start' }">
                            <UButton class="w-full" icon="i-heroicons-calendar-days-20-solid" :label="format(form.endDate, 'd MMM yyy', { locale: th})" size="xl" />
                            <template #panel="{ close }">
                                <DatePicker v-model="form.endDate" is-required @close="close" />
                            </template>
                        </UPopover>
                    </UFormGroup>
                   
                    <UFormGroup label="วันที่โอนเงิน" name="paymentDate" size="xl">
                        <UPopover :popper="{ placement: 'bottom-start' }">
                            <UButton class="w-full" icon="i-heroicons-calendar-days-20-solid" :label="form.paymentDate.start ? format(form.paymentDate.start, 'd MMM yyy', { locale: th}) + ' - ' + format(form.paymentDate.end, 'd MMM yyy', { locale: th}): 'เลือกวันที่โอนเงิน'" size="xl" />
                            <template #panel="{ close }">
                                <DatePicker v-model="form.paymentDate" is-required @close="close" :min-date="new Date(2024, 8, 26)" :max-date="new Date(lastPaymentDate)"  />
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
    import { th } from "date-fns/locale";
    import { z } from "zod";
    import type { FormSubmitEvent } from "#ui/types";


    useSeoMeta({
        title: 'สรุปจำนวนผู้ขอรับเงินช่วยเหลือผู้ประสบอันเนื่องมาจากการกระทำของกองกำลังจากนอกประเทศ ปี 2568'
    })
    const { data: lastPaymentDate } = await useFetch('/api/get-last-payment')

    const form = reactive({
      startDate: new Date(2025, 8, 26),
      endDate: new Date(),
      pcode: 'all',
      phase: 1,
      paymentDate: {
        start: null,
        end: null,
      }
    })

    const schema = z.object({
      startDate: z.date({ message: 'กรุณาเลือกวันที่เริ่มต้น'}),
      endDate: z.date({ message: 'กรุณาเลือกวันที่เริ่มต้น' }),

    })

    const { data: provinces, status } = await useFetch('/api/province')



    const router = useRouter()

    type Schema = z.infer<typeof schema>;
    const submit = (event: FormSubmitEvent<Schema>) => {

      const formattedStartDate = format(form.startDate, 'yyyy-MM-dd')
      const formattedEndDate = format(form.endDate, 'yyyy-MM-dd')
      const formattedPaymentDateStart = form.paymentDate.start ? format(form.paymentDate.start, 'yyyy-MM-dd') : ''
      const formattedPaymentDateEnd = form.paymentDate.end ? format(form.paymentDate.end, 'yyyy-MM-dd') : ''


      router.push(`/report?phase=${form.phase}&${form.paymentDate.start ? `` : `startDate=${formattedStartDate}&endDate=${formattedEndDate}&` }${form.pcode ? `pcode=${form.pcode}`: ''}${form.paymentDate.start ? `&paymentDateStart=${formattedPaymentDateStart}`: ''}${form.paymentDate.end ? `&paymentDateEnd=${formattedPaymentDateEnd}`: ''}`)
    }
</script>

<style>
* {
    
}
</style>