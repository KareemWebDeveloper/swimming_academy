<script setup lang="ts">
import axios from 'axios';
import Button from 'primevue/button';
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

const isFetched : any = ref(false);
const isDialogVisible : any = ref(false);
const isErrorReturned : any = ref(false);
const dbError : any = ref(false);
const updatedSuccessfully : any = ref(false);
const updateLoading : any = ref(false);
const activeCategory : any = ref();
const selectedCategories : any = ref([]);
const deletedSuccessfully = ref(false)

// breadCrumbs
const breadCrumbs : any = ref([]);
breadCrumbs.value = [
    {label: 'أنواع التمارين' , route: '/categories', to:'/categories'},
    {label: 'عرض الأنواع' , route: '/categories', to:'/categories' },
]; 
const home = ref({
    icon: 'pi pi-home',
    to: '/',
},
);

const confirmDeletion = (event : any) => {
    confirm.require({
        target: event.currentTarget,
        message: 'هل متأكد أنك تريد حذف هذا النوع ؟',
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

const categories = ref()
const filters = ref(
    {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        category_name: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
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

const getCategories = () => {
    axios.get('http://127.0.0.1:8000/api/categories').then((result) => {
        console.log(result.data);
        categories.value = result.data.categories
        categories.value.forEach((category : any) => {
            category.created_at = new Date(category.created_at)
        });
        isFetched.value = true
        
    }).catch((err) => {
        console.log(err);
    });
}

const updateCategory = (req : any) => {
    updateLoading.value = true
    axios.put(`http://127.0.0.1:8000/api/updateCategory/${activeCategory.value.id}`, req).then((result) => {
        console.log(result.data);
        updateLoading.value = false
        updatedSuccessfully.value = true
        isErrorReturned.value = false
        setTimeout(() => {
            isDialogVisible.value = false
            updatedSuccessfully.value = false
        }, 1500);
    }).catch((err) => {
        updateLoading.value = false
        isErrorReturned.value = true
        if(err.response.data.message.includes('The category name has already been taken')){
            dbError.value = 'هذا النوع موجود بالفعل';
        }   
        else{
            dbError.value = err.response.data.message
        }
        console.log(err);
    });
}

const bulkDelete = () => {
    console.log(selectedCategories.value);
    let category_ids : any = [];
    selectedCategories.value.forEach((category:any) => {
        category_ids.push(category.id)
    });
    let req : any = {
        category_ids : category_ids
    }
    axios.post('http://127.0.0.1:8000/api/categoryBulkDelete', req ).then((result) => {
        console.log(result);
        deletedSuccessfully.value = true
        selectedCategories.value = []
        getCategories()
        setTimeout(() => {
            deletedSuccessfully.value = false
        }, 4500);
    }).catch((err) => {
        selectedCategories.value = []
        console.log(err);
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
                if(!isEmpAuthorizedFor(empPermissions.value , 'عرض أنواع التمارين' , UserType.value)){
                    localStorage.removeItem('SwimmingToken')
                    location.reload()
                    push({path : '/login', query : currentRoute.value.query})
                }
                console.log(empPermissions.value);
                getCategories()
            })
        }
        else{
            getCategories()
        }
    })
})

const dt = ref();
const exportCSV = () => {
    dt.value.exportCSV();
};
</script>

<template>
    <!-- Update Dialog  -->
    <Dialog v-model:visible="isDialogVisible" @after-hide="getCategories" maximizable modal header="تعديل النوع" :style="{ width: '50vw' }" :breakpoints="{ '960px': '75vw', '641px': '100vw' }">
        <FormKit v-model="activeCategory" type="form" :actions="false" @submit="updateCategory">
        <successMsg v-if="updatedSuccessfully" class="fadeinright animation-duration-500 animation-iteration-1 my-4">تم التعديل بنجاح</successMsg>
        <h5 v-if="isErrorReturned" class="px-3 py-2 textColor text-center borderRound error">{{ dbError }}</h5>
            <div class="mt-3">
                <div class="flex align-items-center">
                    <label for="categoryName" class="px-3 py-1 text-white text-sm">نوع التمرينة</label>
                </div>
                <FormKit prefix-icon="text" id="categoryName" type="text" label="نوع التمرين" placeholder="أدخل نوع تمرين جديد" name="category_name" validation="required|length:3" />
            </div>
            <Button type="submit" class="submitBtn" label="انشاء" :loading="updateLoading" />
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
        <successMsg v-if="deletedSuccessfully" class="fadeinright animation-duration-500 animation-iteration-1 my-4">تم الحذف بنجاح</successMsg>
    <div v-if="isFetched && categories.length >= 0">
        <DataTable v-model:filters="filters" ref="dt"  stripedRows :value="categories"  v-model:selection="selectedCategories"
        stateStorage="session" stateKey="categories-state-session" paginator :rows="10" :rowsPerPageOptions="[10, 20, 50]" filterDisplay="menu"
         dataKey="id" removableSort :globalFilterFields="['id', 'category_name']" tableStyle="min-width: 50rem">
        <template #header>
            <div class="flex flex-column lg:flex-row justify-content-between align-items-center">
                <div class="flex align-items-center">
                    <Button v-if="isEmpAuthorizedFor(empPermissions , 'انشاء و تعديل أنواع التمارين' , UserType)" type="button" class="mb-3 lg:mb-0 mx-2" @click="push('/category/create')" label="انشاء نوع" />
                    <Button v-if="isEmpAuthorizedFor(empPermissions , 'انشاء و تعديل أنواع التمارين' , UserType)" type="button" :disabled="selectedCategories.length == 0" severity="danger" class="mb-3 lg:mb-0 mx-2" label="حذف المحدد" />
                </div>
                <h3 class="hidden md:my-2 lg:my-0 md:flex">أنواع التمارين</h3>
                <span class="p-input-icon-left">
                    <i class="pi pi-search" />
                    <InputText v-model="filters['global'].value" placeholder="بحث شامل" />
                </span>
            </div>
        </template>
        <!-- <Column field="id" header="Code"></Column> -->
        <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
        <Column field="id" sortable  header="الكود"></Column>
        <Column field="category_name" sortable  header="النوع"></Column>
        <Column field="created_at" sortable  header="تاريخ الانشاء" style="width: 36%;">
            <template #body="slotProps" >
                <p>{{ dateTimeFormatter.format(slotProps.data.created_at) }}</p>
            </template>
        </Column>
        <Column  header="تعديل" style="width: 14%;">
            <template #body="slotProps">
                <div v-if="isEmpAuthorizedFor(empPermissions , 'انشاء و تعديل أنواع التمارين' , UserType)" class="flex align-items-center">
                    <span class="material-symbols-outlined cursor-pointer hoverIcon textColor text-3xl p-2 borderRound" 
                    @click="selectedCategories = [{id : slotProps.data.id}]; confirmDeletion($event)">
                        delete_forever
                    </span>
                    <span @click="activeCategory = slotProps.data; isDialogVisible = true" class="material-symbols-outlined cursor-pointer hoverIcon mx-2 textColor text-3xl p-2 borderRound">
                        edit
                    </span>
                </div>
            </template>
        </Column>
            
        <template #empty> <InlineMessage severity="info">لا يوجد أنواع</InlineMessage></template>
        <template #paginatorend>
            <Button type="button" icon="pi pi-download" @click="exportCSV($event)" text />
        </template>
        <!-- <template #footer> In total there are {{ products ? products.length : 0 }} products. </template> -->
        <template #footer> في المجموع هناك {{ categories ? categories.length : 0 }} أنواع </template>
        </DataTable>
    </div>
    </div>
</template>
<style>
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
.p-datatable .p-datatable-header {
    background: rgba(255, 255, 255, 0.025);
    color: white;
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
