<script setup lang="ts">
import { Skeleton } from "primevue";

defineProps<{
    title: string;
    value?: string | number | null;
    icon: string;
    bgColor: string;
    iconColor: string;
    customContent?: boolean;
    isLoading?: boolean;
}>();
</script>

<template>
    <div class="card mb-0 h-full">
        <div class="flex justify-between mb-4 h-full items-center">
            <div class="flex flex-col justify-center">
                <span class="block text-muted-color font-medium mb-4">
                    <template v-if="isLoading">
                        <Skeleton width="10rem" height="1rem" class="mb-2" />
                    </template>
                    <template v-else>{{ title }}</template>
                </span>

                <template v-if="isLoading">
                    <Skeleton width="5rem" height="1.5rem" />
                </template>
                <div v-else-if="!customContent" class="text-surface-900 dark:text-surface-0 font-medium text-xl">
                    {{ value }}
                </div>
                <slot v-else />
            </div>

            <div class="flex items-center justify-center rounded-border"
                 :class="bgColor"
                 style="width: 2.5rem; height: 2.5rem">
                <template v-if="isLoading">
                    <Skeleton width="2.5rem" height="2.5rem" />
                </template>
                <template v-else>
                    <i :class="`pi ${icon} ${iconColor} !text-xl`"></i>
                </template>
            </div>
        </div>
    </div>
</template>
