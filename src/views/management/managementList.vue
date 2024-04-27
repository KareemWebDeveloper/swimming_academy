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

const workersFetched : any = ref(false);
const isDiscountDialogVisible : any = ref(false);
const isAdvancePaymentDialogVisible : any = ref(false);
const activeWorker : any = ref();
const updatedSuccessfully : any = ref(false);
const isEmployeeFetched : any = ref(false);
const isDiscountLoading : any = ref(false);
const discountedWorkersCount : any = ref(0);
const advancePaidWorkersCount : any = ref(0);
const workers : any = ref([]);
const deletedSuccessfully = ref(false)

// breadCrumbs
const breadCrumbs : any = ref([]);
breadCrumbs.value = [
    {label: 'السلف و الخصومات' , route: '/management', to:'/management'},
]; 
const home = ref({
    icon: 'pi pi-home',
    to: '/',
},
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
    timeZone: 'Asia/Dubai',
    locale: 'ar'
};

const dateTimeFormatter = new Intl.DateTimeFormat('ar', options);

const getWorkers = () => {
    axios.get('https://akademia.website/api/allWorkers').then((result) => {
        console.log(result.data);
        result.data.employees.forEach((employee : any) => {
            workers.value.push({
                id : employee.id,
                name : employee.name,
                job : 'موظف',
                phone : employee.phone,
                advance_payment : employee.advance_payment ? `${parseFloat(employee.advance_payment).toFixed(2)} ج.م` : 'غير محدد',
                salary_discount : employee.salary_discount  ? `${parseFloat(employee.salary_discount).toFixed(2)} ج.م` : 'غير محدد'
            })
            if(employee.advance_payment != 0 && employee.advance_payment != null){
                advancePaidWorkersCount.value++
            }
            if(employee.salary_discount != 0 && employee.advance_payment != null){
                discountedWorkersCount.value++
            }
        });
        result.data.coaches.forEach((coach : any) => {
            workers.value.push({
                id : coach.id,
                name : `كابتن / ${coach.name}`,
                job : 'مدرب',
                phone : coach.phone,
                advance_payment : coach.advance_payment ? `${parseFloat(coach.advance_payment).toFixed(2)} ج.م` : 'غير محدد',
                salary_discount : coach.salary_discount ? `${parseFloat(coach.salary_discount).toFixed(2)} ج.م` : 'غير محدد'
            })
            if(coach.advance_payment != 0 && coach.advance_payment != null){
                advancePaidWorkersCount.value++
            }
            if(coach.salary_discount != 0 && coach.salary_discount != null){
                discountedWorkersCount.value++
            }
        });
        workersFetched.value = true
    }).catch((err) => {
        console.log(err);
    });
}

const submitDiscount = (req : any) => {
    isDiscountLoading.value = true
    let request : any = {}
    if(req.salary_discount && req.salary_discount != 'غير محدد'){
        request.salary_discount = req.salary_discount
    }
    if(req.advance_payment && req.advance_payment != 'غير محدد'){
        request.advance_payment = req.advance_payment
    }
    if(activeWorker.value.job == 'موظف'){
        axios.put(`https://akademia.website/api/updateEmployeeFinances/${activeWorker.value.id}` , request).then((result) => {
            console.log(result);
            workers.value = []
            getWorkers()
            isDiscountLoading.value = false
            isDiscountDialogVisible.value = false
            isAdvancePaymentDialogVisible.value = false
        }).catch((err) => {
            console.log(err);
        });
    }
    else{
        axios.put(`https://akademia.website/api/updateCoachFinances/${activeWorker.value.id}` , request).then((result) => {
            console.log(result);
            workers.value = []
            getWorkers()
            isDiscountLoading.value = false
            isDiscountDialogVisible.value = false
            isAdvancePaymentDialogVisible.value = false
        }).catch((err) => {
            console.log(err);
        });
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
                    location.reload()
                    console.log('not employee');
                    push({path : '/login', query : currentRoute.value.query})
                }
                empPermissions.value = employee.permissions
                UserType.value = 'employee'
                if(!isEmpAuthorizedFor(empPermissions.value , 'السلف و الخصومات' , UserType.value)){
                    localStorage.removeItem('SwimmingToken')
                    push({path : '/login', query : {userType : 'employee'}})
                }
                getWorkers()
            })
        }
        else{
            getWorkers()
        }
    })
})

const dt = ref();
const exportCSV = () => {
    dt.value.exportCSV();
};
</script>

<template>
    <Dialog v-model:visible="isDiscountDialogVisible" maximizable modal header="تسجيل خصم" :style="{ width: '60vw' }" :breakpoints="{ '960px': '75vw', '641px': '100vw' }">
        <div class="p-3">
            <FormKit type="form" :actions="false" v-model="activeWorker" @submit="submitDiscount">
                    <FormKit type="number" prefix-icon="dollar" number="float" name="salary_discount" label="الخصم" placeholder="أدخل مبلغ الخصم" />
                    <Button type="submit" label="تسجيل الخصم" severity="danger" class="p-2 px-4 m-auto text-center" :loading="isDiscountLoading" />
            </FormKit>
        </div>
        <template #footer>
        </template>
    </Dialog>

    <Dialog v-model:visible="isAdvancePaymentDialogVisible" maximizable modal header="تسجيل سلفة" :style="{ width: '60vw' }" :breakpoints="{ '960px': '75vw', '641px': '100vw' }">
        <div class="p-3">
            <FormKit type="form" :actions="false" v-model="activeWorker" @submit="submitDiscount">
                    <FormKit type="number" prefix-icon="dollar" number="float" name="advance_payment" label="السلفة" placeholder="أدخل مبلغ السلفة" />
                    <Button type="submit" label="تسجيل السلفة" severity="danger" class="p-2 px-4 m-auto text-center" :loading="isDiscountLoading" />
            </FormKit>
        </div>
        <template #footer>
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
    <div>
        <DataTable v-model:filters="filters" ref="dt" export-filename="السلف و الخصومات" stripedRows :value="workers"  v-model:selection="selectedCoaches"
         paginator :rows="10" :rowsPerPageOptions="[10, 15 , 20, 50]" filterDisplay="menu" :loading="!workersFetched"
         dataKey="id" removableSort :globalFilterFields="['id', 'name']" tableStyle="min-width: 50rem">
        <template #header>
            <div class="flex flex-column lg:flex-row justify-content-between align-items-center">
                <h3 class="hidden md:my-2 lg:my-0 md:flex">السلف و الخصومات</h3>
                <span class="p-input-icon-left">
                    <i class="pi pi-search" />
                    <InputText v-model="filters['global'].value" placeholder="بحث شامل" />
                </span>
            </div>
        </template>
        <Column field="id" sortable  header="الكود"></Column>
        <Column field="name" sortable  header="الاسم" style="min-width: 12rem;">
            <template #body="slotProps" >
                <p>{{ slotProps.data.name }}</p>
            </template>
        </Column>
        <Column field="phone"  header="الهاتف" style="min-width: 10rem;"></Column>
        <Column field="job"  header="الوظيفة">
        </Column>
        <Column field="advance_payment" sortable  header="السلف">
            <template #body="slotProps" >
                <p v-if="slotProps.data.advance_payment != 'غير محدد'" class="text-red-500 font-bold">{{ slotProps.data.advance_payment }}</p>
                <p v-else>{{ slotProps.data.advance_payment }}</p>
            </template>
        </Column>
        <Column field="salary_discount" sortable  header="الخصم">
            <template #body="slotProps" >
                <p v-if="slotProps.data.salary_discount != 'غير محدد'" class="text-red-500 font-bold">{{ slotProps.data.salary_discount }}</p>
                <p v-else>{{ slotProps.data.salary_discount }}</p>
            </template>
        </Column>
        <Column  header="تسجيل سلفة / خصم" style="min-width: 17rem;">
            <template #body="slotProps">
                <div class="flex align-items-center">
                <span class="cursor-pointer hoverIcon textColor text-sm p-2 borderRound" 
                    @click="isAdvancePaymentDialogVisible = true; activeWorker = slotProps.data">
                    تسجيل سلفة
                </span>
                <span @click="isDiscountDialogVisible = true; activeWorker = slotProps.data" class="cursor-pointer hoverIcon mx-2 textColor text-sm p-2 borderRound">
                    تسجيل خصم
                </span>
                </div>
            </template>
        </Column>
            
        <template #empty> <InlineMessage severity="info">لا يوجد موظفين</InlineMessage></template>
        <template #paginatorend>
            <Button type="button" icon="pi pi-download" @click="exportCSV($event)" text />
        </template>
        <template #footer>
            <div>
                <p>
                    في المجموع هناك {{ workers ? workers.length : 0 }} موظفين 
                </p>
                <p>
                    في المجموع هناك {{ discountedWorkersCount }} موظفين عليهم خصم
                </p>
                <p>
                    في المجموع هناك {{ advancePaidWorkersCount }} موظفين عليهم سلف
                </p>

            </div>
            </template>
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
