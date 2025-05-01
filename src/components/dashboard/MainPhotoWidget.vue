<script setup lang="ts">
import { ref } from 'vue';
import { defineProps, defineEmits } from 'vue';
import { Skeleton } from 'primevue';

const props = defineProps({
    title: String,
    isLoading: Boolean,
    imageUrl: String
});

const emit = defineEmits<{
    (e: 'upload', file: File): void;
}>();

const fileInput = ref<HTMLInputElement | null>(null);

const triggerFileSelect = () => {
    fileInput.value?.click();
};

const handleFileChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
        emit('upload', file);
    }
};
</script>

<template>
    <div class="card">
        <div v-if="props.isLoading" class="relative group w-full rounded-xl overflow-hidden">
            <Skeleton width="50%" height="2rem" class="mb-4" />
            <Skeleton width="100%" height="350px" />
        </div>

        <template v-else>
            <div class="font-semibold text-xl mb-4">{{ props.title }}</div>

            <div class="relative group w-full rounded-xl overflow-hidden shadow-lg cursor-pointer bg-gray-100 dark:bg-gray-800 flex items-center justify-center" @click="triggerFileSelect">
                <template v-if="props.imageUrl">
                    <img :src="props.imageUrl" :alt="props.title" class="w-full h-full object-cover rounded-xl transition duration-300 group-hover:brightness-75" />
                    <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300">
                        <i class="pi pi-pencil text-white text-4xl"></i>
                    </div>
                </template>

                <template v-else>
                    <div class="flex flex-col items-center text-gray-400 dark:text-gray-500">
                        <i class="pi pi-camera text-6xl mb-2"></i>
                        <span>Загрузить изображение</span>
                    </div>
                </template>

                <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="handleFileChange" />
            </div>
        </template>
    </div>
</template>
