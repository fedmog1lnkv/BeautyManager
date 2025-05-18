<script setup lang="ts">
import { defineEmits, defineProps, ref } from 'vue';

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
    <Button :disabled="isLoading" @click="triggerFileSelect" :icon="isLoading ? 'pi pi-spin pi-spinner' : 'pi pi-plus'" :label="isLoading ? 'Загрузка...' : title" severity="secondary" outlined />
    <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="handleFileChange" />
</template>

<style scoped lang="scss"></style>
