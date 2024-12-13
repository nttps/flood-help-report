<template>
  <div>
    
  </div>
</template>

<script lang="ts" setup>


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
onMounted(() => {
    query()
})
const dataHead = ref<Head[]>([])
const pending = ref(false)
const route = useRoute()

const query = async () => {
  const res = await $fetch(`/api/?phase=${route.query.phase}&${route.query.paymentDateStart ? '' : `startDate=${route.query?.startDate}&endDate=${route.query?.endDate}&`}${route.query.pcode ? `pcode=${route.query.pcode}`: ''}${route.query.paymentDateStart ? `&paymentDateStart=${route.query.paymentDateStart}`: ''}${route.query.paymentDateStart ? `&paymentDateEnd=${route.query.paymentDateEnd}`: ''}`)
  dataHead.value = res ?? []
  pending.value = true
  generatePDF(dataHead.value)
}
    


</script>

<style>

</style>