<script setup>
import { ref, computed } from 'vue';
import { useDraggable } from '@vue-dnd-kit/core';

const props = defineProps({
    source: Array,
    index: Number
});

const startPoint = ref(null);
const draggingStarted = ref(false);

const { elementRef, isDragging, isOvered, handleDragStart } = useDraggable({
    data: computed(() => ({
        index: props.index,
        source: props.source
    }))
});

function onPointerDown(event) {
    startPoint.value = { x: event.clientX, y: event.clientY };
    draggingStarted.value = false;

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
}

function onPointerMove(event) {
    if (!startPoint.value) return;

    const dx = Math.abs(event.clientX - startPoint.value.x);
    const dy = Math.abs(event.clientY - startPoint.value.y);

    const dragThreshold = 5;

    if (!draggingStarted.value && (dx > dragThreshold || dy > dragThreshold)) {
        draggingStarted.value = true;
        handleDragStart(event);
    }
}

function onPointerUp() {
    startPoint.value = null;
    draggingStarted.value = false;
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', onPointerUp);
}
</script>

<template>
    <div ref="elementRef" class="draggable-item" :class="{ 'is-dragging': isDragging, 'is-overed': isOvered }" @pointerdown="onPointerDown">
        <slot />
    </div>
</template>

<style scoped>
.draggable-item {
    transition:
        transform 0.2s ease,
        opacity 0.2s ease;
}

.draggable-item.is-dragging {
    opacity: 0.4;
    transform: scale(0.95);
    z-index: 10;
}

.draggable-item.is-overed {
    outline: 2px dashed #3b82f6;
    outline-offset: -6px;
}
</style>
