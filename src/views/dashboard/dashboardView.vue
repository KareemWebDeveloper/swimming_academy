<script setup lang="ts">
import axios from 'axios';
import Button from 'primevue/button';
import Breadcrumb from 'primevue/breadcrumb';
import Chart from 'primevue/chart';
import InputText from 'primevue/inputtext';
import { useRouter } from 'vue-router';
const { push , currentRoute } = useRouter();
import { ref, onMounted, onBeforeMount } from 'vue';
import { FilterMatchMode, FilterOperator } from 'primevue/api';
import { adminAuthorize } from '@/global-functions/checkUserRole';
import { employeeAuthorize } from '@/global-functions/isEmployeeAuthorized';
import ConfirmPopup from 'primevue/confirmpopup';
import { useConfirm } from "primevue/useconfirm";
import Dialog from 'primevue/dialog';

const confirm = useConfirm();

const isFetched : any = ref(false);
const isTargetBranchReportLoading : any = ref(false);
const isBranchesFetched : any = ref(false);
const totalRevenue : any = ref(0);
const totalExpenses : any = ref(0);
const chooseTargetBranch : any = ref(true);
const targetProfits = ref()
const ReportName = ref()
const Revenues : any = ref([])
const TotalRevenue : any = ref(0)
const chartData = ref();
const chartOptions = ref();
const doughnutChartData = ref();
const empPermissions = ref()

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
    timeZone: 'Africa/Cairo',
    locale: 'ar'
    };
const dateTimeFormatter = new Intl.DateTimeFormat('ar', options);
const branches : any = ref([{label : 'كل الفروع' , value : 0}])
const insights : any = ref()
const isProfitsFetched = ref(false)
const isInsightsFetched = ref(false)

const getAnnualProfits = () => {
    axios.get('http://127.0.0.1:8000/api/annualProfitsChart').then((result) => {
        console.log(Object.keys(result.data.annualProfits));
        console.log(Object.values(result.data.annualProfits));
        let revenues : any = []
        let expenses : any = []
         Object.values(result.data.annualProfits).forEach((revenue : any) => {
            revenues.push(revenue.revenue)
        });
         Object.values(result.data.annualProfits).forEach((expense : any) => {
            expenses.push(expense.expense)
        });
        const documentStyle = getComputedStyle(document.documentElement);
        chartData.value = {
            labels : Object.keys(result.data.annualProfits),
            datasets: [
            {
                label: 'الإيرادات',
                data: revenues,
                fill: false,
                borderColor: documentStyle.getPropertyValue('--blue-500'),
                tension: 0.4
            },
            {
                label: 'المصروفات',
                data: expenses,
                fill: false,
                borderColor: documentStyle.getPropertyValue('--pink-500'),
                tension: 0.4
            }
        ]
        }
        isProfitsFetched.value = true
    }).catch((err) => {
        console.log(err);
    });
}
const getInsights = () => {
    axios.get('http://127.0.0.1:8000/api/insights').then((result) => {
        console.log(result.data);
        insights.value = result.data
        const documentStyle = getComputedStyle(document.body);
        doughnutChartData.value = {
        labels: ['الأعضاء', 'الأعضاء النشطة'],
        datasets: [
            {
                data: [insights.value.customersCount, insights.value.activeCustomers],
                backgroundColor: [documentStyle.getPropertyValue('--blue-500') , documentStyle.getPropertyValue('--green-600')],
                hoverBackgroundColor: [documentStyle.getPropertyValue('--blue-400'), documentStyle.getPropertyValue('--green-400')]
            }
        ]
    };
    isInsightsFetched.value = true
    }).catch((err) => {
        console.log(err);
    });
}

const dt = ref();

onBeforeMount(() => {
    adminAuthorize().then((isAuthorized) => {
        if(isAuthorized == false){
            employeeAuthorize().then((employee) => {
                if(employee == false){
                    localStorage.removeItem('SwimmingToken')
                    location.reload()
                    push({path : '/login', query : currentRoute.value.query})
                }
                console.log(employee);
                empPermissions.value = employee.permissions
                getAnnualProfits()
                getInsights()
            })
        }  
        else{
            getAnnualProfits()
            getInsights()
        }
    })
})

const exportCSV = () => {
    dt.value.exportCSV();
};

</script>

<template>
    <div v-if="isProfitsFetched && isInsightsFetched" class="w-12 md:w-10 my-5 m-auto p-2 md:p-5 branchesList" style="direction: rtl;">
        <h2 class="text-center text-white my-3">لوحة التحكم</h2>
        <ConfirmPopup></ConfirmPopup>
        <div class="bg-card m-auto w-10 p-3 borderRound">
            <Chart type="line" :data="chartData" :options="chartOptions" class="h-full " />
        </div>
        <div class="flex flex-wrap my-5 justify-content-center">
            <div class="flex boxShadowRight w-20rem my-5 p-3 bg-card borderRound align-items-center mx-3 justify-content-center flex-column">
                <div class="flex align-items-center my-2">
                    <h3 class=" primaryColor">عدد الأعضاء</h3>
                    <span class="material-symbols-outlined primaryColor  mx-1 text-4xl">
                        group
                    </span>
                </div>
                <div class="">
                    <div class="flex align-items-center justify-content-center">
                        <p class="textColor font-bold text-xl my-2">{{ insights.customersCount }} أعضاء</p>
                    </div>
                </div>
            </div>
            <div class="flex shadowBottom w-20rem my-5 p-3 bg-card borderRound align-items-center mx-3 justify-content-center flex-column">
                <div class="flex align-items-center my-2">
                    <h3 class=" primaryColor">الاشتراكات النشطة</h3>
                    <span class="material-symbols-outlined primaryColor  mx-1 text-4xl">
                        group
                    </span>
                </div>
                <div class="">
                    <div class="flex align-items-center justify-content-center">
                        <p class="textColor font-bold text-xl my-2">{{ insights.activeSubscriptions }} اشتراكات</p>
                    </div>
                </div>
            </div>
            <div class="flex boxShadowLeft w-20rem my-5 p-3 bg-card borderRound align-items-center mx-3 justify-content-center flex-column">
                <div class="flex align-items-center my-2">
                    <h3 class=" primaryColor">الاشتراكات المجمدة</h3>
                    <span class="material-symbols-outlined primaryColor  mx-1 text-4xl">
                        group
                    </span>
                </div>
                <div class="">
                    <div class="flex align-items-center justify-content-center">
                        <p class="textColor font-bold text-xl my-2">{{ insights.frozenSubscriptions }} اشتراكات</p>
                    </div>
                </div>
            </div>
            <div class="flex boxShadowRight w-20rem my-5 p-3 bg-card borderRound align-items-center mx-3 justify-content-center flex-column">
                <div class="flex align-items-center my-2">
                    <h3 class=" primaryColor">المديونيات</h3>
                    <span class="material-symbols-outlined primaryColor  mx-1 text-4xl">
                        group
                    </span>
                </div>
                <div class="">
                    <div class="flex align-items-center justify-content-center">
                        <p class="textColor font-bold text-xl my-2">{{ insights.unpaidInstallments }} اقساط</p>
                    </div>
                </div>
            </div>
            <div class="flex shadowBottom w-20rem my-5 p-3 bg-card borderRound align-items-center mx-3 justify-content-center flex-column">
                <div class="flex align-items-center my-2">
                    <h3 class=" primaryColor">عدد المدربين</h3>
                    <span class="material-symbols-outlined primaryColor  mx-1 text-4xl">
                        group
                    </span>
                </div>
                <div class="">
                    <div class="flex align-items-center justify-content-center">
                        <p class="textColor font-bold text-xl my-2">{{ insights.activeSubscriptions }} مدربين</p>
                    </div>
                </div>
            </div>
            <div class="flex boxShadowLeft w-20rem my-5 p-3 bg-card borderRound align-items-center mx-3 justify-content-center flex-column">
                <div class="flex align-items-center my-2">
                    <h3 class=" primaryColor">عدد الموظفين</h3>
                    <span class="material-symbols-outlined primaryColor  mx-1 text-4xl">
                        group
                    </span>
                </div>
                <div class="">
                    <div class="flex align-items-center justify-content-center">
                        <p class="textColor font-bold text-xl my-2">{{ insights.employeesCount }} موظفين</p>
                    </div>
                </div>
            </div>
        </div>
        <div class="bg-card flex justify-content-center m-auto w-10 p-3 borderRound">
            <Chart type="doughnut" :data="doughnutChartData" :options="chartData" class="h-30rem w-7 m-auto flex justify-content-center" />
        </div>
    </div>
</template>
<style>
.profitBg{
    background-color: rgba(3, 203, 0, 0.41);
    box-shadow: 0px 0px 8px rgba(0, 0, 0, 0.437);
}
.boxShadowRight{
    box-shadow: rgba(240, 46, 170, 0.4) 5px 5px, rgba(240, 46, 170, 0.3) 10px 10px, rgba(240, 46, 170, 0.2) 15px 15px, rgba(240, 46, 170, 0.1) 20px 20px, rgba(240, 46, 170, 0.05) 25px 25px;
}
.shadowBottom{
    box-shadow: rgba(240, 46, 170, 0.4) 0px 5px, rgba(240, 46, 170, 0.3) 0px 10px, rgba(240, 46, 170, 0.2) 0px 15px, rgba(240, 46, 170, 0.1) 0px 20px, rgba(240, 46, 170, 0.05) 0px 25px;
}
.boxShadowLeft{
    box-shadow: rgba(240, 46, 170, 0.4) -5px 5px, rgba(240, 46, 170, 0.3) -10px 10px, rgba(240, 46, 170, 0.2) -15px 15px, rgba(240, 46, 170, 0.1) -20px 20px, rgba(240, 46, 170, 0.05) -25px 25px;
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
.p-column-filter-overlay-menu .p-column-filter-operator {
    display: none;
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
