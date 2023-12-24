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
import { ref, onMounted, onBeforeMount } from 'vue';
import { FilterMatchMode, FilterOperator } from 'primevue/api';
import { adminAuthorize } from '@/global-functions/checkUserRole';
import { employeeAuthorize } from '@/global-functions/isEmployeeAuthorized';
import successMsg from '../../components/successMsg.vue'
import InlineMessage from 'primevue/inlinemessage';
import ConfirmPopup from 'primevue/confirmpopup';
import { useConfirm } from "primevue/useconfirm";
import Dialog from 'primevue/dialog';
import { isEmpAuthorizedFor } from '@/global-functions/isEmployeeAuthorizedFor';
import type { Ref } from 'vue';

const confirm = useConfirm();

const isLevelsFetched : any = ref(false);
const isBranchesFetched : any = ref(false);
const isDialogVisible : any = ref(false);
const isErrorReturned : any = ref(false);
const dbError : any = ref(false);
const updatedSuccessfully : any = ref(false);
const updateLoading : any = ref(false);
const isLevelFetched : any = ref(false);
const isAttachBranchLoading : any = ref(false);
const activeLevel : any = ref();
const selectedCoaches : any = ref([]);
const deletedSuccessfully = ref(false)

// breadCrumbs
const breadCrumbs : any = ref([]);
breadCrumbs.value = [
    {label: 'المستويات' , route: '/levels', to:'/levels'},
    {label: 'عرض المستويات' , route: '/levels', to:'/levels' },
]; 
const home = ref({
    icon: 'pi pi-home',
    to: '/',
},
);

const confirmDeletion = (event : any) => {
    confirm.require({
        target: event.currentTarget,
        message: 'هل متأكد أنك تريد حذف هذا المستوي ؟',
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

const levels = ref()
const branches : any = ref([])
const selectedBranches : any = ref()
const levelDetailsFilter = ref(
    {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        branch_name: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
        id: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
    }
);
const filters = ref(
    {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        level_name: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
        sublevels_count: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
        // id: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
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

const getLevels = () => {
    axios.get('https://akademia.website/api/levels').then((result) => {
        console.log(result.data);
        levels.value = result.data.levels
        isLevelsFetched.value = true
        levels.value.forEach((coach : any) => {
            coach.created_at = new Date(coach.created_at)
        });
    }).catch((err) => {
        console.log(err);
    });
}


const getLevelDetails = (levelId : number) => {
    isLevelFetched.value = false
    isDialogVisible.value = true
    axios.get(`https://akademia.website/api/level/${levelId}`).then((result) => {
        activeLevel.value = result.data.level
        isLevelFetched.value = true
        console.log(activeLevel.value);
    }).catch((err) => {
        console.log(err);
    });
}

const bulkDelete = () => {
    console.log(selectedCoaches.value);
    let levels_ids : any = [];
    selectedCoaches.value.forEach((coach:any) => {
        levels_ids.push(coach.id)
    });
    let req : any = {
        levels_ids : levels_ids
    }
    axios.post('https://akademia.website/api/levelsBulkDelete', req).then((result) => {
        console.log(result);
        deletedSuccessfully.value = true
        selectedCoaches.value = []
        getLevels()
        setTimeout(() => {
            deletedSuccessfully.value = false
        }, 4500);
    }).catch((err) => {
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
                    push({path : '/login', query : currentRoute.value.query})
                }
                empPermissions.value = employee.permissions
                UserType.value = 'employee'
                if(!isEmpAuthorizedFor(empPermissions.value , 'المستويات' , UserType.value)){
                    localStorage.removeItem('SwimmingToken')
                    location.reload()
                    push({path : '/login', query : currentRoute.value.query})
                }
                getLevels()
            })
        } 
        else{
            getLevels()
        }
    })
})

const dt = ref();
const exportCSV = () => {
    dt.value.exportCSV();
};
</script>

<template>

    <Dialog v-model:visible="isDialogVisible" maximizable modal header="تفاصيل المستوي" :style="{ width: '65vw' }" :breakpoints="{ '960px': '75vw', '641px': '100vw' }">
        <loading v-if="!isLevelFetched"></loading>
        <div v-else class="branchDetails">
            <h3>{{ activeLevel.level_name }}</h3>
            <div v-for="(sublevel , index) in activeLevel.sublevels" :key="index" class="m-auto my-4">
                <h2 class="text-center my-2">{{ sublevel.sublevel_name }}</h2>
                <div class="flex align-items-center flex-wrap justify-content-center">
                    <div class="p-3 borderRound mx-2 my-2" style="color: #256029; background-color: #c8e6c9d3;" v-for="checkpoint in sublevel.checkpoints">
                        <p>{{ checkpoint.checkpoint_name }}</p>
                    </div>
                </div>
            </div>
        </div>

        <template #footer>
            <div class="flex justify-content-between">
                <Button type="button" class="mb-3 lg:mb-0 mx-2" @click="push(`/level/update/${activeLevel.id}`)" label="تعديل" />
            </div>
        </template>
    </Dialog>

    <!-- Levels List -->

    <div class="w-12 md:w-10 my-5 m-auto p-2 md:p-5 branchesList" style="direction: rtl;">
            <!-- Breadcrumb -->
    <div class="w-full m-auto flex justify-content-center p-4 MargAutoMob padding-1-breadcrumbs" style="direction: ltr;">
        <Breadcrumb :home="home" :model="breadCrumbs" />
    </div>    
    <ConfirmPopup></ConfirmPopup>
        <!-- data Table -->
        <successMsg v-if="deletedSuccessfully" class="fadeinright animation-duration-500 animation-iteration-1 my-4">تم الحذف بنجاح</successMsg>
    <div v-if="isLevelsFetched">
        <DataTable v-model:filters="filters" ref="dt" export-filename="المستويات" stripedRows :value="levels"  v-model:selection="selectedCoaches"
        stateStorage="session" stateKey="levels-state-session" paginator :rows="10" :rowsPerPageOptions="[10, 15 , 20, 50]" filterDisplay="menu"
         dataKey="id" removableSort :globalFilterFields="['level_name', 'sublevels_count']" tableStyle="min-width: 50rem" :loading="!isLevelsFetched">
        <template #header>
            <div class="flex flex-column lg:flex-row justify-content-between align-items-center">
                <div class="flex align-items-center">
                    <Button type="button" class="mb-3 lg:mb-0 mx-2" @click="push('/levels/create')" label="تسجيل مستوي" />
                    <Button type="button" v-if="selectedCoaches.length == 0" severity="danger" class="mb-3 lg:mb-0 mx-2" disabled label="حذف المحدد" />
                    <Button type="button" v-else class="mb-3 lg:mb-0 mx-2" severity="danger" @click="bulkDelete" label="حذف المحدد" />
                </div>
                <h3 class="hidden md:my-2 lg:my-0 md:flex">المستويات</h3>
                <span class="p-input-icon-left">
                    <i class="pi pi-search" />
                    <InputText v-model="filters['global'].value" placeholder="بحث شامل" />
                </span>
            </div>
        </template>
        <template #loading> برجاء الانتظار .. جاري تحميل بيانات المستويات ... </template>

        <!-- <Column field="id" header="Code"></Column> -->
        <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
        <Column field="level_name" sortable  header="المستوي" style="width: 18%;">
        </Column>
        <Column field="sublevels_count"  header="عدد المستويات الفرعية" style="width: 25%;">
            <template #body="slotProps" >
                <p>{{ slotProps.data.sublevels_count }} مستويات</p>
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
                    <span class="material-symbols-outlined cursor-pointer hoverIcon textColor text-3xl p-2 borderRound" 
                    @click="selectedCoaches = [{id : slotProps.data.id}]; confirmDeletion($event)">
                    delete_forever
                </span>
                <span @click="push(`/level/update/${slotProps.data.id}`)" class="material-symbols-outlined cursor-pointer hoverIcon mx-2 textColor text-3xl p-2 borderRound">
                    edit
                </span>
                <span class="material-symbols-outlined cursor-pointer hoverIcon textColor text-3xl p-2 borderRound" 
                @click="getLevelDetails(slotProps.data.id)">
                    visibility
                </span>
                </div>
            </template>
        </Column>
            
        <template #empty> <InlineMessage severity="info">لا يوجد مستويات</InlineMessage></template>
        <template #paginatorend>
            <Button type="button" icon="pi pi-download" @click="exportCSV($event)" text />
        </template>
        <template #footer> في المجموع هناك {{ levels ? levels.length : 0 }} مستوي </template>
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
