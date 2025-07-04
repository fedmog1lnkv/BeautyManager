import AppLayout from '@/layout/AppLayout.vue';
import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            component: AppLayout,
            children: [
                {
                    path: '/',
                    name: 'dashboard',
                    component: () => import('@/views/Dashboard.vue')
                },
                {
                    path: '/venues',
                    name: 'venueList',
                    component: () => import('@/views/venue/VenueList.vue')
                },
                {
                    path: '/venues/:id',
                    name: 'venueDetail',
                    component: () => import('@/views/venue/VenueDetail.vue')
                },
                {
                    path: '/venues/create',
                    name: 'venueCreate',
                    component: () => import('@/views/venue/VenueCreate.vue')
                },
                {
                    path: '/staffs',
                    name: 'staffList',
                    component: () => import('@/views/staff/StaffList.vue')
                },
                {
                    path: '/staffs/:id',
                    name: 'staffDetail',
                    component: () => import('@/views/staff/StaffDetail.vue')
                },
                {
                    path: '/services',
                    name: 'serviceList',
                    component: () => import('@/views/service/ServiceList.vue')
                },
                {
                    path: '/services/:id',
                    name: 'serviceDetail',
                    component: () => import('@/views/service/ServiceDetail.vue')
                },
                {
                    path: '/coupons',
                    name: 'couponList',
                    component: () => import('@/views/coupons/CouponList.vue')
                },
                {
                    path: '/coupons/:id',
                    name: 'couponDetail',
                    component: () => import('@/views/coupons/CouponList.vue')
                }
            ]
        },
        {
            path: '/pages/notfound',
            name: 'notfound',
            component: () => import('@/views/pages/NotFound.vue')
        },

        {
            path: '/auth/login',
            name: 'login',
            component: () => import('@/views/pages/auth/Login.vue')
        },
        {
            path: '/auth/access',
            name: 'accessDenied',
            component: () => import('@/views/pages/auth/Access.vue')
        },
        {
            path: '/auth/error',
            name: 'error',
            component: () => import('@/views/pages/auth/Error.vue')
        }
    ]
});

router.beforeEach((to, from, next) => {
    const isAuthenticated = localStorage.getItem('auth');

    if (to.path === '/auth/login' || to.path === '/auth/access' || to.path === '/auth/login/error' || isAuthenticated) {
        next();
    } else {
        next('/auth/login');
    }
});

export default router;
