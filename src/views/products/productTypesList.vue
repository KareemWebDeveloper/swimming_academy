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
const isWarningDialogVisible : any = ref(false);
const isDeleteLoading : any = ref(false);
const isErrorReturned : any = ref(false);
const dbError : any = ref(false);
const updatedSuccessfully : any = ref(false);
const updateLoading : any = ref(false);
const activeSection : any = ref();
const selectedSections : any = ref([]);
const deletedSuccessfully = ref(false)

// breadCrumbs
const breadCrumbs : any = ref([]);
breadCrumbs.value = [
    {label: 'أقسام المنتجات' , route: '/productTypes', to:'/productTypes'},
]; 
const home = ref({
    icon: 'pi pi-home',
    to: '/',
},
);

const confirmDeletion = (event : any) => {
    confirm.require({
        target: event.currentTarget,
        message: 'هل متأكد أنك تريد حذف هذا القسم ؟',
        icon: 'pi pi-exclamation-triangle',
        acceptLabel : 'نعم',
        rejectLabel : 'لا',
        accept: () => {
            isWarningDialogVisible.value = true
        },  
        reject: () => {
        }
    });
};

const productSections = ref()
const filters = ref(
    {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        products_count: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
        section_name: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
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
    timeZone: 'Asia/Dubai',
    locale: 'ar'
    };
const dateTimeFormatter = new Intl.DateTimeFormat('ar', options);

const getSections = () => {
    axios.get('https://akademia.website/api/productSections').then((result) => {
        console.log(result.data);
        productSections.value = result.data.sections
        productSections.value.forEach((section : any) => {
            section.created_at = new Date(section.created_at)
        });
        isFetched.value = true
        
    }).catch((err) => {
        console.log(err);
    });
}

const updateSection = (req : any) => {
    updateLoading.value = true
    axios.put(`https://akademia.website/api/updateProductSection/${activeSection.value.id}`, req).then((result) => {
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
        if(err.response.data.message.includes('The section name has already been taken')){
            dbError.value = 'هذا القسم موجود بالفعل';
        }   
        else{
            dbError.value = err.response.data.message
        }
        console.log(err);
    });
}

const bulkDelete = () => {
    isDeleteLoading.value = true
    console.log(selectedSections.value);
    let section_ids : any = [];
    selectedSections.value.forEach((section:any) => {
        section_ids.push(section.id)
    });
    let req : any = {
        section_ids : section_ids
    }
    axios.post('https://akademia.website/api/productSectionBulkDelete', req ).then((result) => {
        console.log(result);
        deletedSuccessfully.value = true
        selectedSections.value = []
        getSections()
        setTimeout(() => {
            deletedSuccessfully.value = false
        }, 4500);
        isDeleteLoading.value = false
        isWarningDialogVisible.value = false
    }).catch((err) => {
        selectedSections.value = []
        console.log(err);
        isDeleteLoading.value = false
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
                if(!isEmpAuthorizedFor(empPermissions.value , 'عرض أقسام المنتجات' , UserType.value)){
                    localStorage.removeItem('SwimmingToken')
                    push({path : '/login', query : {userType : 'employee'}})
                }
                console.log(empPermissions.value);
                getSections()
            })
        }
        else{
            getSections()
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
    <Dialog v-model:visible="isDialogVisible" @after-hide="getSections" maximizable modal header="تعديل القسم" :style="{ width: '50vw' }" :breakpoints="{ '960px': '75vw', '641px': '100vw' }">
        <FormKit v-model="activeSection" type="form" :actions="false" @submit="updateSection">
        <successMsg v-if="updatedSuccessfully" class="fadeinright animation-duration-500 animation-iteration-1 my-4">تم التعديل بنجاح</successMsg>
        <h5 v-if="isErrorReturned" class="px-3 py-2 textColor text-center borderRound error">{{ dbError }}</h5>
            <div class="mt-3">
                <div class="flex align-items-center">
                    <label for="categoryName" class="px-3 py-1 text-white text-sm">القسم</label>
                </div>
                <FormKit prefix-icon="text" id="categoryName" type="text" label="القسم" placeholder="أدخل نوع تمرين جديد" name="section_name" validation="required|length:3" />
            </div>
            <Button type="submit" class="submitBtn" label="تعديل" :loading="updateLoading" />
        </FormKit>
        <template #footer>
        </template>
    </Dialog>

    <Dialog v-model:visible="isWarningDialogVisible" @after-hide="getSections" maximizable modal header="تحذير" :style="{ width: '50vw' }" :breakpoints="{ '960px': '75vw', '641px': '100vw' }">
        <div class="m-auto">
            <span style="color: rgba(220, 18, 18, 0.759);display: block;" class="text-center m-auto material-symbols-outlined text-6xl">
                warning
            </span>
        </div>
            <h2 class="text-center" style="color: rgba(220, 18, 18, 0.759);">هل أنت متأكد من القيام بذلك ؟</h2>
            <h4 class="text-center" style="color: rgba(220, 18, 18, 0.959);">قد يكون هناك منتجات لهذا القسم</h4>
        <template #footer>
            <Button type="button" severity="danger" class="mb-3 lg:mb-0 mx-2" :loading="isDeleteLoading" @click="bulkDelete" label="متأكد" />
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
    <div v-if="isFetched && productSections.length >= 0">
        <DataTable v-model:filters="filters" ref="dt"  stripedRows :value="productSections"  v-model:selection="selectedSections"
        stateStorage="session" stateKey="productSections-state-session" paginator :rows="10" :rowsPerPageOptions="[10, 20, 50]" filterDisplay="menu"
         dataKey="id" removableSort :globalFilterFields="['products_count', 'section_name']" tableStyle="min-width: 50rem">
        <template #header>
            <div class="flex flex-column lg:flex-row justify-content-between align-items-center">
                <div class="flex align-items-center">
                    <Button v-if="isEmpAuthorizedFor(empPermissions , 'تسجيل أقسام المنتجات' , UserType)" type="button" class="mb-3 lg:mb-0 mx-2" @click="push('/productType/create')" label="انشاء قسم" />
                    <Button type="button" :disabled="selectedSections.length == 0" @click="isWarningDialogVisible = !isWarningDialogVisible" severity="danger" class="mb-3 lg:mb-0 mx-2" label="حذف المحدد" />
                </div>
                <h3 class="hidden md:my-2 lg:my-0 md:flex">أقسام المنتجات</h3>
                <span class="p-input-icon-left">
                    <i class="pi pi-search" />
                    <InputText v-model="filters['global'].value" placeholder="بحث شامل" />
                </span>
            </div>
        </template>
        <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
        <!-- <Column field="id" sortable  header="الكود"></Column> -->
        <Column field="section_name" sortable  header="القسم"></Column>
        <Column field="products_count" sortable  header="عدد المنتجات">
            <template #body="slotProps" >
                <p>{{ slotProps.data.products_count }} منتج</p>
            </template>
        </Column>
        <Column field="created_at" sortable  header="تاريخ الانشاء" style="width: 36%;">
            <template #body="slotProps" >
                <p>{{ dateTimeFormatter.format(slotProps.data.created_at) }}</p>
            </template>
        </Column>
        <Column  header="تعديل" style="width: 14%;">
            <template #body="slotProps">
                <div v-if="isEmpAuthorizedFor(empPermissions , 'تسجيل أقسام المنتجات' , UserType)" class="flex align-items-center">
                    <span class="material-symbols-outlined cursor-pointer hoverIcon textColor text-3xl p-2 borderRound" 
                    @click="selectedSections = [{id : slotProps.data.id}]; confirmDeletion($event)">
                        delete_forever
                    </span>
                    <span @click="activeSection = slotProps.data; isDialogVisible = true" class="material-symbols-outlined cursor-pointer hoverIcon mx-2 textColor text-3xl p-2 borderRound">
                        edit
                    </span>
                </div>
            </template>
        </Column>
            
        <template #empty> <InlineMessage severity="info">لا يوجد أقسام</InlineMessage></template>
        <template #paginatorend>
            <Button type="button" icon="pi pi-download" @click="exportCSV($event)" text />
        </template>
        <template #footer> في المجموع هناك {{ productSections ? productSections.length : 0 }} أقسام </template>
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
