<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { FilterMatchMode } from '@primevue/core/api';

const breadcrumbHome = ref({ icon: 'pi pi-home', to: '/' });
const breadcrumbItems = ref([{ label: 'Сотрудники', to: '/staffs' }]);

const staffs = ref([]);
const isLoading = ref(true);

const loadStaffs = async () => {
    isLoading.value = true;
    staffs.value = [
        {
            id: 1,
            agent: {
                name: 'Иван Иванов',
                image: 'https://primefaces.org/cdn/primevue/images/avatar/amyelsner.png'
            },
            number: '79999999999',
            role: 'Master',
            rating: 3
        },
        {
            id: 2,
            agent: {
                name: 'Мария Петрова',
                image: 'https://primefaces.org/cdn/primevue/images/avatar/annafali.png'
            },
            number: '79999999999',
            role: 'Unknown',
            rating: 0
        },
        {
            id: 3,
            agent: {
                name: 'Алексей Смирнов',
                image: 'https://primefaces.org/cdn/primevue/images/avatar/annafali.png'
            },
            number: '79999999999',
            role: 'Master',
            rating: 8
        },
        {
            id: 4,
            agent: {
                name: 'Ольга Кузнецова',
                image: 'https://primefaces.org/cdn/primevue/images/avatar/annafali.png'
            },
            number: '79999999999',
            role: 'Unknown',
            rating: 0
        },
        {
            id: 5,
            agent: {
                name: 'Дмитрий Васильев',
                image: 'https://primefaces.org/cdn/primevue/images/avatar/annafali.png'
            },
            number: '79999999999',
            role: 'Manager',
            rating: 6
        }
    ];
    isLoading.value = false;
};

function getColor(status) {
    switch (status?.toLowerCase()) {
        case 'manager':
            return 'info';
        case 'master':
            return 'primary';
        case 'unknown':
            return 'danger';
        default:
            return null;
    }
}

function getRoleString(status) {
    switch (status?.toLowerCase()) {
        case 'manager':
            return 'Менеджер';
        case 'master':
            return 'Мастер';
        case 'unknown':
            return 'Ожидает подтверждения';
        default:
            return null;
    }
}

const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});

const selectRow = (data) => {
    console.log(data.agent.name);
};

onMounted(loadStaffs);
</script>
<template>
    <div class="card" style="padding: 0.5rem">
        <Breadcrumb :home="breadcrumbHome" :model="breadcrumbItems" class="text-sm" />
    </div>

    <div class="flex flex-col">
        <div class="card">
            <div class="font-semibold text-xl mb-4">Сотрудники</div>

            <DataTable :value="staffs" dataKey="id" :filters="filters" filterDisplay="menu" :globalFilterFields="['agent.name', 'number', 'role']" :loading="isLoading">
                <template #header>
                    <div class="flex justify-end">
                        <IconField>
                            <InputIcon>
                                <i class="pi pi-search" />
                            </InputIcon>
                            <InputText v-model="filters.global.value" placeholder="Поиск" />
                        </IconField>
                    </div>
                </template>

                <template #empty>Сотрудники не найдены</template>
                <template #loading>Загружаем сотрудников</template>

                <Column field="agent.name" header="Сотрудник" style="min-width: 14rem">
                    <template #body="{ data }">
                        <div class="flex items-center gap-2">
                            <img :alt="data.agent.name" :src="data.agent.image" style="width: 32px" />
                            <span>{{ data.agent.name }}</span>
                        </div>
                    </template>
                </Column>

                <Column field="number" header="Номер" style="min-width: 10rem">
                    <template #body="{ data }">
                        {{ data.number }}
                    </template>
                </Column>

                <Column field="role" header="Роль" style="min-width: 12rem">
                    <template #body="{ data }">
                        <Tag :value="getRoleString(data.role)" :severity="getColor(data.role)" />
                    </template>
                </Column>

                <Column field="rating" filterField="rating" header="Рейтинг" style="min-width: 12rem">
                    <template #body="{ data }">
                        <Rating :modelValue="data.rating / 2" readonly />
                    </template>
                </Column>

                <Column class="w-24 !text-end">
                    <template #body="{ data }">
                        <Button icon="pi pi-arrow-up-right" @click="selectRow(data)" severity="secondary" rounded />
                    </template>
                </Column>
            </DataTable>
        </div>
    </div>
</template>
