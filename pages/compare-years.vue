<template>
    <div class="p-8">
        <h1 class="text-3xl font-bold mb-8">เปรียบเทียบข้อมูลระหว่างปี 2567 และ 2568</h1>
        
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <!-- ปี 2567 -->
            <div class="border rounded-lg p-6">
                <h2 class="text-2xl font-bold mb-4 text-blue-600">ปี 2567</h2>
                <div v-if="loading67" class="text-center py-8">
                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p class="mt-2">กำลังโหลดข้อมูล...</p>
                </div>
                <div v-else-if="error67" class="text-red-600 p-4 bg-red-100 rounded">
                    <p>Error: {{ error67 }}</p>
                </div>
                <div v-else class="space-y-4">
                    <div class="bg-blue-50 p-4 rounded">
                        <h3 class="font-bold">Database Info:</h3>
                        <p>Year: {{ data67?.year }}</p>
                        <p>Database: {{ data67?.database }}</p>
                    </div>
                    <div class="bg-green-50 p-4 rounded">
                        <h3 class="font-bold">Statistics:</h3>
                        <p>Count Request: {{ data67?.countRequest?.toLocaleString() }}</p>
                        <p>All Transfer: {{ data67?.allTransfer?.toLocaleString() }}</p>
                        <p>All Money Transfer: {{ data67?.allMoneyTransfer?.toLocaleString() }}</p>
                    </div>
                    <div class="bg-yellow-50 p-4 rounded">
                        <h3 class="font-bold">Top Province:</h3>
                        <p>{{ data67?.topRequest?.p_name || 'N/A' }}</p>
                        <p>Count: {{ data67?.topRequest?.top_count?.toLocaleString() }}</p>
                    </div>
                </div>
            </div>

            <!-- ปี 2568 -->
            <div class="border rounded-lg p-6">
                <h2 class="text-2xl font-bold mb-4 text-green-600">ปี 2568</h2>
                <div v-if="loading68" class="text-center py-8">
                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                    <p class="mt-2">กำลังโหลดข้อมูล...</p>
                </div>
                <div v-else-if="error68" class="text-red-600 p-4 bg-red-100 rounded">
                    <p>Error: {{ error68 }}</p>
                </div>
                <div v-else class="space-y-4">
                    <div class="bg-blue-50 p-4 rounded">
                        <h3 class="font-bold">Database Info:</h3>
                        <p>Year: {{ data68?.year }}</p>
                        <p>Database: {{ data68?.database }}</p>
                    </div>
                    <div class="bg-green-50 p-4 rounded">
                        <h3 class="font-bold">Statistics:</h3>
                        <p>Count Request: {{ data68?.countRequest?.toLocaleString() }}</p>
                        <p>All Transfer: {{ data68?.allTransfer?.toLocaleString() }}</p>
                        <p>All Money Transfer: {{ data68?.allMoneyTransfer?.toLocaleString() }}</p>
                    </div>
                    <div class="bg-yellow-50 p-4 rounded">
                        <h3 class="font-bold">Top Province:</h3>
                        <p>{{ data68?.topRequest?.p_name || 'N/A' }}</p>
                        <p>Count: {{ data68?.topRequest?.top_count?.toLocaleString() }}</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Comparison -->
        <div class="mt-8 border rounded-lg p-6">
            <h2 class="text-2xl font-bold mb-4">การเปรียบเทียบ</h2>
            <div v-if="data67 && data68" class="space-y-4">
                <div class="grid grid-cols-3 gap-4 text-center">
                    <div class="bg-gray-50 p-4 rounded">
                        <h3 class="font-bold">Count Request</h3>
                        <p class="text-blue-600">{{ data67.countRequest?.toLocaleString() }}</p>
                        <p class="text-green-600">{{ data68.countRequest?.toLocaleString() }}</p>
                        <p class="text-sm text-gray-600">
                            Difference: {{ (data68.countRequest - data67.countRequest)?.toLocaleString() }}
                        </p>
                    </div>
                    <div class="bg-gray-50 p-4 rounded">
                        <h3 class="font-bold">All Transfer</h3>
                        <p class="text-blue-600">{{ data67.allTransfer?.toLocaleString() }}</p>
                        <p class="text-green-600">{{ data68.allTransfer?.toLocaleString() }}</p>
                        <p class="text-sm text-gray-600">
                            Difference: {{ (data68.allTransfer - data67.allTransfer)?.toLocaleString() }}
                        </p>
                    </div>
                    <div class="bg-gray-50 p-4 rounded">
                        <h3 class="font-bold">Money Transfer</h3>
                        <p class="text-blue-600">{{ data67.allMoneyTransfer?.toLocaleString() }}</p>
                        <p class="text-green-600">{{ data68.allMoneyTransfer?.toLocaleString() }}</p>
                        <p class="text-sm text-gray-600">
                            Difference: {{ (data68.allMoneyTransfer - data67.allMoneyTransfer)?.toLocaleString() }}
                        </p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Refresh Button -->
        <div class="mt-8 text-center">
            <button @click="refreshData" class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
                Refresh Data
            </button>
        </div>
    </div>
</template>

<script setup>
useSeoMeta({
    title: 'เปรียบเทียบข้อมูลระหว่างปี 2567 และ 2568'
})

// Fetch data for year 2567
const { data: data67, pending: loading67, error: error67, refresh: refresh67 } = await useFetch('/api/onepage-unified?phase=1.0&year=2567', {
    cache: 'no-store',
    headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
    }
})

// Fetch data for year 2568
const { data: data68, pending: loading68, error: error68, refresh: refresh68 } = await useFetch('/api/onepage-unified?phase=1.0&year=2568', {
    cache: 'no-store',
    headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
    }
})

// Refresh function
const refreshData = () => {
    refresh67()
    refresh68()
}

// Watch for data changes and log them
watch([data67, data68], ([newData67, newData68]) => {
    if (newData67) {
        console.log('=== Year 2567 Data ===')
        console.log('Database:', newData67.database)
        console.log('Count Request:', newData67.countRequest)
        console.log('All Transfer:', newData67.allTransfer)
    }
    if (newData68) {
        console.log('=== Year 2568 Data ===')
        console.log('Database:', newData68.database)
        console.log('Count Request:', newData68.countRequest)
        console.log('All Transfer:', newData68.allTransfer)
    }
}, { immediate: true })
</script>
