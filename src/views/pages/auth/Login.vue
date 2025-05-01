<script setup lang="ts">
import { computed, ref } from 'vue';
import InputMask from 'primevue/inputmask';
import AuthRepository from '@/data/repositories/AuthRepository';
import StaffRole from '@/data/models/StaffRole';
import StaffProfile from '@/data/models/StaffProfile';
import router from '@/router/index';

const phoneNumber = ref('');
const code = ref('');
const showCodeInput = ref(false);
const isLoading = ref(false);

const isPhoneComplete = computed(() => phoneNumber.value.length === 18);

const submitPhoneNumber = async () => {
    if (!isPhoneComplete.value) return;

    isLoading.value = true;
    try {
        await AuthRepository.sendPhone(phoneNumber.value);
        showCodeInput.value = true;
    } catch (error) {
        showCodeInput.value = false;
        alert(error);
    } finally {
        isLoading.value = false;
    }
};

const submitCode = async () => {
    try {
        let profile: StaffProfile = await AuthRepository.sendCode(phoneNumber.value, code.value);
        switch (profile.role) {
            case StaffRole.Manager:
                await router.push({ name: 'dashboard' });
                break;
            default:
                await router.push({ name: 'accessDenied' });
                break;
        }
    } catch (e) {
        showCodeInput.value = false;
        alert(e);
    }
};
</script>

<template>
    <div class="bg-surface-50 dark:bg-surface-950 flex items-center justify-center min-h-screen min-w-[100vw] overflow-hidden">
        <div class="flex flex-col items-center justify-center">
            <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)">
                <div class="w-full bg-surface-0 dark:bg-surface-900 py-20 px-8 sm:px-20" style="border-radius: 53px">
                    <div class="text-center mb-8">
                        <div class="text-surface-900 dark:text-surface-0 text-3xl font-medium mb-4">BeautyManager</div>
                    </div>

                    <!-- ОБЛАСТЬ С ФИКСИРОВАННОЙ ВЫСОТОЙ -->
                    <div class="relative w-full h-[300px] flex items-center justify-center">
                        <!-- Ввод номера -->
                        <div v-show="!showCodeInput" class="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center transition-opacity duration-300">
                            <label for="phone" class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">Номер телефона</label>
                            <InputMask v-model="phoneNumber" mask="+7 (999) 999-99-99" placeholder="+7 (999) 999-99-99" class="w-full md:w-[30rem] mb-8 p-3 border border-gray-300 rounded" required fluid />
                            <button class="w-full text-white py-3 rounded" :class="isPhoneComplete && !isLoading ? 'bg-blue-500' : 'bg-gray-400 cursor-not-allowed'" :disabled="!isPhoneComplete || isLoading" @click="submitPhoneNumber">
                                <span v-if="isLoading">Загрузка...</span>
                                <span v-else>Отправить код</span>
                            </button>
                        </div>

                        <!-- Ввод кода -->
                        <div v-show="showCodeInput" class="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center transition-opacity duration-300">
                            <label for="code" class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">Введите код</label>
                            <InputMask id="code" type="text" v-model="code" mask="999-999" placeholder="999-999" class="w-full md:w-[30rem] mb-8 p-3 border border-gray-300 rounded" pattern="^[0-9]{6}$" required fluid />
                            <button class="w-full bg-blue-500 text-white py-3 rounded" @click="submitCode">Далее</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Стили для кнопок и ввода */
button {
    cursor: pointer;
}
</style>
