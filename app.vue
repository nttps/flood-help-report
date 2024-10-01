<template>
 <div>
  <div class="py-8" v-if="pending">
    <h3 class="text-center font-bold text-2xl">สรุปจำนวนผู้ขอรับเงินช่วยเหลือผู้ประสบอุทกภัยในช่วงฤดูฝน ปี 2567 ตามมติ ครม.</h3>
    <div class="max-w-screen-2xl mx-auto mt-8">
      <table class="w-full">
        <tr class="bg-zinc-500/70 font-bold">
          <td class="border border-zinc-700">
            
          </td>
          <td class="border border-zinc-700">
            จังหวัด
          </td>
          <td class="border border-b-0 border-zinc-700">
            ครั้งที่
          </td>
          <td class="border border-zinc-700">
            วันที่
          </td>
          <td class="border border-zinc-700">
            จำนวน ก.ช.ก.จ
          </td>
          <td class="border border-zinc-700">
            ส่ง ปค.
          </td>
          <td class="border border-zinc-700">
            ไม่ผ่าน Linkage
          </td>
          <td class="border border-zinc-700">

          </td>
          <td class="border border-zinc-700">
            ส่งออมสิน
          </td>
          <td class="border border-zinc-700">
            วันที่โอนเงิน
          </td>
          <td class="border border-zinc-700">
            ครั้งที่
          </td>
          <td class="border border-zinc-700">
      
          </td>
          <td class="border border-zinc-700">
            โอนสำเร็จ
          </td>
          <td class="border border-zinc-700">
            โอนไม่สำเร็จ
          </td>
          <td class="border border-zinc-700">
            ส่งคืนจังหวัดจรวจสอบ
          </td>
          <td class="border border-zinc-700">

          </td>
          <td class="border border-zinc-700">
            จังหวัดส่งคืนผลตรวจสอบ
          </td>
          <td class="border border-zinc-700">
            สละสิทธิ์
          </td>
          <td class="border border-zinc-700">
            ข้อมูลคงค้าง
          </td>
        </tr>
        <tr class="bg-zinc-400/70 font-semibold">
          <td class="border border-b-0 border-t-0 border-zinc-500" >
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
        <template v-for="head in dataHead" :key="head.p_no">
          <tr class="bg-zinc-400/70 font-bold">
            <td class="border border-t-0 border-zinc-500" colspan="2">
              {{ head.p_name }}
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
              {{ head.send_bank .toLocaleString()}}
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
            <td class="border border border-t-0 border-zinc-500 text-right">
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

          <template v-for="sub in head.sub" :key="sub.sub_id">
            <tr class="bg-zinc-400/70"  >
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
                <UCheckbox class="justify-center" color="gray" disabled v-bind:model-value="true" />
              </td>
              <td class="border bg-white border-zinc-500 text-right">
                {{ sub.failed_linkage.toLocaleString() }}
              </td>
              <td class="border bg-lime-200 border-zinc-500">
                <UCheckbox class="justify-center" color="gray" disabled v-bind:model-value="true" />
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
                <UCheckbox class="justify-center" color="gray" disabled v-bind:model-value="true" />
              </td>
              <td class="border bg-white border-zinc-500 text-right text-blue-500">
                {{ sub.successful_payments.toLocaleString() }}
              </td>
              <td class="border bg-white border-zinc-500 text-right">
                {{ sub.unsuccessful_payments.toLocaleString() }}
              </td>
              <td class="border bg-white border-zinc-500 text-right text-red-500">
                {{ sub.count_back_to_province.toLocaleString() }}
              </td>
              <td class="border bg-sky-300 border-zinc-500 text-right">
                <UCheckbox class="justify-center" color="gray" disabled v-bind:model-value="true" />
              </td>
              <td class="border bg-white border-zinc-500 text-right text-red-500">
                {{ sub.send_from_province.toLocaleString() }}
              </td>
              <td class="border bg-white border-zinc-500 text-right">
                {{ sub.retreat.toLocaleString() }}
              </td>
              <td class="border bg-white border-zinc-500 text-right">
                {{ sub.outstanding.toLocaleString() }}
              </td>
            </tr>
          </template>
          
        </template>
       

      </table>
    </div>

  </div>
  <div v-else class="min-h-screen flex items-center justify-center">
    <h3 class="text-center font-bold text-[50px]">กำลังประมวลผล...</h3>
  </div>
  <NuxtLoadingIndicator />
 </div>
</template>


<script setup lang="ts">

  import { format } from 'date-fns'
  const dataHead = ref<any[]>([])
  const pending = ref(false)

  onMounted(() => {
    query()
  })

  const query = async () => {
    const res = await $fetch('/api')
    dataHead.value = res ?? []
    pending.value = true
  }
</script>

<style>

html {
  font-family: 'Sarabun', sans-serif;
  font-size: 14px;
}
table tr td {
  @apply p-2
}
</style>