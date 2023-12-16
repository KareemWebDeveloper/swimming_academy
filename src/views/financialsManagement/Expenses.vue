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
const isDialogVisible : any = ref(false);
const isUpdateExpense : any = ref(false);
const isErrorReturned : any = ref(false);
const dbError : any = ref(false);
const savedSuccessfully : any = ref(false);
const updateLoading : any = ref(false);
const activeExpense : any = ref();
const selectedCategories : any = ref([]);
const deletedSuccessfully = ref(false)
const expenseLoading = ref(false)
const targetRevenue = ref()
const ReportName = ref()
const Expenses : any = ref([])
const TotalExpenses : any = ref(0)
const activeBranch : any = ref()

// breadCrumbs
const breadCrumbs : any = ref([]);
breadCrumbs.value = [
    {label: 'تقرير المصروفات' , route: '/expenses', to:'/expenses'},
    // {label: 'عرض الأنواع' , route: '/categories', to:'/categories' },
]; 
const home = ref({
    icon: 'pi pi-home',
    to: '/',
},
);

const confirmDeletion = (event : any , expenseId : number) => {
    confirm.require({
        target: event.currentTarget,
        message: 'هل متأكد أنك تريد حذف هذا المصروف بشكل نهائي ؟',
        icon: 'pi pi-exclamation-triangle',
        acceptLabel : 'نعم',
        rejectLabel : 'لا',
        accept: () => {
            deleteExpense(expenseId)
        },  
        reject: () => {
        }
    });
};

const categories = ref()
const filters = ref(
    {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        description: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
        type: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
        cost: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
        created_at: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.DATE_AFTER } , { value: null, matchMode: FilterMatchMode.DATE_BEFORE }] },
        branch: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
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

const getExpenses = (branchId : number) => {
    axios.get(`https://akademia.website/api/expenses/${branchId}`).then((result) => {
        Expenses.value = []
        let today = new Date()
        result.data.expenses.forEach((expense : any ) => {
            Expenses.value.push({
                id : expense.id,
                description : expense.expense_name,
                cost : expense.expense_cost,
                type : expense.expense_type == 'constant' ? 'مصروفات ثابتة' : 'مصروفات متغيرة',
                automatic_payment_date : expense.automatic_payment_date ? `يوم ${expense.automatic_payment_date} من كل شهر` : 'لا يوجد',
                created_at : expense.automatic_payment_date ? new Date(today.setDate(expense.automatic_payment_date)) : new Date(expense.created_at) ,
                branch : expense.branch.branch_name,
            })
        });
        if(result.data.salaries){
            result.data.salaries.forEach((salary : any ) => {
                Expenses.value.push({
                    id : salary.id,
                    description : salary.coach_id ? `دفع مرتب كابتن / ${salary.coach.name}` : `دفع مرتب موظف / ${salary.employee.name}`,
                    cost : salary.amount,
                    type : 'دفع مرتبات',
                    automatic_payment_date : 'لا يوجد',
                    created_at : new Date(salary.paid_date) ,
                    branch : salary.branch? salary.branch.branch_name : 'مجموع الفروع',
                })
            });
        }
        calculateTotalExpenses()
        isTargetBranchReportLoading.value = false
        chooseTargetBranch.value = false
        isFetched.value = true
        console.log(Expenses.value);
    }).catch((err) => {
        console.log(err);
    });
}

const branchNames : any = []
const branches : any = ref([{label : 'كل الفروع' , value : 0}])
const branchesOptions : any = ref([])
const academies : any = ref([])

const getBranches = () => {
    axios.get('https://akademia.website/api/branches').then((result) => {
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
const deleteExpense = (expenseId : number) => {
    axios.delete(`https://akademia.website/api/deleteExpense/${expenseId}`).then((result) => {
        console.log(result.data);
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        deletedSuccessfully.value = true
        setTimeout(() => {
            deletedSuccessfully.value = false
        }, 5000);
        getExpenses(activeBranch.value);
    }).catch((err) => {
        console.log(err);
    });
}
const expenseCreateUpdate = (req : any) => {
    expenseLoading.value = true
    if(isUpdateExpense.value){
        axios.put(`https://akademia.website/api/updateExpense/${req.id}` , req).then((result) => {
            console.log(result.data);
            getExpenses(activeBranch.value)
            savedSuccessfully.value = true
            setTimeout(() => {
                isDialogVisible.value = false
            }, 1000);
            isUpdateExpense.value = false
            expenseLoading.value = false
        }).catch((err) => {
            console.log(err);
            expenseLoading.value = false
        });
    }
    else{
        axios.post('https://akademia.website/api/createExpense' , req).then((result) => {
            console.log(result.data);
            getExpenses(activeBranch.value)
            savedSuccessfully.value = true
            setTimeout(() => {
                isDialogVisible.value = false
            }, 1000);
            expenseLoading.value = false
        }).catch((err) => {
            console.log(err);
        });
    }
}

const updateExpenseRow = (expense : any) => {
    axios.get(`https://akademia.website/api/expense/${expense.id}`).then((result) => {
        activeExpense.value = result.data.expense
        isDialogVisible.value = true
        isUpdateExpense.value = true
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
const submitTargetExpenses = (req : any) => {
    isTargetBranchReportLoading.value = true
    activeBranch.value = req.branch_id
    getExpenses(req.branch_id)
    if(req.branch_id == 0){
        ReportName.value = 'تقرير مصروفات كل الفروع'
    }
    else{
        let branchName = branchNames.filter((branch : any) => branch.value == req.branch_id)
        branchName = branchName[0].label
        ReportName.value = `تقرير مصروفات فرع ${branchName}`
    }
}
const dt = ref();

const calculateTotalExpenses = () => {
    let tmp = Expenses.value
    let hasNoFilters = true
    let totalExp = 0
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
        Expenses.value.forEach((expense : any) => {
            totalExp += parseFloat(expense.cost as string)
        });
        TotalExpenses.value = totalExp
    }
    else{
        tmp.forEach((expense : any) => {
            totalExp += parseFloat(expense.cost as string)
        });
        TotalExpenses.value = totalExp
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
                    push({path : '/login', query : currentRoute.value.query})
                }
                empPermissions.value = employee.permissions
                UserType.value = 'employee'
                if(!isEmpAuthorizedFor(empPermissions.value , 'الحسابات المالية' , UserType.value)){
                    localStorage.removeItem('SwimmingToken')
                    location.reload()
                    push({path : '/login', query : currentRoute.value.query})
                }
                if(currentRoute.value.query.branchId){
                    let branchId = {
                        branch_id : currentRoute.value.query.branchId
                    }
                    chooseTargetBranch.value = false
                    submitTargetExpenses(branchId)
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
                submitTargetExpenses(branchId)
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
    <!-- Update Dialog  -->
    <Dialog v-model:visible="isDialogVisible" ref="expenseDialog" class="expensesDialog" maximizable modal header="تسجيل مصروفات" :style="{ width: '65vw' }" :breakpoints="{ '960px': '75vw', '641px': '100vw' }">
        <FormKit v-model="activeExpense" type="form" :actions="false" @submit="expenseCreateUpdate">
        <!-- <successMsg v-if="savedSuccessfully" class="fadeinright animation-duration-500 animation-iteration-1 my-4">تم الحفظ بنجاح</successMsg> -->
        <h5 v-if="isErrorReturned" class="px-3 py-2 textColor text-center borderRound error">{{ dbError }}</h5>
            <div class="mt-3">
                <div class="flex align-items-center">
                    <label for="expense_name" class="px-3 py-1 text-white text-sm">وصف المصروف</label>
                </div>
                <FormKit prefix-icon="text" id="expense_name" type="text" label="المصروف" placeholder="يرجي ادخال وصف للمصروف الذي تريد انشاؤه" name="expense_name" validation="required|length:3" />
            </div>
            <div class="mt-3">
                <div class="flex align-items-center">
                    <label for="expense_cost" class="px-3 py-1 text-white text-sm">تكلفة المصروف</label>
                </div>
                <FormKit prefix-icon="dollar" id="expense_cost" type="number" number="float" label="تكلفة المصروف" placeholder="يرجي ادخال تكلفة المصروف" name="expense_cost" validation="required|min:0" />
            </div>
            <div class="mt-3">
                <div class="flex align-items-center">
                    <label for="expense_type" class="px-3 py-1 text-white text-sm">نوع المصروف</label>
                </div>
                <FormKit id="expense_type" type="dropdown" label="نوع المصروف" :options="[{label : 'ثابتة', value: 'constant'} , {label : 'متغيرة', value: 'variable'}]"
                 placeholder="أختر نوع المصروف" name="expense_type" validation="required" />
            </div>
            <div class="mt-3 fadein animation-duration-1000 animation-iteration-1" v-if="activeExpense.expense_type == 'constant'">
                <div class="flex align-items-center">
                    <label for="automatic_payment_date" class="px-3 py-1 text-white text-sm">موعد الدفع التلقائي</label>
                </div>
                <div class="automaticPaymentDate">
                    <FormKit prefix-icon="number" type="number" number="integer" name="automatic_payment_date" outer-class="col-12" label="موعد الدفع التلقائي" id="automatic_payment_date"
                    :value="new Date().getDate()"  placeholder="أدخل موعد الدفع التلقائي" validation-label="موعد الدفع التلقائي" validation="required|max:28" />
                </div>
                <p class="text-white text-center mb-3" style="font-size: 12px;">اختر اليوم الذي تريد أن يتم فيه دفع المصروف تلقائياً في كل شهر</p>
            </div>
            <div class="mt-3">
                <div class="flex align-items-center">
                    <label for="branch" class="px-3 py-1 text-white text-sm">الفرع</label>
                </div>
                <FormKit type="dropdown" id="branch" validation="required" :value="activeBranch == 0 ? null : activeBranch" name="branch_id"
                 label="الفرع" placeholder="اختر الفرع الذي سيتم تسجيل المصروف فيه" :options="branchesOptions" />
            </div>
            <Button type="submit" class="submitBtn" label="تسجيل" :loading="expenseLoading" />
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

        <!-- Choose Target Branch and Academy -->
    <div v-if="!isBranchesFetched && !currentRoute.query.branchId" class=" flex justify-content-center my-5 mx-auto">
        <i class="pi pi-spin pi-spinner text-white" style="font-size: 2rem"></i>
    </div>
    <div v-if="chooseTargetBranch && isBranchesFetched">
        <h2 class="text-center my-5 text-white">انشاء تقرير المصروفات</h2>
        <FormKit v-model="targetRevenue" type="form" :actions="false" @submit="submitTargetExpenses">
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
        <successMsg v-if="deletedSuccessfully" class="fadeinright animation-duration-500 animation-iteration-1 my-4">تم الحذف بنجاح</successMsg>
            <h2 class="text-center my-3 text-white">تقرير المصروفات</h2>
            <DataTable v-model:filters="filters" ref="dt" :export-filename="ReportName" stripedRows :value="Expenses"
             filterDisplay="menu" paginator :rows="10" :loading="!isFetched" :rowsPerPageOptions="[10, 20, 50 , 100]"
             dataKey="id" removableSort :globalFilterFields="['branch' , 'type' , 'description' , 'cost']" tableStyle="min-width: 50rem">
            <template #header>
                <div class="flex flex-column lg:flex-row justify-content-between align-items-center">
                    <Button type="button" class="mb-2 lg:mb-0 mx-2" @click="isDialogVisible = true;" label="تسجيل مصروفات" />
                    <div class="flex align-content-center justify-content-center">
                        <div v-for="(filter,index) in filters.created_at.constraints" class="flex">
                            <!-- {{ filter }} -->
                            <p v-if="filter.value && filter.matchMode=='dateIsNot'" class="mx-2">المصروفات ما عدا {{ new Date(filter.value).toLocaleDateString() }}</p>
                            <p v-if="filter.value && filter.matchMode=='dateIs'" class="mx-2">المصروفات في {{ new Date(filter.value).toLocaleDateString() }}</p>
                            <p v-if="filter.value && filter.matchMode=='dateAfter'" class="mx-2">المصروفات بعد {{ new Date(filter.value).toLocaleDateString() }}</p>
                            <p v-if="filter.value && filter.matchMode=='dateBefore'" class="mx-2">المصروفات قبل {{ new Date(filter.value).toLocaleDateString() }}</p>
                            <p class="mx-2" v-if="filters.created_at.constraints[index +1] && filters.created_at.constraints[index +1].value"> مع </p>
                        </div>
                    </div>
                    <span class="p-input-icon-left">
                        <i class="pi pi-search" />
                        <InputText v-model="filters['global'].value" placeholder="بحث شامل" />
                    </span>
                </div>
            </template>
            <Column field="description" header="الوصف" style="width: 18%;">
            </Column>
            <div class="noDropDownFilterOptions">
                <Column field="type" header="النوع" style="width: 17%;">
                    <template #filter="{ filterModel, filterCallback }">
                        <Dropdown v-model="filterModel.value" @change="filterCallback()" :options="['مصروفات ثابتة' , 'مصروفات متغيرة' , 'دفع مرتبات']" placeholder="اختر طريقة دفع" class="p-column-filter noDropDownFilterOptions" style="min-width: 12rem" :showClear="true">
                        </Dropdown>
                    </template>
                    <template #filterapply="{ filterCallback }">
                        <Button type="button" @click="filterCallback(); calculateTotalExpenses()" class="mb-3 lg:mb-0 mx-2" label="تفعيل" />
                    </template>
                    <template #filterclear="{ filterCallback }">
                        <Button type="button" @click="filterCallback(); calculateTotalExpenses()" class="mb-3 lg:mb-0 mx-2" label="الغاء" outlined />
                    </template>
                </Column>
            </div>
            <Column field="created_at" filterField="created_at" dataType="date" sortable  header="تاريخ التسجيل" style="width: 22%;">
                <template #body="slotProps" >
                    <p>{{ dateTimeFormatter.format(new Date(slotProps.data.created_at)) }}</p>
                </template>
                <template #filter="{ filterModel }">
                    <Calendar v-model="filterModel.value" dateFormat="mm/dd/yy" placeholder="أختر التاريخ " mask="99/99/9999" />
                </template>
                <template #filterapply="{ filterCallback }">
                    <Button type="button" @click="filterCallback(); calculateTotalExpenses()" class="mb-3 lg:mb-0 mx-2" label="تفعيل" />
                </template>
                <template #filterclear="{ filterCallback }">
                    <Button type="button" @click="filterCallback(); calculateTotalExpenses()" class="mb-3 lg:mb-0 mx-2" label="الغاء" outlined />
                </template>
            </Column>
            <Column field="cost" sortable header="التكلفة">
                <template #body="slotProps" >
                    <p>{{ slotProps.data.cost }} ج.م</p>
                </template>
            </Column>
            <Column field="automatic_payment_date" sortable  header="تاريخ الدفع التلقائي" style="width: 23%;">
            </Column>
            <Column field="branch"  header="الفرع" style="width: 13%;">
            </Column>
            <Column  header="تعديل">
                <template #body="slotProps">
                    <div v-if="slotProps.data.type !== 'دفع مرتبات'" class="flex align-items-center">
                        <span class="material-symbols-outlined cursor-pointer hoverIcon textColor text-3xl p-2 borderRound" 
                        @click="confirmDeletion($event , slotProps.data.id)">
                        delete_forever
                    </span>
                    <span @click="updateExpenseRow(slotProps.data)" class="material-symbols-outlined cursor-pointer hoverIcon mx-2 textColor text-3xl p-2 borderRound">
                        edit
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
                    <h4 class="textColor text-center mb-3">في المجموع هناك {{ Expenses ? Expenses.length : 0 }} مصادر مصروفات </h4>
                    <h3 class="text-center textColor">اجمالي المصروفات : <span style="background: rgba(0, 128, 0, 0.932);" class="p-1 px-3 borderRound">{{ TotalExpenses.toFixed(2) }} ج.م</span></h3>
                </div>
            </template>
            <!-- <template #footer> 
                <h4 class="text-center">جار حساب مجموع المصروفات </h4>
            </template> -->
            </DataTable>
    </div>
    </div>
</template>
<style>
.expensesDialog .p-dialog-content{
    background: var(--background);
}

.p-datepicker .p-datepicker-header {
    direction: ltr; /* it's responsible for making the datepicker filter ltr */
}
.automaticPaymentDate .formkit-panel-wrapper{
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
