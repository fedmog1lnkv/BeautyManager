<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { FilterMatchMode } from '@primevue/core/api';
import router from '@/router';
import { DataTablePageEvent } from 'primevue/datatable';
import CouponRepository from '@/data/repositories/CouponRepository';
import OrganizationRepository from '@/data/repositories/OrganizationRepository';
import ServiceRepository from '@/data/repositories/ServiceRepository';
import { DiscountType } from '@/data/models/DiscountType';
import { useDebounceFn } from '@vueuse/core';
import Coupon from '@/data/models/Coupon';

// Хлебные крошки
const breadcrumbHome = ref({ icon: 'pi pi-home', to: '/' });
const breadcrumbItems = ref([{ label: 'Купоны', to: '/coupons' }]);

// Основные состояния
const coupons = ref<Coupon[]>([]);
const isLoading = ref(true);
const isDialogVisible = ref(false);
const pageSize = 5;
const totalCoupons = ref(0);
const searchText = ref('');
const currentPage = ref(0);

// Новый купон
const newCoupon = ref({
    name: '',
    description: '',
    discountType: 'Fixed',
    discountValue: 0,
    isPublic: false,
    usageLimit: 1,
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
    serviceIds: []
});

const minEndDate = computed(() => {
    return new Date(newCoupon.value.startDate);
});

function onStartDateChange() {
    if (newCoupon.value.endDate < newCoupon.value.startDate) {
        newCoupon.value.endDate = newCoupon.value.startDate;
    }
}

watch(
    () => newCoupon.value.startDate,
    (newStart) => {
        const start = new Date(newStart);
        const end = new Date(newCoupon.value.endDate);

        if (end < start) {
            // Обновляем endDate, чтобы не было раньше startDate
            newCoupon.value.endDate = newStart;
        }
    }
);

// Список доступных услуг
const availableServices = ref<Service[]>([]);
const isServicesLoading = ref(false);

const canCreateCoupon = computed(() => {
    return !isLoading.value && newCoupon.value.name.trim().length > 0 && newCoupon.value.discountValue > 0;
});

const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});

const selectRow = (data: Coupon) => {
    router.push({ name: 'couponDetail', params: { id: data.id } });
};

const loadCoupons = async () => {
    isLoading.value = true;
    try {
        const paging = await CouponRepository.getCoupons(0, pageSize, searchText.value);
        coupons.value = paging.data;
        totalCoupons.value = paging.totalCount;
    } finally {
        isLoading.value = false;
    }
};

const loadPage = async (page: number) => {
    isLoading.value = true;
    try {
        const paging = await CouponRepository.getCoupons(page, pageSize, searchText.value);
        coupons.value = paging.data;
        totalCoupons.value = paging.totalCount;
    } finally {
        isLoading.value = false;
    }
};

const pageSelected = async (params: DataTablePageEvent) => {
    await loadPage(params.page);
};

const applySearch = useDebounceFn(async () => {
    currentPage.value = 0;
    await loadPage(0);
}, 500);

const searchChanged = async () => {
    await applySearch();
};

const addCoupon = async () => {
    isLoading.value = true;
    try {
        const org = await OrganizationRepository.getCachedOrFetch();
        await CouponRepository.createCoupon(
            new Coupon(
                undefined,
                org.id,
                newCoupon.value.name,
                newCoupon.value.description,
                '',
                newCoupon.value.discountType,
                newCoupon.value.discountValue,
                newCoupon.value.isPublic,
                newCoupon.value.usageLimit,
                newCoupon.value.usageLimit,
                newCoupon.value.startDate,
                newCoupon.value.endDate,
                newCoupon.value.serviceIds
            )
        );

        isDialogVisible.value = false;
        currentPage.value = 0;
        await loadPage(0);
    } finally {
        isLoading.value = false;
    }
};

function openCouponCreationDialog() {
    isDialogVisible.value = true;
    if (availableServices.value.length === 0) {
        loadServices();
    }
}

const loadServices = async () => {
    isServicesLoading.value = true;
    try {
        const response = await ServiceRepository.getServices(0, 1000000000, '');
        availableServices.value = response.data;
        console.log(availableServices.value);
    } catch (e) {
        console.error('Ошибка при загрузке сервисов', e);
    } finally {
        isServicesLoading.value = false;
    }
};

const discountTypeOptions = [
    { label: 'Фиксированная сумма', value: DiscountType.Fixed },
    { label: 'Процент', value: DiscountType.Percentage }
];

onMounted(loadCoupons);
</script>
<template>
    <div class="card" style="padding: 0.5rem">
        <Breadcrumb :home="breadcrumbHome" :model="breadcrumbItems" class="text-sm" />
    </div>

    <div class="flex flex-col">
        <div class="card">
            <div class="font-semibold text-xl mb-4">Купоны</div>

            <DataTable paginator v-model:first="currentPage" @page="pageSelected" :total-records="totalCoupons" :rows="pageSize" :lazy="true" :value="coupons" dataKey="id" :loading="isLoading">
                <template #header>
                    <div class="flex justify-between items-center">
                        <IconField>
                            <InputIcon><i class="pi pi-search" /></InputIcon>
                            <InputText @update:modelValue="searchChanged" v-model="searchText" placeholder="Поиск" />
                        </IconField>
                        <Button icon="pi pi-plus" @click="openCouponCreationDialog" severity="success" rounded />
                    </div>
                </template>

                <template #empty>Купоны не найдены</template>
                <template #loading>Загружаем купоны...</template>

                <Column field="name" header="Название" style="min-width: 14rem" />
                <Column field="code" header="Код" style="min-width: 10rem" />
                <Column field="discountType" header="Тип" style="min-width: 8rem" />
                <Column field="discountValue" header="Скидка" style="min-width: 10rem">
                    <template #body="{ data }">
                        {{ data.discountType === 'Percentage' ? data.discountValue + '%' : data.discountValue + '₽' }}
                    </template>
                </Column>
                <Column header="Лимит" style="min-width: 8rem">
                    <template #body="{ data }"> {{ data.usageLimitRemaining }} / {{ data.usageLimit }}</template>
                </Column>
                <Column header="Период действия" style="min-width: 14rem">
                    <template #body="{ data }"> {{ data.startDate }} — {{ data.endDate }}</template>
                </Column>
                <Column field="isPublic" header="Публичный" style="min-width: 8rem">
                    <template #body="{ data }">
                        <i :class="data.isPublic ? 'pi pi-check text-green-500' : 'pi pi-times text-red-500'" />
                    </template>
                </Column>

                <Column class="w-24 !text-end">
                    <template #body="{ data }">
                        <Button icon="pi pi-arrow-up-right" @click="selectRow(data)" severity="secondary" rounded />
                    </template>
                </Column>
            </DataTable>
        </div>
    </div>

    <Dialog v-model:visible="isDialogVisible" modal header="Добавление купона" :style="{ width: '40rem' }">
        <div class="flex flex-col gap-4">
            <div>
                <label class="block mb-1">Название купона</label>
                <InputText v-model="newCoupon.name" placeholder="Например, «Лифт»" class="w-full" />
            </div>

            <div>
                <label class="block mb-1">Описание</label>
                <Textarea v-model="newCoupon.description" rows="3" class="w-full" />
            </div>

            <div class="flex gap-4">
                <div class="flex-1">
                    <label class="block mb-1">Тип скидки</label>
                    <Dropdown v-model="newCoupon.discountType" :options="discountTypeOptions" optionLabel="label" optionValue="value" class="w-full" />
                </div>
                <div class="flex-1">
                    <label class="block mb-1">Значение скидки</label>
                    <InputNumber v-model="newCoupon.discountValue" class="w-full" />
                </div>
            </div>

            <div>
                <label class="block mb-1">Лимит использования</label>
                <InputNumber v-model="newCoupon.usageLimit" class="w-full" />
            </div>

            <div class="flex gap-4">
                <div class="flex-1">
                    <label class="block mb-1">Дата начала</label>
                    <Calendar v-model="newCoupon.startDate" dateFormat="yy-mm-dd" class="w-full" />
                </div>
                <div class="flex-1">
                    <label class="block mb-1">Дата окончания</label>
                    <Calendar v-model="newCoupon.endDate" dateFormat="yy-mm-dd" class="w-full" :minDate="minEndDate" />
                </div>
            </div>

            <div>
                <label class="block mb-1">Публичный</label>
                <Checkbox v-model="newCoupon.isPublic" :binary="true" />
            </div>

            <div>
                <label class="block mb-1">Выбор услуг</label>
                <MultiSelect v-model="newCoupon.serviceIds" :options="availableServices" optionLabel="name" optionValue="id" placeholder="Выберите услуги" class="w-full" :loading="isServicesLoading" />
            </div>
        </div>

        <template #footer>
            <Button label="Готово" icon="pi pi-check" @click="addCoupon" :disabled="!canCreateCoupon" />
        </template>
    </Dialog>
</template>
