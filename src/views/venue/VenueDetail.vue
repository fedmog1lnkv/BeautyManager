<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import VenueRepository from "@/data/repositories/VenueRepository";
import Venue from "@/data/models/Venue";
import MainPhotoWidget from "@/components/dashboard/MainPhotoWidget.vue";
import { fileToBase64 } from "@/util/Utils";

const route = useRoute();
const isLoading = ref(true);

const venue = ref<Venue | null>(null);
const originalVenue = ref<Venue | null>(null);

const hasChanges = ref(false);

const normalize = (obj: any): any => {
    if (Array.isArray(obj)) return obj.map(normalize);
    if (obj && typeof obj === "object") {
        const normalized: any = {};
        for (const key in obj) {
            normalized[key] = normalize(obj[key]);
        }
        return normalized;
    }
    return obj === null || obj === undefined ? "" : obj;
};

watch(
    venue,
    (newVal) => {
        if (!originalVenue.value || !newVal) {
            hasChanges.value = false;
            return;
        }
        const normalizedOriginal = JSON.stringify(normalize(originalVenue.value));
        const normalizedCurrent = JSON.stringify(normalize(newVal));
        hasChanges.value = normalizedOriginal !== normalizedCurrent;
    },
    { deep: true, immediate: true }
);

const colorUppercase = computed({
    get: () => {
        const color = venue.value?.theme.color || "";
        venue.value.theme.color = color.startsWith("#") ? color.toUpperCase() : `#${color.toUpperCase()}`;
        return venue.value.theme.color;
    },
    set: (val: string) => {
        if (venue.value) {
            const cleaned = val.startsWith("#") ? val : `#${val}`;
            venue.value.theme.color = cleaned.toUpperCase();
        }
    }
});

const loadVenue = async () => {
    isLoading.value = true;
    const id = route.params.id as string;
    venue.value = await VenueRepository.getVenue(id);
    originalVenue.value = JSON.parse(JSON.stringify(venue.value));
    isLoading.value = false;
};

const saveVenue = async () => {
    if (!venue.value) return;
    isLoading.value = true;
    try {
        await VenueRepository.saveVenue(venue.value);
        originalVenue.value = JSON.parse(JSON.stringify(venue.value));
        hasChanges.value = false;
    } catch (e) {
        console.error("Ошибка при сохранении:", e);
    } finally {
        isLoading.value = false;
    }
};

const uploadPhoto = async (file: File) => {
    if (!venue.value) return;
    isLoading.value = true;
    try {
        const base64 = await fileToBase64(file);
        await VenueRepository.uploadPhoto(venue.value.id, base64);
        await loadVenue();
    } catch (e) {
        console.error("Ошибка загрузки фото:", e);
    } finally {
        isLoading.value = false;
    }
};

onMounted(loadVenue);
</script>

<template>
    <div class="card" style="padding: 0.5rem">
        <Breadcrumb :home="{ icon: 'pi pi-home' }" :model="[{ label: 'Салоны', to: '/venues' }, { label: venue?.name }]"
                    class="text-sm" />
    </div>
    <div>
        <div class="grid grid-cols-12 gap-8 mt-6">
            <div class="col-span-12 xl:col-span-6 flex flex-col h-full">
                <MainPhotoWidget :title="'Главное фото'" :isLoading="isLoading" :imageUrl="venue?.theme?.photo"
                                 @upload="uploadPhoto" class="h-full" />
            </div>

            <div class="col-span-12 xl:col-span-6 flex flex-col h-full">
                <div class="card flex flex-col gap-4 flex-1">
                    <div class="font-semibold text-xl">
                        <Skeleton v-if="isLoading" width="50%" height="1.5rem" />
                        <span v-else>Название салона</span>
                    </div>
                    <Skeleton v-if="isLoading" width="100%" height="2.5rem" class="mb-2" />
                    <InputText v-else v-model="venue.name" class="w-full" />

                    <div class="font-semibold text-xl">
                        <Skeleton v-if="isLoading" width="50%" height="1.5rem" />
                        <span v-else>Описание</span>
                    </div>
                    <Skeleton v-if="isLoading" width="100%" height="5rem" class="mb-2" />
                    <Textarea v-else v-model="venue.description" :autoResize="true" rows="3" cols="30" />

                    <div class="font-semibold text-xl">
                        <Skeleton v-if="isLoading" width="50%" height="1.5rem" />
                        <span v-else>Адрес</span>
                    </div>
                    <Skeleton v-if="isLoading" width="100%" height="2.5rem" class="mb-2" />
                    <InputText v-else v-model="venue.address" class="w-full" />

                    <div class="font-semibold text-xl mb-2">
                        <Skeleton v-if="isLoading" width="50%" height="1.5rem" />
                        <span v-else>Цвет темы</span>
                    </div>
                    <Skeleton v-if="isLoading" width="100%" height="2.5rem" class="mb-2" />
                    <div v-else class="flex items-center gap-2">
                        <InputText v-model="colorUppercase" class="w-full" />
                        <ColorPicker v-model="venue.theme.color" />
                    </div>

                    <Button label="Сохранить" :disabled="!hasChanges" @click="saveVenue" class="w-full" />
                </div>
            </div>
        </div>

        <Skeleton v-if="isLoading" width="50%" height="1.5rem" />
        <div class="card mt-6" v-else>
            <div class="font-semibold text-xl mb-4">Фотографии</div>
            <Carousel :value="[...venue.photos, 'add-new-photo']" :numVisible="3" :numScroll="2">
                <template #item="slotProps">
                    <div class="border border-surface-200 dark:border-surface-700 rounded m-2 p-4">
                        <div class="mb-4">
                            <div class="relative mx-auto">
                                <img
                                    v-if="slotProps.data !== 'add-new-photo'"
                                    :src="slotProps.data"
                                    :alt="`Фото ${slotProps.index}`"
                                    class="w-full h-64 object-cover rounded" />
                                <div v-else class="w-full h-48 flex justify-center items-center bg-surface-200 dark:bg-surface-800 rounded">
                                    <Button icon="pi pi-plus" label="Добавить фото" severity="secondary" outlined @click="handleAddPhoto" />
                                </div>
                            </div>
                        </div>
                        <div class="flex justify-center items-center space-x-2">
                        <span>
                            <Button icon="pi pi-arrow-left" severity="secondary" outlined />
                            <Button icon="pi pi-times" severity="danger" outlined />
                            <Button icon="pi pi-arrow-right" severity="secondary" outlined />
                        </span>
                        </div>
                    </div>
                </template>
            </Carousel>
        </div>
    </div>
</template>
