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

const TotalRevenue : any = ref(0)
const chartData = ref();
const customerId = ref();
const chartOptions = ref();
const doughnutChartData = ref();
const empPermissions = ref()
const isDialogVisible = ref(false)
const isErrorReturned = ref(false)
const dbError = ref()
const isSubscriptionFetched = ref(false)
const isSubscriptionLoading = ref(false)
const customerDetails = ref()
const customerActiveSubscriptions = ref()

const router = useRouter();
const openNewTab = (routeName : string) => {
      const routeUrl = router.resolve({ name: routeName }).href;
      // Open the route URL in a new tab
      window.open(routeUrl, '_blank');
};

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

const getCustomerSubscriptions = () => {
    console.log(customerId.value);
    isSubscriptionFetched.value= false
    isSubscriptionLoading.value= true
    axios.get(`https://akademia.website/api/customerActiveSubscriptions/${customerId.value}`).then((result) => {
        console.log(result);
        isSubscriptionFetched.value= true
        isSubscriptionLoading.value= false
        customerDetails.value = result.data.customer
        customerActiveSubscriptions.value = result.data.activeSubscriptions
    }).catch((err) => {
        console.log(err);
        isErrorReturned.value = true
        isSubscriptionLoading.value= false
        dbError.value = 'كود المشترك غير موجود'
    });
    
}

const getAnnualProfits = () => {
    axios.get('https://akademia.website/api/annualProfitsChart').then((result) => {
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
    axios.get('https://akademia.website/api/insights').then((result) => {
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

    <Dialog v-model:visible="isDialogVisible" class="attendancesDialog" maximizable modal header="تفاصيل الاشتراك بالكود" :style="{ width: '65vw' }" :breakpoints="{ '960px': '75vw', '641px': '100vw' }">

        <!-- <FormKit v-model="coachSalaryInfo" type="form" :actions="false" @submit="payCoachSalary"> -->
            <!-- </FormKit> -->
        <h5 v-if="isErrorReturned" class="px-3 py-2 textColor text-center borderRound error">{{ dbError }}</h5>
            <div v-if="!isSubscriptionFetched" class="mt-3 w-8 m-auto flex justify-content-center flex-column">
                <div class="flex align-items-center">
                    <label for="customer_id" class="px-3 py-1 text-white text-sm">كود اللاعب</label>
                </div>
                <FormKit prefix-icon="number" v-model="customerId" id="customer_id" type="number" number="integer" label="كود اللاعب" placeholder="يرجي ادخال كود اللاعب" name="customer_id" validation="min:0" />
            </div>
            <div v-else>
                <div class="mt-3 w-12 py-2 borderRound m-auto flex justify-content-center flex-wrap" style="background: var(--background);">
                    <h5 class="text-white m-2 bgColor py-2 px-3 borderRound">اسم اللاعب : {{ customerDetails.customer_name }}</h5>
                    <h5 class="text-white m-2 bgColor py-2 px-3 borderRound">البريد الالكتروني : {{ customerDetails.customer_email }}</h5>
                    <h5 class="text-white m-2 bgColor py-2 px-3 borderRound">رقم الهاتف : {{ customerDetails.customer_phone }}</h5>
                </div>
                <div v-for="subscription in customerActiveSubscriptions" class="mt-3 w-12 py-2 borderRound m-auto" style="background: var(--background);">
                    <h4 :class="{'profitBg' : subscription.state == 'active' , 'lossBg' : subscription.state == 'inactive' , 'bgColor' : subscription.state == 'frozen'}" class="text-white text-center m-2 py-2 px-3 borderRound">{{ subscription.category_name }} / {{ subscription.branch.branch_name }} - {{ subscription.academy_name }} </h4>
                    <div class="flex justify-content-center flex-wrap">
                        <h5 class="text-white m-2 bgColor py-2 px-3 borderRound">اسم المدرب : كابتن / {{ subscription.coach.name }}</h5>
                        <h5 class="text-white m-2 bgColor py-2 px-3 borderRound">تاريخ الاشتراك : {{ subscription.subscription_date }}</h5>
                        <h5 class="text-white m-2 bgColor py-2 px-3 borderRound">تاريخ الانتهاء : {{ subscription.expiration_date }}</h5>
                        <h5 class="text-white m-2 bgColor py-2 px-3 borderRound">أيام التجميد المتاحة : {{ subscription.avail_freeze_days }} يوم</h5>
                        <h5 class="text-white m-2 bgColor py-2 px-3 borderRound">عدد الحصص المتبقية : {{ subscription.number_of_sessions }} حصص</h5>
                        <h5 class="text-white m-2 bgColor py-2 px-3 borderRound">طريقة الدفع : {{ subscription.subscription_type }}</h5>
                        <h5 v-if="subscription.is_private" class="text-white m-2 bgColor py-2 px-3 borderRound">برايفت</h5>
                        <h5 v-if="!subscription.invitations || subscription.invitations == 0" class="text-white m-2 bgColor py-2 px-3 borderRound">الدعوات : 0</h5>
                        <h5 v-else class="text-white m-2 bgColor py-2 px-3 borderRound">الدعوات : {{ subscription.invitations }}</h5>
                    </div>
                    <div class="mx-auto flex justify-content-center my-2">
                        <Button label="تعديل الاشتراك" class="py-2 px-3" @click="push(`/customer/${subscription.id}`)"  />
                    </div>
                </div>
            </div>
        <template #footer>
            <Button v-if="!isSubscriptionFetched" type="submit" class="px-3 py-2" label="التالي" @click="getCustomerSubscriptions" :loading="isSubscriptionLoading" />
            <Button v-else type="submit" class="px-3 py-2" label="رجوع" @click="isSubscriptionFetched = !isSubscriptionFetched" />
        </template>
    </Dialog>
    <div v-if="isProfitsFetched && isInsightsFetched" class="w-12 md:w-10 my-5 m-auto p-2 md:p-5 branchesList" style="direction: rtl;">
        <h2 class="text-center text-white my-3">لوحة التحكم</h2>
        <ConfirmPopup></ConfirmPopup>
        <div class="bg-card m-auto w-10 p-3 borderRound">
            <Chart type="line" :data="chartData" :options="chartOptions" class="h-full " />
        </div>

        <div class="flex justify-content-center my-5">
            <Button label="تسجيل اشتراك" class="py-3 px-4 mx-2" @click="openNewTab('customer_create')" />
            <Button label="تفاصيل الاشتراك بالكود" class="py-3 px-4 mx-2" @click="isDialogVisible = true" />
            <Button label="تسجيل حضور" class="py-3 px-4 mx-2" @click="openNewTab('attendance_list')" />
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
                    <h3 class=" primaryColor">عدد الأعضاء الذكور</h3>
                    <span class="material-symbols-outlined primaryColor  mx-1 text-4xl">
                        boy
                    </span>
                </div>
                <div class="">
                    <div class="flex align-items-center justify-content-center">
                        <p class="textColor font-bold text-xl my-2">{{ insights.maleCustomersCount }} أعضاء</p>
                    </div>
                </div>
            </div>
            <div class="flex boxShadowLeft w-20rem my-5 p-3 bg-card borderRound align-items-center mx-3 justify-content-center flex-column">
                <div class="flex align-items-center my-2">
                    <h3 class=" primaryColor">عدد الأعضاء الإناث</h3>
                    <span class="material-symbols-outlined primaryColor  mx-1 text-4xl">
                        girl
                    </span>
                </div>
                <div class="">
                    <div class="flex align-items-center justify-content-center">
                        <p class="textColor font-bold text-xl my-2">{{ insights.femaleCustomersCount }} أعضاء</p>
                    </div>
                </div>
            </div>
            <div class="flex boxShadowRight w-20rem my-5 p-3 bg-card borderRound align-items-center mx-3 justify-content-center flex-column">
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
            <div class="flex shadowBottom w-20rem my-5 p-3 bg-card borderRound align-items-center mx-3 justify-content-center flex-column">
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
            <div class="flex boxShadowLeft w-20rem my-5 p-3 bg-card borderRound align-items-center mx-3 justify-content-center flex-column">
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
            <div class="flex boxShadowRight w-20rem my-5 p-3 bg-card borderRound align-items-center mx-3 justify-content-center flex-column">
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
            <div class="flex shadowBottom w-20rem my-5 p-3 bg-card borderRound align-items-center mx-3 justify-content-center flex-column">
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
            <div class="flex boxShadowLeft w-20rem my-5 p-3 bg-card borderRound align-items-center mx-3 justify-content-center flex-column">
                <div class="flex align-items-center my-2">
                    <h3 class=" primaryColor">عدد الفروع</h3>
                    <span class="material-symbols-outlined primaryColor  mx-1 text-4xl">
                        home
                    </span>
                </div>
                <div class="">
                    <div class="flex align-items-center justify-content-center">
                        <p class="textColor font-bold text-xl my-2">{{ insights.branchesCount }} فروع</p>
                    </div>
                </div>
            </div>
            <div class="flex boxShadowLeft w-20rem my-5 p-3 bg-card borderRound align-items-center mx-3 justify-content-center flex-column">
                <div class="flex align-items-center my-2">
                    <h3 class=" primaryColor">عدد المنتجات</h3>
                    <span class="material-symbols-outlined primaryColor  mx-1 text-4xl">
                        database
                    </span>
                </div>
                <div class="">
                    <div class="flex align-items-center justify-content-center">
                        <p class="textColor font-bold text-xl my-2">{{ insights.productsCount }} منتجات</p>
                    </div>
                </div>
            </div>
        </div>
        <div class="bg-card flex justify-content-center m-auto w-10 p-3 borderRound">
            <Chart type="doughnut" :data="doughnutChartData" :options="chartData" class="md:h-30rem w-full md:w-7 m-auto flex justify-content-center" />
        </div>
    </div>
</template>
<style>
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
.formkit-placeholder {
    font-family: 'Lato', sans-serif;
    font-family: 'Lemonada', cursive;
    font-size: 12px !important;
}
.formkit-outer .formkit-icon {
    color: white;
    width: 3.2rem !important;
    background: var(--background) !important;
}
.formkit-outer .formkit-icon svg {
    max-width: 2em;
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
    font-size: 13px;
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
.formkit-wrapper{
    padding:  1vh;
    max-width: 100% !important;
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
.formkit-input::placeholder{
    color: rgba(0, 0, 0, 0.79);
}
.formkit-input:focus{
    outline: none;
    box-shadow: 0px 0px 7px rgba(0, 0, 0, 0.442);
}
.formkit-form{
    margin: 2vh auto;
    width: 100%;
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
