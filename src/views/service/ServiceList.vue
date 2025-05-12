<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { FilterMatchMode } from '@primevue/core/api';
import router from '@/router';
import { DataTablePageEvent } from 'primevue/datatable';
import ServiceRepository from '@/data/repositories/ServiceRepository';
import Service from '@/data/models/Service';
import { useDebounceFn } from '@vueuse/core';
import InputMask from 'primevue/inputmask';
import OrganizationRepository from '@/data/repositories/OrganizationRepository';

const breadcrumbHome = ref({ icon: 'pi pi-home', to: '/' });
const breadcrumbItems = ref([{ label: 'Услуги', to: '/services' }]);

const services = ref<Service[]>([]);
const isLoading = ref(true);

const isDialogVisible = ref(false);
const pageSize = 5;

const totalServices = ref(0);

const searchText = ref('');

const currentPage = ref(0);

const creationServiceName = ref('');
const canCreateVenue = computed(() => {
    return !isLoading.value && creationServiceName.value.trim().length > 0;
});

const loadServices = async () => {
    isLoading.value = true;
    try {
        const paging = await ServiceRepository.getServices(0, pageSize, searchText.value);
        services.value = paging.data;
        totalServices.value = paging.totalCount;
    } catch (e) {
    } finally {
        isLoading.value = false;
    }
};

const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});

const selectRow = (data) => {
    router.push({ name: 'serviceDetail', params: { id: data.id } });
};
const loadPage = async (page: number) => {
    isLoading.value = true;
    try {
        const paging = await ServiceRepository.getServices(page, pageSize, searchText.value);
        services.value = paging.data;
        totalServices.value = paging.totalCount;
    } catch (e) {
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

const searchChanged = async (value: string) => {
    await applySearch();
};

const addService = async () => {
    isLoading.value = true;
    try {
        await ServiceRepository.createService((await OrganizationRepository.getCachedOrFetch()).id, creationServiceName.value);
        isDialogVisible.value = false;
        currentPage.value = 0;
        await loadPage(0);
    } catch (e) {
    } finally {
        isLoading.value = false;
    }
};

function openServiceCreationDialog() {
    isDialogVisible.value = true;
}

onMounted(loadServices);
</script>
<template>
    <div class="card" style="padding: 0.5rem">
        <Breadcrumb :home="breadcrumbHome" :model="breadcrumbItems" class="text-sm" />
    </div>

    <div class="flex flex-col">
        <div class="card">
            <div class="font-semibold text-xl mb-4">Сервисы</div>

            <DataTable paginator v-model:first="currentPage" @page="pageSelected" :total-records="totalServices" :rows="pageSize" :lazy="true" :value="services" dataKey="name" :loading="isLoading">
                <template #header>
                    <div class="flex justify-between items-center">
                        <IconField>
                            <InputIcon>
                                <i class="pi pi-search" />
                            </InputIcon>
                            <InputText @update:modelValue="searchChanged" v-model="searchText" placeholder="Поиск" />
                        </IconField>
                        <Button icon="pi pi-plus" @click="openServiceCreationDialog" severity="success" rounded />
                    </div>
                </template>

                <template #empty>Сервисы не найдены</template>
                <template #loading>Загружаем сервисы...</template>

                <Column field="name" header="Название" style="min-width: 14rem">
                    <template #body="{ data }">
                        <div class="flex items-center gap-2">
                            <img :alt="data.name" :src="data.photo" style="width: 80px; height: 48px" class="rounded object-cover" />
                            <span>{{ data.name }}</span>
                        </div>
                    </template>
                </Column>

                <Column field="duration" header="Длительность" style="min-width: 10rem">
                    <template #body="{ data }">
                        {{ data.duration?.substring(0, 5) ?? '—' }}
                    </template>
                </Column>

                <Column field="price" header="Цена (₽)" style="min-width: 10rem">
                    <template #body="{ data }">
                        {{ data.price ?? '—' }}
                    </template>
                </Column>

                <Column field="rating" header="Рейтинг" style="min-width: 12rem">
                    <template #body="{ data }">
                        <Rating :modelValue="data.rating / 2" readonly />
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

    <Dialog v-model:visible="isDialogVisible" modal header="Добавление услуги" :style="{ width: '30rem' }">
        <div class="flex flex-col gap-3">
            <label class="block mb-2">Название услуги</label>
            <InputText v-model="creationServiceName" placeholder="Стрижка" class="w-full mb-8 p-3 border border-gray-300 rounded" fluid />
        </div>
        <template #footer>
            <Button label="Готово" icon="pi pi-check" @click="addService" :disabled="!canCreateVenue" />
        </template>
    </Dialog>
</template>
