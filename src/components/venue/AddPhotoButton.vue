<script setup lang="ts">
import { ref } from 'vue';
import { defineProps, defineEmits } from 'vue';
import { Skeleton } from 'primevue';

const props = defineProps({
    title: String,
    isLoading: Boolean
});

const emit = defineEmits<{
    (e: 'upload', file: File): void;
}>();

const fileInput = ref<HTMLInputElement | null>(null);

const triggerFileSelect = () => {
    if (props.isLoading) return;
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
    <Button v-if="!isLoading" @click="triggerFileSelect" icon="pi pi-plus" :label="title" severity="secondary" outlined />
    <Skeleton v-else width="100%" height="100%" />
    <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="handleFileChange" />
</template>

<style scoped lang="scss"></style>
