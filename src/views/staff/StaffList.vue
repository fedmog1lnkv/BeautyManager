<script setup lang="ts">
import { onMounted, ref } from 'vue';
import InputMask from 'primevue/inputmask';
import router from '@/router/index';
import StaffRepository from '@/data/repositories/StaffRepository';
import { DataTablePageEvent } from 'primevue/datatable';
import { useDebounceFn } from '@vueuse/core';
import OrganizationRepository from '@/data/repositories/OrganizationRepository';

const breadcrumbHome = ref({ icon: 'pi pi-home', to: '/' });
const breadcrumbItems = ref([{ label: 'Сотрудники', to: '/staffs' }]);

const staffs = ref([]);
const isLoading = ref(true);

const pageSize = 5;

const totalStaffs = ref(0);

const searchText = ref('');

const currentPage = ref(0);

const loadStaffs = async () => {
    isLoading.value = true;
    try {
        const paging = await StaffRepository.getStaff(0, pageSize, searchText.value);
        staffs.value = paging.data;
        totalStaffs.value = paging.totalCount;
    } catch (e) {
    } finally {
        isLoading.value = false;
    }
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

const selectRow = (data) => {
    router.push({ name: 'staffDetail', params: { id: data.id } });
};

const loadPage = async (page: number) => {
    isLoading.value = true;
    try {
        const paging = await StaffRepository.getStaff(page, pageSize, searchText.value);
        staffs.value = paging.data;
        totalStaffs.value = paging.totalCount;
    } catch (e) {
    } finally {
        isLoading.value = false;
    }
};

const pageSelected = async (params: DataTablePageEvent) => {
    await loadPage(params.page);
};

const applySearch = useDebounceFn(async () => {
    currentPage.value = 0;
    await loadPage(0);
}, 500);

const searchChanged = async (value: string) => {
    await applySearch();
};

const isDialogVisible = ref(false);
const currentStep = ref(1);

const newStaffPhoneNumber = ref('');
const code = ref('');

const isPhoneValid = () => {
    const cleaned = newStaffPhoneNumber.value.replace(/\D/g, '');
    return cleaned.length === 11;
};

const isCodeValid = () => {
    const cleaned = code.value.replace('-', '');
    return /^[0-9]{6}$/.test(cleaned);
};

function openStaffCreationDialog() {
    currentStep.value = 1;
    isDialogVisible.value = true;
}

const nextStep = async () => {
    if (currentStep.value === 1) {
        try {
            const organizationId = (await OrganizationRepository.getCachedOrFetch()).id;
            await StaffRepository.sendPhoneChallenge(newStaffPhoneNumber.value.replace(/\D/g, ''), organizationId);
            currentStep.value++;
        } catch (e) {
            console.error('Ошибка отправки номера:', e);
        }
    } else if (currentStep.value === 2) {
        try {
            await StaffRepository.verifyPhoneCode(newStaffPhoneNumber.value.replace(/\D/g, ''), code.value.replace('-', ''));
            currentStep.value++;
            await loadStaffs(); // обновить список после успешной регистрации
        } catch (e) {
            console.error('Ошибка подтверждения кода:', e);
        }
    }
};

const prevStep = () => {
    if (currentStep.value > 1) currentStep.value--;
};

const resetDialog = () => {
    newStaffPhoneNumber.value = '';
    code.value = '';
    currentStep.value = 1;
    isDialogVisible.value = false;
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

            <DataTable paginator v-model:first="currentPage" @page="pageSelected" :total-records="totalStaffs" :rows="pageSize" :lazy="true" :value="staffs" dataKey="name" :loading="isLoading">
                <template #header>
                    <div class="flex justify-between items-center">
                        <IconField>
                            <InputIcon>
                                <i class="pi pi-search" />
                            </InputIcon>
                            <InputText @update:modelValue="searchChanged" v-model="searchText" placeholder="Поиск" />
                        </IconField>
                        <Button icon="pi pi-plus" @click="openStaffCreationDialog" severity="success" rounded />
                    </div>
                </template>

                <template #empty>Сотрудники не найдены</template>
                <template #loading>Загружаем сотрудников</template>

                <Column field="agent.name" header="Сотрудник" style="min-width: 14rem">
                    <template #body="{ data }">
                        <div class="flex items-center gap-2">
                            <div style="width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; background: #eee; border-radius: 50%;">
                                <img v-if="data.photo" :alt="data.name" :src="data.photo" style="width: 32px; height: 32px; border-radius: 50%;" />
                                <i v-else class="pi pi-user" style="font-size: 20px; color: #888"></i>
                            </div>
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
                <InputMask v-model="newStaffPhoneNumber" mask="+7 (999) 999-99-99" placeholder="+7 (999) 999-99-99" class="w-full md:w-[30rem] mb-8 p-3 border border-gray-300 rounded" required fluid />
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
            <Button v-if="currentStep < 3" label="Далее" icon="pi pi-angle-right" iconPos="right" @click="nextStep" :disabled="(currentStep === 1 && !isPhoneValid()) || (currentStep === 2 && !isCodeValid())" />
            <Button v-else label="Готово" icon="pi pi-check" @click="resetDialog" />
        </template>
    </Dialog>
</template>
