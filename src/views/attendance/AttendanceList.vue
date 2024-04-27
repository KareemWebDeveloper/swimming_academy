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

import { FormKit } from '@formkit/vue';
import SelectButton from 'primevue/selectbutton';
import { isEmpAuthorizedFor } from '@/global-functions/isEmployeeAuthorizedFor';

const confirm = useConfirm();

const isSubmitAttendanceDataLoading : any = ref(false);
const attendanceListView : any = ref(false);
const selectedCustomers : any = ref([]);
const selectedCoaches : any = ref([]);
const workingSchedule : any = ref([]);
const workingDays : any = ref([]);
const attendedSuccessfully = ref(false)
const isAttendingLoading = ref(false);
const missingSubscriptionError = ref(false)
const attendanceData : any = ref()
const activeCoaches : any = ref()
const activeCustomers : any = ref()
const isBranchesFetched : any = ref(false)
const branches : any = ref([])
const currentTime : any = ref()
const activeBranch : any = ref()
const training_start_time : any = ref()
const session_duration : any = ref()
const categories : any = ref([])
const isCategoriesFetched = ref(false)
const optionValue : any = ref('customers')
const isCoachAttendancesDialogVisible = ref(false)
const isDialogLoading = ref(false)
const warningTargetCoach : any = ref()

// breadCrumbs
const breadCrumbs : any = ref([]);
breadCrumbs.value = [
    {label: 'تسجيل الحضور' , route: '/attendance', to:'/attendance'},
    // {label: 'عرض المنتجات' , route: '/attendance', to:'/attendance' },
]; 
const home = ref({
    icon: 'pi pi-home',
    to: '/',
},
);

function getCurrentTime() {
    const now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();

    // Check if the minutes are greater than or equal to 45
    if (minutes > 45) {
        // Increment hours and set minutes to 0
        hours = (hours + 1) % 24;
        minutes = 0;
    } else if (minutes > 30) {
        // Set minutes to 45
        minutes = 45;
    } else if (minutes > 15) {
        // Set minutes to 30
        minutes = 30;
    } else {
        // Set minutes to 15
        minutes = 15;
    }
    // Format hours and minutes
    const formattedHours = hours < 10 ? `0${hours}` : hours;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;

    // Return the formatted time
    currentTime.value = `${formattedHours}:${formattedMinutes}`;
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
const confirmSubmittingCoaches = (event : any , name : string , chosenCategory : any , todayAttendances : any , coach : any) => {
    if(!chosenCategory){
        confirm.require({
            target: event.currentTarget,
            message: 'من فضلك اختر نوع التمرين أولاً',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel : 'موافق',
            rejectLabel : ' ',
            accept: () => {
            },  
            reject: () => {
            }
        });
        return
    }
    confirm.require({
        target: event.currentTarget,
        message: `هل متأكد أنك تريد تحضير كابتن / ${name} ؟`,
        icon: 'pi pi-exclamation-triangle',
        acceptLabel : 'نعم',
        rejectLabel : 'لا',
        accept: () => {
            if(todayAttendances.length > 0){
                isDialogLoading.value = true
                isCoachAttendancesDialogVisible.value = true
                warningTargetCoach.value = coach
                setTimeout(() => {
                    isDialogLoading.value = false
                    console.log(isDialogLoading.value);
                }, 700);
            }
            else{
                attendCoaches()
            }
        },  
        reject: () => {
        }
    });
};
const filters = ref(
    {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        customer_name: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
        coach_name: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
        id: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
    }
);
const coachesFilters = ref(
    {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        name: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
        id: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
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
    timeZone: 'Asia/Dubai',
    locale: 'ar'
    };
const dateTimeFormatter = new Intl.DateTimeFormat('ar', options);

const attendCustomers = () => {
    isAttendingLoading.value = true
    let customersArrayRequest : any = []
     selectedCustomers.value.forEach((customer : any) => {
        customersArrayRequest.push({customer_id : customer.id , subscription_id : customer.subscription_id})
     });
    let attendeesReq = {
        branch_id : activeBranch.value,
        training_start_time : training_start_time.value,
        session_duration : session_duration.value,
        customers : customersArrayRequest,
    }
    axios.post('https://akademia.website/api/bulkAttendance', attendeesReq).then((result) => {
        console.log(result);
        attendedSuccessfully.value = true
        selectedCustomers.value = []
        getAttendees()
        isAttendingLoading.value = false
        setTimeout(() => {
            attendedSuccessfully.value = false
        }, 4500);
    }).catch((err) => {
        selectedCustomers.value = []
        console.log(err);
        isAttendingLoading.value = false
    });
}

const attendCoaches = () => {
    isAttendingLoading.value = true
    let CoachIds : any = []
    selectedCoaches.value.forEach((coach : any) => {
        CoachIds.push(coach.id)
    });
        let request = {
            branch_id : activeBranch.value,
            category_id : selectedCoaches.value[0].sessionCategory,
            training_start_time : training_start_time.value,
            session_duration : session_duration.value,
            coach_ids : CoachIds,
        }
        axios.post('https://akademia.website/api/bulkAttendance', request).then((result) => {
            console.log(result);
            attendedSuccessfully.value = true
            selectedCustomers.value = []
            getAttendees()
            isAttendingLoading.value = false
            isCoachAttendancesDialogVisible.value = false
            setTimeout(() => {
                attendedSuccessfully.value = false
            }, 4500);
        }).catch((err) => {
            selectedCustomers.value = []
            console.log(err);
            isAttendingLoading.value = false
        });
}

function areDatesEqual(lastAttendance : any) {
    
    const currentDate = new Date();
    const lastAttendanceDate = new Date(lastAttendance)  
    const year1 = lastAttendanceDate.getFullYear();
    const month1 = lastAttendanceDate.getMonth();
    const day1 = lastAttendanceDate.getDate();
    
  const year2 = currentDate.getFullYear();
  const month2 = currentDate.getMonth();
  const day2 = currentDate.getDate();
  
  return year1 === year2 && month1 === month2 && day1 === day2;
}

const submitAttendanceData = (req : any) => {
    isSubmitAttendanceDataLoading.value = true
    training_start_time.value = req.training_start_time
    activeBranch.value = req.branch_id
    session_duration.value = req.session_duration
    localStorage.setItem('last_attendance_branch' , req.branch_id)
    getAttendees()
}

const getAttendees = () => {
    axios.get(`https://akademia.website/api/coaches/active/${activeBranch.value}`).then((result : any) => {
        console.log(result.data.coaches);
        activeCoaches.value = result.data.coaches
        axios.get(`https://akademia.website/api/customers/active/${activeBranch.value}`).then((result : any) => {
            console.log(result.data.customers);
            activeCustomers.value = result.data.customers
            generateCustomerSubscriptionsOptions()
            isSubmitAttendanceDataLoading.value = false
            attendanceListView.value = true
        }).catch((err : any) => {
            console.log(err);
        });
    }).catch((err : any) => {
        console.log(err);
    });
}
const workingDaysOptions = (branchId : any) => {
    const options : any = {
        weekday: 'long',
        timeZone: 'Asia/Dubai',
        locale: 'ar'
    };
    const formatter = new Intl.DateTimeFormat('ar', options);
    const weekday = formatter.format(new Date())
    axios.get(`https://akademia.website/api/branch/workingDays/${branchId}`).then((result) => {
    workingSchedule.value = result.data.workingDays
    workingSchedule.value.forEach((element : any) => {
        console.log(typeof weekday);
        console.log(element.day.includes(weekDay));
    });
    const todaySchedules = workingSchedule.value.filter((day : any) => day.day == weekDay)
    console.log(todaySchedules);
})
}
const getBranches = () => {
    axios.get('https://akademia.website/api/branches').then((result) => {
        console.log(result.data);
        result.data.branches.forEach((branch : any) => {
            branches.value.push({label : branch.branch_name , value : branch.id})
        });
        if(localStorage.getItem('last_attendance_branch')){
            console.log(localStorage.getItem('last_attendance_branch'));
            activeBranch.value = parseInt(localStorage.getItem('last_attendance_branch') as string)
            attendanceData.branch_id = activeBranch.value
            workingDaysOptions(activeBranch.value)
        }
        isBranchesFetched.value = true
    }).catch((err) => {
        console.log(err);
    });
}
const getCategories = () => {
    axios.get('https://akademia.website/api/categories').then((result) => {
        console.log(result.data);
        result.data.categories.forEach((category : any) => {
            categories.value.push({label : category.category_name , value : category.id})
        });
        isCategoriesFetched.value = true
    }).catch((err) => {
        console.log(err);
    });
}
const generateCustomerSubscriptionsOptions = () => {
    let dividedCustomersSubscription : any = []
    activeCustomers.value.forEach((customer : any) => {
        customer.subscriptions.forEach((subscription : any) => {
            let category_name = null
            if(subscription.is_private){
                category_name = `${subscription.category_name} - برايفت`
            }
            if(subscription.is_semi_private){
                category_name = `${subscription.category_name} - سيمي برايفت`
            }
            else{
                category_name = subscription.category_name
            }
            let newCustomerRow = {
                id : customer.id,
                customer_name : customer.customer_name,
                last_attendance_date : customer.last_attendance_date,
                subscription_id : subscription.id,
                expiration_date : subscription.expiration_date,
                number_of_sessions : subscription.number_of_sessions,
                category_name : category_name,
                coach_name : subscription.coach.name,
            }
            dividedCustomersSubscription.push(newCustomerRow)
            // if(subscription.is_private){
            //     customer.subscriptionsOptions.push({label : `${subscription.category_name} - برايفت` , value : subscription.id})
            // }
            // else{
            //     customer.subscriptionsOptions.push({label : `${subscription.category_name} - ${subscription.academy_name}` , value : subscription.id})
            // }
        });
    });
    activeCustomers.value = dividedCustomersSubscription
    console.log(activeCustomers.value);
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
                if(!isEmpAuthorizedFor(empPermissions.value , 'تسجيل الحضور' , UserType.value)){
                    localStorage.removeItem('SwimmingToken')
                    push({path : '/login', query : {userType : 'employee'}})
                }
                getBranches()
                getCurrentTime()        
                getCategories()
            })
        }
        else{
            getBranches()
            getCurrentTime()        
            getCategories()
        }
    })
})
</script>

<template>
    {{ new Date() }}
    <Dialog v-model:visible="isCoachAttendancesDialogVisible" maximizable modal header="تحذير" :style="{ width: '60vw' }" :breakpoints="{ '960px': '75vw', '641px': '100vw' }">
        <loading v-if="isDialogLoading"></loading>
        <div v-else class="dialogTable">
            <div class="flex flex-column my-3">
                <span style="color: rgba(220, 18, 18, 0.759);" class="material-symbols-outlined text-center text-6xl">
                    warning
                </span>
                <h3 class="text-center"  style="color: rgba(220, 18, 18, 0.759);">هل أنت متأكد أنك تريد تحضير كابتن / {{ warningTargetCoach.name }} ؟</h3>
                <h5 class="text-center">مع العلم أنه قد قام بحضور هذا التمارين اليوم!</h5>
            </div>
            <DataTable stripedRows :value="warningTargetCoach.attendances" showGridlines
            paginator :rows="10" :rowsPerPageOptions="[10, 20, 50]" filterDisplay="menu"
             dataKey="id" removableSort :globalFilterFields="['duration', 'category_name']" tableStyle="min-width: 50rem">
            <template #header>
                <div class="flex flex-column lg:flex-row justify-content-between align-items-center">
                    <h3 style="color : black;">كابتن / {{ warningTargetCoach.name }}</h3>
                    <h3 style="color : black;">جدول حضور اليوم</h3>
                </div>
            </template>
            <Column field="branch.branch_name" sortable  header="الفرع"></Column>
            <Column field="category.category_name" sortable  header="نوع التمرين"></Column>
            <Column field="created_at" sortable  header="موعد الحضور">
                <template #body="slotProps">
                    <p>{{ new Date(slotProps.data.created_at).getMinutes().toString().padStart(2, '0') }} : {{ new Date(slotProps.data.created_at).getHours().toString().padStart(2, '0') }}</p> 
                </template>
            </Column>
            <template #footer> في المجموع هناك {{ warningTargetCoach.attendances ? warningTargetCoach.attendances.length : 0 }} مرات حضور اليوم </template>
            </DataTable>
        </div>

        <template #footer>
            <Button type="button" :loading="isAttendingLoading" class="mb-3 lg:mb-0 mx-2" @click="attendCoaches" label="تسجيل حضور" />
        </template>
    </Dialog>

    <div class="w-12 md:w-10 my-5 m-auto p-2 md:p-5 productsList" style="direction: rtl;">
            <!-- Breadcrumb -->
    <div class="w-full m-auto flex justify-content-center p-4 MargAutoMob padding-1-breadcrumbs" style="direction: ltr;">
        <Breadcrumb :home="home" :model="breadCrumbs" />
    </div>    

    <div v-if="isBranchesFetched && !attendanceListView">
        <FormKit v-model="attendanceData" type="form" :actions="false" @submit="submitAttendanceData">
            <div class="mt-3">
                <div class="flex align-items-center">
                    <label for="branch" class="px-3 py-1 text-white text-sm">الفرع</label>
                </div>
                <FormKit type="dropdown" @input="workingDaysOptions(attendanceData.branch_id)" :value="activeBranch" id="branch" validation="required" name="branch_id" label="الفرع" placeholder="اختر الفرع الذي تريد تسجيل الحضور فيه" :options="branches" />
            </div>
            <div class="mt-3">
                <div class="flex align-items-center">
                    <label for="start_time" class="px-3 py-1 text-white text-sm">موعد بدء التمرين</label>
                </div>
                <FormKit type="time" id="start_time" label="موعد بدء التمرين" outer-class="col-12" name="training_start_time" :value="currentTime" validation="required" />
            </div>
            <div class="mt-3">
                <div class="flex align-items-center">
                    <label for="duration" class="px-3 py-1 text-white text-sm">مدة التمرين ( بالساعة )</label>
                </div>
                <FormKit type="text" number="float" id="duration" label="مدة التمرين" :value="1" outer-class="col-12" placeholder="يرجي ادخال عدد ساعات التمرين" name="session_duration" validation="required" />
            </div>
            <Button type="submit" class="submitBtn" label="التالي" :loading="isSubmitAttendanceDataLoading" />
        </FormKit>
    </div>

    <ConfirmPopup></ConfirmPopup>
        <!-- data Table -->
        <div v-if="attendanceListView">
            <div class="flex justify-content-between my-5 pt-5 m-auto">
                <Button type="button" v-if="optionValue == 'customers'" label="تسجيل حضور المدربين" @click="optionValue = 'coaches'" />
                <Button type="button" v-if="optionValue == 'coaches'" label="تسجيل حضور المشتركين" @click="optionValue = 'customers'" />
                <div @click="attendanceListView = false" class="cursor-pointer flex align-items-center text-white">
                    <h4>الرجوع</h4>
                    <span class="material-symbols-outlined mx-2">
                        arrow_back
                    </span>
                </div>
            </div>
        <successMsg v-if="attendedSuccessfully" class="fadeinright animation-duration-500 animation-iteration-1 my-4">تم التسجيل بنجاح</successMsg>

        <!-- Customers Attendees Submitting -->
        <div v-if="optionValue == 'customers'">
            <h5 v-if="missingSubscriptionError" class="px-3 my-2 fadeinup animation-duration-500 animation-iteration-1 py-2 textColor text-center borderRound error">يرجي تحديد الاشتراكات أولاً</h5>
            <DataTable v-model:filters="filters" ref="dt"  stripedRows :value="activeCustomers"  v-model:selection="selectedCustomers"
             paginator :rows="10" :rowsPerPageOptions="[10, 20, 50]" filterDisplay="menu"
             dataKey="subscription_id" removableSort :globalFilterFields="['id', 'customer_name', 'coach_name']" tableStyle="min-width: 50rem">
            <template #header>
                <div class="flex flex-column lg:flex-row justify-content-between align-items-center">
                    <Button type="button" class="mb-3 lg:mb-0 mx-2" @click="attendCustomers" :loading="isAttendingLoading" :disabled="selectedCustomers.length == 0" label="تسجيل المحدد" />
                    <h3>تسجيل حضور اللاعبين</h3>
                    <span class="p-input-icon-left">
                        <i class="pi pi-search" />
                        <InputText v-model="filters['global'].value" placeholder="بحث شامل" />
                    </span>
                </div>
            </template>
            <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
            <Column field="id" sortable  header="الكود"></Column>
            <Column field="customer_name" sortable  header="اسم المشترك" style="min-width: 13rem;"></Column>
            <Column field="coach_name" sortable  header="المدرب" style="min-width: 12rem;">
            </Column>
            <Column field="category_name"  header="نوع الاشتراك" style="min-width: 12rem;"></Column>
            <!-- <Column field="expiration_date" sortable  header="تاريخ انتهاء الاشتراك"></Column> -->
            <Column field="number_of_sessions" sortable  header="الحصص المتبقية"></Column>
            <Column  header="تسجيل الحضور" style="min-width: 13rem;">
                <template #body="slotProps">
                <div v-if="!areDatesEqual(slotProps.data.last_attendance_date)">
                    <div class="flex text-center justify-content-center align-items-center cursor-pointer hoverIcon textColor p-2 borderRound" 
                    @click="selectedCustomers.push(slotProps.data); confirmSubmittingCustomers($event , slotProps.data.customer_name)">
                        <h3 class="text-center">تسجيل</h3>
                        <span class="material-symbols-outlined mx-2 cursor-pointer text-3xl" >
                        assignment_turned_in
                        </span>
                    </div>
                </div>
                <div v-else>
                    <p class=""> تم تسجيل الحضور اليوم في {{ dateTimeFormatter.format(new Date(slotProps.data.last_attendance_date)) }} </p>
                </div>
                </template>
            </Column>
            <template #empty> <InlineMessage severity="info">لا يوجد مشتركين</InlineMessage></template>
            <template #footer> في المجموع هناك {{ activeCustomers ? activeCustomers.length : 0 }} أعضاء </template>
            </DataTable>    
        </div>

        <!-- Coaches Attendances Submiting -->
        <div v-else>
            <!-- <h5 v-if="missingSubscriptionError" class="px-3 my-2 fadeinup animation-duration-500 animation-iteration-1 py-2 textColor text-center borderRound error">يرجي تحديد الاشتراكات أولاً</h5> -->
            <DataTable v-model:filters="coachesFilters" ref="dt"  stripedRows :value="activeCoaches"  v-model:selection="selectedCoaches"
             paginator :rows="10" :rowsPerPageOptions="[10, 20, 50]" filterDisplay="menu"
             dataKey="id" removableSort :globalFilterFields="['id', 'name']" tableStyle="min-width: 50rem">
            <template #header>
                <div class="flex flex-column lg:flex-row justify-content-between align-items-center">
                    <h3>تسجيل حضور المدربين</h3>
                    <span class="p-input-icon-left">
                        <i class="pi pi-search" />
                        <InputText v-model="coachesFilters['global'].value" placeholder="بحث شامل" />
                    </span>
                </div>
            </template>
            <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
            <Column field="id" sortable  header="الكود"></Column>
            <Column field="name" sortable  header="اسم المدرب">
                <template #body="slotProps">
                    <p>كابتن / {{ slotProps.data.name }} </p>
                </template>
            </Column>
            <Column  header="تسجيل الحضور" style="max-width: 20rem;">
                <template #body="slotProps">
                    <FormKit type="autocomplete" id="sessionCategory" v-model="slotProps.data.sessionCategory" validation="required"
                    name="sessionCategory" label="نوع التمرين" placeholder="اختر نوع التمرين" :options="categories" />
                    <div class="flex text-center justify-content-center align-items-center cursor-pointer hoverIcon textColor p-2 borderRound" 
                    @click="selectedCoaches.push(slotProps.data); confirmSubmittingCoaches($event , slotProps.data.name , slotProps.data.sessionCategory , slotProps.data.attendances , slotProps.data)">
                        <h3 class="text-center">تسجيل</h3>
                        <span class="material-symbols-outlined mx-2 cursor-pointer text-3xl" >
                        assignment_turned_in
                        </span>
                    </div>
             </template>
            </Column>
            <template #empty> <InlineMessage severity="info">لا يوجد مدربين</InlineMessage></template>
            <template #footer> في المجموع هناك {{ activeCoaches ? activeCoaches.length : 0 }} مدربين </template>
            </DataTable>    
        </div>
    </div>
</div>
</template>
<style>
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
