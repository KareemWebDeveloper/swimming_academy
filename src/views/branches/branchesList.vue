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
const isBranchFetched : any = ref(false);
const activeBranch : any = ref();
const selectedBranches : any = ref([]);
const deletedSuccessfully = ref(false)

// breadCrumbs
const breadCrumbs : any = ref([]);
breadCrumbs.value = [
    {label: 'الفروع' , route: '/branches', to:'/branches'},
    {label: 'عرض الفروع' , route: '/branches', to:'/branches' },
]; 
const home = ref({
    icon: 'pi pi-home',
    to: '/',
},
);

const confirmDeletion = (event : any) => {
    confirm.require({
        target: event.currentTarget,
        message: 'هل متأكد أنك تريد حذف هذا الفرع ؟',
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

const branches = ref()
const branchCategoriesFilters = ref(
    {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        category_name: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
        duration: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
        price_per_1: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.GREATER_THAN_OR_EQUAL_TO }] },
    }
);
const filters = ref(
    {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        branch_name: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
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
    timeZone: 'Africa/Cairo',
    locale: 'ar'
    };
const dateTimeFormatter = new Intl.DateTimeFormat('ar', options);

const getBranches = () => {
    axios.get('http://127.0.0.1:8000/api/branches').then((result) => {
        console.log(result.data);
        branches.value = result.data.branches
        isFetched.value = true
        branches.value.forEach((branch : any) => {
            branch.created_at = new Date(branch.created_at)
        });
        
    }).catch((err) => {
        console.log(err);
    });
}

const getBranchDetails = (branchId : number) => {
    isBranchFetched.value = false
    isDialogVisible.value = true
    axios.get(`http://127.0.0.1:8000/api/branch/${branchId}`).then((result) => {
        activeBranch.value = result.data.branch
        let workingDays : any[] = []
        activeBranch.value.categories = activeBranch.value.categories.map((category : any) => {
            const { category_name } = category;
            const { category_id, ...pivotRest } = category.pivot;
            return {
                category_name,
                categoryId : category_id,
                ...pivotRest
            };
        });
        activeBranch.value.categories.forEach((category : any , index : number) => {
            activeBranch.value.categories[index].session_prices = JSON.parse(category.session_prices)
            activeBranch.value.categories[index].prices_per_sessions = []
            activeBranch.value.categories[index].session_prices.forEach((sessionPrice : any) => {
                activeBranch.value.categories[index].prices_per_sessions+= `( ${sessionPrice.sessions} sessions / ${sessionPrice.price} ج.م ) , ` 
            });
        });
        console.log(activeBranch.value.categories);
        
        activeBranch.value.working_days.forEach((day : any) => {
            workingDays.push({day : day.day , start_time : day.start_time , end_time: day.end_time})
        });
        activeBranch.value.working_days = workingDays
        isBranchFetched.value = true
        console.log(activeBranch.value , 'activeBranchhh');
        
    }).catch((err) => {
        console.log(err);
    });
}

const bulkDelete = () => {
    console.log(selectedBranches.value);
    let branch_ids : any = [];
    selectedBranches.value.forEach((branch:any) => {
        branch_ids.push(branch.id)
    });
    let req : any = {
        branch_ids : branch_ids
    }
    axios.post('http://127.0.0.1:8000/api/branchBulkDelete', req ).then((result) => {
        console.log(result);
        deletedSuccessfully.value = true
        isErrorReturned.value = false
        selectedBranches.value = []
        getBranches()
        setTimeout(() => {
            deletedSuccessfully.value = false
        }, 4500);
    }).catch((err) => {
        selectedBranches.value = []
        console.log(err);
        isErrorReturned.value = true
        if(err.response.data.message.includes('Branch has active subscriptions')){
            dbError.value = 'الفروع التي تريد حذفها لديها اشتراكات نشطة'
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
                if(!isEmpAuthorizedFor(empPermissions.value , 'عرض الفروع' , UserType.value)){
                    localStorage.removeItem('SwimmingToken')
                    push({path : '/login', query : {userType : 'employee'}})
                }
                console.log(empPermissions.value);
                getBranches()
            })
        }
        else{
            getBranches()
        }
    })
})

const dt = ref();
const exportCSV = () => {
    dt.value.exportCSV();
};
</script>

<template>
    <Dialog v-model:visible="isDialogVisible" maximizable modal header="تفاصيل الفرع" :style="{ width: '60vw' }" :breakpoints="{ '960px': '75vw', '641px': '100vw' }">
        <loading v-if="!isBranchFetched"></loading>
        <div v-else class="branchDetails">
            <div class="flex justify-content-center">
                <h4 v-for="academy in activeBranch.academies" class="m-2"> {{ academy.academy_name }} </h4> 
            </div>
            <DataTable v-model:filters="branchCategoriesFilters"  :export-filename="`تفاصيل فرع ${activeBranch.branch_name}`"  ref="dt"  stripedRows :value="activeBranch.categories"
            paginator :rows="10" :rowsPerPageOptions="[10, 20, 50]" filterDisplay="menu"
             dataKey="id" removableSort :globalFilterFields="['duration', 'category_name']" tableStyle="min-width: 50rem">
            <template #header>
                <div class="flex flex-column lg:flex-row justify-content-between align-items-center">
                    <h3 style="color : black;">{{ activeBranch.branch_name }}</h3>
                    <span class="p-input-icon-left">
                        <i class="pi pi-search" />
                        <InputText v-model="branchCategoriesFilters['global'].value" placeholder="بحث شامل" />
                    </span>
                </div>
            </template>
            <Column field="category_name" sortable  header="نوع التمرينة"></Column>
            <Column field="duration" sortable  header="مدة التمرينة">
                <template #body="slotProps" >
                    <p>{{ slotProps.data.duration }} ساعة</p>
                </template>
            </Column>
            <Column field="price_per_session" sortable  header="سعر 1 تمرينة">
                <template #body="slotProps" >
                    <p>{{ slotProps.data.price_per_session }} ج.م</p> 
                </template>
            </Column>
            <Column field="prices_per_sessions" sortable  header="عدد الحصص / السعر">
                <template #body="slotProps" >
                    <div v-for="(sessionPrice , index) in slotProps.data.session_prices" :key="index">
                        <p>{{ sessionPrice.sessions }} حصص / {{ sessionPrice.price }} ج.م</p> 
                    </div>
                </template>
            </Column>
    
            <template #empty> <InlineMessage severity="info">لا يوجد تمارين</InlineMessage></template>
            <template #paginatorend>
                <Button type="button" icon="pi pi-download" @click="exportCSV($event)" text />
            </template>
            <template #footer> في المجموع هناك {{ branches ? branches.length : 0 }} أنواع </template>
            </DataTable>
            <div class="text-center" v-for="workingDay in activeBranch.working_days">
                <h3 v-if="workingDay.start_time && workingDay.end_time">{{ workingDay.day }} : من {{ workingDay.start_time }} إلي {{ workingDay.end_time }}</h3>
            </div>
        </div>

        <template #footer>
            <Button type="button" class="mb-3 lg:mb-0 mx-2" @click="push(`/branch/update/${activeBranch.id}`)" label="تعديل" />
        </template>
    </Dialog>

    <div class="w-12 md:w-10 my-5 m-auto p-2 md:p-5 branchesList" style="direction: rtl;">
            <!-- Breadcrumb -->
    <div class="w-full m-auto flex justify-content-center p-4 MargAutoMob padding-1-breadcrumbs" style="direction: ltr;">
        <Breadcrumb :home="home" :model="breadCrumbs" />
    </div>    
    <ConfirmPopup></ConfirmPopup>
        <!-- data Table -->
        <h5 v-if="isErrorReturned" class="px-3 py-2 textColor text-center borderRound error my-3">{{ dbError }}</h5>
        <successMsg v-if="deletedSuccessfully" class="fadeinright animation-duration-500 animation-iteration-1 my-4">تم الحذف بنجاح</successMsg>
    <div v-if="isFetched">
        <DataTable v-model:filters="filters" ref="dt" export-filename="تفاصيل الفروع"  stripedRows :value="branches"  v-model:selection="selectedBranches"
        stateStorage="session" stateKey="branches-state-session" paginator :rows="10" :rowsPerPageOptions="[10, 20, 50]" filterDisplay="menu"
         dataKey="id" removableSort :globalFilterFields="['id', 'branch_name']" tableStyle="min-width: 50rem">
        <template #header>
            <div class="flex flex-column lg:flex-row justify-content-between align-items-center">
                <div class="flex align-items-center">
                    <Button v-if="isEmpAuthorizedFor(empPermissions , 'تسجيل و تعديل الفروع' , UserType)" type="button" class="mb-3 lg:mb-0 mx-2" @click="push('/branch/create')" label="انشاء فرع" />
                    <Button v-if="isEmpAuthorizedFor(empPermissions , 'تسجيل و تعديل الفروع' , UserType)" type="button" @click="bulkDelete" :disabled="selectedBranches.length == 0" severity="danger" class="mb-3 lg:mb-0 mx-2" label="حذف المحدد" />
                </div>
                <h3 class="hidden md:my-2 lg:my-0 md:flex">الفروع</h3>
                <span class="p-input-icon-left">
                    <i class="pi pi-search" />
                    <InputText v-model="filters['global'].value" placeholder="بحث شامل" />
                </span>
            </div>
        </template>
        <!-- <Column field="id" header="Code"></Column> -->
        <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
        <Column field="id" sortable  header="الكود"></Column>
        <Column field="branch_name" sortable  header="الفرع"></Column>
        <Column field="created_at" sortable  header="تاريخ الانشاء" style="width: 36%;">
            <template #body="slotProps" >
                <p>{{ dateTimeFormatter.format(slotProps.data.created_at) }}</p>
            </template>
        </Column>
        <Column  header="تعديل" style="width: 14%;">
            <template #body="slotProps">
                <div class="flex align-items-center">
                <span v-if="isEmpAuthorizedFor(empPermissions , 'تسجيل و تعديل الفروع' , UserType)" class="material-symbols-outlined cursor-pointer hoverIcon textColor text-3xl p-2 borderRound" 
                    @click="selectedBranches = [{id : slotProps.data.id}]; confirmDeletion($event)">
                    delete_forever
                </span>
                <span v-if="isEmpAuthorizedFor(empPermissions , 'تسجيل و تعديل الفروع' , UserType)" @click="push(`/branch/update/${slotProps.data.id}`)" class="material-symbols-outlined cursor-pointer hoverIcon mx-2 textColor text-3xl p-2 borderRound">
                    edit
                </span>
                <span class="material-symbols-outlined cursor-pointer hoverIcon textColor text-3xl p-2 borderRound" 
                @click="getBranchDetails(slotProps.data.id)">
                    visibility
                </span>
                </div>
            </template>
        </Column>
            
        <template #empty> <InlineMessage severity="info">لا يوجد فروع</InlineMessage></template>
        <template #paginatorend>
            <Button type="button" icon="pi pi-download" @click="exportCSV($event)" text />
        </template>
        <!-- <template #footer> In total there are {{ products ? products.length : 0 }} products. </template> -->
        <template #footer> في المجموع هناك {{ branches ? branches.length : 0 }} فروع </template>
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
    .branchesList{
        margin-top: 10vh !important;
    }
}
</style>
