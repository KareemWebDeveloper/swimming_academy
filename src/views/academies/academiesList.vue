<script setup lang="ts">
import axios from 'axios';
import Button from 'primevue/button';
import loading from '../../components/loadingComponent.vue'
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Breadcrumb from 'primevue/breadcrumb';
import InputText from 'primevue/inputtext';
import { useRouter } from 'vue-router';
const { push , currentRoute } = useRouter();
import { ref, onMounted, onBeforeMount } from 'vue';
import { FilterMatchMode, FilterOperator } from 'primevue/api';
import { adminAuthorize } from '@/global-functions/checkUserRole';
import { employeeAuthorize } from '@/global-functions/isEmployeeAuthorized';
import { isEmpAuthorizedFor } from '@/global-functions/isEmployeeAuthorizedFor';
import successMsg from '../../components/successMsg.vue'
import InlineMessage from 'primevue/inlinemessage';
import ConfirmPopup from 'primevue/confirmpopup';
import { useConfirm } from "primevue/useconfirm";
import Dialog from 'primevue/dialog';
import type { Ref } from 'vue';

const confirm = useConfirm();

const isFetched : any = ref(false);
const isDialogVisible : any = ref(false);
const isErrorReturned : any = ref(false);
const dbError : any = ref(false);
const isAcademyFetched : any = ref(false);
const activeAcademy : any = ref();
const selectedAcademies : any = ref([]);
const deletedSuccessfully = ref(false)
const isUpdateFormDialogVisible = ref(false)
const updatedSuccessfully = ref(false)
const updateLoading = ref(false)

// breadCrumbs
const breadCrumbs : any = ref([]);
breadCrumbs.value = [
    {label: 'الأكاديميات' , route: '/academies', to:'/academies'},
    {label: 'عرض الأكاديميات' , route: '/academies', to:'/academies' },
]; 
const home = ref({
    icon: 'pi pi-home',
    to: '/',
},
);

const confirmDeletion = (event : any) => {
    confirm.require({
        target: event.currentTarget,
        message: 'هل متأكد أنك تريد حذف هذه الأكاديمية ؟',
        icon: 'pi pi-exclamation-triangle',
        acceptLabel : 'نعم',
        rejectLabel : 'لا',
        accept: () => {
            bulkDelete()
        },  
        reject: () => {
        }
    });
};

const academies = ref()
const academyBranchesFilters = ref(
    {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        branch_name: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
        id: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
    }
);
const filters = ref(
    {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        academy_name: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
        id: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
    }
);

const options = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
    timeZone: 'Asia/Dubai',
    locale: 'ar'
    };
const dateTimeFormatter = new Intl.DateTimeFormat('ar', options);

const getAcademies = () => {
    axios.get('https://akademia.website/api/academies').then((result) => {
        console.log(result.data);
        academies.value = result.data.academies
        isFetched.value = true
        academies.value.forEach((academy : any) => {
            academy.created_at = new Date(academy.created_at)
        });
    }).catch((err) => {
        console.log(err);
    });
}

const getAcademyDetails = (academyId : number) => {
    isAcademyFetched.value = false
    isDialogVisible.value = true
    axios.get(`https://akademia.website/api/academy/${academyId}`).then((result) => {
        activeAcademy.value = result.data.academy
        activeAcademy.value.activeSubscriptions = result.data.activeSubscriptions
        isAcademyFetched.value = true
    }).catch((err) => {
        console.log(err);
    });
}

const updateAcademy = (req : any) => {
    updateLoading.value = true
    axios.put(`https://akademia.website/api/academy/update/${activeAcademy.value.id}`, req).then((result) => {
        updateLoading.value = false
        updatedSuccessfully.value = true
        isErrorReturned.value = false
        setTimeout(() => {
            isUpdateFormDialogVisible.value = false
            updatedSuccessfully.value = false
        }, 1500);
    }).catch((err) => {
        updateLoading.value = false
        isErrorReturned.value = true
        if(err.response.data.message.includes('The academy name has already been taken')){
            dbError.value = 'هذه الأكاديمية موجود بالفعل';
        }   
        else{
            dbError.value = err.response.data.message
        }
        console.log(err);
    });
}

const bulkDelete = () => {
    console.log(selectedAcademies.value);
    let academy_ids : any = [];
    selectedAcademies.value.forEach((branch:any) => {
        academy_ids.push(branch.id)
    });
    let req : any = {
        academy_ids : academy_ids
    }
    axios.post('https://akademia.website/api/academyBulkDelete', req ).then((result) => {
        console.log(result);
        deletedSuccessfully.value = true
        isErrorReturned.value = false
        selectedAcademies.value = []
        getAcademies()
        setTimeout(() => {
            deletedSuccessfully.value = false
        }, 4500);
    }).catch((err) => {
        selectedAcademies.value = []
        console.log(err);
        isErrorReturned.value = true
        if(err.response.data.message.includes('Academy has active subscriptions')){
            dbError.value = 'الأكاديمية التي تريد حذفها لديها اشتراكات نشطة'
        }
    });
    
}
const empPermissions = ref()
type userType = 'admin' | 'employee' 
const UserType : Ref<userType> = ref('admin')
onBeforeMount(() => {
    adminAuthorize().then((isAuthorized) => {
        if(isAuthorized == false){
            employeeAuthorize().then((employee) => {
                if(employee == false){
                    localStorage.removeItem('SwimmingToken')
                    push({path : '/login', query : currentRoute.value.query})
                }
                empPermissions.value = employee.permissions
                UserType.value = 'employee'
                if(!isEmpAuthorizedFor(empPermissions.value , 'عرض الأكاديميات' , UserType.value)){
                    localStorage.removeItem('SwimmingToken')
                    push({path : '/login', query : {userType : 'employee'}})
                }
                console.log(empPermissions.value);
                getAcademies()
            })
        }
        else{
            getAcademies()
        }
    })
})

const dt = ref();
const exportCSV = () => {
    dt.value.exportCSV();
};
</script>

<template>
    <Dialog v-model:visible="isDialogVisible" maximizable modal header="تفاصيل الأكاديمية" :style="{ width: '60vw' }" :breakpoints="{ '960px': '75vw', '641px': '100vw' }">
        <loading v-if="!isAcademyFetched"></loading>
        <div v-else class="branchDetails">
            <div class="flex justify-content-between p-5">
                <h5>{{ activeAcademy.academy_name }}</h5>
                <h5>مجموع الاشتراكات النشطة : {{ activeAcademy.activeSubscriptions }} اشتراك</h5>
            </div>
            <DataTable v-model:filters="academyBranchesFilters"  :export-filename="`تفاصيل أكاديمية ${activeAcademy.academy_name}`"  ref="dt"
              stripedRows :value="activeAcademy.branches" paginator :rows="10" :rowsPerPageOptions="[10, 20, 50]" filterDisplay="menu"
             dataKey="id" removableSort :globalFilterFields="['id', 'branch_name']" tableStyle="min-width: 50rem">
            <template #header>
                <div class="flex flex-column lg:flex-row justify-content-between align-items-center">
                    <h3 style="color : black;">الفروع المتواجدة بها</h3>
                    <span class="p-input-icon-left">
                        <i class="pi pi-search" />
                        <InputText v-model="academyBranchesFilters['global'].value" placeholder="بحث شامل" />
                    </span>
                </div>
            </template>
            <Column field="id" sortable  header="كود الفرع"></Column>
            <Column field="branch_name" sortable  header="الفرع">
            </Column>
    
            <template #empty> <InlineMessage severity="info">لا يوجد فروع</InlineMessage></template>
            <template #paginatorend>
                <Button type="button" icon="pi pi-download" @click="exportCSV($event)" text />
            </template>
            <template #footer> في المجموع هناك {{ activeAcademy.branches ? activeAcademy.branches.length : 0 }} فروع </template>
            </DataTable>
        </div>

        <template #footer>
            <Button type="button" class="mb-3 lg:mb-0 mx-2" @click="isDialogVisible = false; isUpdateFormDialogVisible = true" label="تعديل" />
        </template>
    </Dialog>

        <!-- Update Dialog  -->
        <Dialog v-model:visible="isUpdateFormDialogVisible" @after-hide="getAcademies" maximizable 
        modal header="تعديل الأكاديمية" :style="{ width: '50vw' }" :breakpoints="{ '960px': '75vw', '641px': '100vw' }">
            <FormKit v-model="activeAcademy" type="form" :actions="false" @submit="updateAcademy">
            <successMsg v-if="updatedSuccessfully" class="fadeinright animation-duration-500 animation-iteration-1 my-4">تم التعديل بنجاح</successMsg>
            <h5 v-if="isErrorReturned" class="px-3 py-2 textColor text-center borderRound error">{{ dbError }}</h5>
                <div class="mt-3">
                    <div class="flex align-items-center">
                        <label for="academyName" class="px-3 py-1 text-white text-sm">اسم الأكاديمية</label>
                    </div>
                    <FormKit prefix-icon="text" id="academyName" type="text" label="الأكاديمية" placeholder="أدخل اسم الأكاديمية" name="academy_name" validation="required|length:3" />
                </div>
                <Button type="submit" class="submitBtn" label="حفظ" :loading="updateLoading" />
            </FormKit>
            <template #footer>
            </template>
        </Dialog>

    <div class="w-12 md:w-10 my-5 m-auto p-2 md:p-5 academiesList" style="direction: rtl;">
            <!-- Breadcrumb -->
    <div class="w-full m-auto flex justify-content-center p-4 MargAutoMob padding-1-breadcrumbs" style="direction: ltr;">
        <Breadcrumb :home="home" :model="breadCrumbs" />
    </div>    
    <ConfirmPopup></ConfirmPopup>
        <!-- data Table -->
        <h5 v-if="isErrorReturned" class="px-3 py-2 textColor text-center borderRound error my-3">{{ dbError }}</h5>
        <successMsg v-if="deletedSuccessfully" class="fadeinright animation-duration-500 animation-iteration-1 my-4">تم الحذف بنجاح</successMsg>
    <div v-if="isFetched">
        <DataTable v-model:filters="filters" ref="dt" export-filename="تفاصيل الأكاديميات"  stripedRows :value="academies"  v-model:selection="selectedAcademies"
        stateStorage="session" stateKey="academies-state-session" paginator :rows="10" :rowsPerPageOptions="[10, 20, 50]" filterDisplay="menu"
         dataKey="id" removableSort :globalFilterFields="['id', 'academy_name']" tableStyle="min-width: 50rem">
        <template #header>
            <div class="flex flex-column lg:flex-row justify-content-between align-items-center">
                <div class="flex align-items-center">
                    <Button v-if="isEmpAuthorizedFor(empPermissions , 'انشاء أكاديمية' , UserType)" type="button" class="mb-3 lg:mb-0 mx-2" @click="push('/academies/create')" label="انشاء أكاديمية" />
                    <Button v-if="isEmpAuthorizedFor(empPermissions , 'تعديل الأكاديميات' , UserType)" type="button" @click="bulkDelete" :disabled="selectedAcademies.length == 0" severity="danger" class="mb-3 lg:mb-0 mx-2" label="حذف المحدد" />
                </div>
                <h3 class="hidden md:my-2 lg:my-0 md:flex">الأكاديميات</h3>
                <span class="p-input-icon-left">
                    <i class="pi pi-search" />
                    <InputText v-model="filters['global'].value" placeholder="بحث شامل" />
                </span>
            </div>
        </template>
        <!-- <Column field="id" header="Code"></Column> -->
        <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
        <Column field="id" sortable  header="الكود"></Column>
        <Column field="academy_name" sortable  header="الأكاديمية"></Column>
        <Column field="created_at" sortable  header="تاريخ الانشاء" style="width: 36%;">
            <template #body="slotProps" >
                <p>{{ dateTimeFormatter.format(slotProps.data.created_at) }}</p>
            </template>
        </Column>
        <Column  header="تعديل" style="width: 14%;">
            <template #body="slotProps">
                <div class="flex align-items-center">
                <span v-if="isEmpAuthorizedFor(empPermissions , 'تعديل الأكاديميات' , UserType)" class="material-symbols-outlined cursor-pointer hoverIcon textColor text-3xl p-2 borderRound" 
                    @click="selectedAcademies = [{id : slotProps.data.id}]; confirmDeletion($event)">
                    delete_forever
                </span>
                <span v-if="isEmpAuthorizedFor(empPermissions , 'تعديل الأكاديميات' , UserType)" 
                @click="isUpdateFormDialogVisible = true; activeAcademy = slotProps.data" class="material-symbols-outlined cursor-pointer hoverIcon mx-2 textColor text-3xl p-2 borderRound">
                    edit
                </span>
                <span class="material-symbols-outlined cursor-pointer hoverIcon textColor text-3xl p-2 borderRound" 
                @click="getAcademyDetails(slotProps.data.id)">
                    visibility
                </span>
                </div>
            </template>
        </Column>
            
        <template #empty> <InlineMessage severity="info">لا يوجد أكاديميات</InlineMessage></template>
        <template #paginatorend>
            <Button type="button" icon="pi pi-download" @click="exportCSV($event)" text />
        </template>
        <!-- <template #footer> In total there are {{ products ? products.length : 0 }} products. </template> -->
        <template #footer> في المجموع هناك {{ academies ? academies.length : 0 }} أكاديمية </template>
        </DataTable>
    </div>
    </div>
</template>
<style>
.formkit-form{
    margin: 2vh auto;
    width: 65%;
}
.formkit-wrapper{
    max-width: 100%;
}
.submitBtn{
    background-color: white;
    color: black;
    margin: 2vh auto;
    padding: 1.5vh;
    width: 100%;
    border: none;
    box-shadow: 0px 0px 8px rgba(0, 0, 0, 0.342);
    border-radius: 8px;
    transition-duration: 0.2s;
}
.p-confirm-popup .p-confirm-popup-icon {
    margin: 0 2vh;
}
.p-inline-message.p-inline-message-info .p-inline-message-icon {
    margin: 0 2vh;
}
.hoverIcon{
    transition-duration: 0.2s;
    background: var(--background);
}
.hoverIcon:hover{
    background: rgba(0, 0, 0, 0.836);
}
td{
    text-align: right !important;
}
.p-paginator {
    margin: 1vh;
}
.p-paginator .p-dropdown .p-dropdown-label {
     padding-right: 1rem;
}
.p-datatable .p-datatable-header{
    background: rgba(255, 255, 255, 0.025);
    color: white;
}
.branchDetails .p-datatable .p-datatable-thead > tr > th {
    background: var(--background);
}
.p-datatable .p-datatable-footer {
    margin: 1vh;
    background: none;
    color: #ffffff;
    border: 1px solid #dee2e6;
    border-width: 0 0 1px 0;
    padding: 0.5rem 1rem;
    font-weight: 700;
}
.p-datatable .p-datatable-thead > tr > th {
    background: rgba(255, 255, 255, 0.055);
    color: white;
}
.p-input-icon-left > svg:first-of-type, .p-input-icon-left > i:first-of-type {
    top: 2vh !important;
}
.p-sortable-column-icon{
    margin: 0 1.2vh;
}
@media screen and (max-width : 500px){
    .academiesList{
        margin-top: 10vh !important;
    }
}
</style>
