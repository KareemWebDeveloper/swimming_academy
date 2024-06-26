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
import { isEmpAuthorizedFor } from '@/global-functions/isEmployeeAuthorizedFor';
import successMsg from '../../components/successMsg.vue'
import InlineMessage from 'primevue/inlinemessage';
import ConfirmPopup from 'primevue/confirmpopup';
import { useConfirm } from "primevue/useconfirm";
import Dialog from 'primevue/dialog';
import Tag from 'primevue/tag';
import Dropdown from 'primevue/dropdown';
import Calendar from 'primevue/calendar';
import { log } from 'console';

const confirm = useConfirm();

const isCustomersFetched : any = ref(false);
const isBranchesFetched : any = ref(false);
const isConfirmBulkDeleteVisible : any = ref(false);
const isFailedDeletionDialogVisible : any = ref(false);
const isCoachFetched : any = ref(false);
const isBulkDeleteLoading : any = ref(false);
const activeCoach : any = ref();
const unpaidInstallments : any = ref();
const unPaidInstallmentsFetched = ref(false);
const isUnpaidInstallmentsDialogVisible = ref(false);
const selectedCustomers : any = ref([]);
const deletedSuccessfully = ref(false)

// breadCrumbs
const breadCrumbs : any = ref([]);
breadCrumbs.value = [
    {label: 'المشتركين' , route: '/customers', to:'/customers'},
    {label: 'عرض المشتركين' , route: '/customers', to:'/customers' },
]; 
const home = ref({
    icon: 'pi pi-home',
    to: '/',
},
);

const confirmDeletion = (event : any , payment : string) => {
    confirm.require({
        target: event.currentTarget,
        message: payment == 'cash' ? 'هل متأكد أنك تريد حذف هذا المشترك ؟' : 'هذا المشترك نشط! هل متأكد أنك تريد حذف هذا المشترك ؟' ,
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
const statuses = ref(['active' ,'inactive','frozen'])
const paymentsOptions = ref(['cash','installments','vodafone','instapay', 'visa'])
const customers = ref()
const branches : any = ref([])
const categories : any = ref([])
const selectedBranches : any = ref()
const failedDeletions : any = ref([])

const filters = ref(
    {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        customer_name: { value: '', matchMode: FilterMatchMode.CONTAINS },
        category_name: { value: '', matchMode: FilterMatchMode.EQUALS },
        expiration_date: { value: null, matchMode: FilterMatchMode.DATE_IS },
        subscription_type: { value: null, matchMode: FilterMatchMode.EQUALS },
        customer_phone: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
        id: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
        state: { value: null, matchMode: FilterMatchMode.CONTAINS},
    }
);
const unpaidInstallmentsFilters = ref(
    {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        'customer.customer_name': { value: '', matchMode: FilterMatchMode.CONTAINS },
        'customer.id': { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
    }
);

const options = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    // hour: 'numeric',
    // minute: 'numeric',
    // hour12: true,
    timeZone: 'Asia/Dubai',
    locale: 'ar'
};

const dateTimeFormatter = new Intl.DateTimeFormat('ar', options);

const getCustomers = () => {
    axios.get('https://akademia.website/api/customersReservedOnly').then((result) => {
        console.log(result.data);
        customers.value = result.data.customers
        isCustomersFetched.value = true
        customers.value.forEach((customer : any) => {
            customer.created_at = new Date(customer.created_at)
        });
    }).catch((err) => {
        console.log(err);
    });
}

const getBranches = () => {
    axios.get('https://akademia.website/api/branches').then((result) => {
        console.log(result.data);
        result.data.branches.forEach((branch : any) => {
            branches.value.push(branch.branch_name)
        });
        isBranchesFetched.value = true
    }).catch((err) => {
        console.log(err);
    });
}

const confirmBulkDelete = () => {
    let containsActiveCustomer = false
    selectedCustomers.value.forEach((coach:any) => {
        if(coach.state == 'active'){
            containsActiveCustomer = true
        }
    });
    if(containsActiveCustomer){
        isConfirmBulkDeleteVisible.value = true
    }
}

const bulkDelete = (customerId : number) => {
    let customers_ids : any = [customerId];
    let req : any = {
        customer_ids : customers_ids
    }
    axios.post('https://akademia.website/api/customerBulkDelete', req).then((result) => {
        console.log(result);
        deletedSuccessfully.value = true
        isFailedDeletionDialogVisible.value = false
        isConfirmBulkDeleteVisible.value = false
        getCustomers()
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
                    push({path : '/login', query : currentRoute.value.query})
                }
                empPermissions.value = employee.permissions
                UserType.value = 'employee'
                getCustomers()
                getBranches()
            })
        } 
        else{
            getCustomers()
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
    <!-- ( RESERVED ONLY ) Customers List -->
    <div class="w-12 md:w-10 my-5 m-auto p-2 md:p-5 customersList" style="direction: rtl;">
        <!-- Breadcrumb -->
        <div class="w-full m-auto flex justify-content-center p-4 MargAutoMob padding-1-breadcrumbs" style="direction: ltr;">
            <Breadcrumb :home="home" :model="breadCrumbs" />
        </div>    
        <ConfirmPopup></ConfirmPopup>
        <!-- data Table -->
        <successMsg v-if="deletedSuccessfully" class="fadeinright animation-duration-500 animation-iteration-1 my-4">تم الحذف بنجاح</successMsg>
    <div class="customersList">
        <DataTable class="customersList" v-model:filters="filters" filter-locale="ar" export-filename="العملاء - بدون اشتراك" ref="dt"  stripedRows :value="customers"  v-model:selection="selectedCustomers" :loading="!isCustomersFetched"
         paginator :rows="10" :rowsPerPageOptions="[10, 15 , 20, 50]" filterDisplay="menu"
         dataKey="id" removableSort :globalFilterFields="['id' , 'customer_name' , 'customer_phone']" tableStyle="min-width: 50rem">
        <template #header>
            <div class="flex flex-column lg:flex-row justify-content-between align-items-center">
                <h3 class="hidden md:my-2 lg:my-0 md:flex">العملاء - حجز فقط</h3>
                <div class="flex flex-column md:flex-row ">
                    <span class="p-input-icon-left my-2">
                        <i class="pi pi-search" />
                        <InputText v-model="filters['global'].value" class="mx-2" placeholder="بحث شامل" />
                    </span>
                </div>
            </div>
        </template>
        <template #loading> برجاء الانتظار .. جاري تحميل بيانات العملاء ... </template>
        <!-- <Column selectionMode="multiple" headerStyle="width: 3rem"></Column> -->
        <Column field="id" sortable  header="الكود" style="width: 8%;"></Column>
        <Column field="customer_name" sortable  header="الاسم" >
            <template #body="slotProps" >
                {{ slotProps.data.customer_name }}
            </template>
            <template #filter="{ filterModel , filterCallback }">
                <InputText v-model="filterModel.value" @input="filterCallback()" type="text" class="p-column-filter" placeholder="أدخل اسم المشترك" />
            </template>
            <template #filterapply="{ filterCallback }">
                <Button type="button" @click="filterCallback()" class="mb-3 lg:mb-0 mx-2" label="تفعيل" />
            </template>
            <template #filterclear="{ filterCallback }">
                <Button type="button" @click="filterCallback()" class="mb-3 lg:mb-0 mx-2" label="الغاء" outlined />
            </template>
        </Column>
        <Column field="customer_phone"  header="الهاتف"></Column>
        <Column  header="الحالة" >
            <template #body="slotProps">
                <p>حجز بدون اشتراك</p>
            </template>
        </Column>
        <Column  header="تعديل">
            <template #body="slotProps">
                <div class="flex align-items-center">
                <span v-if="isEmpAuthorizedFor(empPermissions , 'تعديل عملاء حجز فقط' , UserType)" @click="push({ path : '/customer/create' , query : {isReservedCustomer : slotProps.data.id}})" class="material-symbols-outlined cursor-pointer hoverIcon mx-2 textColor text-3xl p-2 borderRound">
                    edit
                </span>
                <span v-if="isEmpAuthorizedFor(empPermissions , 'تعديل عملاء حجز فقط' , UserType)" @click="bulkDelete(slotProps.data.id)" class="material-symbols-outlined cursor-pointer hoverIcon mx-2 textColor text-3xl p-2 borderRound">
                    delete
                </span>
                </div>
            </template>
        </Column>
            
        <template #empty> <InlineMessage severity="info">لا يوجد عملاء</InlineMessage></template>
        <template #paginatorend>
            <Button type="button" icon="pi pi-download" @click="exportCSV($event)" text />
        </template>
        <template #footer> في المجموع هناك {{ customers ? customers.length : 0 }} عملاء </template>
        </DataTable>
    </div>
    </div>
</template>
<style>
.failedDeletions .p-datatable .p-datatable-thead > tr > th {
    background: var(--background);
}
.p-datepicker .p-datepicker-header {
    direction: ltr; /* it's responsible for making the datepicker filter ltr */
}
.customersList .p-column-filter-overlay-menu .p-column-filter-constraint .p-column-filter-matchmode-dropdown {
    display: none !important; /* it hides the ability to choose the filter match mode */
}
.p-dropdown-clear-icon {
    position: absolute;
    top: 2.3vh !important;
    right: 5px !important;
}
.p-column-filter-menu-button {
    margin: 0 0.5vh;
}
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
