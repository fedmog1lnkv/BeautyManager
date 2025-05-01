<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import VenueRepository from '@/data/repositories/VenueRepository';
import Venue from '@/data/models/Venue';
import { fileToBase64 } from '@/util/Utils';
import MainPhotoWidget from "@/components/dashboard/MainPhotoWidget.vue";

// Пропсы и эмиты
const props = defineProps({
    visible: Boolean,
    venueId: String
});

const emit = defineEmits(['update:visible', 'updateVenue']);

// Локальные переменные и состояние
const isDialogLoading = ref(false);
const selectedVenue = ref<Venue | null>(null);
const isLoading = ref(true);
const hasChanges = ref(false);
const originalVenue = ref<Venue | null>(null);

// Функции для загрузки данных заведения и работы с фото
const loadVenue = async (id: string) => {
    isLoading.value = true;
    selectedVenue.value = await VenueRepository.getVenue(id);
    originalVenue.value = JSON.parse(JSON.stringify(selectedVenue.value)); // Для отслеживания изменений
    isLoading.value = false;
};

const saveVenue = async () => {
    isDialogLoading.value = true;
    try {
        if (selectedVenue.value) {
            // TODO
            // await VenueRepository.saveVenue(selectedVenue.value);
            originalVenue.value = JSON.parse(JSON.stringify(selectedVenue.value));
            hasChanges.value = false;
            emit('updateVenue', selectedVenue.value); // Обновляем данные в родительском компоненте
        }
    } catch (error) {
        console.error('Ошибка при сохранении заведения:', error);
    } finally {
        isDialogLoading.value = false;
    }
};

const uploadPhoto = async (file: File) => {
    try {
        isDialogLoading.value = true;
        const base64 = await fileToBase64(file);
        if (!selectedVenue.value) return;
        await VenueRepository.uploadPhoto(selectedVenue.value.id, base64);
        await loadVenue(selectedVenue.value.id);
    } catch (error) {
        console.error('Ошибка при загрузке фото:', error);
    } finally {
        isDialogLoading.value = false;
    }
};

// Отслеживаем изменения
watch(
    selectedVenue,
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

// Нормализация данных для сравнения
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

// Загружаем заведение при монтировании компонента
onMounted(() => {
    if (props.visible && props.venueId) {
        loadVenue(props.venueId);
    }
});
</script>

<template>
    <Dialog
        v-model:visible="props.visible"
    header="Информация о заведении"
    :breakpoints="{ '960px': '75vw' }"
    :style="{ width: '50vw' }"
    :modal="true"
    @update:visible="emit('update:visible', false)"
    >
    <div v-if="isDialogLoading" class="text-center py-10">
        <ProgressSpinner />
    </div>

    <div v-else-if="selectedVenue">
        <h2 class="text-xl font-semibold mb-2">{{ selectedVenue.name }}</h2>

        <div>
            <div class="font-semibold text-lg">Описание</div>
            <Textarea v-model="selectedVenue.description" :autoResize="true" rows="3" cols="30" />
        </div>

        <div class="mt-4">
            <div class="font-semibold text-lg">Адрес</div>
            <InputText v-model="selectedVenue.address" class="w-full" />
        </div>

        <div class="mt-4">
            <div class="font-semibold text-lg">Фото</div>
            <MainPhotoWidget :imageUrl="selectedVenue.theme.photo" @upload="uploadPhoto" />
        </div>

        <div class="mt-4">
            <Button label="Сохранить изменения" :disabled="!hasChanges" @click="saveVenue" class="w-full" />
        </div>
    </div>
    </Dialog>
</template>
