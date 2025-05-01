<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue';
import OrganizationRepository from '@/data/repositories/OrganizationRepository';
import Organization from '@/data/models/Organization';
import OrganizationStats from '@/data/models/OrganizationStats';
import StatsItemWidget from '@/components/dashboard/StatsItemWidget.vue';

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
        return color.startsWith('#') ? color.toUpperCase() : `#${color.toUpperCase()}`;
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

const saveOrganization = () => {
    if (organization.value) {
        console.log('Сохраняем:', JSON.stringify(organization.value, null, 2));
        // Пример: await OrganizationRepository.save(organization.value);
        originalOrganization.value = JSON.parse(JSON.stringify(organization.value)); // обновить оригинал
        hasChanges.value = false;
    }
};


const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const loadOrganization = async () => {
    isLoading.value = true;
    await sleep(500);
    organization.value = await OrganizationRepository.getOrganization();
    originalOrganization.value = JSON.parse(JSON.stringify(organization.value));
    stats.value = await OrganizationRepository.getStats();
    isLoading.value = false;
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
        <div v-if="organization" class="col-span-12 xl:col-span-6">
            <div class="card">
                <div class="font-semibold text-xl mb-4">Главное фото</div>
                <img :src="organization.theme.photo" :alt="organization.theme.photo" width="100%" class="shadow" />
            </div>
        </div>
        <div v-if="organization" class="col-span-12 xl:col-span-6">
            <div class="card flex flex-col gap-4">
                <div class="font-semibold text-xl">Название организации</div>
                <InputText type="text" v-model="organization.name" rows="3" cols="30" />

                <div class="font-semibold text-xl">Описание организации</div>
                <Textarea v-model="organization.description" :autoResize="true" rows="3" cols="30" />

                <div class="font-semibold text-xl mb-2">Цвет организации</div>
                <div class="flex items-center gap-2">
                    <InputText v-model="colorUppercase" class="w-full" />
                    <ColorPicker v-model="organization.theme.color" />
                </div>

                <div class="font-semibold text-xl">Статус подписки</div>
                <Button :label="organization.subscription.toLowerCase() === 'active' ? 'Активна' : 'Не активна'" :severity="organization.subscription.toLowerCase() === 'active' ? 'success' : 'danger'" outlined disabled />

                <Button
                    label="Сохранить"
                    :disabled="!hasChanges"
                    @click="saveOrganization"
                    class="w-full"
                />
            </div>
        </div>
    </div>
</template>
