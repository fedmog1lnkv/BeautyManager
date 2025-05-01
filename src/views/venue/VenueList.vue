<script setup lang="ts">
import { onMounted, ref } from 'vue';
import VenueDialog from '@/components/venue/VenueInfoWidget.vue';
import VenueRepository from '@/data/repositories/VenueRepository';
import router from '@/router/index';

const options = ref(['grid', 'list']);
const layout = ref('grid');

const displayDialog = ref(false);
const selectedVenueId = ref(null);

const breadcrumbHome = ref({ icon: 'pi pi-home', to: '/' });
const breadcrumbItems = ref([{ label: 'Салоны', to: '/venues' }]);

const venues = ref([]);
const isLoading = ref(true);

const loadVenues = async () => {
    isLoading.value = true;
    venues.value = await VenueRepository.getVenues();
    isLoading.value = false;
};

const goToVenueDetail = (id: string) => {
    router.push({ name: 'venueDetail', params: { id } });
};

onMounted(loadVenues);
</script>

<template>
    <div class="card" style="padding: 0.5rem">
        <Breadcrumb :home="breadcrumbHome" :model="breadcrumbItems" class="text-sm" />
    </div>

    <div class="flex flex-col">
        <div class="card">
            <div class="font-semibold text-xl">Список салонов</div>

            <div v-if="isLoading">Loading...</div>

            <DataView v-else :value="venues" :layout="layout">
                <template #header>
                    <div class="flex justify-end">
                        <SelectButton v-model="layout" :options="options" :allowEmpty="false">
                            <template #option="{ option }">
                                <i :class="[option === 'list' ? 'pi pi-bars' : 'pi pi-table']" />
                            </template>
                        </SelectButton>
                    </div>
                </template>
                <template #grid="slotProps">
                    <div class="grid grid-cols-12 gap-4">
                        <div v-for="(item, index) in slotProps.items" :key="index" class="col-span-12 sm:col-span-6 lg:col-span-4 p-2">
                            <div class="p-6 border border-surface-200 dark:border-surface-700 bg-surface-0 dark:bg-surface-900 rounded flex flex-col">
                                <div class="bg-surface-50 flex justify-center rounded p-2">
                                    <div class="relative mx-auto">
                                        <img class="rounded w-full" :src="item.theme.photo" :alt="item.name.value" style="max-width: 300px; max-height: 150px" />
                                    </div>
                                </div>
                                <div class="pt-6">
                                    <div class="flex justify-between items-center">
                                        <div class="text-lg font-medium mt-1">{{ item.name.value }}</div>

                                        <div class="bg-surface-100 p-1 rounded-full">
                                            <div
                                                class="bg-surface-0 flex items-center gap-2 justify-center py-1 px-2"
                                                style="
                                                    border-radius: 30px;
                                                    box-shadow:
                                                        0px 1px 2px 0px rgba(0, 0, 0, 0.04),
                                                        0px 1px 2px 0px rgba(0, 0, 0, 0.06);
                                                "
                                            >
                                                <span class="text-surface-900 font-medium text-sm">{{ item.rating.value }}</span>
                                                <i class="pi pi-star-fill text-yellow-500"></i>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="mt-2">
                                        <span class="font-medium text-surface-500 dark:text-surface-400 text-sm line-clamp-2 min-h-[3em]">
                                            {{ item.description.value }}
                                        </span>
                                    </div>

                                    <div class="flex flex-col gap-6 mt-6">
                                        <span class="text-xl font-semibold">{{ item.address.value }}</span>
                                        <div class="flex gap-2">
                                            <Button icon="pi pi-arrow-up-right" label="Подробнее" class="flex-auto whitespace-nowrap" @click="goToVenueDetail(item.id)" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </template>
                <template #list="slotProps">
                    <div class="flex flex-col divide-y divide-surface-200 dark:divide-surface-700">
                        <div v-for="(item, index) in slotProps.items" :key="index" class="flex flex-row p-4 gap-4">
                            <div class="w-32 h-20 flex-shrink-0">
                                <img class="rounded w-full h-full object-cover" :src="item.theme.photo" :alt="item.name.value" />
                            </div>

                            <div class="flex flex-col justify-between flex-grow">
                                <div>
                                    <div class="flex items-center">
                                        <div class="text-lg font-semibold mr-2">{{ item.name.value }}</div>
                                        <div class="flex items-center p-1">
                                            <span class="text-surface-900 font-semibold text-lg">{{ item.rating.value }}</span>
                                            <i class="pi pi-star-fill text-yellow-500 ml-1"></i>
                                        </div>
                                    </div>

                                    <div class="text-surface-500 dark:text-surface-400 text-sm line-clamp-1 min-h-[1.5em]">
                                        {{ item.description.value }}
                                    </div>
                                </div>

                                <div class="text-sm text-surface-600 mt-2">{{ item.address.value }}</div>
                            </div>

                            <div class="flex items-center">
                                <Button icon="pi pi-arrow-up-right" label="Подробнее" class="whitespace-nowrap" @click="goToVenueDetail(item.id)" />
                            </div>
                        </div>
                    </div>
                </template>
            </DataView>
        </div>

        <VenueDialog v-model:visible="displayDialog" :venueId="selectedVenueId" @updateVenue="updateVenue" />
    </div>
</template>
