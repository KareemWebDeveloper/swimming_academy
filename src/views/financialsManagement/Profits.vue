<script setup lang="ts">
import axios from 'axios';
import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Breadcrumb from 'primevue/breadcrumb';
import Chart from 'primevue/chart';
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

const confirm = useConfirm();

const isChartGenerated : any = ref(false);
const isTargetBranchReportLoading : any = ref(false);
const isBranchesFetched : any = ref(false);
const totalRevenue : any = ref(0);
const totalExpenses : any = ref(0);
const chooseTargetBranch : any = ref(true);
const targetProfits = ref()
const ReportName = ref()
const Revenues : any = ref([])
const revenuesDetails : any = ref([{}])
const expensesDetails : any = ref([{}])
const TotalRevenue : any = ref(0)
const chartData = ref();
const chartOptions = ref();
// breadCrumbs
const breadCrumbs : any = ref([]);
breadCrumbs.value = [
    {label: 'تقرير الأرباح' , route: '/profits', to:'/profits'},
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
const getExpenses = (req : any) => {
    req.start_date = new Date(req.start_date).toLocaleDateString()
    req.end_date = new Date(req.end_date).toLocaleDateString()
    axios.post(`https://akademia.website/api/expensesInInterval/${req.branch_id}`,req).then((result) => {
        console.log(result.data);
        result.data.variableExpenses.forEach((expense : any) => {
            totalExpenses.value += expense.expense_cost
            if(req.branch_id == 0){
                if (expensesDetails.value[0].hasOwnProperty(expense.branch_id)) {
                    expensesDetails.value[0][expense.branch_id].total += expense.expense_cost; // Updating the `total` property to a new value
                }
            }
        });
        result.data.constantExpenses.forEach((expense : any) => {
            totalExpenses.value += expense.expense_cost
            if(req.branch_id == 0){
                if (expensesDetails.value[0].hasOwnProperty(expense.branch_id)) {
                    expensesDetails.value[0][expense.branch_id].total += expense.expense_cost; // Updating the `total` property to a new value
                }
            }
        });
        if(result.data.salaries){
            result.data.salaries.forEach((expense : any) => {
                totalExpenses.value += expense.amount
                if(req.branch_id == 0){
                    expensesDetails.value[0]['salaries'].totalSalaries += parseFloat(expense.amount); // Updating the `total` property to a new value
                }
            });
        }
        chartData.value = {
            labels: ['الايرادات', 'المصروفات'],
            datasets: [
                {
                    label: ['الايرادات' , 'المصروفات'],
                    data: [totalRevenue.value , totalExpenses.value],
                    backgroundColor: ['rgba(3, 203, 0, 0.31)', '#ff000054'],
                    borderColor: ['rgba(3, 203, 0, 0.81)', '#ff000094'],
                    borderWidth: 2
                }
            ]
        };
        isChartGenerated.value = true
    }).catch((err) => {
        console.log(err);
    });
}

const getRevenues = (req : any) => {
    axios.post(`https://akademia.website/api/revenuesInInterval/${req.branch_id}` , req).then((result) => {
        console.log(result.data);
        result.data.subscriptions.forEach((subscription : any) => {
            if(subscription.sale){
                let price = parseFloat(subscription.price) - parseFloat(subscription.sale)
                totalRevenue.value += price
                if(req.branch_id == 0){
                    if (revenuesDetails.value[0].hasOwnProperty(subscription.branch_id)) {
                        revenuesDetails.value[0][subscription.branch_id].total += price; // Updating the `total` property to a new value
                    }
                }
            }
            else{
                totalRevenue.value += parseFloat(subscription.price)
                if(req.branch_id == 0){
                    if (revenuesDetails.value[0].hasOwnProperty(subscription.branch_id)) {
                        revenuesDetails.value[0][subscription.branch_id].total += subscription.price; // Updating the `total` property to a new value
                    }
                }
            }
        });
        result.data.installments.forEach((installment : any) => {   
                totalRevenue.value += parseFloat(installment.amount)
                if(req.branch_id == 0){
                    if (revenuesDetails.value[0].hasOwnProperty(installment.subscription.branch_id)) {
                        revenuesDetails.value[0][installment.subscription.branch_id].total += parseFloat(installment.amount); // Updating the `total` property to a new value
                    }
                }
        });
        getExpenses(req)
        isTargetBranchReportLoading.value = false
        chooseTargetBranch.value = false
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
            expensesDetails.value[0][branch.id] = {
                branchName : branch.branch_name,
                total : 0
            }
            revenuesDetails.value[0][branch.id] = {
                branchName : branch.branch_name,
                total : 0
            }
        });
        expensesDetails.value[0].salaries = {
            totalSalaries : 0
        }
        isBranchesFetched.value = true
    }).catch((err) => {
        console.log(err);
    });
}
const getTargetProfits = (req : any) => {
    isTargetBranchReportLoading.value = true
    getRevenues(req)
    if(req.branch_id == 0){
        ReportName.value = 'تقرير أرباح كل الفروع'
    }
    else{
        let branchName = branchNames.filter((branch : any) => branch.value == req.branch_id)
        branchName = branchName[0].label
        ReportName.value = `تقرير أرباح فرع ${branchName}`
    }
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
                    push({path : '/login', query : currentRoute.value.query})
                }
                empPermissions.value = employee.permissions
                UserType.value = 'employee'
                if(!isEmpAuthorizedFor(empPermissions.value , 'الحسابات المالية' , UserType.value)){
                    localStorage.removeItem('SwimmingToken')
                    push({path : '/login', query : {userType : 'employee'}})
                }
                getBranches()
            })
        }
        else{
            getBranches()
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

        <!-- Choose Target Branch and Academy -->
        <div v-if="chooseTargetBranch && isBranchesFetched">
            <h2 class="text-center my-5 text-white">انشاء تقرير الأرباح</h2>
            <FormKit v-model="targetProfits" type="form" :actions="false" @submit="getTargetProfits">
                <div class="mt-3">
                    <div class="flex align-items-center">
                        <label for="branch" class="px-3 py-1 text-white text-sm">الفرع</label>
                    </div>
                    <FormKit type="dropdown" id="branch" validation="required" name="branch_id" label="الفرع" placeholder="اختر الفرع الذي تريد تقرير عنه" :options="branches" />
                </div>
                <div class="mt-3">
                    <div class="flex align-items-center">
                        <label for="start_date" class="px-3 py-1 text-white text-sm">الأرباح منذ</label>
                    </div>
                    <FormKit
                        type="datepicker"
                        name="start_date"
                        label="الأرباح منذ"
                        id="start_date"
                        :format="{ date: 'short' }"
                        validation="required"
                        :value="new Date()"
                    />
                </div>
                <div class="mt-3">
                    <div class="flex align-items-center">
                        <label for="end_date" class="px-3 py-1 text-white text-sm">الأرباح حتي</label>
                    </div>
                    <FormKit
                    type="datepicker"
                    name="end_date"
                    label="الأرباح حتي"
                    id="end_date"
                    :format="{ date: 'short' }"
                    validation="required"
                    :value="new Date()"
                />
                </div>
                <Button type="submit" class="submitBtn" label="التالي" :loading="isTargetBranchReportLoading" />
            </FormKit>
        </div>
        <div v-else-if="isChartGenerated && !chooseTargetBranch" class="m-auto">
            <div class="text-center m-auto">
                <span style="color: rgba(3, 203, 0, 0.565);" class="material-symbols-outlined text-7xl text-center m-auto">
                    table_chart_view
                </span>
                <h3 class="textColor my-3">منذ {{ new Date(targetProfits.start_date).toLocaleDateString() }} إلي {{ new Date(targetProfits.end_date).toLocaleDateString() }}</h3>
            </div>
            <div class="flex justify-content-center textColor align-items-center p-5 m-auto">
                <h4 class="cursor-pointer" @click="chooseTargetBranch = !chooseTargetBranch">رجوع</h4> 
                <span class="material-symbols-outlined cursor-pointer mx-2 text-5xl" @click="chooseTargetBranch = !chooseTargetBranch">
                    arrow_back
                </span>
            </div>
            <div class="flex align-items-center w-full">
                <div class="bg-card borderRound p-3 m-auto w-6">
                    <div style="background-color: rgba(3, 203, 0, 0.265);" class="flex my-3 p-3 borderRound lg:my-1 align-items-center mx-3 justify-content-center flex-column">
                        <div class="flex align-items-center my-2">
                            <h3 class="text-white">اجمالي الايرادات</h3>
                            <span class="material-symbols-outlined text-white mx-1 text-4xl">
                                trending_up
                            </span>
                        </div>
                        <div class="">
                            <div class="flex align-items-center justify-content-center">
                                <p class="textColor font-bold text-xl my-2" style="color: #04CB00;">ج.م {{ totalRevenue.toFixed(2) }}</p>
                                <span class="material-symbols-outlined mx-1 text-4xl" style="color: #04CB00;">
                                    call_made
                                </span>
                            </div>
                        </div>
                    </div>
                    <div v-if="targetProfits.branch_id == 0" class="w-full px-4 py-1 flex justify-content-between" v-for="revenue in revenuesDetails[0]">
                        <h5 class="text-white">فرع {{ revenue.branchName }}</h5>
                        <h5 class="text-white">{{ revenue.total.toFixed(2) }} ج.م</h5>
                    </div>
                    <!-- {{ revenuesDetails }} -->
                    <div class="flex align-items-center justify-content-center">
                        <Button label="تفاصيل الايرادات" @click="push({path : '/revenues' , query : {branchId : targetProfits.branch_id} })" class="px-4 my-2 profitBg" />
                    </div>
                </div>
                <div class="bg-card borderRound p-3 m-auto w-6 mx-2">
                    <div style="background-color: #ff000028" class="flex my-3 p-3 borderRound lg:my-1 align-items-center mx-3 justify-content-center flex-column">
                        <div class="flex align-items-center my-2">
                            <h3 class="text-white">اجمالي المصروفات</h3>
                            <span class="material-symbols-outlined text-white mx-1 text-4xl">
                                trending_down
                            </span>
                        </div>
                        <div class="">
                            <div class="flex align-items-center justify-content-center">
                                <p class="textColor font-bold text-xl my-2" style="color: #FF0000;"> ج.م {{ totalExpenses.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") }}</p>
                                <span class="material-symbols-outlined mx-1 text-4xl" style="color: #FF0000;">
                                    call_received
                                </span>
                            </div>
                        </div>
                    </div>
                    <div v-if="targetProfits.branch_id == 0" class="w-full px-4 py-1 flex justify-content-between" v-for="expense in expensesDetails[0]">
                        <h5 class="text-white" v-if="expense.branchName">فرع {{ expense.branchName }}</h5>
                        <h5 class="text-white" v-if="expense.branchName">{{ parseFloat(expense.total).toFixed(2) }} ج.م</h5>
                        <h5 class="text-white" v-if="expense.totalSalaries">المرتبات</h5>
                        <!-- {{ expense }} -->
                        <h5 class="text-white" v-if="expense.totalSalaries">{{ parseFloat(expense.totalSalaries).toFixed(2) }} ج.م</h5>
                    </div>
                    <div class="flex align-items-center justify-content-center">
                        <Button label="تفاصيل المصروفات" @click="push({path : '/expenses' , query : {branchId : targetProfits.branch_id} })" class="px-4 my-2 lossBg" />
                    </div>
                </div>
            </div>
            <div v-if="totalRevenue - totalExpenses > 0" class="my-5">
                <div class="flex m-auto align-items-center justify-content-center">
                    <h2 class="textColor text-center">اجمالي الأرباح</h2>
                    <span class="mx-2 text-6xl material-symbols-outlined textColor">
                        moving
                    </span>
                </div>
                <h3 class="textColor text-center my-3" style="color: #04CB00;">ج.م {{ (totalRevenue - totalExpenses).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") }}</h3>
            </div>
            <div v-else class="my-5">
                <div class="flex m-auto align-items-center justify-content-center">
                    <h2 class="textColor text-center">اجمالي الخسارة</h2>
                    <span class="mx-2 text-6xl material-symbols-outlined textColor">
                        trending_down
                    </span>
                </div>
                <h2 class="textColor text-center my-3" style="color: #ff0000da;">ج.م {{ (totalExpenses - totalRevenue).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") }}</h2>
            </div>

            <div class="bg-card p-3 borderRound">
                <Chart type="bar" :data="chartData" :options="chartOptions" />
            </div>
        </div>
    </div>
</template>
<style>
.profitBg{
    background-color: rgba(3, 203, 0, 0.41);
    box-shadow: 0px 0px 8px rgba(0, 0, 0, 0.437);
}
.lossBg{
    background-color: #ff000064;
    box-shadow: 0px 0px 8px rgba(0, 0, 0, 0.437);
}
.bg-card{
    background-color: rgba(255, 255, 255, 0.029);
}
.primaryColor{
    color: #9b9bad;
}
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
