<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue';
import OrganizationRepository from '@/data/repositories/OrganizationRepository';
import Organization from '@/data/models/Organization';
import OrganizationStats from '@/data/models/OrganizationStats';
import StatsItemWidget from '@/components/dashboard/StatsItemWidget.vue';
import MainPhotoWidget from '@/components/dashboard/MainPhotoWidget.vue';
import { fileToBase64 } from '@/util/Utils';

const isLoading = ref(true);
const organization = ref<Organization | null>(null);
const originalOrganization = ref<Organization | null>(null);
const stats = ref<OrganizationStats>({
    completedRecordsCount: 0,
    uniqueCustomersCount: 0,
    averageRating: 0,
    totalEarned: 0
});

const ratingToShow = computed(() => {
    return stats.value.averageRating / 2;
});

const colorUppercase = computed({
    get: () => {
        const color = organization.value?.theme.color || '';
        organization.value.theme.color = color.startsWith('#') ? color.toUpperCase() : `#${color.toUpperCase()}`;
        return organization.value.theme.color;
    },
    set: (val: string) => {
        if (organization.value) {
            const cleaned = val.startsWith('#') ? val : `#${val}`;
            organization.value.theme.color = cleaned.toUpperCase();
        }
    }
});

const hasChanges = ref(false);
watch(
    organization,
    (newVal) => {
        if (!originalOrganization.value || !newVal) {
            hasChanges.value = false;
            return;
        }

        const normalizedOriginal = JSON.stringify(normalize(originalOrganization.value));
        const normalizedCurrent = JSON.stringify(normalize(newVal));
        hasChanges.value = normalizedOriginal !== normalizedCurrent;
    },
    { deep: true, immediate: true }
);
const normalize = (obj: any): any => {
    if (Array.isArray(obj)) {
        return obj.map(normalize);
    } else if (obj && typeof obj === 'object') {
        const normalized: any = {};
        for (const key in obj) {
            normalized[key] = normalize(obj[key]);
        }
        return normalized;
    } else {
        return obj === null || obj === undefined ? '' : obj;
    }
};

const saveOrganization = async () => {
    isLoading.value = true;
    try {
        if (organization.value) {
            await OrganizationRepository.saveOrganization(organization.value);
            originalOrganization.value = JSON.parse(JSON.stringify(organization.value));
            hasChanges.value = false;
            await loadOrganization();
        }
    } catch (error) {
        console.error('Ошибка при сохранении организации:', error);
    } finally {
        isLoading.value = false;
    }
};

const loadOrganization = async () => {
    isLoading.value = true;
    organization.value = await OrganizationRepository.getOrganization();
    originalOrganization.value = JSON.parse(JSON.stringify(organization.value));
    stats.value = await OrganizationRepository.getStats();
    isLoading.value = false;
};

const uploadPhoto = async (file: File) => {
    try {
        isLoading.value = true;
        const base64 = await fileToBase64(file);
        if (!organization.value) return;
        await OrganizationRepository.uploadPhoto(organization.value.id, base64);
        await loadOrganization();
    } catch (error) {
        console.error('Ошибка при загрузке фото:', error);
    } finally {
        isLoading.value = false;
    }
};

onMounted(loadOrganization);
</script>

<template>
    <div class="grid grid-cols-12 gap-8">
        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <StatsItemWidget title="Выполнено заказов" :value="stats.completedRecordsCount" icon="pi-shopping-cart" bgColor="bg-blue-100 dark:bg-blue-400/10" iconColor="text-blue-500" :isLoading="isLoading" />
        </div>
        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <StatsItemWidget title="Уникальных клиентов" :value="stats.uniqueCustomersCount" icon="pi-users" bgColor="bg-cyan-100 dark:bg-cyan-400/10" iconColor="text-cyan-500" :isLoading="isLoading" />
        </div>
        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <StatsItemWidget title="Средний рейтинг" icon="pi-star" bgColor="bg-yellow-100 dark:bg-cyan-400/10" iconColor="text-yellow-500" :customContent="true" :isLoading="isLoading">
                <Rating v-model="ratingToShow" style="--p-rating-icon-size: 1.695rem" readonly />
            </StatsItemWidget>
        </div>
        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <StatsItemWidget title="Сумма заказов" :value="`${stats.totalEarned} ₽`" icon="pi-credit-card" bgColor="bg-purple-100 dark:bg-purple-400/10" iconColor="text-purple-500" :isLoading="isLoading" />
        </div>
        <div class="col-span-12 xl:col-span-6">
            <MainPhotoWidget :title="'Главное фото'" :isLoading="isLoading" :imageUrl="organization?.theme?.photo" @upload="uploadPhoto" />
        </div>
        <div class="col-span-12 xl:col-span-6">
            <div class="card flex flex-col gap-4">
                <div class="font-semibold text-xl">
                    <Skeleton v-if="isLoading" width="50%" height="1.5rem" />
                    <span v-else>Название организации</span>
                </div>
                <Skeleton v-if="isLoading" width="100%" height="2.5rem" class="mb-2" />
                <InputText v-else v-model="organization.name" rows="3" cols="30" />

                <div class="font-semibold text-xl">
                    <Skeleton v-if="isLoading" width="50%" height="1.5rem" />
                    <span v-else>Описание организации</span>
                </div>
                <Skeleton v-if="isLoading" width="100%" height="5rem" class="mb-2" />
                <Textarea v-else v-model="organization.description" :autoResize="true" rows="3" cols="30" />

                <div class="font-semibold text-xl mb-2">
                    <Skeleton v-if="isLoading" width="50%" height="1.5rem" />
                    <span v-else>Цвет организации</span>
                </div>
                <Skeleton v-if="isLoading" width="100%" height="2.5rem" class="mb-2" />
                <div v-else class="flex items-center gap-2">
                    <InputText v-model="colorUppercase" class="w-full" />
                    <ColorPicker v-model="organization.theme.color" />
                </div>

                <div class="font-semibold text-xl">
                    <Skeleton v-if="isLoading" width="50%" height="1.5rem" />
                    <span v-else>Статус подписки</span>
                </div>
                <Skeleton v-if="isLoading" width="100%" height="2.5rem" class="mb-2" />
                <Button v-else :label="organization.isActiveSubscription() ? 'Активна' : 'Не активна'" :severity="organization.isActiveSubscription() ? 'success' : 'danger'" outlined disabled />

                <Button label="Сохранить" :disabled="!hasChanges" @click="saveOrganization" class="w-full" />
            </div>
        </div>
    </div>
</template>
