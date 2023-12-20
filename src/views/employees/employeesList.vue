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
import { ref, onMounted, onBeforeMount, type Ref } from 'vue';
import { FilterMatchMode, FilterOperator } from 'primevue/api';
import { adminAuthorize } from '@/global-functions/checkUserRole';
import { employeeAuthorize } from '@/global-functions/isEmployeeAuthorized';
import successMsg from '../../components/successMsg.vue'
import InlineMessage from 'primevue/inlinemessage';
import ConfirmPopup from 'primevue/confirmpopup';
import { useConfirm } from "primevue/useconfirm";
import Dialog from 'primevue/dialog';
import { isEmpAuthorizedFor } from '@/global-functions/isEmployeeAuthorizedFor';

const confirm = useConfirm();

const isEmployeesFetched : any = ref(false);
const isBranchesFetched : any = ref(false);
const isDialogVisible : any = ref(false);
const isErrorReturned : any = ref(false);
const dbError : any = ref(false);
const updatedSuccessfully : any = ref(false);
const updateLoading : any = ref(false);
const isEmployeeFetched : any = ref(false);
const isAttachBranchLoading : any = ref(false);
const activeEmployee : any = ref();
const selectedCoaches : any = ref([]);
const deletedSuccessfully = ref(false)

// breadCrumbs
const breadCrumbs : any = ref([]);
breadCrumbs.value = [
    {label: 'الموظفين' , route: '/employees', to:'/employees'},
    {label: 'عرض الموظفين' , route: '/employees', to:'/employees' },
]; 
const home = ref({
    icon: 'pi pi-home',
    to: '/',
},
);

const confirmDeletion = (event : any) => {
    confirm.require({
        target: event.currentTarget,
        message: 'هل متأكد أنك تريد حذف هذا الموظف ؟',
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

const employees = ref()
const branches : any = ref([])
const selectedBranches : any = ref()
const coachBranchesFilters = ref(
    {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        branch_name: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
        id: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
    }
);
const filters = ref(
    {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        name: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
        phone: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
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

const getEmployees = () => {
    axios.get('http://127.0.0.1:8000/api/employees').then((result) => {
        console.log(result.data);
        employees.value = result.data.employees
        isEmployeesFetched.value = true
        employees.value.forEach((coach : any) => {
            coach.created_at = new Date(coach.created_at)
        });
    }).catch((err) => {
        console.log(err);
    });
}

const getBranches = () => {
    axios.get('http://127.0.0.1:8000/api/branches').then((result) => {
        console.log(result.data);
        result.data.branches.forEach((branch : any) => {
            branches.value.push({label : branch.branch_name , value : branch.id})
        });
        isBranchesFetched.value = true
    }).catch((err) => {
        console.log(err);
    });
}

const getEmployeeDetails = (employeeId : number) => {
    isEmployeeFetched.value = false
    isDialogVisible.value = true
    axios.get(`http://127.0.0.1:8000/api/employee/${employeeId}`).then((result) => {
        activeEmployee.value = result.data.employee
        selectedBranches.value = {branchIds : []}
        result.data.employee.branches.forEach((branch : any) => {
            selectedBranches.value.branchIds.push(branch.id)
        });
        isEmployeeFetched.value = true
        console.log(activeEmployee.value);
        console.log(branches.value);
    }).catch((err) => {
        console.log(err);
    });
}

const attachBranches = (req : any) => {
    isAttachBranchLoading.value = true
    axios.put(`http://127.0.0.1:8000/api/employee/attachBranches/${activeEmployee.value.id}` , req).then((result) => {
        console.log(result);
        isAttachBranchLoading.value = false
        isEmployeeFetched.value = false
        getEmployeeDetails(activeEmployee.value.id)
    }).catch((err) => {
        console.log(err);
    });
}


const bulkDelete = () => {
    console.log(selectedCoaches.value);
    let employees_ids : any = [];
    selectedCoaches.value.forEach((coach:any) => {
        employees_ids.push(coach.id)
    });
    let req : any = {
        employees_ids : employees_ids
    }
    axios.post('http://127.0.0.1:8000/api/employeeBulkDelete', req).then((result) => {
        console.log(result);
        deletedSuccessfully.value = true
        selectedCoaches.value = []
        getEmployees()
        setTimeout(() => {
            deletedSuccessfully.value = false
        }, 4500);
    }).catch((err) => {
        console.log(err.response.data);
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
                    location.reload()
                    console.log('not employee');
                    push({path : '/login', query : currentRoute.value.query})
                }
                empPermissions.value = employee.permissions
                UserType.value = 'employee'
                if(!isEmpAuthorizedFor(empPermissions.value , 'عرض الموظفين' , UserType.value)){
                    localStorage.removeItem('SwimmingToken')
                    console.log('not authorized');
                    location.reload()
                    push({path : '/login', query : currentRoute.value.query})
                }
                getEmployees()
                getBranches()
            })
        }
        else{
            getEmployees()
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
    <!-- Coach Details -->

    <Dialog v-model:visible="isDialogVisible" maximizable modal header="الفروع التي يعمل بها" :style="{ width: '60vw' }" :breakpoints="{ '960px': '75vw', '641px': '100vw' }">
        <loading v-if="!isEmployeeFetched"></loading>
        <div v-else class="branchDetails">
            <DataTable v-model:filters="coachBranchesFilters" paginator :rows="10" :rowsPerPageOptions="[10, 15 , 20, 50]" ref="dt"  stripedRows :value="activeEmployee.branches"
            filterDisplay="menu"
             dataKey="id" removableSort :globalFilterFields="['id', 'branch_name']" tableStyle="min-width: 50rem">
            <template #header>
                <div class="flex flex-column lg:flex-row justify-content-between align-items-center">
                    <div class="flex align-items-center">
                        <h3 style="color : black;">{{ activeEmployee.name }}</h3>
                    </div>
                    <span class="p-input-icon-left">
                        <i class="pi pi-search" />
                        <InputText v-model="coachBranchesFilters['global'].value" placeholder="بحث شامل" />
                    </span>
                </div>
            </template>
            <Column field="id" sortable  header="كود الفرع"></Column>
            <Column field="branch_name" sortable  header="اسم الفرع"></Column>
    
            <template #empty> <InlineMessage severity="info">لا يوجد فروع</InlineMessage></template>
            <template #paginatorend>
                <Button type="button" icon="pi pi-download" @click="exportCSV($event)" text />
            </template>
            <template #footer> 
                <h2 style="color: black;" class="text-center">الصلاحيات</h2>
            <div class="flex align-items-center flex-wrap justify-content-center">
                <div class="p-3 borderRound mx-2" style="color: #256029; background-color: #c8e6c9d3;" v-for="role in activeEmployee.roles">
                    <p>{{ role.role_name }}</p>
                </div>
            </div>
            <FormKit type="form" :actions="false" v-model="selectedBranches" @submit="attachBranches">
                <div class="attachBranches">
                    <FormKit type="dropdown" name="branchIds" label="الفروع" placeholder="اختر الفروع التي يعمل بها الموظف" :options="branches" multiple />
                </div>
                <Button type="submit" label="تحديث الفروع" class="p-2 px-4 m-auto text-center font-sm" style="background: var(--background);" :loading="isAttachBranchLoading" />
            </FormKit>
            </template>
            </DataTable>
        </div>

        <template #footer>
            <div class="flex justify-content-between">
                <Button type="button" class="mb-3 lg:mb-0 mx-2" @click="push(`/employee/update/${activeEmployee.id}`)" label="تعديل" />
            </div>
        </template>
    </Dialog>

    <!-- Employees List -->

    <div class="w-12 md:w-10 my-5 m-auto p-2 md:p-5 branchesList" style="direction: rtl;">
            <!-- Breadcrumb -->
    <div class="w-full m-auto flex justify-content-center p-4 MargAutoMob padding-1-breadcrumbs" style="direction: ltr;">
        <Breadcrumb :home="home" :model="breadCrumbs" />
    </div>    
    <ConfirmPopup></ConfirmPopup>
        <!-- data Table -->
        <successMsg v-if="deletedSuccessfully" class="fadeinright animation-duration-500 animation-iteration-1 my-4">تم الحذف بنجاح</successMsg>
    <div v-if="isEmployeesFetched">
        <DataTable v-model:filters="filters" ref="dt" export-filename="الموظفين" stripedRows :value="employees"  v-model:selection="selectedCoaches"
        stateStorage="session" stateKey="employees-state-session" paginator :rows="10" :rowsPerPageOptions="[10, 15 , 20, 50]" filterDisplay="menu"
         dataKey="id" removableSort :globalFilterFields="['id', 'name']" tableStyle="min-width: 50rem">
        <template #header>
            <div class="flex flex-column lg:flex-row justify-content-between align-items-center">
                <div class="flex align-items-center">
                    <Button type="button" v-if="isEmpAuthorizedFor(empPermissions , 'تسجيل و تعديل الموظفين' , UserType)" class="mb-3 lg:mb-0 mx-2" @click="push('/employee/create')" label="تسجيل موظف" />
                    <Button type="button" v-if="isEmpAuthorizedFor(empPermissions , 'تسجيل و تعديل الموظفين' , UserType)" @click="bulkDelete" :disabled="selectedCoaches.length == 0" severity="danger" class="mb-3 lg:mb-0 mx-2" label="حذف المحدد" />
                </div>
                <h3 class="hidden md:my-2 lg:my-0 md:flex">الموظفين</h3>
                <span class="p-input-icon-left">
                    <i class="pi pi-search" />
                    <InputText v-model="filters['global'].value" placeholder="بحث شامل" />
                </span>
            </div>
        </template>
        <!-- <Column field="id" header="Code"></Column> -->
        <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
        <Column field="id" sortable  header="الكود"></Column>
        <Column field="name" sortable  header="الاسم" style="width: 28%;">
            <template #body="slotProps" >
                <p>{{ slotProps.data.name }}</p>
            </template>
        </Column>
        <Column field="phone"  header="الهاتف" style="width: 20%;"></Column>
        <Column field="salary_per_hour" sortable  header="الراتب" style="width: 23%;">
            <template #body="slotProps" >
                <p>{{ slotProps.data.salary }}ج.م / شهر</p>
            </template>
        </Column>
        <Column field="created_at" sortable  header="تاريخ التسجيل" style="width: 40%;">
            <template #body="slotProps" >
                <p>{{ dateTimeFormatter.format(slotProps.data.created_at) }}</p>
            </template>
        </Column>
        <Column  header="تعديل" style="width: 14%;">
            <template #body="slotProps">
                <div class="flex align-items-center">
                <span v-if="isEmpAuthorizedFor(empPermissions , 'تسجيل و تعديل الموظفين' , UserType)" class="material-symbols-outlined cursor-pointer hoverIcon textColor text-3xl p-2 borderRound" 
                    @click="selectedCoaches = [{id : slotProps.data.id}]; confirmDeletion($event)">
                    delete_forever
                </span>
                <span v-if="isEmpAuthorizedFor(empPermissions , 'تسجيل و تعديل الموظفين' , UserType)" @click="push(`/employee/update/${slotProps.data.id}`)" class="material-symbols-outlined cursor-pointer hoverIcon mx-2 textColor text-3xl p-2 borderRound">
                    edit
                </span>
                <span class="material-symbols-outlined cursor-pointer hoverIcon textColor text-3xl p-2 borderRound" 
                @click="getEmployeeDetails(slotProps.data.id)">
                    visibility
                </span>
                </div>
            </template>
        </Column>
            
        <template #empty> <InlineMessage severity="info">لا يوجد موظفين</InlineMessage></template>
        <template #paginatorend>
            <Button type="button" icon="pi pi-download" @click="exportCSV($event)" text />
        </template>
        <template #footer> في المجموع هناك {{ employees ? employees.length : 0 }} موظفين </template>
        </DataTable>
    </div>
    </div>
</template>
<style>
.formkit-dropdown-wrapper{
    font-family: 'Lato', sans-serif !important;
    font-family: 'Lemonada', cursive !important;
    color: black !important;
}
.attachBranches .formkit-label{
    color: black;
    margin: 0.5vh;
}
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
