<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { FilterMatchMode } from '@primevue/core/api';
import InputMask from 'primevue/inputmask';
import router from '@/router/index';

const breadcrumbHome = ref({ icon: 'pi pi-home', to: '/' });
const breadcrumbItems = ref([{ label: 'Сотрудники', to: '/staffs' }]);

const staffs = ref([]);
const isLoading = ref(true);

const loadStaffs = async () => {
    isLoading.value = true;
    staffs.value = [
        {
            id: 1,
            name: 'Иван Иванов',
            photo: 'https://primefaces.org/cdn/primevue/images/avatar/amyelsner.png',
            phoneNumber: '79999999999',
            role: 'Master',
            rating: 3
        },
        {
            id: 2,
            name: 'Ольга Смирнова',
            photo: 'https://primefaces.org/cdn/primevue/images/avatar/asiyajavayant.png',
            phoneNumber: '79888888888',
            role: 'Unknown',
            rating: 0
        },
        {
            id: 3,
            name: 'Дмитрий Кузнецов',
            photo: 'https://primefaces.org/cdn/primevue/images/avatar/onyamalimba.png',
            phoneNumber: '79777777777',
            role: 'Master',
            rating: 4
        },
        {
            id: 4,
            name: 'Екатерина Соколова',
            photo: 'https://primefaces.org/cdn/primevue/images/avatar/ionibowcher.png',
            phoneNumber: '79666666666',
            role: 'Manager',
            rating: 9
        },
        {
            id: 5,
            name: 'Алексей Морозов',
            photo: 'https://primefaces.org/cdn/primevue/images/avatar/xuxuefeng.png',
            phoneNumber: '79555555555',
            role: 'Master',
            rating: 7
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
    const id = data.id;
    router.push({ name: 'staffDetail', params: { id } });
};

const isDialogVisible = ref(false);
const currentStep = ref(1);

const addStaff = () => {
    currentStep.value = 1;
    isDialogVisible.value = true;
};

const nextStep = () => {
    if (currentStep.value < 3) currentStep.value++;
};

const prevStep = () => {
    if (currentStep.value > 1) currentStep.value--;
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
                    <div class="flex justify-between items-center">
                        <IconField>
                            <InputIcon>
                                <i class="pi pi-search" />
                            </InputIcon>
                            <InputText v-model="filters.global.value" placeholder="Поиск" />
                        </IconField>
                        <Button icon="pi pi-plus" @click="addStaff" severity="success" rounded />
                    </div>
                </template>

                <template #empty>Сотрудники не найдены</template>
                <template #loading>Загружаем сотрудников</template>

                <Column field="agent.name" header="Сотрудник" style="min-width: 14rem">
                    <template #body="{ data }">
                        <div class="flex items-center gap-2">
                            <img :alt="data.name" :src="data.photo" style="width: 32px" />
                            <span>{{ data.name }}</span>
                        </div>
                    </template>
                </Column>

                <Column field="number" header="Номер" style="min-width: 10rem">
                    <template #body="{ data }">
                        {{ data.phoneNumber }}
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
    <Dialog v-model:visible="isDialogVisible" modal header="Добавление сотрудника" :style="{ width: '30rem' }">
        <div class="flex flex-col gap-3">
            <Stepper :value="String(currentStep)">
                <StepList>
                    <Step value="1">Телефон</Step>
                    <Step value="2">Готово</Step>
                </StepList>
            </Stepper>

            <div v-if="currentStep === 1">
                <label class="block mb-2">Введите номер телефона:</label>
                <InputMask v-model="phoneNumber" mask="+7 (999) 999-99-99" placeholder="+7 (999) 999-99-99" class="w-full md:w-[30rem] mb-8 p-3 border border-gray-300 rounded" required fluid />
            </div>

            <div v-else-if="currentStep === 2">
                <label class="block mb-2">Введите код подтверждения:</label>
                <InputMask v-model="code" id="code" type="text" mask="999-999" placeholder="999-999" class="w-full md:w-[30rem] mb-8 p-3 border border-gray-300 rounded" pattern="^[0-9]{6}$" required fluid />
            </div>

            <div v-else-if="currentStep === 3">
                <p class="text-green-600 font-semibold">Сотрудник успешно добавлен!</p>
            </div>
        </div>

        <template #footer>
            <Button label="Назад" icon="pi pi-angle-left" @click="prevStep" text :disabled="currentStep === 1" />
            <Button v-if="currentStep < 3" label="Далее" icon="pi pi-angle-right" iconPos="right" @click="nextStep" />
            <Button v-else label="Готово" icon="pi pi-check" @click="isDialogVisible = false" />
        </template>
    </Dialog>
</template>
