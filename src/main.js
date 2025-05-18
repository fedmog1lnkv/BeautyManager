import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

import Aura from '@primeuix/themes/aura';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';

import '@/assets/styles.scss';
import BeautyClient from '@/data/clients/BeautyClient';
import { definePreset } from '@primeuix/themes';
import VueDnDKitPlugin from '@vue-dnd-kit/core';

const app = createApp(App);

app.use(VueDnDKitPlugin);

BeautyClient.interceptors.request.use(
    function (config) {
        let token = localStorage.getItem('auth');
        if (token) {
            let accessToken = JSON.parse(token)['token'];
            config.headers['Authorization'] = `Bearer ${accessToken}`;
        }
        return config;
    },
    function (error) {
        // Do something with request error
        return Promise.reject(error);
    }
);

BeautyClient.interceptors.response.use(
    function (config) {
        return config;
    },
    async function (error) {
        if (error.response.status === 401 || error.response.status === 403) {
            localStorage.clear();
            await router.push('/auth/login');
        }
        return Promise.reject(error);
    }
);

app.use(router);

const primaryColor = localStorage.getItem('primaryColor');

if (primaryColor) {
}

const myPreset = definePreset(Aura, {
    semantic: {
        primary: {
            50: '#f5f3ff',
            100: '#ede9fe',
            200: '#ddd6fe',
            300: '#c4b5fd',
            400: '#a78bfa',
            500: '#8b5cf6',
            600: '#7c3aed',
            700: '#6d28d9',
            800: '#5b21b6',
            900: '#4c1d95'
        }
    }
});

app.use(PrimeVue, {
    theme: {
        preset: myPreset,
        options: {
            darkModeSelector: '.app-dark'
        }
    }
});
app.use(ToastService);
app.use(ConfirmationService);

app.mount('#app');
