<template>
    <div class="flex items-center justify-center min-h-screen px-4">
        <UContainer class="bg-zinc-200 p-10 rounded-lg border-2 border-black">
            <h1 class="text-lg lg:text-2xl font-bold mb-4 text-center">ค้นหา จำนวนผู้ขอรับเงินช่วยเหลือผู้ประสบอุทกภัยในช่วงฤดูฝน ปี 2567 ตามมติ ครม.</h1>
            <UForm :state="form" :schema="schema" @submit.prevent="submit">
                <div class="grid grid-cols-2 lg:grid-cols-4 items-center justify-center gap-4">
                    <UFormGroup label="ตั้งแต่วันที่" size="xl" name="startDate">
                        <UPopover :popper="{ placement: 'bottom-start' }">
                            <UButton icon="i-heroicons-calendar-days-20-solid" :label="format(form.startDate, 'd MMM yyy', { locale: th})" size="xl" />
                            <template #panel="{ close }">
                                <DatePicker v-model="form.startDate" is-required @close="close" />
                            </template>
                        </UPopover>
                    </UFormGroup>
                    <UFormGroup label="ถึงวันที่" name="endDate" size="xl">
                        <UPopover :popper="{ placement: 'bottom-start' }">
                            <UButton icon="i-heroicons-calendar-days-20-solid" :label="format(form.endDate, 'd MMM yyy', { locale: th})" size="xl" />
                            <template #panel="{ close }">
                                <DatePicker v-model="form.endDate" is-required @close="close" />
                            </template>
                        </UPopover>
                    </UFormGroup>
                    <UFormGroup label="จังหวัด" size="xl">
                        <USelectMenu searchable v-model="form.pcode" placeholder="เลือกจังหวัด" value-attribute="pcode" option-attribute="pname" :options="provinces"/>
                    </UFormGroup>
                    <div class="text-center self-end">
                        <UButton type="submit" label="ค้นหา" size="xl" />
                    </div>
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


    const form = reactive({
        startDate: new Date(2024, 8, 26),
        endDate: new Date(),
        pcode: 'all'
    })

    const schema = z.object({
        startDate: z.date({ message: 'กรุณาเลือกวันที่เริ่มต้น'}),
        endDate: z.date({ message:  'กรุณาเลือกวันที่เริ่มต้น' }),

    })

    const { data: provinces, status } = await useFetch('/api/province')

    const router = useRouter()

    type Schema = z.infer<typeof schema>;
    const submit = (event: FormSubmitEvent<Schema>) => {

        const formattedStartDate = format(form.startDate, 'yyyy-MM-dd')
        const formattedEndDate = format(form.endDate, 'yyyy-MM-dd')

        router.push(`/report?startDate=${formattedStartDate}&endDate=${formattedEndDate}${form.pcode ? `&pcode=${form.pcode}`: ''}`)
    }
</script>

<style>
* {
    
}
</style>