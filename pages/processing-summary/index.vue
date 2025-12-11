<template>
  <div class="flex items-center justify-center min-h-screen px-4">
      <UContainer class="bg-zinc-200 p-10 rounded-lg border-2 border-black min-w-[80rem]">
          <h1 class="text-lg lg:text-2xl font-bold mb-4 text-center">บัญชีรายชื่อจังหวัดและจำนวนผู้ประสบภัย</h1>
          <UForm :state="form" :schema="schema" @submit.prevent="submit">
              <div class="grid grid-cols-1 lg:grid-cols-2 items-center justify-center gap-4 mb-4">
                  <UFormGroup label="เลือกการช่วยเหลือ" size="xl">
                      <USelectMenu v-model="form.database" value-attribute="value" option-attribute="label" placeholder="เลือกการช่วยเหลือ" :options="databases" @update:model-value="onDatabaseChange" />
                  </UFormGroup>
                  <UFormGroup label="จังหวัด" size="xl">
                      <USelectMenu searchable v-model="form.pcode" placeholder="เลือกจังหวัด" value-attribute="pcode" option-attribute="pname" :options="provinces || []"/>
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
      value: 'DPM_HELP68_FLOOD',
      label: 'การช่วยเหลือผู้ประสบภัยในช่วงฤดูฝน ปี พ.ศ.2568',
  }, {
      value: 'DPM_HELP68_FLOOD_PLUS',
      label: 'น้ำท่วมขังบริเวณที่อยู่อาศัยประจำเป็นระยะเวลานานในช่วงฤดูฝน ปี 2568',
  }])

  const form = reactive({
    database: 'DPM_HELP68_FLOOD_PLUS', // ค่าเริ่มต้น
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
    database: z.string({ message: 'กรุณาเลือกการช่วยเหลือ'}),
  })

  const { data: provinces, status } = await useFetch(() => `/api/province?database=${form.database}`)
  const router = useRouter()

  // ฟังก์ชันสำหรับเมื่อเปลี่ยน database
  const onDatabaseChange = async (newDatabase: string) => {
    // Refresh provinces เมื่อเปลี่ยน database
    await refreshNuxtData()
  }

  type Schema = z.infer<typeof schema>;
  const submit = (event: FormSubmitEvent<Schema>) => {
    // ไปยังหน้าผลลัพธ์พร้อม parameter database และ pcode (ถ้ามี)
    const queryParams = new URLSearchParams({
      database: form.database
    })
    
    if (form.pcode) {
      queryParams.append('pcode', form.pcode)
    }

    router.push(`/processing-summary/result?${queryParams.toString()}`)
  }
</script>

<style scoped>
</style>