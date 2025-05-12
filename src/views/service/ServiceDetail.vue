<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import router from '@/router';
import MainPhotoWidget from '@/components/dashboard/MainPhotoWidget.vue';
import InputNumber from 'primevue/inputnumber';
import InputText from 'primevue/inputtext';
import Rating from 'primevue/rating';
import Skeleton from 'primevue/skeleton';
import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Service from '@/data/models/Service';
import StaffProfile from '@/data/models/StaffProfile';
import Venue from '@/data/models/Venue';
import ServiceRepository from '@/data/repositories/ServiceRepository';
import VenueRepository from '@/data/repositories/VenueRepository';
import MarkdownRenderer from '@/views/service/MarkdownRenderer.vue';
import { useDebounceFn } from '@vueuse/core';

const route = useRoute();
const isLoading = ref(true);

const service = ref<Service>(null);
const originalService = ref<Service>(null);
const hasChanges = computed(() => {
    return JSON.stringify(service.value) != JSON.stringify(originalService.value);
});

const staff = ref<StaffProfile[]>([]);
const venues = ref<Venue[]>();

const multiselectStaffValue = ref([]);
const multiselectVenuesValue = ref([]);
const addStaff = () => {
    multiselectStaffValue.value.forEach((staffId: string) => {});
};

const syncVenues = useDebounceFn(async () => {
    await ServiceRepository.saveServiceVenues(
        service.value,
        selectedVenues.value.map((v) => v.id)
    );
}, 500);

const toggleVenue = async (value) => {
    await syncVenues();
};

async function loadService() {
    isLoading.value = true;
    try {
        service.value = await ServiceRepository.getService(route.params.id as string);
        originalService.value = JSON.parse(JSON.stringify(service.value));
        venues.value = await VenueRepository.getVenues();
        selectedVenues.value = venues.value.filter((v) => service.value.venueIds.includes(v.id));
    } catch (_) {
    } finally {
        isLoading.value = false;
    }
}

const normalize = (obj: any): any => {
    if (Array.isArray(obj)) return obj.map(normalize);
    if (obj && typeof obj === 'object') {
        const normalized: any = {};
        for (const key in obj) {
            normalized[key] = normalize(obj[key]);
        }
        return normalized;
    }
    return obj === null || obj === undefined ? '' : obj;
};

const saveService = async () => {
    isLoading.value = true;
    try {
        await ServiceRepository.saveService(service.value);
        await loadService();
    } catch (e) {
        console.error('Ошибка сохранения сервиса:', e);
    } finally {
        isLoading.value = false;
    }
};
const uploadPhoto = async (file: File) => {};

const selectedVenues = ref<Venue[]>([]);

onMounted(loadService);
</script>
<template>
    <div class="card" style="padding: 0.5rem">
        <Breadcrumb :home="{ icon: 'pi pi-home', command: () => router.push('/') }" :model="[{ label: 'Сервисы', command: () => router.push('/services') }, { label: service?.name }]" class="text-sm" />
    </div>

    <div class="grid grid-cols-12 gap-8 mt-6">
        <div class="col-span-12 xl:col-span-6 flex flex-col h-full">
            <MainPhotoWidget :title="'Фото сервиса'" :isLoading="isLoading" :imageUrl="service?.photo" @upload="uploadPhoto" class="h-full" />
        </div>
        <div class="col-span-12 xl:col-span-6 flex flex-col h-full">
            <div class="card flex flex-col gap-4 flex-1">
                <!-- Название -->
                <div class="font-semibold text-xl">
                    <Skeleton v-if="isLoading" width="50%" height="1.5rem" />
                    <span v-else>Название</span>
                </div>
                <Skeleton v-if="isLoading" width="100%" height="2.5rem" class="mb-2" />
                <InputText v-else v-model="service.name" class="w-full" />

                <!-- Длительность -->
                <div class="font-semibold text-xl">
                    <Skeleton v-if="isLoading" width="50%" height="1.5rem" />
                    <span v-else>Длительность (ч:м:с)</span>
                </div>
                <Skeleton v-if="isLoading" width="100%" height="2.5rem" class="mb-2" />
                <InputMask mask="99:99:99" v-else v-model="service.duration" class="w-full" />

                <!-- Цена -->
                <div class="font-semibold text-xl">
                    <Skeleton v-if="isLoading" width="50%" height="1.5rem" />
                    <span v-else>Цена (₽)</span>
                </div>
                <Skeleton v-if="isLoading" width="100%" height="2.5rem" class="mb-2" />
                <InputNumber v-else v-model="service.price" class="w-full" mode="currency" currency="RUB" locale="ru-RU" />

                <!-- Рейтинг -->
                <div class="font-semibold text-xl">
                    <Skeleton v-if="isLoading" width="50%" height="1.5rem" />
                    <span v-else>Рейтинг</span>
                </div>
                <Skeleton v-if="isLoading" width="100%" height="2.5rem" class="mb-2" />
                <Rating v-else :modelValue="service.rating / 2" readonly />

                <!-- Кнопка -->
                <Button label="Сохранить" :disabled="!hasChanges" @click="saveService" class="w-full" />
            </div>
        </div>

        <div class="col-span-12 flex flex-col h-full">
            <Skeleton v-if="isLoading" width="100%" height="2.5rem" class="mb-2" />
            <div v-else class="card flex flex-col gap-4 flex-1">
                <div class="font-semibold text-xl">Описание</div>
                <div class="flex flex-row gap-4 flex-1">
                    <Textarea v-model="service.description" :autoResize="true" class="w-full" />
                    <MarkdownRenderer :source="service.description" class="w-full" />
                </div>
            </div>
        </div>

        <div class="col-span-12 flex flex-col h-full">
            <!-- Добавление сотрудников -->
<!--            <div class="card flex flex-col gap-4 flex-1">-->
<!--                <div class="font-semibold text-xl mb-4">Сотрудники</div>-->
<!--                <MultiSelect v-model="multiselectStaffValue" :options="staff" optionLabel="name" placeholder="Выберите сотрудников" :filter="true" class="mb-4">-->
<!--                    <template #value="slotProps">-->
<!--                        <div class="inline-flex items-center py-1 px-2 bg-primary text-primary-contrast rounded-border mr-2" v-for="option of slotProps.value" :key="option.code">-->
<!--                            <div>{{ option.name }}</div>-->
<!--                        </div>-->
<!--                        <template v-if="!slotProps.value || slotProps.value.length === 0">-->
<!--                            <div class="p-1">Выберите сотрудников</div>-->
<!--                        </template>-->
<!--                    </template>-->
<!--                </MultiSelect>-->
<!--                <Button label="Добавить сотрудников" icon="pi pi-plus" @click="addStaff" class="w-full" />-->

<!--                &lt;!&ndash; Таблица сотрудников &ndash;&gt;-->
<!--                <DataTable :value="staff" :loading="isLoading" dataKey="id">-->
<!--                    <Column field="name" header="Имя" />-->
<!--                    <Column field="role" header="Роль" />-->
<!--                    <Column header="Фото">-->
<!--                        <template #body="{ data }">-->
<!--                            <img :src="data.photo" alt="photo" style="width: 50px; height: 50px; border-radius: 50%" />-->
<!--                        </template>-->
<!--                    </Column>-->
<!--                </DataTable>-->
<!--            </div>-->

            <!-- Добавление салонов -->
            <div v-if="!isLoading" class="card flex flex-col gap-4 flex-1 mt-6">
                <div class="font-semibold text-xl mb-4">Салоны</div>
                <DataTable v-model:selection="selectedVenues" @rowSelect="toggleVenue" :value="venues" :loading="isLoading" dataKey="id">
                    <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
                    <Column field="name" header="Название">
                        <template #body="{ data }">
                            {{ data.name.value }}
                        </template>
                    </Column>
                    <Column field="address" header="Адрес">
                        <template #body="{ data }">
                            {{ data.address.value }}
                        </template>
                    </Column>
                    <Column field="theme.photo" header="Фото">
                        <template #body="{ data }"><img class="rounded object-cover" :src="data.theme.photo" alt="photo" style="width: 80px; height: 48px" /></template>
                    </Column>
                </DataTable>
            </div>
        </div>
    </div>
</template>
