<script setup lang="ts">
import axios from 'axios';
import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Breadcrumb from 'primevue/breadcrumb';
import InputText from 'primevue/inputtext';
import { useRouter } from 'vue-router';
const { push } = useRouter();
import { ref, watch, onBeforeMount, type Ref } from 'vue';
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
const chooseTargetBranch : any = ref(true);
const isDialogVisible : any = ref(false);
const isErrorReturned : any = ref(false);
const dbError : any = ref(false);
const savedSuccessfully : any = ref(false);
const isDialogLoading : any = ref(false);
const activeCoachAttendances : any = ref();
const paidSuccessfully = ref(false)
const isPayingSalary = ref(false)
const ReportName = ref()
const ExpectedSalaries : any = ref([])
const TotalExpectedSalaries : any = ref(0)
const coachSalaryInfo : any = ref()
const activeCoachInfo : any = ref()

// breadCrumbs
const breadCrumbs : any = ref([]);
breadCrumbs.value = [
    {label: 'تقرير المرتبات' , route: '/salaries', to:'/salaries'},
]; 
const home = ref({
    icon: 'pi pi-home',
    to: '/',
},
);

const confirmPayment = (event : any , employeeId : number) => {
    confirm.require({
        target: event.currentTarget,
        message: 'هل متأكد أنك تريد صرف الراتب لهذا الموظف ؟',
        icon: 'pi pi-exclamation-triangle',
        acceptLabel : 'نعم',
        rejectLabel : 'لا',
        accept: () => {
            payEmployeeSalary(employeeId)
        },  
        reject: () => {
        }
    });
};

const filters = ref(
    {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        id: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
        name: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
        job: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
        last_paid_date: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.DATE_AFTER } , { value: null, matchMode: FilterMatchMode.DATE_BEFORE }] },
        expected_salary: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
        // id: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
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

const getCoachAttendances = (coachId : number) => {
    isDialogLoading.value = true
    axios.get(`http://127.0.0.1:8000/api/coach/attendances/${coachId}`).then((result) => {
        activeCoachAttendances.value = result.data.attendances
        isDialogVisible.value = true
        isDialogLoading.value = false
    }).catch((err) => {
        console.log(err);
    });
}

const getExpectedSalaries = () => {
    isFetched.value = false
    axios.get('http://127.0.0.1:8000/api/expectedSalaries').then((result) => {
        ExpectedSalaries.value = []
        result.data.coaches.forEach((coach : any ) => {
            ExpectedSalaries.value.push({
                id : coach.id,
                name : coach.name,
                job : 'مدرب',
                last_paid_date : coach.last_paid_date ? new Date(coach.last_paid_date) : 'لم يصرف له مرتب',
                hours_worked : coach.hours_worked,
                expected_salary : parseFloat(coach.salary_per_hour) * parseFloat(coach.hours_worked),
            })
        });
        result.data.employees.forEach((employee : any ) => {
            ExpectedSalaries.value.push({
                id : employee.id,
                name : employee.name,
                job : 'موظف',
                hours_worked : '-',
                last_paid_date : employee.last_paid_date ? new Date(employee.last_paid_date) : 'لم يصرف له مرتب',
                expected_salary : parseFloat(employee.salary),
            })
        });
        calculateTotalExpectedSalaries()
        isTargetBranchReportLoading.value = false
        chooseTargetBranch.value = false
        isFetched.value = true
        console.log(ExpectedSalaries.value);
    }).catch((err) => {
        isFetched.value = true
        console.log(err);
    });
}

const branchNames : any = []
const branches : any = ref([{label : 'كل الفروع' , value : 0}])
const branchesOptions : any = ref([])
const academies : any = ref([])

const getBranches = () => {
    axios.get('http://127.0.0.1:8000/api/branches').then((result) => {
        console.log(result.data);
        result.data.branches.forEach((branch : any) => {
            branches.value.push({label : branch.branch_name , value : branch.id})
            branchesOptions.value.push({label : branch.branch_name , value : branch.id})
            branchNames.push({label : branch.branch_name , value : branch.id})
        });
        isBranchesFetched.value = true
    }).catch((err) => {
        console.log(err);
    });
}
const payEmployeeSalary = (id : number) => {
        axios.post(`http://127.0.0.1:8000/api/payEmployeeSalary/${id}`).then((result) => {
            console.log(result.data);
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
            paidSuccessfully.value = true
            setTimeout(() => {
                paidSuccessfully.value = false
            }, 5000);
            getExpectedSalaries();
        }).catch((err) => {
            console.log(err);
        });
}

const payCoachSalary = (req : any) => {
        isPayingSalary.value = true
        axios.post(`http://127.0.0.1:8000/api/payCoachSalary/${activeCoachInfo.value.id}` , req).then((result) => {
            isPayingSalary.value = false
            console.log(result.data);
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
            isDialogVisible.value = false
            paidSuccessfully.value = true
            getExpectedSalaries();
            setTimeout(() => {
                paidSuccessfully.value = false
            }, 5000);
        }).catch((err) => {
            console.log(err);
            isPayingSalary.value = false
        });
}

const calculateFinalSalary = () => {
    console.log(coachSalaryInfo.value);
    if(coachSalaryInfo.value.discount){
        coachSalaryInfo.value.amount = parseFloat(activeCoachInfo.value.expected_salary) - parseFloat(coachSalaryInfo.value.discount)
    }
    if(coachSalaryInfo.value.bonus){
        coachSalaryInfo.value.amount = parseFloat(activeCoachInfo.value.expected_salary) + parseFloat(coachSalaryInfo.value.bonus)
    }
}

const dt = ref();

const calculateTotalExpectedSalaries = () => {
    let tmp = ExpectedSalaries.value
    let hasNoFilters = true
    let totalExp = 0
    console.log(tmp);
    
    filters.value.last_paid_date.constraints.forEach((filter : any) => {
        if(filter.value){
            hasNoFilters = false
            if(filter.matchMode == 'dateAfter'){
                if(tmp.length > 0){
                    tmp = tmp.filter((obj : any) => obj.last_paid_date > new Date(filter.value));
                }
            }
            if(filter.matchMode == 'dateBefore'){
                if(tmp.length > 0){
                tmp = tmp.filter((obj : any) => obj.last_paid_date < new Date(filter.value));
                }
            }
            if(filter.matchMode == 'dateIs'){
                if(tmp.length > 0){
                filter.value = new Date(filter.value)
                filter.value.setHours(0, 0, 0, 0);
                tmp = tmp.filter((obj : any) => {
                    console.log(obj);
                    console.log(obj.last_paid_date , 'from inside filter');
                
                    const objDate = new Date(obj.last_paid_date);
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
                    const objDate = new Date(obj.last_paid_date);
                    objDate.setHours(0, 0, 0, 0); // Set time to midnight
                    return objDate.getTime() !== filter.value.getTime();
                });
                }
            }
        }
    });
    if(hasNoFilters){
        ExpectedSalaries.value.forEach((expense : any) => {
            totalExp += parseFloat(expense.expected_salary as string)
        });
        TotalExpectedSalaries.value = totalExp
    }
    else{
        tmp.forEach((expense : any) => {
            totalExp += parseFloat(expense.cost as string)
        });
        TotalExpectedSalaries.value = totalExp
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
                    push({path : '/login'})
                }
                empPermissions.value = employee.permissions
                UserType.value = 'employee'
                if(!isEmpAuthorizedFor(empPermissions.value , 'الحسابات المالية' , UserType.value)){
                    localStorage.removeItem('SwimmingToken')
                    location.reload()
                    push({path : '/login'})
                }
                getBranches()
                getExpectedSalaries()
            })
        }
        else{
            getBranches()
            getExpectedSalaries()
        }
    })
})

const exportCSV = () => {
    dt.value.exportCSV();
};

</script>

<template>
    <!-- Coach Attendances Dialog  -->
    <Dialog v-model:visible="isDialogVisible" class="attendancesDialog" maximizable modal header="جدول حضور المدرب" :style="{ width: '65vw' }" :breakpoints="{ '960px': '75vw', '641px': '100vw' }">

        <DataTable v-model:filters="filters" ref="dt"  stripedRows :value="activeCoachAttendances" paginator :rows="10" 
        :rowsPerPageOptions="[10, 20, 50]" filterDisplay="menu"
         dataKey="id" removableSort :globalFilterFields="['id', 'category_name']" tableStyle="min-width: 50rem">
            <template #header>
                <div class="flex flex-column lg:flex-row justify-content-between align-items-center">
                    <h3 class="hidden md:my-2 lg:my-0 md:flex">كابتن / {{ activeCoachInfo.name }}</h3>
                    <span class="p-input-icon-left">
                        <i class="pi pi-search" />
                        <InputText v-model="filters['global'].value" placeholder="بحث شامل" />
                    </span>
                </div>
            </template>
            <Column field="branch.branch_name" sortable  header="الفرع"></Column>
            <Column field="training_start_time" sortable  header="موعد التمرين" style="width: 22%;">
                <template #body="slotProps" >
                    <p>{{ new Date(`2000-01-01 ${slotProps.data.training_start_time}`).toLocaleTimeString('en-US', { hour12: true }) }}</p>
                </template>
            </Column>
            <Column field="session_duration" sortable  header="مدة التمرين" style="width: 21%;">
                <template #body="slotProps" >
                    <p>{{ slotProps.data.session_duration }} ساعة</p>
                </template>
            </Column>
            <Column field="created_at" sortable header="التاريخ">
                <template #body="slotProps" >
                    <p>{{ new Date(slotProps.data.created_at).toLocaleDateString() }}</p>
                </template>
            </Column>
            <Column field="created_at" header="موعد الجضور">
                <template #body="slotProps" >
                    <p>{{ new Date(slotProps.data.created_at).toLocaleTimeString() }}</p>
                </template>
            </Column>
                
            <template #empty> <InlineMessage severity="info">لا يوجد حضرور للمدرب منذ أخر راتب صرف له</InlineMessage></template>
            <!-- <template #paginatorend>
                <Button type="button" icon="pi pi-download" @click="exportCSV($event)" text />
            </template> -->
        </DataTable>
        <FormKit v-model="coachSalaryInfo" type="form" :actions="false" @submit="payCoachSalary">
        <successMsg v-if="savedSuccessfully" class="fadeinright animation-duration-500 animation-iteration-1 my-4">تم الحفظ بنجاح</successMsg>
        <h5 v-if="isErrorReturned" class="px-3 py-2 textColor text-center borderRound error">{{ dbError }}</h5>
            <div class="mt-3">
                <div class="flex align-items-center">
                    <label for="discount" class="px-3 py-1 text-white text-sm">خصم ( اختياري )</label>
                </div>
                <FormKit prefix-icon="dollar" id="discount" type="number" number="float" label="الخصم" placeholder="يرجي ادخال مبلغ الخصم" name="discount" validation="min:0" />
            </div>
            <div class="mt-3">
                <div class="flex align-items-center">
                    <label for="bonus" class="px-3 py-1 text-white text-sm">البونص ( اختياري )</label>
                </div>
                <FormKit prefix-icon="dollar" id="bonus" type="number" number="float" label="البونص" placeholder="يرجي ادخال مبلغ المكافأة" name="bonus" validation="min:0" />
            </div>
            <Button type="button" class="mx-auto" label="احسب الراتب النهائي" @click="calculateFinalSalary" />
            <div class="mt-3">
                <div class="flex align-items-center">
                    <label for="amount" class="px-3 py-1 text-white text-sm">الراتب النهائي</label>
                </div>
                <FormKit prefix-icon="dollar" :value="activeCoachInfo.expected_salary" id="amount" type="number" number="float" label="الراتب" placeholder="يرجي ادخال الراتب النهائي للمدرب" name="amount" validation="required|min:0" />
            </div>
            <div class="mt-3">
                <div class="flex align-items-center">
                    <label for="notes" class="px-3 py-1 text-white text-sm">الملاحظات ( اختياري )</label>
                </div>
                <FormKit prefix-icon="tools" id="notes" type="textarea" label="الملاحظات" placeholder="يرجي ادخال ملاحظات ان وجدت" name="notes" validation="" />
            </div>

            <Button type="submit" class="submitBtn" label="دفع" :loading="isPayingSalary" />
        </FormKit>
        <template #footer>
        </template>
    </Dialog>

    <div class="w-12 md:w-10 my-5 m-auto p-2 md:p-5 branchesList" style="direction: rtl;">
        <!-- Breadcrumb -->
    <div class="w-full m-auto flex justify-content-center p-4 MargAutoMob padding-1-breadcrumbs" style="direction: ltr;">
        <Breadcrumb :home="home" :model="breadCrumbs" />
    </div>    
    <ConfirmPopup></ConfirmPopup>
        <!-- data Table -->
    <div>
        <successMsg v-if="paidSuccessfully" class="fadeinright animation-duration-500 animation-iteration-1 my-4">تم الصرف بنجاح</successMsg>
            <h2 class="text-center my-3 text-white">تقرير المرتبات</h2>
            <DataTable v-model:filters="filters" ref="dt" :export-filename="ReportName" stripedRows :value="ExpectedSalaries" :loading="!isFetched"
             filterDisplay="menu" paginator :rows="10" :rowsPerPageOptions="[10, 20, 50 , 100]"
             dataKey="id" removableSort :globalFilterFields="['name' , 'id' , 'job' , 'expected_salary']" tableStyle="min-width: 50rem">
            <template #header>
                <div class="flex flex-column lg:flex-row justify-content-between align-items-center">
                    <Button type="button" class="mb-2 lg:mb-0 mx-2" @click="push('/expenses')" label="المصروفات" />
                    <div class="flex align-content-center justify-content-center">
                        <div v-for="(filter,index) in filters.last_paid_date.constraints" class="flex">
                            <!-- {{ filter }} -->
                            <p v-if="filter.value && filter.matchMode=='dateIsNot'" class="mx-2">المرتبات ما عدا {{ new Date(filter.value).toLocaleDateString() }}</p>
                            <p v-if="filter.value && filter.matchMode=='dateIs'" class="mx-2">المرتبات في {{ new Date(filter.value).toLocaleDateString() }}</p>
                            <p v-if="filter.value && filter.matchMode=='dateAfter'" class="mx-2">المرتبات بعد {{ new Date(filter.value).toLocaleDateString() }}</p>
                            <p v-if="filter.value && filter.matchMode=='dateBefore'" class="mx-2">المرتبات قبل {{ new Date(filter.value).toLocaleDateString() }}</p>
                            <p class="mx-2" v-if="filters.last_paid_date.constraints[index +1] && filters.last_paid_date.constraints[index +1].value"> مع </p>
                        </div>
                    </div>
                    <span class="p-input-icon-left">
                        <i class="pi pi-search" />
                        <InputText v-model="filters['global'].value" placeholder="بحث شامل" />
                    </span>
                </div>
            </template>
            <Column field="id" sortable header="الكود">
            </Column>
            <Column field="name" sortable header="الاسم" style="width: 20%;">
                <template #body="slotProps" >
                    <p v-if="slotProps.data.job == 'مدرب'">كابتن / {{ slotProps.data.name }}</p>
                    <p v-else>{{ slotProps.data.name }}</p>
                </template>
            </Column>
                <Column field="job" header="الوظيفة" style="width: 17%;">
                    <template #filter="{ filterModel, filterCallback }">
                        <Dropdown v-model="filterModel.value" @change="filterCallback()" :options="['مدرب' , 'موظف']" placeholder="اختر الوظيفة" class="p-column-filter noDropDownFilterOptions" style="min-width: 12rem" :showClear="true">
                        </Dropdown>
                    </template>
                    <template #filterapply="{ filterCallback }">
                        <Button type="button" @click="filterCallback()" class="mb-3 lg:mb-0 mx-2" label="تفعيل" />
                    </template>
                    <template #filterclear="{ filterCallback }">
                        <Button type="button" @click="filterCallback()" class="mb-3 lg:mb-0 mx-2" label="الغاء" outlined />
                    </template>
                </Column>
            <Column field="last_paid_date" filterField="last_paid_date" dataType="date" sortable  header="تاريخ آخر قبض" style="width: 24%;">
                <template #body="slotProps" >
                    <p v-if="slotProps.data.last_paid_date == 'لم يصرف له مرتب'">{{ slotProps.data.last_paid_date }}</p>
                    <p v-else>{{ dateTimeFormatter.format(new Date(slotProps.data.last_paid_date)) }}</p>
                </template>
                <!-- <template #filter="{ filterModel }">
                    <Calendar v-model="filterModel.value" dateFormat="mm/dd/yy" placeholder="أختر التاريخ " mask="99/99/9999" />
                </template>
                <template #filterapply="{ filterCallback }">
                    <Button type="button" @click="filterCallback(); calculateTotalExpectedSalaries()" class="mb-3 lg:mb-0 mx-2" label="تفعيل" />
                </template>
                <template #filterclear="{ filterCallback }">
                    <Button type="button" @click="filterCallback(); calculateTotalExpectedSalaries()" class="mb-3 lg:mb-0 mx-2" label="الغاء" outlined />
                </template> -->
            </Column>
            <Column field="expected_salary" sortable header="المرتب">
                <template #body="slotProps" >
                    <p v-if="slotProps.data.job == 'مدرب'">{{ slotProps.data.expected_salary }} ج.م / {{ slotProps.data.hours_worked }} ساعات</p>
                    <p v-else>{{ slotProps.data.expected_salary }} ج.م</p>
                </template>
            </Column>
            <Column  header="صرف">
                <template #body="slotProps">
                    <div v-if="slotProps.data.job == 'موظف'" class="flex align-items-center">
                        <span class="material-symbols-outlined cursor-pointer hoverIcon textColor text-4xl p-2 borderRound" 
                        @click="confirmPayment($event , slotProps.data.id)">
                        finance_chip
                        </span>
                    </div>
                    <div v-if="slotProps.data.job == 'مدرب'" class="flex align-items-center">
                        <span v-if="!isDialogLoading" class="material-symbols-outlined cursor-pointer hoverIcon textColor text-4xl p-2 borderRound" 
                        @click="getCoachAttendances(slotProps.data.id); activeCoachInfo = slotProps.data">
                        finance_chip
                        </span>
                        <span v-else class="material-symbols-outlined cursor-pointer hoverIcon textColor text-4xl p-2 borderRound" 
                        >
                        <i class="pi pi-spin pi-spinner text-white" style="font-size: 2rem"></i>
                        </span>
                    </div>
                </template>
            </Column>
                
            <template #empty> <InlineMessage severity="info">غير موجود</InlineMessage></template>
            <template #paginatorend>
                <Button type="button" icon="pi pi-download" @click="exportCSV($event)" text />
            </template>
            <template #footer>
                <div class="py-2">
                    <h4 class="textColor text-center mb-3">في المجموع هناك {{ ExpectedSalaries ? ExpectedSalaries.length : 0 }} مرتبات </h4>
                    <h3 class="text-center textColor">اجمالي المرتبات : <span style="background: rgba(0, 128, 0, 0.932);" class="p-1 px-3 borderRound">{{ TotalExpectedSalaries.toFixed(2) }} ج.م</span></h3>
                </div>
            </template>
            </DataTable>
    </div>
    </div>
</template>
<style>
.attendancesDialog .p-dialog-content{
    background: var(--background);
}

.p-datepicker .p-datepicker-header {
    direction: ltr; /* it's responsible for making the datepicker filter ltr */
}
.automaticPaymentDate .formkit-panel-wrapper{
    direction: ltr; /* it's responsible for making the datepicker filter ltr */
}
.noDropDownFilterOptions .p-column-filter-overlay-menu .p-column-filter-operator{
    display: none !important;
}
.noDropDownFilterOptions .p-column-filter-overlay-menu .p-column-filter-constraint .p-column-filter-matchmode-dropdown{
    display: none !important;
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
