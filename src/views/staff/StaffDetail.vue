<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import StaffRepository from '@/data/repositories/StaffRepository';
import ServiceRepository from '@/data/repositories/ServiceRepository';
import MainPhotoWidget from '@/components/dashboard/MainPhotoWidget.vue';
import router from '@/router';
import StaffProfile from '@/data/models/StaffProfile';
import StaffRole from '@/data/models/StaffRole';
import InputMask from 'primevue/inputmask';
import { fileToBase64 } from '@/util/Utils';

const route = useRoute();
const isLoading = ref(true);

const staff = ref<StaffProfile | null>(null);
const originalStaff = ref<StaffProfile | null>(null);
const hasChanges = ref(false);

const services = ref<Service[]>([]);

const goToService = (id: string) => {
    router.push({ path: `/services/${id}` });
};

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

watch(
    staff,
    (newVal) => {
        if (!originalStaff.value || !newVal) {
            hasChanges.value = false;
            return;
        }
        const normalizedOriginal = JSON.stringify(normalize(originalStaff.value));
        const normalizedCurrent = JSON.stringify(normalize(newVal));
        hasChanges.value = normalizedOriginal !== normalizedCurrent;
    },
    { deep: true, immediate: true }
);

const loadStaff = async () => {
    isLoading.value = true;
    const id = route.params.id as string;
    staff.value = await StaffRepository.getStaffById(id);
    originalStaff.value = JSON.parse(JSON.stringify(staff.value));

    if (staff.value?.services && staff.value.services.length > 0) {
        services.value = await ServiceRepository.getStaffServices(staff.value.services);
    } else {
        services.value = [];
    }

    isLoading.value = false;
};

const saveStaff = async () => {
    if (!staff.value) return;
    isLoading.value = true;
    try {
        await StaffRepository.saveStaff(staff.value);
        originalStaff.value = JSON.parse(JSON.stringify(staff.value));
        hasChanges.value = false;
    } catch (e) {
        console.error('Ошибка при сохранении:', e);
    } finally {
        isLoading.value = false;
    }
};

const uploadPhoto = async (file: File) => {
    if (!staff.value) return;
    isLoading.value = true;
    try {
        const base64 = await fileToBase64(file);
        await StaffRepository.saveStaffPhoto(staff.value.id, base64);
        staff.value = await StaffRepository.getStaffById(staff.value.id);
        originalStaff.value = JSON.parse(JSON.stringify(staff.value));
        hasChanges.value = false;
    } catch (e) {
        console.error('Ошибка загрузки фото:', e);
    } finally {
        isLoading.value = false;
    }
};

const roleOptions = Object.values(StaffRole).map((role) => ({
    label: role === 'Manager' ? 'Менеджер' : role === 'Master' ? 'Мастер' : 'Неизвестно',
    value: role
}));

const deleteClickCount = ref(0);
const deleteLoading = ref(false);

const deleteButtonText = computed(() => {
    switch (deleteClickCount.value) {
        case 1:
            return 'Точно удалить?';
        case 2:
            return 'Удалить безвозвратно!';
        default:
            return 'Удалить сотрудника';
    }
});

const onDeleteClick = async () => {
    if (deleteClickCount.value < 2) {
        deleteClickCount.value++;
        return;
    }

    if (!staff.value) return;

    deleteLoading.value = true;
    try {
        await StaffRepository.deleteStaff(staff.value.id);
        router.push('/staffs');
    } catch (e) {
        console.error('Ошибка при удалении:', e);
    } finally {
        deleteLoading.value = false;
    }
};

onMounted(loadStaff);
</script>
<template>
    <div>
        <div class="grid grid-cols-12 gap-8 mt-6" style="align-items: stretch">
            <div class="col-span-12 xl:col-span-6 flex">
                <div style="width: 100%; height: 100%">
                    <MainPhotoWidget :title="'Фото сотрудника'" :isLoading="isLoading" :imageUrl="staff?.photo" @upload="uploadPhoto" style="width: 100%; height: 100%; object-fit: contain" />
                </div>
            </div>

            <div class="col-span-12 xl:col-span-6 flex">
                <div class="card flex flex-col gap-4" style="width: 100%">
                    <!-- Имя -->
                    <div class="font-semibold text-xl">
                        <Skeleton v-if="isLoading" width="50%" height="1.5rem" />
                        <span v-else>Имя</span>
                    </div>
                    <Skeleton v-if="isLoading" width="100%" height="2.5rem" class="mb-2" />
                    <InputText v-else v-model="staff.name" class="w-full" />

                    <!-- Телефон -->
                    <div class="font-semibold text-xl">
                        <Skeleton v-if="isLoading" width="50%" height="1.5rem" />
                        <span v-else>Телефон</span>
                    </div>
                    <Skeleton v-if="isLoading" width="100%" height="2.5rem" class="mb-2" />
                    <InputMask v-else v-model="staff.phoneNumber" mask="+7 (999) 999-99-99" placeholder="+7 (999) 999-99-99" class="w-full" disabled fluid />

                    <!-- Роль -->
                    <div class="font-semibold text-xl">
                        <Skeleton v-if="isLoading" width="50%" height="1.5rem" />
                        <span v-else>Роль</span>
                    </div>
                    <Skeleton v-if="isLoading" width="100%" height="2.5rem" class="mb-2" />
                    <Dropdown v-else v-model="staff.role" :options="roleOptions" optionLabel="label" optionValue="value" placeholder="Выберите роль" class="w-full" />

                    <!-- Рейтинг -->
                    <div class="font-semibold text-xl">
                        <Skeleton v-if="isLoading" width="50%" height="1.5rem" />
                        <span v-else>Рейтинг</span>
                    </div>
                    <Skeleton v-if="isLoading" width="100%" height="2.5rem" class="mb-2" />
                    <Rating v-else-if="staff" :modelValue="staff.rating / 2" readonly />

                    <!-- Кнопки -->
                    <Button label="Сохранить" :disabled="!hasChanges" @click="saveStaff" class="w-full mt-4" />
                    <Button :label="deleteButtonText" icon="pi pi-trash" severity="danger" outlined @click="onDeleteClick" class="w-full mt-2" :loading="deleteLoading" />
                </div>
            </div>
        </div>

        <div class="card mt-6">
            <div class="font-semibold text-xl mb-3">Услуги сотрудника</div>

            <div v-if="isLoading">
                <Skeleton width="100%" height="2rem" v-for="n in 3" :key="n" class="mb-2" />
            </div>

            <div v-else-if="services.length === 0">Услуги не найдены</div>

            <DataTable v-else :value="services" dataKey="id" class="p-datatable-sm" :loading="isLoading" :paginator="false" :rows="services.length" :empty-message="'Услуги не найдены'">
                <Column header="Название" style="min-width: 20rem">
                    <template #body="{ data }">
                        <div class="flex items-center gap-3">
                            <img :src="data.photo" :alt="data.name" class="rounded object-cover" style="width: 80px; height: 48px" />
                            <span>{{ data.name }}</span>
                        </div>
                    </template>
                </Column>

                <Column header="Длительность" style="min-width: 10rem">
                    <template #body="{ data }">{{ data.duration?.substring(0, 5) ?? '—' }}</template>
                </Column>

                <Column header="Цена (₽)" style="min-width: 10rem">
                    <template #body="{ data }">{{ data.price ?? '—' }}</template>
                </Column>

                <Column header="Рейтинг" style="min-width: 8rem">
                    <template #body="{ data }">
                        <Rating :modelValue="data.rating / 2" readonly />
                    </template>
                </Column>

                <Column style="width: 4rem; text-align: center">
                    <template #body="{ data }">
                        <Button icon="pi pi-arrow-up-right" @click="goToService(data.id)" severity="secondary" rounded />
                    </template>
                </Column>
            </DataTable>
        </div>
    </div>
</template>
