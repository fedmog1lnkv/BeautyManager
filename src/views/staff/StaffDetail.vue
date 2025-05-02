<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
// import StaffRepository from '@/data/repositories/StaffRepository';
import MainPhotoWidget from '@/components/dashboard/MainPhotoWidget.vue';
import router from '@/router';
import StaffProfile from "@/data/models/StaffProfile";
import StaffRole from "@/data/models/StaffRole";
import InputMask from "primevue/inputmask";

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
    // staff.value = await StaffRepository.getStaff(id);
    staff.value = {
        id: '1',
        name: 'Иван Иванов',
        phoneNumber: '79991234567',
        role: StaffRole.Master,
        rating: 4.7,
        photo: 'https://beauty-images.storage.yandexcloud.net/staffs/ce787f0c-af70-422e-854d-434ce1b21bde.jpg',
    };
    originalStaff.value = JSON.parse(JSON.stringify(staff.value));
    isLoading.value = false;
};

// const saveStaff = async () => {
//     if (!staff.value) return;
//     isLoading.value = true;
//     try {
//         await StaffRepository.saveStaff(staff.value);
//         originalStaff.value = JSON.parse(JSON.stringify(staff.value));
//         hasChanges.value = false;
//     } catch (e) {
//         console.error('Ошибка при сохранении:', e);
//     } finally {
//         isLoading.value = false;
//     }
// };

// const uploadPhoto = async (file: File) => {
//     if (!staff.value) return;
//     isLoading.value = true;
//     try {
//         const base64 = await fileToBase64(file);
//         await StaffRepository.saveStaffPhoto(staff.value.id, base64);
//         staff.value.photo = base64; // Если API сразу не возвращает новое значение — можно так
//         hasChanges.value = true;
//     } catch (e) {
//         console.error('Ошибка загрузки фото:', e);
//     } finally {
//         isLoading.value = false;
//     }
// };

const roleOptions = Object.values(StaffRole).map(role => ({
    label: role === 'Manager' ? 'Менеджер' : role === 'Master' ? 'Мастер' : 'Неизвестно',
    value: role
}));

onMounted(loadStaff);
</script>
<template>
    <div class="card" style="padding: 0.5rem">
        <Breadcrumb
            :home="{ icon: 'pi pi-home', command: () => router.push('/') }"
            :model="[
                { label: 'Сотрудники', command: () => router.push('/staffs') },
                { label: originalStaff?.name }
            ]"
            class="text-sm"
        />
    </div>

    <div>
        <div class="grid grid-cols-12 gap-8 mt-6">
            <div class="col-span-12 xl:col-span-6 flex flex-col h-full">
                <MainPhotoWidget
                    :title="'Фото сотрудника'"
                    :isLoading="isLoading"
                    :imageUrl="staff?.photo"
                    @upload="uploadPhoto"
                    class="h-full"
                />
            </div>

            <div class="col-span-12 xl:col-span-6 flex flex-col h-full">
                <div class="card flex flex-col gap-4 flex-1">
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
                    <Dropdown
                        v-else
                        v-model="staff.role"
                        :options="roleOptions"
                        optionLabel="label"
                        optionValue="value"
                        placeholder="Выберите роль"
                        class="w-full"
                    />

                    <!-- Рейтинг -->
                    <div class="font-semibold text-xl">
                        <Skeleton v-if="isLoading" width="50%" height="1.5rem" />
                        <span v-else>Рейтинг</span>
                    </div>
                    <Skeleton v-if="isLoading" width="100%" height="2.5rem" class="mb-2" />
                    <Rating :modelValue="staff.rating / 2" readonly />

                    <!-- Кнопка -->
                    <Button label="Сохранить" :disabled="!hasChanges" @click="saveStaff" class="w-full" />
                </div>
            </div>
        </div>
    </div>
</template>
