<script setup lang="ts">
import axios from 'axios';
import Button from 'primevue/button';
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
import Calendar from 'primevue/calendar';
import Dropdown from 'primevue/dropdown';
import { isEmpAuthorizedFor } from '@/global-functions/isEmployeeAuthorizedFor';

const confirm = useConfirm();

const isFetched : any = ref(false);
const isTargetBranchReportLoading : any = ref(false);
const isBranchesFetched : any = ref(false);
const isAcademiesFetched : any = ref(false);
const chooseTargetBranch : any = ref(true);
const orderDeletedSuccessfully = ref(false)
const Orders : any = ref([])
const TotalOrders : any = ref(0)

// breadCrumbs
const breadCrumbs : any = ref([]);
breadCrumbs.value = [
    {label: 'تقرير الايرادات' , route: '/revenues', to:'/revenues'},
    // {label: 'عرض الأنواع' , route: '/categories', to:'/categories' },
]; 
const home = ref({
    icon: 'pi pi-home',
    to: '/',
},
);

const confirmDeletion = (event : any , orderId : number , index : number) => {
    confirm.require({
        target: event.currentTarget,
        message: 'هل متأكد أنك تريد حذف هذا الطلب ؟',
        icon: 'pi pi-exclamation-triangle',
        acceptLabel : 'نعم',
        rejectLabel : 'لا',
        accept: () => {
            deleteOrder(orderId , index)
        },  
        reject: () => {
        }
    });
};

const deleteOrder = (orderId : number , index : number) => {
    axios.delete(`https://akademia.website/api/deleteOrder/${orderId}`).then((result) => {
        console.log(result.data);
        orderDeletedSuccessfully.value = true
        window.scrollTo({
            behavior : 'smooth',
            top : 0
        })
        setTimeout(() => {
            orderDeletedSuccessfully.value = false     
            location.reload()   
        }, 1000);
    }).catch((err) => {
        console.log(err);
    });
}

const filters = ref(
    {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        branch: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
        product: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
        type: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
        total_price: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
        // paid_date: { value: null, matchMode: FilterMatchMode.DATE_IS },
        created_at: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.DATE_AFTER } , { value: null, matchMode: FilterMatchMode.DATE_BEFORE }] },
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

const getOrders = () => {
    axios.get('https://akademia.website/api/orders').then((result) => {
        result.data.orders.forEach((order : any ) => {
            Orders.value.push({
                id : order.id,
                branch : order.branch_id ? order.branch.branch_name : 'مجموع الفروع',
                product : order.product.product_name,
                created_at : new Date(order.created_at),
                type : order.order_type == 'buy' ? 'مشتريات' : 'مبيعات' ,
                count : order.count ,
                total_price : order.total_price,
            })
        });
        calculateTotalOrders()
        chooseTargetBranch.value = false
        isFetched.value = true
        console.log(Orders.value);
    }).catch((err) => {
        console.log(err);
    });
}

const branches : any = ref(['مجموع الفروع'])
const branchNames : any = []

const getBranches = () => {
    axios.get('https://akademia.website/api/branches').then((result) => {
        console.log(result.data);
        result.data.branches.forEach((branch : any) => {
            branches.value.push(branch.branch_name)
            branchNames.push({label : branch.branch_name , value : branch.id})
        });
        isBranchesFetched.value = true
    }).catch((err) => {
        console.log(err);
    });
}
const dt = ref();

const calculateTotalOrders = () => {
    let tmp = Orders.value
    let hasNoFilters = true
    let totalRev = 0
    console.log(tmp);
    filters.value.created_at.constraints.forEach((filter : any) => {
        if(filter.value){
            hasNoFilters = false
            if(filter.matchMode == 'dateAfter'){
                if(tmp.length > 0){
                    tmp = tmp.filter((obj : any) => obj.created_at > new Date(filter.value));
                }
            }
            if(filter.matchMode == 'dateBefore'){
                if(tmp.length > 0){
                tmp = tmp.filter((obj : any) => obj.created_at < new Date(filter.value));
                }
            }
            if(filter.matchMode == 'dateIs'){
                if(tmp.length > 0){
                filter.value = new Date(filter.value)
                filter.value.setHours(0, 0, 0, 0);
                tmp = tmp.filter((obj : any) => {
                    console.log(obj);
                    console.log(obj.created_at , 'from inside filter');
                
                    const objDate = new Date(obj.created_at);
                    objDate.setHours(0, 0, 0, 0); // Set time to midnight
                    return objDate.getTime() == filter.value.getTime();
                });
            }
            }
            if(filter.matchMode == 'dateIsNot'){
                if(tmp.length > 0){
                filter.value = new Date(filter.value)
                filter.value.setHours(0, 0, 0, 0);
                tmp = tmp.filter((obj : any) => {
                    const objDate = new Date(obj.created_at);
                    objDate.setHours(0, 0, 0, 0); // Set time to midnight
                    return objDate.getTime() !== filter.value.getTime();
                });
                }
            }
        }
    });
    filters.value.type.constraints.forEach((filter : any) => {
        if(filter.value){
            hasNoFilters = false
            if(tmp.length > 0){
                tmp = tmp.filter((obj : any) => obj.type.includes(filter.value));
            }
        }
    });
    if(hasNoFilters){
        Orders.value.forEach((order : any) => {
            totalRev += parseFloat(order.total_price as string)
        });
        TotalOrders.value = totalRev
    }
    else{
        tmp.forEach((order : any) => {
            totalRev += parseFloat(order.total_price as string)
        });
        TotalOrders.value = totalRev
    }
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
                if(!isEmpAuthorizedFor(empPermissions.value , 'المرتجعات' , UserType.value) || !isEmpAuthorizedFor(empPermissions.value , 'تقرير المبيعات' , UserType.value)){
                    localStorage.removeItem('SwimmingToken')
                    push({path : '/login', query : {userType : 'employee'}})
                }
                getBranches()
                getOrders()
            })
        }   
        else{
            getBranches()
            getOrders()
        }
    })
})

const exportCSV = () => {
    dt.value.exportCSV();
};

</script>

<template>

    <div class="w-12 md:w-10 my-5 m-auto p-2 md:p-5 branchesList" style="direction: rtl;">
        <!-- Breadcrumb -->
    <div class="w-full m-auto flex justify-content-center p-4 MargAutoMob padding-1-breadcrumbs" style="direction: ltr;">
        <Breadcrumb :home="home" :model="breadCrumbs" />
    </div>    
    <ConfirmPopup></ConfirmPopup>
        <!-- data Table -->

    <div>
        <successMsg v-if="orderDeletedSuccessfully" class="fadeinright animation-duration-500 animation-iteration-1 my-4">تم الحذف بنجاح</successMsg>
            <DataTable v-model:filters="filters" :loading="!isFetched" ref="dt" export-filename="تقرير المبيعات و المشتريات" stripedRows :value="Orders"
             filterDisplay="menu" paginator :rows="10" :rowsPerPageOptions="[10, 20, 50 , 100]"
             dataKey="id" removableSort :globalFilterFields="['branch' , 'product' , 'type']" tableStyle="min-width: 50rem">
            <template #header>
                <div class="flex flex-column lg:flex-row justify-content-between align-items-center">
                    <h3 class="hidden md:my-2 lg:my-0 md:flex">تقرير المبيعات و المشتريات</h3>
                    <div class="flex align-content-center justify-content-center">
                        <div v-for="(filter,index) in filters.created_at.constraints" class="flex">
                            <!-- {{ filter }} -->
                            <p v-if="filter.value && filter.matchMode=='dateIsNot'" class="mx-2">المبيعات و المشتريات ما عدا {{ new Date(filter.value).toLocaleDateString() }}</p>
                            <p v-if="filter.value && filter.matchMode=='dateIs'" class="mx-2">المبيعات و المشتريات في {{ new Date(filter.value).toLocaleDateString() }}</p>
                            <p v-if="filter.value && filter.matchMode=='dateAfter'" class="mx-2">المبيعات و المشتريات بعد {{ new Date(filter.value).toLocaleDateString() }}</p>
                            <p v-if="filter.value && filter.matchMode=='dateBefore'" class="mx-2">المبيعات و المشتريات قبل {{ new Date(filter.value).toLocaleDateString() }}</p>
                            <p class="mx-2" v-if="filters.created_at.constraints[index +1] && filters.created_at.constraints[index +1].value"> مع </p>
                        </div>
                    </div>
                    <span class="p-input-icon-left">
                        <i class="pi pi-search" />
                        <InputText v-model="filters['global'].value" placeholder="بحث شامل" />
                    </span>
                </div>
            </template>
            <Column field="product" sortable  header="المنتج" style="width: 15%;">
            </Column>
            <Column field="type"  header="النوع">
                <template #filter="{ filterModel, filterCallback }">
                    <Dropdown v-model="filterModel.value" @change="filterCallback()" :options="['مشتريات' , 'مبيعات']" placeholder="اختر النوع" class="p-column-filter noDropDownFilterOptions" style="min-width: 12rem" :showClear="true">
                    </Dropdown>
                </template>
                <template #filterapply="{ filterCallback }">
                    <Button type="button" @click="filterCallback(); calculateTotalOrders()" class="mb-3 lg:mb-0 mx-2" label="تفعيل" />
                </template>
                <template #filterclear="{ filterCallback }">
                    <Button type="button" @click="filterCallback(); calculateTotalOrders()" class="mb-3 lg:mb-0 mx-2" label="الغاء" outlined />
                </template>''
            </Column>
            <Column field="created_at" filterField="created_at" dataType="date" sortable  header="تاريخ الدفع" style="width: 22%;">
                <template #body="slotProps" >
                    <p>{{ dateTimeFormatter.format(slotProps.data.created_at) }}</p>
                </template>
                <template #filter="{ filterModel }">
                    <Calendar v-model="filterModel.value" dateFormat="mm/dd/yy" placeholder="أختر التاريخ " mask="99/99/9999" />
                </template>
                <template #filterapply="{ filterCallback }">
                    <Button type="button" @click="filterCallback(); calculateTotalOrders()" class="mb-3 lg:mb-0 mx-2" label="تفعيل" />
                </template>
                <template #filterclear="{ filterCallback }">
                    <Button type="button" @click="filterCallback(); calculateTotalOrders()" class="mb-3 lg:mb-0 mx-2" label="الغاء" outlined />
                </template>
            </Column>
            <Column field="branch"  header="الفرع">
                <template #filter="{ filterModel, filterCallback }">
                    <div class="">
                        <FormKit type="dropdown" v-model="filterModel.value" id="branch" validation="required" name="branch" label="الفرع" placeholder="اختر الفرع" :options="branches" />
                    </div>
                </template>
                <template #filterapply="{ filterCallback }">
                    <Button type="button" @click="filterCallback(); calculateTotalOrders()" class="mb-3 lg:mb-0 mx-2" label="تفعيل" />
                </template>
                <template #filterclear="{ filterCallback }">
                    <Button type="button" @click="filterCallback(); calculateTotalOrders()" class="mb-3 lg:mb-0 mx-2" label="الغاء" outlined />
                </template>
            </Column>
            <Column field="count" sortable header="الكمية">
                <template #body="slotProps" >
                    <p>{{ slotProps.data.count }} قطعة</p>
                </template>
            </Column>
            <Column field="total_price" sortable header="السعر">
                <template #body="slotProps" >
                    <p>{{ slotProps.data.total_price.toFixed(2) }} ج.م</p>
                </template>
            </Column>
            <Column field="" header="تسجيل مرتجع">
                <template #body="slotProps" >
                    <span v-if="isEmpAuthorizedFor(empPermissions , 'تسجيل مرتجع' , UserType)" class="material-symbols-outlined cursor-pointer hoverIcon textColor text-3xl p-2 borderRound" 
                    @click="confirmDeletion($event , slotProps.data.id , slotProps.index)">
                        currency_exchange
                    </span>
                </template>
            </Column>
                
            <template #empty> <InlineMessage severity="info">غير موجود</InlineMessage></template>
            <template #paginatorend>
                <Button type="button" icon="pi pi-download" @click="exportCSV($event)" text />
            </template>
            <template #footer>
                <div class="py-2">
                    <h4 class="textColor text-center mb-3">في المجموع هناك {{ Orders ? Orders.length : 0 }} </h4>
                    <h3 class="text-center textColor">اجمالي : <span style="background: rgba(0, 128, 0, 0.932);" class="p-1 px-3 borderRound">{{ TotalOrders.toFixed(2) }} ج.م</span></h3>
                </div>
            </template>
            <!-- <template #footer> 
                <h4 class="text-center">جار حساب مجموع الايرادات </h4>
            </template> -->
            </DataTable>
    </div>
    </div>
</template>
<style>
.p-datepicker .p-datepicker-header {
    direction: ltr; /* it's responsible for making the datepicker filter ltr */
}

.formkit-panel-wrapper{
    direction: ltr; /* it's responsible for making the datepicker filter ltr */
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
.formkit-outer .formkit-icon.formkit-prefix-icon , .formkit-calendar-icon , .formkit-select-icon{
    color: white;
    width: 3.2rem !important;
    background: var(--background);
}
.formkit-outer .formkit-icon svg {
    max-width: 2em;
}
[data-type='dropdown'] .formkit-inner {
    background-color: rgba(255, 255, 255, 0.623);
}
.formkit-select-icon{
    border-radius: 5px;
}
.formkit-input{
    padding: 2.5vh;
    margin: auto;
    border: none;
    border-radius: 3px;
    width: 100%;
    font-size: 15px;
    border: 1.4px solid rgba(0, 0, 0, 0.696);
    background-color: rgba(255, 255, 255, 0.623);
}
.formkit-input::placeholder{
    color: rgba(0, 0, 0, 0.79);
}
.formkit-input:focus{
    outline: none;
    box-shadow: 0px 0px 7px rgba(0, 0, 0, 0.442);
}
.formkit-form{
    margin: 2vh auto;
    width: 65%;
}
.formkit-wrapper{
    padding:  1vh;
}
.formkit-messages{
    list-style: none;
    padding: 0;
}
.formkit-message{
    color: white;
    background-color: rgba(255, 0, 0, 0.684);
    padding: 1.5vh;
    margin: 1vh 2vh;
    border-radius: 3px;
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
.submitBtn:hover{
    background-color: #009a33 !important;
    color: white !important;
}
label{
    padding: 0 1.8vh;
}
.repeater .formkit-label{
    display: flex;
    padding: 2vh;
    color: white;
    font-family: 'Lato', sans-serif;
    font-family: 'Lemonada', cursive;
}
.formkit-label{
    display: none;
    padding: 1vh;
}
.login .p-selectbutton .p-button.p-highlight{
    background-color: #00a650;
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
