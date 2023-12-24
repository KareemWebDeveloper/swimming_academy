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
import { ref, onBeforeMount, type Ref } from 'vue';
import { FilterMatchMode, FilterOperator } from 'primevue/api';
import { adminAuthorize } from '@/global-functions/checkUserRole';
import { employeeAuthorize } from '@/global-functions/isEmployeeAuthorized';
import successMsg from '../../components/successMsg.vue'
import InlineMessage from 'primevue/inlinemessage';
import ConfirmPopup from 'primevue/confirmpopup';
import { useConfirm } from "primevue/useconfirm";
import Dialog from 'primevue/dialog';
import Tag from 'primevue/tag';
import Dropdown from 'primevue/dropdown';
import { FormKit } from '@formkit/vue';
import SelectButton from 'primevue/selectbutton';
import { isEmpAuthorizedFor } from '@/global-functions/isEmployeeAuthorizedFor';

const confirm = useConfirm();

const isSubmitAttendanceDataLoading : any = ref(false);
const attendanceListView : any = ref(false);
const selectedCustomers : any = ref([]);
const selectedCoaches : any = ref([]);
const attendedSuccessfully = ref(false)
const isAttendingLoading = ref(false);
const missingSubscriptionError = ref(false)
const attendanceData : any = ref()
const activeCoaches : any = ref()
const activeCustomers : any = ref()
const isBranchesFetched : any = ref(false)
const branches : any = ref([])
const currentTime : any = ref()
const customerAttendances : any = ref()
const coachAttendances : any = ref()
const categories : any = ref([])
const isCategoriesFetched = ref(false)
const allAcademies : any = ref([])
const isAcademiesFetched = ref(false)
const optionValue : any = ref('customers')

// breadCrumbs
const breadCrumbs : any = ref([]);
breadCrumbs.value = [
    {label: 'تقرير الحضور اليومي' , route: '/daily/attendances', to:'/daily/attendances'},
    // {label: 'عرض المنتجات' , route: '/attendance', to:'/attendance' },
]; 
const home = ref({
    icon: 'pi pi-home',
    to: '/',
},
);

function getCurrentTime() {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
    currentTime.value = `${hours}:${minutes}`;
}

const confirmSubmittingCustomers = (event : any , name : string) => {
    confirm.require({
        target: event.currentTarget,
        message: `هل متأكد أنك تريد تحضير ${name} ؟`,
        icon: 'pi pi-exclamation-triangle',
        acceptLabel : 'نعم',
        rejectLabel : 'لا',
        accept: () => {
            attendCustomers()
        },  
        reject: () => {
        }
    });
};

const filters = ref(
    {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        'customer.customer_name': { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
        'subscription.coach.name': { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
        'branch.branch_name': { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
        'subscription.academy_name': { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
        'subscription.category_name': { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
        'customer.id': { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
    }
);
const coachesFilters = ref(
    {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        'coach.name': { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
        'category.category_name': { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
        'coach.id': { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
    }
);
const options = {
    weekday: 'long',
    // year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
    timeZone: 'Africa/Cairo',
    locale: 'ar'
    };
const dateTimeFormatter = new Intl.DateTimeFormat('ar', options);

const getAttendances = (req : any) => {
    isSubmitAttendanceDataLoading.value = true
    req.target_date = new Date(req.target_date).setHours(13)
    req.target_date = new Date(req.target_date).toISOString().split('T')[0]
    console.log(req.target_date);  
    axios.post('https://akademia.website/api/attendances' , req).then((result : any) => {
        console.log(result.data);
        customerAttendances.value = result.data.customers
        coachAttendances.value = result.data.coaches
        isSubmitAttendanceDataLoading.value = false
        attendanceListView.value = true 
    }).catch((err : any) => {
        console.log(err);
    });
}

const getAcademies = () => {
    axios.get('https://akademia.website/api/academies').then((result) => {
        console.log(result.data);
        result.data.academies.forEach((academy : any) => {
            allAcademies.value.push(academy.academy_name)
        });
        isAcademiesFetched.value = true
    }).catch((err) => {
        console.log(err);
    });
}

const showUserProfile = (subscriptionId : any) =>{
    push({name : 'customer_find' , params : {id : subscriptionId}})
}

const deleteAttendance = (attendanceId : number , index : number , type : 'customer' | 'coach') => {
    axios.delete(`https://akademia.website/api/attendanceDelete/${attendanceId}`).then((result) => {
        console.log(result.data);
        if(type == 'customer'){
            customerAttendances.value.splice(index , 1)
        }
        else{
            coachAttendances.value.splice(index , 1)
        }
    }).catch((err) => {
        console.log(err);
    });
}
const getCategories = () => {
    axios.get('https://akademia.website/api/categories').then((result) => {
        console.log(result.data);
        result.data.categories.forEach((category : any) => {
            categories.value.push(category.category_name)
        });
        isCategoriesFetched.value = true
    }).catch((err) => {
        console.log(err);
    });
}
const dt = ref();

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
                if(!isEmpAuthorizedFor(empPermissions.value , 'تقرير الحضور اليومي' , UserType.value)){
                    localStorage.removeItem('SwimmingToken')
                    location.reload()
                    push({path : '/login', query : currentRoute.value.query})
                }
                getAcademies()
                getCategories()
            })
        }
        else{
            getAcademies()
            getCategories()
        }
    })
})
</script>

<template>

    <div class="w-12 md:w-10 my-5 m-auto p-2 md:p-5 productsList" style="direction: rtl;">
            <!-- Breadcrumb -->
    <div class="w-full m-auto flex justify-content-center p-4 MargAutoMob padding-1-breadcrumbs" style="direction: ltr;">
        <Breadcrumb :home="home" :model="breadCrumbs" />
    </div>    

    <div v-if="!attendanceListView">
        <FormKit v-model="attendanceData" type="form" :actions="false" @submit="getAttendances">
            <div class="mt-3">
                <div class="flex align-items-center">
                    <label for="target_date" class="px-3 py-1 text-white text-sm">يوم الحضور</label>
                </div>
                <FormKit
                type="datepicker"
                name="target_date"
                label="يوم الحضور"
                id="target_date"
                :format="{ date: 'short' }"
                validation="required"
                :value="new Date()"
            />
            </div>
            <Button type="submit" class="submitBtn" label="عرض التقرير" :loading="isSubmitAttendanceDataLoading" />
        </FormKit>
    </div>

    <ConfirmPopup></ConfirmPopup>
        <!-- data Table -->
        <div v-if="attendanceListView && isAcademiesFetched && isCategoriesFetched">
            <div class="flex justify-content-center my-5 pt-5 m-auto">
                <Button type="button" v-if="optionValue == 'customers'" label="تقرير حضور المدربين" @click="optionValue = 'coaches'" />
                <Button type="button" v-if="optionValue == 'coaches'" label="تقرير حضور المشتركين" @click="optionValue = 'customers'" />
            </div>
        <successMsg v-if="attendedSuccessfully" class="fadeinright animation-duration-500 animation-iteration-1 my-4">تم التسجيل بنجاح</successMsg>

        <!-- Customers Attendees Submitting -->
        <div v-if="optionValue == 'customers'">
            <DataTable v-model:filters="filters" ref="dt"  stripedRows :value="customerAttendances" paginator :rows="15" 
            :rowsPerPageOptions="[10, 20, 50]" filterDisplay="menu" dataKey="subscription_id" removableSort 
            :globalFilterFields="['customer.id', 'customer.customer_name', 'subscription.coach.name', 'branch.branch_name']" tableStyle="min-width: 50rem">
            <template #header>
                <div class="flex flex-column lg:flex-row justify-content-between align-items-center">
                    <!-- <Button type="button" class="mb-3 lg:mb-0 mx-2" @click="attendCustomers" :loading="isAttendingLoading" :disabled="selectedCustomers.length == 0" label="تسجيل المحدد" /> -->
                    <h3>تقرير حضور اللاعبين</h3>
                    <span class="p-input-icon-left">
                        <i class="pi pi-search" />
                        <InputText v-model="filters['global'].value" placeholder="بحث شامل" />
                    </span>
                </div>
            </template>
            <Column field="customer.id" sortable  header="الكود"></Column>
            <Column field="customer.customer_name" sortable  header="اسم المشترك" style="min-width: 11rem;"></Column>
            <Column field="subscription.coach.name" sortable  header="المدرب" style="min-width: 13rem;">
                <template #body="slotProps">
                    <p>كابتن / {{ slotProps.data.subscription.coach.name }}</p>
                </template>
            </Column>
            <Column field="subscription.category_name"  header="نوع الاشتراك" style="min-width: 11rem;">
                <template #filter="{ filterModel, filterCallback }">
                    <Dropdown v-model="filterModel.value" @change="filterCallback()" :options="categories" placeholder="اختر النوع" class="p-column-filter" style="min-width: 12rem" :showClear="true">
                    </Dropdown>
                </template>
                <template #filterapply="{ filterCallback }">
                    <Button type="button" @click="filterCallback()" class="mb-3 lg:mb-0 mx-2" label="تفعيل" />
                </template>
                <template #filterclear="{ filterCallback }">
                    <Button type="button" @click="filterCallback()" class="mb-3 lg:mb-0 mx-2" label="الغاء" outlined />
                </template>
            </Column>
            <Column field="subscription.academy_name"  header="الأكاديمية" style="min-width: 8rem;">
                <template #filter="{ filterModel, filterCallback }">
                    <Dropdown v-model="filterModel.value" @change="filterCallback()" :options="allAcademies" placeholder="اختر الأكاديمية" class="p-column-filter" style="min-width: 12rem" :showClear="true">
                    </Dropdown>
                </template>
                <template #filterapply="{ filterCallback }">
                    <Button type="button" @click="filterCallback()" class="mb-3 lg:mb-0 mx-2" label="تفعيل" />
                </template>
                <template #filterclear="{ filterCallback }">
                    <Button type="button" @click="filterCallback()" class="mb-3 lg:mb-0 mx-2" label="الغاء" outlined />
                </template>
            </Column>
            <Column field="created_at" sortable  header="موعد الحضور" style="min-width: 13rem;">
                <template #body="slotProps">
                    <p>{{ dateTimeFormatter.format(new Date(slotProps.data.created_at)) }}</p>
                </template>
            </Column>
            <Column field="branch.branch_name"  header="الفرع" style="min-width: 8rem;"></Column>
            <Column  header="تعديل" style="min-width: 8rem;">
                <template #body="slotProps">
                    <div class="flex align-items-center">
                        <span @click="deleteAttendance(slotProps.data.id , slotProps.index , 'customer')" class="material-symbols-outlined cursor-pointer hoverIcon textColor mx-2 text-3xl p-2 borderRound">
                            delete_forever
                        </span>
                        <span @click="showUserProfile(slotProps.data.subscription.id)" class="material-symbols-outlined cursor-pointer hoverIcon textColor mx-2 text-3xl p-2 borderRound">
                            visibility
                        </span>
                    </div>
                </template>
            </Column>
            <template #empty> <InlineMessage severity="info">لا يوجد مشتركين</InlineMessage></template>
            <template #footer> في المجموع هناك {{ customerAttendances ? customerAttendances.length : 0 }} أعضاء </template>
            </DataTable>    
        </div>

        <!-- Coaches Attendances Submiting -->
        <div v-else>
            <DataTable v-model:filters="coachesFilters" ref="dt"  stripedRows :value="coachAttendances"
             paginator :rows="10" :rowsPerPageOptions="[10, 20, 50]" filterDisplay="menu"
             dataKey="id" removableSort :globalFilterFields="['coach.id', 'coach.name']" tableStyle="min-width: 50rem">
            <template #header>
                <div class="flex flex-column lg:flex-row justify-content-between align-items-center">
                    <h3>تقرير حضور المدربين</h3>
                    <span class="p-input-icon-left">
                        <i class="pi pi-search" />
                        <InputText v-model="coachesFilters['global'].value" placeholder="بحث شامل" />
                    </span>
                </div>
            </template>
            <Column field="coach.id" sortable  header="الكود"></Column>
            <Column field="coach.name" sortable  header="اسم المدرب"  style="min-width: 13rem;">
                <template #body="slotProps">
                    <p>كابتن / {{ slotProps.data.coach.name }} </p>
                </template>
            </Column>
            <Column field="category.category_name" sortable  header="نوع التمرين" style="min-width: 13rem;">
                <template #filter="{ filterModel, filterCallback }">
                    <Dropdown v-model="filterModel.value" @change="filterCallback()" :options="categories" placeholder="اختر النوع" class="p-column-filter" style="min-width: 12rem" :showClear="true">
                    </Dropdown>
                </template>
                <template #filterapply="{ filterCallback }">
                    <Button type="button" @click="filterCallback()" class="mb-3 lg:mb-0 mx-2" label="تفعيل" />
                </template>
                <template #filterclear="{ filterCallback }">
                    <Button type="button" @click="filterCallback()" class="mb-3 lg:mb-0 mx-2" label="الغاء" outlined />
                </template>
            </Column>
            <Column field="training_start_time" sortable  header="موعد التمرين" style="min-width: 11rem;">
                <template #body="slotProps" >
                    <p>{{ new Date(`2000-01-01 ${slotProps.data.training_start_time}`).toLocaleTimeString('en-US', { hour12: true }) }}</p>
                </template>
            </Column>
            <Column field="created_at" sortable  header="موعد الحضور" style="min-width: 13rem;">
                <template #body="slotProps">
                    <p>{{ dateTimeFormatter.format(new Date(slotProps.data.created_at)) }}</p>
                </template>
            </Column>
            <Column  header="تعديل" style="max-width: 20rem;">
                <template #body="slotProps">
                    <div class="flex align-items-center">
                        <span @click="deleteAttendance(slotProps.data.id , slotProps.index , 'coach')" class="material-symbols-outlined cursor-pointer hoverIcon textColor mx-2 text-3xl p-2 borderRound">
                            delete_forever
                        </span>
                    </div>
                </template>
            </Column>
            <template #empty> <InlineMessage severity="info">لا يوجد مدربين</InlineMessage></template>
            <template #footer> في المجموع هناك {{ coachAttendances ? coachAttendances.length : 0 }} مدربين </template>
            </DataTable>    
        </div>
    </div>
</div>
</template>
<style>
.formkit-panel-wrapper{
    direction: ltr; /* it's responsible for making the datepicker filter ltr */
}
.dialogTable .p-datatable .p-datatable-thead > tr > th {
    color: black;
}
.p-inputtext {
    text-align: center;
}
.reciept .p-datatable .p-column-header-content {
    color: black;
}
.greenHover{
    transition-duration: 0.3s;
}
.greenHover:hover{
    color: rgb(3, 176, 3);
    font-size: 20px;
}
.greenHover:hover .posHover{
    color: rgb(3, 176, 3);
}
.posHover{
    transition-duration: 0.3s;
}
.posHover:hover{
    color: rgb(3, 176, 3);
    font-size: 75px !important;
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
.formkit-label{
    display: none;
    padding: 1vh;
}
[data-type='dropdown'] .formkit-inner {
    background-color: rgba(255, 255, 255, 0.623);
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
.productDetails .p-datatable .p-datatable-thead > tr > th {
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
    .productsList{
        margin-top: 10vh !important;
    }
}
</style>
