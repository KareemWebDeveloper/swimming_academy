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
import Dropdown from 'primevue/dropdown';
import { isEmpAuthorizedFor } from '@/global-functions/isEmployeeAuthorizedFor';

const confirm = useConfirm();

const isCoachesFetched : any = ref(false);
const isBranchesFetched : any = ref(false);
const isDialogVisible : any = ref(false);
const isFailedDeletionDialogVisible : any = ref(false);

const isCoachFetched : any = ref(false);
const isAttachBranchLoading : any = ref(false);
const isUpdateCoachesSubscriptionsLoading : any = ref(false);
const activeCoach : any = ref();
const selectedCoaches : any = ref([]);
const deletedSuccessfully = ref(false)

// breadCrumbs
const breadCrumbs : any = ref([]);
breadCrumbs.value = [
    {label: 'المدربين' , route: '/coaches', to:'/coaches'},
    {label: 'عرض المدربين' , route: '/coaches', to:'/coaches' },
]; 
const home = ref({
    icon: 'pi pi-home',
    to: '/',
},
);

const confirmDeletion = (event : any) => {
    confirm.require({
        target: event.currentTarget,
        message: 'هل متأكد أنك تريد حذف هذا المدرب ؟',
        icon: 'pi pi-exclamation-triangle',
        acceptLabel : 'نعم',
        rejectLabel : 'لا',
        accept: () => {
            bulkDelete()
        },  
        reject: () => {
        }
    });
};
const coachesOptions : any = ref([])
const coachesToBeDeleted : any = ref([])
const coaches = ref()
const failedDeletions = ref()
const branches : any = ref([])
const selectedBranches : any = ref()
const coachBranchesFilters = ref(
    {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        branch_name: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
        id: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
    }
);
const failedDeletionsFilters = ref(
    {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        'branch.branch_name': { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
        'customer.customer_name': { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
    }
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
    timeZone: 'Africa/Cairo',
    locale: 'ar'
};

const dateTimeFormatter = new Intl.DateTimeFormat('ar', options);

const getCoaches = () => {
    axios.get('http://127.0.0.1:8000/api/coaches').then((result) => {
        console.log(result.data);
        coaches.value = result.data.coaches
        isCoachesFetched.value = true
        coaches.value.forEach((coach : any) => {
            coach.created_at = new Date(coach.created_at)
        });
        coachesInputList()
    }).catch((err) => {
        console.log(err);
    });
}

const getBranches = () => {
    axios.get('http://127.0.0.1:8000/api/branches').then((result) => {
        console.log(result.data);
        result.data.branches.forEach((branch : any) => {
            branches.value.push({label : branch.branch_name , value : branch.id})
        });
        isBranchesFetched.value = true
    }).catch((err) => {
        console.log(err);
    });
}

const getCoachDetails = (coachId : number) => {
    isCoachFetched.value = false
    isDialogVisible.value = true
    axios.get(`http://127.0.0.1:8000/api/coach/${coachId}`).then((result) => {
        activeCoach.value = result.data.coach
        activeCoach.value.numberOfSubscriptions = result.data.activeSubscriptions.length
        selectedBranches.value = {branchIds : []}
        result.data.coach.branches.forEach((branch : any) => {
            selectedBranches.value.branchIds.push(branch.id)
        });
        isCoachFetched.value = true
        console.log(activeCoach.value);
        console.log(branches.value);
    }).catch((err) => {
        console.log(err);
    });
}

const attachBranches = (req : any) => {
    isAttachBranchLoading.value = true
    axios.put(`http://127.0.0.1:8000/api/coach/attachBranches/${activeCoach.value.id}` , req).then((result) => {
        console.log(result);
        isAttachBranchLoading.value = false
        isCoachFetched.value = false
        getCoachDetails(activeCoach.value.id)
    }).catch((err) => {
        console.log(err);
    });
}

const UpdateCoachesSubscriptions = () => {
    isUpdateCoachesSubscriptionsLoading.value = true
    console.log(failedDeletions.value);
    let subscriptionsNewCoaches : any = {subscriptions : []}
    failedDeletions.value.forEach((failed : any) => {
        failed.subscriptions.forEach((subscription : any) => {
            subscriptionsNewCoaches.subscriptions.push({id : subscription.id , coach_id : subscription.coach_id})
        });
    });
    console.log(subscriptionsNewCoaches);
    axios.post(`http://127.0.0.1:8000/api/subscriptionCoaches/update` , subscriptionsNewCoaches).then((result) => {
        isUpdateCoachesSubscriptionsLoading.value = false
        bulkDelete()
    }).catch((err) => {
        console.log(err);
    });
}
const coachesInputList = () => {
    coaches.value.forEach((coach : any) => {
        let coachOption = {
            name :  `كابتن / ${coach.name}`,
            code : coach.id
        }
        coachesOptions.value.push(coachOption)
    });
}


const bulkDelete = () => {
    console.log(selectedCoaches.value);
    let coaches_ids : any = [];
    selectedCoaches.value.forEach((coach:any) => {
        coaches_ids.push(coach.id)
    });
    let req : any = {
        coaches_ids : coaches_ids
    }
    axios.post('http://127.0.0.1:8000/api/coachBulkDelete', req).then((result) => {
        console.log(result);
        deletedSuccessfully.value = true
        isFailedDeletionDialogVisible.value = false
        selectedCoaches.value = []
        getCoaches()
        setTimeout(() => {
            deletedSuccessfully.value = false
        }, 4500);
    }).catch((err) => {
        if(err.response.data.failed_deletions){
            console.log('coaches have subsciptions !');
            console.log(err.response.data.failed_deletions);
            failedDeletions.value = err.response.data.failed_deletions
            isFailedDeletionDialogVisible.value = true
            err.response.data.failed_deletions.forEach((deletion : any) => {
                coachesToBeDeleted.value.push(deletion.coach_id)
            });            

        }
        console.log(err.response.data);
    });
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
                if(!isEmpAuthorizedFor(empPermissions.value , 'عرض المدربين' , UserType.value)){
                    localStorage.removeItem('SwimmingToken')
                    console.log('not authorized');
                    location.reload()
                    push({path : '/login', query : currentRoute.value.query})
                }
                console.log(empPermissions.value);
                getCoaches()
                getBranches()
            })
        }
        else{
            getCoaches()
            getBranches()
        }
    })
})

const dt = ref();
const exportCSV = () => {
    dt.value.exportCSV();
};
</script>

<template>

    <Dialog v-model:visible="isFailedDeletionDialogVisible" maximizable @after-hide="failedDeletions = []; coachesToBeDeleted = []; getCoaches()" modal header="تنبيه" :style="{ width: '60vw' }" :breakpoints="{ '960px': '75vw', '641px': '100vw' }">
        <!-- <loading v-if="!isCoachFetched"></loading> -->
        <div class="text-center">
            <span style="color: rgba(220, 18, 18, 0.759);" class="material-symbols-outlined text-6xl">
                warning
            </span>
            <h3 style="color: rgba(220, 18, 18, 0.759);">لا يمكن حذف المدربين التاليين بسبب وجود اشتراكات نشطة</h3>
            <div v-if="failedDeletions.length > 0" class="failedDeletions">
                <div v-for="(failed , index) in failedDeletions" :key="index" class="surface-100 my-3 p-3 borderRound">
                <DataTable v-model:filters="failedDeletionsFilters" ref="dt"  stripedRows :value="failed.subscriptions" paginator :rows="10" 
                :rowsPerPageOptions="[10, 20, 50]" filterDisplay="menu"
                 dataKey="id" removableSort :globalFilterFields="['branch.branch_name', 'customer.customer_name']" tableStyle="min-width: 50rem">
                <template #header>
                    <div class="flex flex-column lg:flex-row justify-content-between align-items-center">
                        <h3 class="hidden md:my-2 lg:my-0 md:flex" style="color: black;">اشتراكات كابتن / {{ failedDeletions[index].coach_name }}</h3>
                        <span class="p-input-icon-left">
                            <i class="pi pi-search" />
                            <InputText v-model="failedDeletionsFilters['global'].value" placeholder="بحث شامل" />
                        </span>
                    </div>
                </template>
                <Column field="customer.customer_name" sortable  header="اسم اللاعب" style="min-width: 10rem;"></Column>
                <Column field="branch.branch_name" sortable  header="الفرع"></Column>
                <Column field="number_of_sessions"  header="الحصص المتبقية" style="min-width: 11rem;">
                    <template #body="slotProps" >
                        <p>{{ slotProps.data.number_of_sessions }} حصص</p>
                    </template>
                </Column>
                <Column field="category_name" sortable  header="نوع التمرين" style="min-width: 10rem;">
                    <template #body="slotProps" >
                        <p>{{ slotProps.data.category_name }}</p>
                    </template>
                </Column>
                <Column field="expiration_date" sortable header="موعد الانتهاء" style="min-width: 11rem;">
                    <template #body="slotProps" >
                        <p>{{ slotProps.data.expiration_date }}</p>
                    </template>
                </Column>
                <Column header="تغيير المدرب" style="min-width: 17rem;">
                    <template #body="data">
                        <div class="flex align-items-center w-full">
                            <Dropdown v-model="data.data.coach_id" :options="coachesOptions" optionLabel="name" optionValue="code" placeholder="اختر مدرب جديد" class="p-column-filter" style="min-width: 15rem" :showClear="true">
                                <template #option="slotProps">
                                    <p v-if="coachesToBeDeleted.includes(slotProps.option.code)" class="line-through">{{ slotProps.option.name }}</p>
                                    <p v-else>{{ slotProps.option.name }}</p>
                                </template>
                            </Dropdown>
                        </div>
                    </template>
                </Column>
                    
                <template #empty> <InlineMessage severity="info">لا يوجد اشتراكات</InlineMessage></template>
                <template #paginatorend>
                    <Button type="button" icon="pi pi-download" @click="exportCSV($event)" text />
                </template>
                <template #footer>
                    <h4 class="p-2" style="color: black;"> في المجموع هناك {{ failed ? failed.subscriptions.length : 0 }} مشتركين </h4>
                </template>
                </DataTable>
            </div>
            </div>
        </div>

        <template #footer>
            <div class="flex justify-content-between p-2">
                <Button type="button" severity="danger" class="mb-3 lg:mb-0 mx-2" :loading="isUpdateCoachesSubscriptionsLoading" @click="UpdateCoachesSubscriptions" label="حاول مجدداً" />
            </div>
        </template>
    </Dialog>

    <!-- Coach Details -->

    <Dialog v-model:visible="isDialogVisible" maximizable modal header="الفروع التي يعمل بها" :style="{ width: '60vw' }" :breakpoints="{ '960px': '75vw', '641px': '100vw' }" >
        <loading v-if="!isCoachFetched"></loading>
        <div v-else class="branchDetails">
            <DataTable v-model:filters="coachBranchesFilters" paginator :rows="10" :rowsPerPageOptions="[10, 15 , 20, 50]" ref="dt"  stripedRows :value="activeCoach.branches"
            filterDisplay="menu"
             dataKey="id" removableSort :globalFilterFields="['id', 'branch_name']" tableStyle="min-width: 50rem">
            <template #header>
                <div class="flex flex-column lg:flex-row justify-content-between align-items-center">
                    <div class="flex align-items-center">
                        <h3 style="color : black;">كابتن / {{ activeCoach.name }}</h3>
                    </div>
                    <h3 style="background: rgba(0, 128, 0, 0.932);" class="w-4 text-center p-2 borderRound m-auto" v-if="activeCoach.numberOfSubscriptions > 0">يشترك معه {{ activeCoach.numberOfSubscriptions }} أعضاء</h3>
                    <h3 style="background-color: rgba(255, 0, 0, 0.684);" class="w-4 text-center p-2 borderRound m-auto" v-else> ليس لديه مشتركين</h3>    
                    <span class="p-input-icon-left">
                        <i class="pi pi-search" />
                        <InputText v-model="coachBranchesFilters['global'].value" placeholder="بحث شامل" />
                    </span>
                </div>
            </template>
            <Column field="id" sortable  header="كود الفرع"></Column>
            <Column field="branch_name" sortable  header="اسم الفرع"></Column>
    
            <template #empty> <InlineMessage severity="info">لا يوجد فروع</InlineMessage></template>
            <template #paginatorend>
                <Button type="button" icon="pi pi-download" @click="exportCSV($event)" text />
            </template>
            <template #footer> 
                <!-- <h3 style="background: rgba(0, 128, 0, 0.932);" class="w-5 text-center p-2 borderRound m-auto" v-if="activeCoach.numberOfSubscriptions > 0">يشترك معه {{ activeCoach.numberOfSubscriptions }} أعضاء</h3> -->
                <!-- <h3 style="background-color: rgba(255, 0, 0, 0.684);" class="w-5 text-center p-2 borderRound m-auto" v-else> ليس لديه مشتركين</h3> -->
            <FormKit type="form" :actions="false" v-model="selectedBranches" @submit="attachBranches">
                <div class="attachBranches">
                    <FormKit type="dropdown" name="branchIds" label="الفروع" placeholder="اختر الفروع التي يعمل بها المدرب" :options="branches" multiple />
                </div>
                <Button type="submit" label="تحديث الفروع" class="p-2 px-4 m-auto text-center font-sm" style="background: var(--background);" :loading="isAttachBranchLoading" />
            </FormKit>
            </template>
            </DataTable>
        </div>

        <template #footer>
            <div class="flex justify-content-between">
                <Button type="button" class="mb-3 lg:mb-0 mx-2" @click="push(`/coach/update/${activeCoach.id}`)" label="تعديل" />
            </div>
        </template>
    </Dialog>

    <!-- Coaches List -->

    <div class="w-12 md:w-10 my-5 m-auto p-2 md:p-5 branchesList" style="direction: rtl;">
            <!-- Breadcrumb -->
    <div class="w-full m-auto flex justify-content-center p-4 MargAutoMob padding-1-breadcrumbs" style="direction: ltr;">
        <Breadcrumb :home="home" :model="breadCrumbs" />
    </div>    
    <ConfirmPopup></ConfirmPopup>
        <!-- data Table -->
        <successMsg v-if="deletedSuccessfully" class="fadeinright animation-duration-500 animation-iteration-1 my-4">تم الحذف بنجاح</successMsg>
    <div>
        <DataTable v-model:filters="filters" ref="dt" export-filename="المدربين"  stripedRows :value="coaches"  v-model:selection="selectedCoaches"
        stateStorage="session" stateKey="coaches-state-session" paginator :rows="10" :rowsPerPageOptions="[10, 15 , 20, 50]" filterDisplay="menu" :loading="!isCoachesFetched"
         dataKey="id" removableSort :globalFilterFields="['id', 'name']" tableStyle="min-width: 50rem">
        <template #header>
            <div class="flex flex-column lg:flex-row justify-content-between align-items-center">
                <div class="flex align-items-center">
                    <Button v-if="isEmpAuthorizedFor(empPermissions , 'تسجيل و تعديل المدربين' , UserType)" type="button" class="mb-3 lg:mb-0 mx-2" @click="push('/coach/create')" label="تسجيل مدرب" />
                    <Button v-if="isEmpAuthorizedFor(empPermissions , 'تسجيل و تعديل المدربين' , UserType)" type="button" :disabled="selectedCoaches.length == 0" severity="danger" class="mb-3 lg:mb-0 mx-2" label="حذف المحدد" />
                </div>
                <h3 class="hidden md:my-2 lg:my-0 md:flex">المدربين</h3>
                <span class="p-input-icon-left">
                    <i class="pi pi-search" />
                    <InputText v-model="filters['global'].value" placeholder="بحث شامل" />
                </span>
            </div>
        </template>
        <template #loading> برجاء الانتظار .. جاري تحميل بيانات المدربين ... </template>

        <!-- <Column field="id" header="Code"></Column> -->
        <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
        <Column field="id" sortable  header="الكود"></Column>
        <Column field="name" sortable  header="الاسم" style="width: 28%;">
            <template #body="slotProps" >
                <p>كابتن / {{ slotProps.data.name }}</p>
            </template>
        </Column>
        <Column field="phone"  header="الهاتف" style="width: 20%;"></Column>
        <Column field="salary_per_hour" sortable  header="الراتب" style="width: 23%;">
            <template #body="slotProps" >
                <p>{{ slotProps.data.salary_per_hour }}ج.م / ساعة</p>
            </template>
        </Column>
        <Column field="created_at" sortable  header="تاريخ التسجيل" style="width: 40%;">
            <template #body="slotProps" >
                <p>{{ dateTimeFormatter.format(slotProps.data.created_at) }}</p>
            </template>
        </Column>
        <Column  header="تعديل" style="width: 14%;">
            <template #body="slotProps">
                <div class="flex align-items-center">
                <span v-if="isEmpAuthorizedFor(empPermissions , 'تسجيل و تعديل المدربين' , UserType)" class="material-symbols-outlined cursor-pointer hoverIcon textColor text-3xl p-2 borderRound" 
                    @click="selectedCoaches = [{id : slotProps.data.id}]; confirmDeletion($event)">
                    delete_forever
                </span>
                <span v-if="isEmpAuthorizedFor(empPermissions , 'تسجيل و تعديل المدربين' , UserType)" @click="push(`/coach/update/${slotProps.data.id}`)" class="material-symbols-outlined cursor-pointer hoverIcon mx-2 textColor text-3xl p-2 borderRound">
                    edit
                </span>
                <span class="material-symbols-outlined cursor-pointer hoverIcon textColor text-3xl p-2 borderRound" 
                @click="getCoachDetails(slotProps.data.id)">
                    visibility
                </span>
                </div>
            </template>
        </Column>
            
        <template #empty> <InlineMessage severity="info">لا يوجد مدربين</InlineMessage></template>
        <template #paginatorend>
            <Button type="button" icon="pi pi-download" @click="exportCSV($event)" text />
        </template>
        <template #footer> في المجموع هناك {{ coaches ? coaches.length : 0 }} مدربين </template>
        </DataTable>
    </div>
    </div>
</template>
<style>
.p-dropdown-clear-icon {
    position: absolute;
    top: 2.3vh !important;
    right: 5px !important;
}
.failedDeletions .p-datatable .p-datatable-thead > tr > th {
    background: var(--background);
}
.failedDeletions .formkit-listbox .formkit-listitem .formkit-selected-icon {
    display: none;
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
