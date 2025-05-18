<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import VenueRepository from '@/data/repositories/VenueRepository';
import Venue from '@/data/models/Venue';
import MainPhotoWidget from '@/components/dashboard/MainPhotoWidget.vue';
import { fileToBase64 } from '@/util/Utils';
import { useDebounceFn } from '@vueuse/core';
import router from '@/router/index';
import 'leaflet/dist/leaflet.css';
import { LMap, LMarker, LTileLayer } from '@vue-leaflet/vue-leaflet';
import VenueLocation from '@/data/models/VenueLocation';
import Draggable from '@/components/Draggable.vue';
import { DnDOperations, useDroppable } from '@vue-dnd-kit/core';
import AddPhotoButton from "@/components/venue/AddPhotoButton.vue";

const route = useRoute();
const isLoading = ref(true);
const isAddingPhoto = ref(false);
const isDeletingPhoto = ref(false);

const venue = ref<Venue | null>(null);
const originalVenue = ref<Venue | null>(null);

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

const mapLatLng = computed(() => {
    if (!venue.value) return [0, 0];
    return [venue.value.location.latitude, venue.value.location.longitude];
});

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
        const color = venue.value?.theme.color || '';
        venue.value.theme.color = color.startsWith('#') ? color.toUpperCase() : `#${color.toUpperCase()}`;
        return venue.value.theme.color;
    },
    set: (val: string) => {
        if (venue.value) {
            const cleaned = val.startsWith('#') ? val : `#${val}`;
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
        console.error('Ошибка при сохранении:', e);
    } finally {
        isLoading.value = false;
    }
};

const uploadPhoto = async (file: File) => {
    if (!venue.value) return;
    isLoading.value = true;
    try {
        const base64 = await fileToBase64(file);
        await VenueRepository.saveVenuePhoto(venue.value.id, base64);
        venue.value = await VenueRepository.getVenue(venue.value.id);
        originalVenue.value = JSON.parse(JSON.stringify(venue.value));
        hasChanges.value = false;
    } catch (e) {
        console.error('Ошибка загрузки фото:', e);
    } finally {
        isLoading.value = false;
    }
};

const addPhotoToList = async (file: File) => {
    if (!venue.value) return;
    isAddingPhoto.value = true;
    try {
        const base64 = await fileToBase64(file);
        await VenueRepository.addPhotoToList(venue.value.id, base64);
        originalVenue.value = await VenueRepository.getVenue(venue.value.id);
        let newVenue = venue.value;
        newVenue.photos = originalVenue.value.photos;
        venue.value = newVenue;
    } catch (e) {
        console.error('Ошибка загрузки фото:', e);
    } finally {
        isAddingPhoto.value = false;
    }
};

const updatePhotoOrder = useDebounceFn(async () => {
    if (!venue.value) return;
    isAddingPhoto.value = true;
    try {
        await VenueRepository.savePhotoOrder(venue.value.id, venue.value.photos);
        let original = originalVenue.value;
        original.photos = venue.value.photos;
        originalVenue.value = original;
    } catch (e) {
        console.error('Ошибка загрузки фото:', e);
    } finally {
        isAddingPhoto.value = false;
    }
}, 500);

const removePhotoFromList = async (index: number) => {
    if (!venue.value) return;
    isDeletingPhoto.value = true;
    try {
        const photos = [...venue.value.photos];
        let photoToDelete = photos[index];
        photos.splice(index, 1);
        let original = originalVenue.value;
        original.photos = photos;
        originalVenue.value = original;
        let newVenue = venue.value;
        newVenue.photos = photos;
        venue.value = newVenue;
        await VenueRepository.deletePhoto(venue.value.id, photoToDelete);
    } catch (e) {
        console.error('Ошибка удаления фото:', e);
    } finally {
        isDeletingPhoto.value = false;
    }
};

const { elementRef, isOvered, isAllowed } = useDroppable({
    data: computed(() => ({
        source: venue.value?.photos || []
    })),
    events: {
        onDrop: (store, payload) => {
            DnDOperations.applyTransfer(store);
            updatePhotoOrder();
        }
    }
});

const onMapClicked = (data) => {
    if (!venue.value) return;
    venue.value.location = new VenueLocation(data.latlng.lat, data.latlng.lng);
};

onMounted(loadVenue);
</script>

<template>
    <div class="card" style="padding: 0.5rem">
        <Breadcrumb :home="{ icon: 'pi pi-home', command: () => router.push('/') }" :model="[{ label: 'Салоны', command: () => router.push('/venues') }, { label: originalVenue?.name }]" class="text-sm" />
    </div>
    <div>
        <div class="grid grid-cols-12 gap-8 mt-6">
            <div class="col-span-12 xl:col-span-6 flex flex-col h-full">
                <MainPhotoWidget :title="'Главное фото'" :isLoading="isLoading" :imageUrl="venue?.theme?.photo" @upload="uploadPhoto" class="h-full" />
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

        <div class="grid card mt-6">
            <l-map :use-global-leaflet="false" :zoom="16" :center="mapLatLng" style="height: 400px; width: 100%" ref="mapRef" @click="onMapClicked">
                <l-tile-layer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <l-marker :lat-lng="mapLatLng" />
            </l-map>
        </div>

        <div class="card mt-6">
            <div class="font-semibold text-xl mb-4">Фотографии</div>

            <div class="flex justify-end mb-4">
                <AddPhotoButton :isLoading="isAddingPhoto" @upload="addPhotoToList" title="Добавить фото" />
            </div>

            <div class="list" ref="elementRef">
                <TransitionGroup name="list">
                    <Draggable v-if="venue" v-for="(photo, index) in venue.photos" :key="photo" :source="venue.photos" :index="index">
                        <div class="item relative group w-full h-64 rounded overflow-hidden shadow">
                            <img :src="photo" class="w-full h-full object-cover rounded" />

                            <div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <Button icon="pi pi-trash" severity="danger" outlined @click="removePhotoFromList(index)" />
                            </div>
                        </div>
                    </Draggable>
                </TransitionGroup>
            </div>
        </div>
    </div>
</template>

<style scoped>
.list {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px;
    position: relative;
}
</style>
