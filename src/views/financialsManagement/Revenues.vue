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
import { isEmpAuthorizedFor } from '@/global-functions/isEmployeeAuthorizedFor';
import Dropdown from 'primevue/dropdown';

const confirm = useConfirm();

const isFetched : any = ref(false);
const isTargetBranchReportLoading : any = ref(false);
const isBranchesFetched : any = ref(false);
const isAcademiesFetched : any = ref(false);
const chooseTargetBranch : any = ref(true);
const isDialogVisible : any = ref(false);
const isErrorReturned : any = ref(false);
const dbError : any = ref(false);
const updatedSuccessfully : any = ref(false);
const updateLoading : any = ref(false);
const activeCategory : any = ref();
const deletedSuccessfully = ref(false)
const targetRevenue = ref()
const ReportName = ref()
const Revenues : any = ref([])
const TotalRevenue : any = ref(0)

const paymentsOptions = ref(['cash','installments','vodafone','instapay' ,'visa'])

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

const filters = ref(
    {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        academy_name: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
        created_by: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
        customer: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
        type: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
        // paid_date: { value: null, matchMode: FilterMatchMode.DATE_IS },
        paid_date: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.DATE_AFTER } , { value: null, matchMode: FilterMatchMode.DATE_BEFORE }] },
        id: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
    }
);

const options = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    // hour: 'numeric',
    // minute: 'numeric',
    hour12: true,
    timeZone: 'Asia/Dubai',
    locale: 'ar'
    };
const dateTimeFormatter = new Intl.DateTimeFormat('ar', options);

const getRevenues = (branchId : number) => {
    axios.get(`https://akademia.website/api/revenues/${branchId}`).then((result) => {
        result.data.installments.forEach((installment : any ) => {
            Revenues.value.push({
                amount : installment.amount,
                paid_date : new Date(installment.updated_at),
                subscription_date : new Date(installment.subscription.subscription_date),
                expiration_date : new Date(installment.subscription.subscription_date).toLocaleDateString() + ' إلي ' +  new Date(installment.subscription.expiration_date).toLocaleDateString(),
                type : 'installments' ,
                created_by : installment.subscription.created_by ,
                branch : installment.subscription.branch.branch_name,
                academy_name : installment.subscription.academy_name,
                customer : `${installment.subscription.customer.customer_name} - ${installment.subscription.customer.customer_phone}`,
                category_name : installment.subscription.category_name,
            })
        });
        result.data.subscriptions.forEach((subscription : any ) => {
            Revenues.value.push({
                amount : subscription.sale ? subscription.price - subscription.sale : subscription.price,
                paid_date : new Date(subscription.subscription_date),
                subscription_date : new Date(subscription.subscription_date),
                created_by : subscription.created_by,
                expiration_date : new Date(subscription.subscription_date).toLocaleDateString() + ' إلي ' + new Date(subscription.expiration_date).toLocaleDateString(),
                type : subscription.subscription_type == 'cash' ? 'cash'  : subscription.subscription_type ,
                branch : subscription.branch.branch_name,
                customer : `${subscription.customer.customer_name} - ${subscription.customer.customer_phone}`,
                academy_name : subscription.academy_name,
                category_name : subscription.category_name,
            })
        });
        updateTotalRevenues(Revenues.value)
        if(currentRoute.value.query.filter == 'installments'){
            filterInstallmentsOnly()
        }
        isTargetBranchReportLoading.value = false
        chooseTargetBranch.value = false
        isFetched.value = true
        console.log(Revenues.value);
    }).catch((err) => {
        console.log(err);
    });
}

const branches : any = ref([{label : 'كل الفروع' , value : 0}])
const academies : any = ref([])
const branchNames : any = []

const getBranches = () => {
    axios.get('https://akademia.website/api/branches').then((result) => {
        console.log(result.data);
        result.data.branches.forEach((branch : any) => {
            branches.value.push({label : branch.branch_name , value : branch.id})
            branchNames.push({label : branch.branch_name , value : branch.id})
        });
        isBranchesFetched.value = true
    }).catch((err) => {
        console.log(err);
    });
}
const getAcademies = () => {
    axios.get('https://akademia.website/api/academies').then((result) => {
        console.log(result.data);
        result.data.academies.forEach((academy : any) => {
            academies.value.push({label : academy.academy_name , value : academy.id})
        });
        isAcademiesFetched.value = true
    }).catch((err) => {
        console.log(err);
    });
}
const submitTargetRevenue = (req : any) => {
    isTargetBranchReportLoading.value = true
    getRevenues(req.branch_id)
    if(req.branch_id == 0){
        ReportName.value = 'تقرير ايرادات كل الفروع'
    }
    else{
        let branchName = branchNames.filter((branch : any) => branch.value == req.branch_id)
        branchName = branchName[0].label
        ReportName.value = `تقرير ايرادات فرع ${branchName}`
    }
}
const dt = ref();

const filterInstallmentsOnly = () => {
    
    let tmp = Revenues.value
    let totalRev = 0
    if(tmp.length > 0){
        tmp = tmp.filter((obj : any) => obj.type == 'تقسيط');
    }
    tmp.forEach((revenue : any) => {
            totalRev += parseFloat(revenue.amount as string)
    });
    Revenues.value = tmp
    TotalRevenue.value = totalRev
}

function formatNumberWithComma(number : number) {
  
  // Convert the number to a string for manipulation
  const numberString = number.toString();
  
  const digits = numberString.split(/[-+]/)[1] ? numberString.split(/[-+]/)[1].split('') : numberString.split('');

  // Reverse the digits array for easier processing
  digits.reverse();

  // Insert commas after every 3rd digit (except the first 3)
  for (let i = 3; i < digits.length; i += 4) {
    digits.splice(i, 0, ',');
  }

  // Reverse the digits array back to the original order
  digits.reverse();

  // Join the digits array back into a string
  const formattedNumber = digits.join('');

  return formattedNumber;
}

const updateTotalRevenues = (value : any[]) => {
    console.log(value);
    let total = 0
    value.forEach(element => {
        total += parseFloat(element.amount as string)
    });
    TotalRevenue.value = formatNumberWithComma(total) 
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
                if(!isEmpAuthorizedFor(empPermissions.value , 'تقرير الإيرادات' , UserType.value)){
                    localStorage.removeItem('SwimmingToken')
                    location.reload()
                    push({path : '/login', query : {userType : 'employee'}})
                }
                if(currentRoute.value.query.branchId){
                    let branchId = {
                        branch_id : currentRoute.value.query.branchId
                    }
                    chooseTargetBranch.value = false
                    submitTargetRevenue(branchId)
                }
                getBranches()
                getAcademies()
            })
        }
        else{
            if(currentRoute.value.query.branchId){
                let branchId = {
                    branch_id : currentRoute.value.query.branchId
                }
                chooseTargetBranch.value = false
                submitTargetRevenue(branchId)
            }
            getBranches()
            getAcademies()
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

        <!-- Choose Target Branch and Academy -->
    <div v-if="chooseTargetBranch && isBranchesFetched">
        <h2 class="text-center my-5 text-white">انشاء تقرير الايرادات</h2>
        <FormKit v-model="targetRevenue" type="form" :actions="false" @submit="submitTargetRevenue">
            <div class="mt-3">
                <div class="flex align-items-center">
                    <label for="branch" class="px-3 py-1 text-white text-sm">الفرع</label>
                </div>
                <FormKit type="dropdown" id="branch" validation="required" name="branch_id" label="الفرع" placeholder="اختر الفرع الذي تريد تقرير عنه" :options="branches" />
            </div>
            <Button type="submit" class="submitBtn" label="التالي" :loading="isTargetBranchReportLoading" />
        </FormKit>
    </div>

    <div v-else-if="!chooseTargetBranch">
        <div @click="chooseTargetBranch = true" class="bg-card w-8rem text-center my-3 py-2 px-3 borderRound cursor-pointer flex justify-content-center align-items-center text-white">
            <h5>الرجوع</h5>
            <span class="material-symbols-outlined mx-2">
                arrow_back
            </span>
        </div>
        <successMsg v-if="deletedSuccessfully" class="fadeinright animation-duration-500 animation-iteration-1 my-4">تم الحذف بنجاح</successMsg>
            <DataTable v-model:filters="filters" :loading="!isFetched" ref="dt" :export-filename="ReportName" stripedRows :value="Revenues"
             filterDisplay="menu" paginator :rows="10" :rowsPerPageOptions="[10, 20, 50 , 100]" @value-change="updateTotalRevenues"
             dataKey="id" removableSort :globalFilterFields="['academy_name' , 'amount' , 'branch' , 'customer' , 'created_by']" tableStyle="min-width: 50rem">
            <template #header>
                <div class="flex flex-column lg:flex-row justify-content-between align-items-center">
                    <h3 class="hidden md:my-2 lg:my-0 md:flex">تقرير الايرادات</h3>
                    <div class="flex align-content-center justify-content-center">
                        <div v-for="(filter,index) in filters.paid_date.constraints" class="flex">
                            <!-- {{ filter }} -->
                            <p v-if="filter.value && filter.matchMode=='dateIsNot'" class="mx-2">الإيرادات ما عدا {{ new Date(filter.value).toLocaleDateString() }}</p>
                            <p v-if="filter.value && filter.matchMode=='dateIs'" class="mx-2">الإيرادات في {{ new Date(filter.value).toLocaleDateString() }}</p>
                            <p v-if="filter.value && filter.matchMode=='dateAfter'" class="mx-2">الإيرادات بعد {{ new Date(filter.value).toLocaleDateString() }}</p>
                            <p v-if="filter.value && filter.matchMode=='dateBefore'" class="mx-2">الإيرادات قبل {{ new Date(filter.value).toLocaleDateString() }}</p>
                            <p class="mx-2" v-if="filters.paid_date.constraints[index +1] && filters.paid_date.constraints[index +1].value"> مع </p>
                        </div>
                    </div>
                    <span class="p-input-icon-left">
                        <i class="pi pi-search" />
                        <InputText v-model="filters['global'].value" placeholder="بحث شامل" />
                    </span>
                </div>
            </template>
            <Column field="amount" sortable  header="المبلغ" style="width: 15%;">
                <template #body="slotProps" >
                    <p>{{ parseFloat(slotProps.data.amount).toFixed(2) }} ج.م</p>
                </template>
            </Column>
            <Column field="type"  header="طريقة الدفع" style="min-width : 9rem;">
                <template #body="slotProps" >
                    <p v-if="slotProps.data.type == 'cash'">كاش</p>
                    <p v-if="slotProps.data.type == 'installments'">تقسيط</p>
                    <p v-if="slotProps.data.type == 'vodafone'">فودافون كاش</p>
                    <p v-if="slotProps.data.type == 'instapay'">انستا باي</p>
                    <p v-if="slotProps.data.type == 'visa'">فيزا</p>
                </template>
                <template #filter="{ filterModel, filterCallback }">
                    <Dropdown v-model="filterModel.value" @change="filterCallback()" :options="paymentsOptions" placeholder="اختر طريقة دفع" class="p-column-filter" style="min-width: 12rem" :showClear="true">
                        <template #option="slotProps">
                            <p v-if="slotProps.option == 'cash'">كاش</p>
                            <p v-if="slotProps.option == 'vodafone'">فودافون كاش</p>
                            <p v-if="slotProps.option == 'instapay'">انستا باي</p>
                            <p v-if="slotProps.option == 'installments'">تقسيط</p>
                            <p v-if="slotProps.option == 'visa'">فيزا</p>
                        </template>
                    </Dropdown>
                </template>
                <template #filterapply="{ filterCallback }">
                    <Button type="button" @click="filterCallback()" class="mb-3 lg:mb-0 mx-2" label="تفعيل" />
                </template>
                <template #filterclear="{ filterCallback }">
                    <Button type="button" @click="filterCallback()" class="mb-3 lg:mb-0 mx-2" label="الغاء" outlined />
                </template>
            </Column>
            <Column field="paid_date" filterField="paid_date" dataType="date" sortable  header="تاريخ الدفع" style="width: 22%;">
                <template #body="slotProps" >
                    <p>{{ dateTimeFormatter.format(slotProps.data.paid_date) }}</p>
                </template>
                <template #filter="{ filterModel }">
                    <Calendar v-model="filterModel.value" dateFormat="mm/dd/yy" placeholder="أختر التاريخ " mask="99/99/9999" />
                </template>
                <template #filterapply="{ filterCallback }">
                    <Button type="button" @click="filterCallback();" class="mb-3 lg:mb-0 mx-2" label="تفعيل" />
                </template>
                <template #filterclear="{ filterCallback }">
                    <Button type="button" @click="filterCallback();" class="mb-3 lg:mb-0 mx-2" label="الغاء" outlined />
                </template>
            </Column>
            <Column field="created_by" sortable  header="المسجل">
                <template #body="slotProps" >
                    <p v-if="slotProps.data.created_by">{{ slotProps.data.created_by }}</p>
                    <p v-else>غير محدد</p>
                </template>
                <template #filter="{ filterModel , filterCallback }">
                    <InputText v-model="filterModel.value" @input="filterCallback()" type="text" class="p-column-filter" placeholder="أدخل اسم المسجل" />
                </template>
                <template #filterapply="{ filterCallback }">
                    <Button type="button" @click="filterCallback()" class="mb-3 lg:mb-0 mx-2" label="تفعيل" />
                </template>
                <template #filterclear="{ filterCallback }">
                    <Button type="button" @click="filterCallback()" class="mb-3 lg:mb-0 mx-2" label="الغاء" outlined />
                </template>
            </Column>
            <Column field="expiration_date" sortable  header="مدة الاشتراك" style="width: 22%;">
                <!-- <template #body="slotProps" >
                    <p>{{ slotProps.data.subscription_date.toLocaleDateString() }} إلي {{ slotProps.data.expiration_date.toLocaleDateString() }}</p>
                </template> -->
            </Column>
            <Column field="branch"  header="الفرع" style="min-width: 11rem;">
            </Column>
            <Column field="customer"  header="العميل" style="min-width: 14rem;">
            </Column>
            <Column field="academy_name"  header="الأكاديمية" style="min-width: 11rem;">
                <template #filter="{ filterModel , filterCallback }">
                    <InputText v-model="filterModel.value" @input="filterCallback()" type="text" class="p-column-filter" placeholder="أدخل اسم الأكاديمية" />
                </template>
                <template #filterapply="{ filterCallback }">
                    <Button type="button" @click="filterCallback()" class="mb-3 lg:mb-0 mx-2" label="تفعيل" />
                </template>
                <template #filterclear="{ filterCallback }">
                    <Button type="button" @click="filterCallback()" class="mb-3 lg:mb-0 mx-2" label="الغاء" outlined />
                </template>
            </Column>
                
            <template #empty> <InlineMessage severity="info">غير موجود</InlineMessage></template>
            <template #paginatorend>
                <Button type="button" icon="pi pi-download" @click="exportCSV($event)" text />
            </template>
            <template #footer>
                <div class="py-2">
                    <h4 class="textColor text-center mb-3">في المجموع هناك {{ Revenues ? Revenues.length : 0 }} مصادر ايرادات </h4>
                    <h3 class="text-center textColor">اجمالي الايرادات : <span style="background: rgba(0, 128, 0, 0.932);" class="p-1 px-3 borderRound">{{ TotalRevenue }} ج.م</span></h3>
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
