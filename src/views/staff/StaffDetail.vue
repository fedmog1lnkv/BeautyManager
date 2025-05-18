<script setup lang="ts">
import { onMounted, ref, watch, computed } from 'vue';
import { useRoute } from 'vue-router';
import StaffRepository from '@/data/repositories/StaffRepository';
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
    <div class="card" style="padding: 0.5rem">
        <Breadcrumb :home="{ icon: 'pi pi-home', command: () => router.push('/') }" :model="[{ label: 'Сотрудники', command: () => router.push('/staffs') }, { label: originalStaff?.name }]" class="text-sm" />
    </div>

    <div>
        <div class="grid grid-cols-12 gap-8 mt-6">
            <div class="col-span-12 xl:col-span-6 flex flex-col h-full">
                <MainPhotoWidget :title="'Фото сотрудника'" :isLoading="isLoading" :imageUrl="staff?.photo" @upload="uploadPhoto" class="h-full" />
            </div>

            <div class="col-span-12 xl:col-span-6 flex flex-col">
                <div class="card flex flex-col gap-4">
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

                    <!-- Кнопка -->
                    <Button label="Сохранить" :disabled="!hasChanges" @click="saveStaff" class="w-full" />

                    <Button
                        :label="deleteButtonText"
                        icon="pi pi-trash"
                        severity="danger"
                        outlined
                        @click="onDeleteClick"
                        class="w-full mt-4"
                        :loading="deleteLoading"
                    />
                </div>
            </div>
        </div>
    </div>
</template>
