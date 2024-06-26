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
import Tag from 'primevue/tag';
import Dropdown from 'primevue/dropdown';
import Calendar from 'primevue/calendar';
import { isEmpAuthorizedFor } from '@/global-functions/isEmployeeAuthorizedFor';
import type { Ref } from 'vue';

const confirm = useConfirm();

const isPrivateSubscriptionsFetched : any = ref(false);
const isBranchesFetched : any = ref(false);
const isConfirmBulkDeleteVisible : any = ref(false);
const isFailedDeletionDialogVisible : any = ref(false);
const isCoachFetched : any = ref(false);
const isBulkDeleteLoading : any = ref(false);
const activeCoach : any = ref();
const selectedCustomers : any = ref([]);
const deletedSuccessfully = ref(false)

// breadCrumbs
const breadCrumbs : any = ref([]);
breadCrumbs.value = [
    {label: 'التمرينات الفردية' , route: '/privateSubscriptions', to:'/privateSubscriptions'},
    {label: 'عرض التمرينات الفردية' , route: '/privateSubscriptions', to:'/privateSubscriptions' },
]; 
const home = ref({
    icon: 'pi pi-home',
    to: '/',
},
);

const confirmDeletion = (event : any , payment : string) => {
    confirm.require({
        target: event.currentTarget,
        message: payment == 'cash' ? 'هل متأكد أنك تريد حذف هذا المشترك ؟' : 'هذا المشترك نشط! هل متأكد أنك تريد حذف هذا المشترك ؟' ,
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
const statuses = ref(['active' ,'inactive','frozen'])
const paymentsOptions = ref(['cash','installments','vodafone','instapay' , 'visa'])
const privateSubscriptions = ref()
const branches : any = ref([])
const categories : any = ref([])
const selectedBranches : any = ref()
const failedDeletions : any = ref([])

const filters = ref(
    {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        'customer.customer_name': { value: '', matchMode: FilterMatchMode.CONTAINS },
        category_name: { value: '', matchMode: FilterMatchMode.EQUALS },
        academy_name: { value: '', matchMode: FilterMatchMode.CONTAINS },
        is_semi_private: { value: '', matchMode: FilterMatchMode.CONTAINS },
        'coach.name': { value: '', matchMode: FilterMatchMode.CONTAINS },
        'branch.branch_name': { value: '', matchMode: FilterMatchMode.CONTAINS },
        expiration_date: { value: null, matchMode: FilterMatchMode.DATE_IS },
        subscription_type: { value: null, matchMode: FilterMatchMode.EQUALS },
        'customer.customer_phone': { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
        customer_id: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
        state: { value: null, matchMode: FilterMatchMode.CONTAINS},
    }
);

const options = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    // hour: 'numeric',
    // minute: 'numeric',
    // hour12: true,
    timeZone: 'Asia/Dubai',
    locale: 'ar'
};

const dateTimeFormatter = new Intl.DateTimeFormat('ar', options);

const getPrivateSubscriptions = () => {
    axios.get('https://akademia.website/api/privateSubscriptions').then((result) => {
        console.log(result.data);
        privateSubscriptions.value = result.data.privateSubscriptions
        isPrivateSubscriptionsFetched.value = true
        privateSubscriptions.value.forEach((subscription : any) => {
            subscription.expiration_date = new Date(subscription.expiration_date)
            const differenceInMS = subscription.expiration_date.getTime() - new Date().getTime()
            console.log(differenceInMS / (1000 * 3600 * 24));
            subscription.daysLeft = Math.ceil(differenceInMS / (1000 * 3600 * 24))
        });
    }).catch((err) => {
        console.log(err);
    });
}

const getBranches = () => {
    axios.get('https://akademia.website/api/branches').then((result) => {
        console.log(result.data);
        result.data.branches.forEach((branch : any) => {
            branches.value.push(branch.branch_name)
        });
        isBranchesFetched.value = true
    }).catch((err) => {
        console.log(err);
    });
}

const getCoachDetails = (coachId : number) => {
    isCoachFetched.value = false
    // isDialogVisible.value = true
    axios.get(`https://akademia.website/api/coach/${coachId}`).then((result) => {
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

const payInstallment = (installmentId : number) => {
    axios.put(`https://akademia.website/api/payInstallment/${installmentId}`).then((result) => {
        console.log(result.data.installment);
        failedDeletions.value = failedDeletions.value.filter((installment : any) => installment.id !== installmentId);
    }).catch((err) => {
        console.log(err);
    });
}

const deleteInstallment = (installmentId : number) => {
    axios.delete(`https://akademia.website/api/deleteInstallment/${installmentId}`).then((result) => {
        console.log(result.data);
        failedDeletions.value = failedDeletions.value.filter((installment : any) => installment.id !== installmentId);
    }).catch((err) => {
        console.log(err);
    });
}

const confirmBulkDelete = () => {
    let containsActiveCustomer = false
    selectedCustomers.value.forEach((coach:any) => {
        if(coach.state == 'active'){
            containsActiveCustomer = true
        }
    });
    if(containsActiveCustomer){
        isConfirmBulkDeleteVisible.value = true
    }
}

const bulkDelete = () => {
    isBulkDeleteLoading.value = true
    console.log(selectedCustomers.value);
    failedDeletions.value = []
    let customers_ids : any = [];
    selectedCustomers.value.forEach((customer:any) => {
        customers_ids.push(customer.customer_id)
    });
    let req : any = {
        customer_ids : customers_ids
    }
    axios.post('https://akademia.website/api/customerBulkDelete', req).then((result) => {
        console.log(result);
        isBulkDeleteLoading.value = false
        deletedSuccessfully.value = true
        selectedCustomers.value = []
        isFailedDeletionDialogVisible.value = false
        isConfirmBulkDeleteVisible.value = false
        getPrivateSubscriptions()
        setTimeout(() => {
            deletedSuccessfully.value = false
        }, 4500);
    }).catch((err) => {
        if(err.response.data.failed_deletions){
            isFailedDeletionDialogVisible.value = true
            isBulkDeleteLoading.value = false
            isConfirmBulkDeleteVisible.value = false
            err.response.data.failed_deletions.forEach((failed : any) => {
                Object.values(failed.installments).forEach((installment : any) => {
                    installment.customer_name = failed.customer_name
                    console.log(installment);
                    failedDeletions.value.push(installment)
                }); 
            });
            console.log('customers have unpaid installments !');
            console.log(failedDeletions.value);
        }
        // console.log(err.response.data);
    });
}

const getCategories = () => {
    axios.get('https://akademia.website/api/categories').then((result) => {
        console.log(result.data);
        result.data.categories.forEach((category : any) => {
            categories.value.push(category.category_name)
        });
    }).catch((err) => {
        console.log(err);
    });
}

const getSeverity = (status : any) => {
    if(status == 'active'){
        return 'success'
    }
    if(status == 'inactive'){
        return 'danger'
    }
    if(status == 'frozen'){
        return 'info'
    }
}
const getStateValue = (status : any) => {
    if(status == 'active'){
        return 'نشط'
    }
    if(status == 'inactive'){
        return 'غير نشط'
    }
    if(status == 'frozen'){
        return 'مجمد'
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
                    push({path : '/login', query : currentRoute.value.query})
                }
                empPermissions.value = employee.permissions
                UserType.value = 'employee'
                if(!isEmpAuthorizedFor(empPermissions.value , 'عرض التمرينات البرايفت' , UserType.value)){
                    localStorage.removeItem('SwimmingToken')
                    push({path : '/login', query : {userType : 'employee'}})
                }
                getPrivateSubscriptions()
                getBranches()
                getCategories()
            })
        }
        else{
            getPrivateSubscriptions()
            getBranches()
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
    
    <!-- Failed Deletions Dialog -->
    <Dialog v-model:visible="isFailedDeletionDialogVisible" @after-hide="failedDeletions = []" modal header="تنبيه" :style="{ width: '60vw' }" :breakpoints="{ '960px': '75vw', '641px': '100vw' }">
        <!-- <loading v-if="!isCoachFetched"></loading> -->
        <div class="text-center">
            <span style="color: rgba(220, 18, 18, 0.759);" class="material-symbols-outlined text-6xl">
                warning
            </span>
            <h3 style="color: rgba(220, 18, 18, 0.759);">لا يمكن حذف المشتركين التاليين بسبب وجود مديونيات لم تسدد</h3>
            <div v-if="failedDeletions.length > 0" class="failedDeletions">
                <DataTable v-model:filters="filters" ref="dt"  stripedRows :value="failedDeletions" paginator :rows="10" 
                :rowsPerPageOptions="[10, 20, 50]" filterDisplay="menu"
                 dataKey="id" removableSort :globalFilterFields="['id', 'category_name']" tableStyle="min-width: 50rem">
                <template #header>
                    <div class="flex flex-column lg:flex-row justify-content-between align-items-center">
                        <h3 class="hidden md:my-2 lg:my-0 md:flex" style="color: black;">المديونيات</h3>
                        <span class="p-input-icon-left">
                            <i class="pi pi-search" />
                            <InputText v-model="filters['global'].value" placeholder="بحث شامل" />
                        </span>
                    </div>
                </template>
                <Column field="customer_name" sortable  header="اسم اللاعب"></Column>
                <Column field="installment_number"  header="رقم القسط"></Column>
                <Column field="amount" sortable  header="المبلغ المستحق">
                    <template #body="slotProps" >
                        <p>{{ slotProps.data.amount }} ج.م</p>
                    </template>
                </Column>
                <Column field="due_date" sortable header="موعد الاستحقاق">
                    <template #body="slotProps" >
                        <p>{{ slotProps.data.due_date }}</p>
                    </template>
                </Column>
                <Column  header="تعديل" style="min-width: 11rem;">
                    <template #body="slotProps">
                        <div class="flex align-items-center">
                            <span class="cursor-pointer hoverIcon textColor text-sm p-2 borderRound" 
                            @click="payInstallment(slotProps.data.id)">
                                تم الدفع
                            </span>
                            <span @click="deleteInstallment(slotProps.data.id)" class="material-symbols-outlined cursor-pointer hoverIcon textColor mx-2 text-3xl p-2 borderRound">
                                delete_forever
                            </span>
                        </div>
                    </template>
                </Column>
                    
                <template #empty> <InlineMessage severity="info">لا يوجد مديونيات</InlineMessage></template>
                <template #paginatorend>
                    <Button type="button" icon="pi pi-download" @click="exportCSV($event)" text />
                </template>
                </DataTable>
            </div>
        </div>

        <template #footer>
            <div class="flex justify-content-between">
                <Button type="button" severity="danger" class="mb-3 lg:mb-0 mx-2" :loading="isBulkDeleteLoading" @click="bulkDelete" label="حاول مجدداً" />
            </div>
        </template>
    </Dialog>

    <!-- Bulk Delete Confirmation Dialog -->
    <Dialog v-model:visible="isConfirmBulkDeleteVisible" modal header="رسالة تأكيد" :style="{ width: '60vw' }" :breakpoints="{ '960px': '75vw', '641px': '100vw' }">
        <div class="text-center">
            <span style="color: rgba(220, 18, 18, 0.759);" class="material-symbols-outlined text-6xl">
                warning
            </span>
            <h3 style="color: rgba(220, 18, 18, 0.759);">هل متأكد أنك تريد حذف هؤلاء المشتركين ؟</h3>
            <p class="my-2">أنت علي وشك حذف مشتركين نشطين</p>
        </div>

        <template #footer>
            <div class="flex justify-content-between">
                <Button type="button" severity="danger" class="mb-3 lg:mb-0 mx-2" @click="bulkDelete" label="تأكيد" />
            </div>
        </template>
    </Dialog>
    
    
    <!-- Customers List -->
    <div class="w-12 md:w-10 my-5 m-auto p-2 md:p-5 privateList" style="direction: rtl;">
        <!-- Breadcrumb -->
        <div class="w-full m-auto flex justify-content-center p-4 MargAutoMob padding-1-breadcrumbs" style="direction: ltr;">
            <Breadcrumb :home="home" :model="breadCrumbs" />
        </div>    
        <ConfirmPopup></ConfirmPopup>
        <!-- data Table -->
        <successMsg v-if="deletedSuccessfully" class="fadeinright animation-duration-500 animation-iteration-1 my-4">تم الحذف بنجاح</successMsg>
    <div>
        <DataTable v-model:filters="filters" filter-locale="ar" export-filename="الاشتاركات الفردية" ref="dt"  stripedRows :value="privateSubscriptions"  v-model:selection="selectedCustomers" :loading="!isPrivateSubscriptionsFetched"
         paginator :rows="10" :rowsPerPageOptions="[10, 15 , 20, 50]" filterDisplay="menu"
         dataKey="customer_id" removableSort :globalFilterFields="['customer_id' , 'customer.customer_name' , 'customer.customer_phone']" tableStyle="min-width: 50rem">
        <template #header>
            <div class="flex flex-column lg:flex-row justify-content-between align-items-center">
                <div class="flex align-items-center">
                    <Button type="button" v-if="isEmpAuthorizedFor(empPermissions , 'تسجيل و تعديل التمرينات البرايفت' , UserType)" class="mb-3 lg:mb-0 mx-2" @click="push({path : '/customer/create' , query : {isPrivate : 'true'} })" label="تسجيل مشترك" />
                    <Button type="button" v-if="isEmpAuthorizedFor(empPermissions , 'تسجيل و تعديل التمرينات البرايفت' , UserType)" @click="bulkDelete" :disabled="selectedCustomers.length == 0" severity="danger" class="mb-3 lg:mb-0 mx-2" label="حذف المحدد" />
                </div>
                <h3 class="hidden md:my-2 lg:my-0 md:flex">الاشتراكات الفردية</h3>
                <div>
                    <span class="p-input-icon-left">
                        <i class="pi pi-search" />
                        <InputText v-model="filters['global'].value" class="mx-2" placeholder="بحث شامل" />
                    </span>
                    <Dropdown v-model="filters['state'].value" :options="statuses" placeholder="اختر حالة" class="p-column-filter" style="min-width: 12rem" :showClear="true">
                        <template #option="slotProps">
                            <Tag :value="getStateValue(slotProps.option)" :severity="getSeverity(slotProps.option)" />
                        </template>
                    </Dropdown>
                </div>
            </div>
        </template>
        <template #loading> برجاء الانتظار .. جاري تحميل بيانات الاشتراكات الفردية ... </template>
        <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
        <Column field="customer_id" sortable  header="الكود" style="width: 8%;"></Column>
        <Column field="customer.customer_name" sortable  header="الاسم" >
            <template #body="slotProps" >
                {{ slotProps.data.customer.customer_name }}
            </template>
            <template #filter="{ filterModel , filterCallback }">
                <InputText v-model="filterModel.value" @input="filterCallback()" type="text" class="p-column-filter" placeholder="أدخل اسم المشترك" />
            </template>
            <template #filterapply="{ filterCallback }">
                <Button type="button" @click="filterCallback()" class="mb-3 lg:mb-0 mx-2" label="تفعيل" />
            </template>
            <template #filterclear="{ filterCallback }">
                <Button type="button" @click="filterCallback()" class="mb-3 lg:mb-0 mx-2" label="الغاء" outlined />
            </template>
        </Column>
        <Column field="customer.customer_phone"  header="الهاتف"></Column>
        <Column field="state"  header="الحالة" >
            <template #body="slotProps" >
                <Tag :value="getStateValue(slotProps.data.state)" :severity="getSeverity(slotProps.data.state)"></Tag>
            </template>
            <template #filter="{ filterModel, filterCallback }">
                <Dropdown v-model="filterModel.value" @change="filterCallback()" :options="statuses" placeholder="اختر حالة" class="p-column-filter" style="min-width: 12rem" :showClear="true">
                    <template #option="slotProps">
                        <Tag :value="getStateValue(slotProps.option)" :severity="getSeverity(slotProps.option)" />
                    </template>
                </Dropdown>
            </template>
            <template #filterapply="{ filterCallback }">
                <Button type="button" @click="filterCallback()" class="mb-3 lg:mb-0 mx-2" label="تفعيل" />
            </template>
            <template #filterclear="{ filterCallback }">
                <Button type="button" @click="filterCallback()" class="mb-3 lg:mb-0 mx-2" label="الغاء" outlined />
            </template>
        </Column>
        <Column field="subscription_type"  header="الدفع" style="min-width: 9rem">
            <template #body="slotProps" >
                <p v-if="slotProps.data.subscription_type == 'cash'">كاش</p>
                <p v-if="slotProps.data.subscription_type == 'vodafone'">فودافون كاش</p>
                <p v-if="slotProps.data.subscription_type == 'instapay'">انستا باي</p>
                <p v-if="slotProps.data.subscription_type == 'installments'">تقسيط</p>
                <p v-if="slotProps.data.subscription_type == 'visa'">فيزا</p>
            </template>
            <template #filter="{ filterModel, filterCallback }">
                <Dropdown v-model="filterModel.value" @change="filterCallback()" :options="paymentsOptions" placeholder="اختر طريقة دفع" class="p-column-filter" style="min-width: 12rem" :showClear="true">
                    <template #option="slotProps">
                        <p v-if="slotProps.option == 'cash'">كاش</p>
                        <p v-if="slotProps.option == 'vodafone'">فودافون كاش</p>
                        <p v-if="slotProps.option == 'instapay'">انستا باي</p>
                        <p v-if="slotProps.option == 'installments'">تقسيط</p>
                        <p v-if="slotProps.option == 'visa'">فيزا</p>
                    </template>
                </Dropdown>
            </template>
            <template #filterapply="{ filterCallback }">
                <Button type="button" @click="filterCallback()" class="mb-3 lg:mb-0 mx-2" label="تفعيل" />
            </template>
            <template #filterclear="{ filterCallback }">
                <Button type="button" @click="filterCallback()" class="mb-3 lg:mb-0 mx-2" label="الغاء" outlined />
            </template>
        </Column>
        <Column field="is_semi_private"  header="نوع الاشتراك"  style="min-width: 11rem">
            <template #body="slotProps" >
                <p v-if="slotProps.data.is_semi_private">سيمي برايفت</p>
                <p v-else>برايفت</p>
            </template>
            <template #filter="{ filterModel, filterCallback }">
                <Dropdown v-model="filterModel.value" @change="filterCallback()" option-value="value" option-label="label"
                :options="[{label : 'سيمي برايفت' , value : 1} , {label : 'برايفت' , value : 0}]" placeholder="اختر نوع الاشتراك" class="p-column-filter" style="min-width: 12rem" :showClear="true">
                </Dropdown>
            </template>
            <template #filterapply="{ filterCallback }">
                <Button type="button" @click="filterCallback()" class="mb-3 lg:mb-0 mx-2" label="تفعيل" />
            </template>
            <template #filterclear="{ filterCallback }">
                <Button type="button" @click="filterCallback()" class="mb-3 lg:mb-0 mx-2" label="الغاء" outlined />
            </template>
        </Column>
        <Column field="category_name"  header="نوع التمرين"  style="min-width: 11rem">
            <template #filter="{ filterModel, filterCallback }">
                <Dropdown v-model="filterModel.value" @change="filterCallback()" :options="categories" placeholder="اختر نوع التمرين" class="p-column-filter" style="min-width: 12rem" :showClear="true">
                </Dropdown>
            </template>
            <template #filterapply="{ filterCallback }">
                <Button type="button" @click="filterCallback()" class="mb-3 lg:mb-0 mx-2" label="تفعيل" />
            </template>
            <template #filterclear="{ filterCallback }">
                <Button type="button" @click="filterCallback()" class="mb-3 lg:mb-0 mx-2" label="الغاء" outlined />
            </template>
        </Column>
        <Column field="academy_name"  header="الأكاديمية"  style="min-width: 11rem">
            <template #filter="{ filterModel, filterCallback }">
                <InputText v-model="filterModel.value" @input="filterCallback()" type="text" class="p-column-filter" placeholder="أدخل اسم الأكاديمية" />
            </template>
            <template #filterapply="{ filterCallback }">
                <Button type="button" @click="filterCallback()" class="mb-3 lg:mb-0 mx-2" label="تفعيل" />
            </template>
            <template #filterclear="{ filterCallback }">
                <Button type="button" @click="filterCallback()" class="mb-3 lg:mb-0 mx-2" label="الغاء" outlined />
            </template>
        </Column>
        <Column field="branch.branch_name"  header="الفرع"  style="min-width: 11rem">
            <template #filter="{ filterModel, filterCallback }">
                <Dropdown v-model="filterModel.value" @change="filterCallback()" :options="branches" placeholder="اختر الفرع" class="p-column-filter" style="min-width: 12rem" :showClear="true">
                </Dropdown>
            </template>
            <template #filterapply="{ filterCallback }">
                <Button type="button" @click="filterCallback()" class="mb-3 lg:mb-0 mx-2" label="تفعيل" />
            </template>
            <template #filterclear="{ filterCallback }">
                <Button type="button" @click="filterCallback()" class="mb-3 lg:mb-0 mx-2" label="الغاء" outlined />
            </template>
        </Column>
        <Column field="coach.name"  header="المدرب" style="min-width: 9rem">
            <template #body="slotProps" >
                {{ slotProps.data.coach.name }}
            </template>
            <template #filter="{ filterModel , filterCallback }">
                <InputText v-model="filterModel.value" @input="filterCallback()" type="text" class="p-column-filter" placeholder="أدخل اسم المدرب" />
            </template>
            <template #filterapply="{ filterCallback }">
                <Button type="button" @click="filterCallback()" class="mb-3 lg:mb-0 mx-2" label="تفعيل" />
            </template>
            <template #filterclear="{ filterCallback }">
                <Button type="button" @click="filterCallback()" class="mb-3 lg:mb-0 mx-2" label="الغاء" outlined />
            </template>
        </Column>
        <Column field="expiration_date" sortable  header="تاريخ انتهاء الاشتراك" style="min-width: 17rem">
            <template #body="slotProps" >
                <p>{{ dateTimeFormatter.format(slotProps.data.expiration_date) }}</p>
            </template>
            <template #filter="{ filterModel, filterCallback }">
                    <Calendar v-model="filterModel.value" @input="filterCallback()" placeholder="اختر تاريخ انتهاء الاشتراك" showIcon showButtonBar inputId="expiration_date"></Calendar> 
            </template>
            <template #filterapply="{ filterCallback }">
                <Button type="button" @click="filterCallback()" class="mb-3 lg:mb-0 mx-2" label="تفعيل" />
            </template>
            <template #filterclear="{ filterCallback }">
                <Button type="button" @click="filterCallback()" class="mb-3 lg:mb-0 mx-2" label="الغاء" outlined />
            </template>
        </Column>
        <Column field="daysLeft" sortable  header="الأيام المتبقية" style="min-width: 12rem">
            <template #body="slotProps">
                <p v-if="slotProps.data.daysLeft >= 0">{{ slotProps.data.daysLeft }} يوم</p>
                <p v-else>اشتراك منتهي</p>
            </template>
        </Column>
        <Column  header="تعديل">
            <template #body="slotProps">
                <div class="flex align-items-center">
                    <span v-if="isEmpAuthorizedFor(empPermissions , 'تسجيل و تعديل التمرينات البرايفت' , UserType)" class="material-symbols-outlined cursor-pointer hoverIcon textColor text-3xl p-2 borderRound" 
                    @click="selectedCustomers = [{customer_id : slotProps.data.customer_id}]; confirmDeletion($event , slotProps.data.subscription_type)">
                    delete_forever
                    </span>
                    <div v-if="isEmpAuthorizedFor(empPermissions , 'تسجيل و تعديل التمرينات البرايفت' , UserType)">
                        <span v-if="slotProps.data.is_semi_private" @click="push({path : `/customer/update/${slotProps.data.customer_id}` , query : {isPrivate : 'true' , isSemiPrivate : 'true'} })" class="material-symbols-outlined cursor-pointer hoverIcon mx-2 textColor text-3xl p-2 borderRound">
                            edit
                        </span>
                        <span v-else @click="push({path : `/customer/update/${slotProps.data.customer_id}` , query : {isPrivate : 'true'} })" class="material-symbols-outlined cursor-pointer hoverIcon mx-2 textColor text-3xl p-2 borderRound">
                            edit
                        </span>
                    </div>
                    <span class="material-symbols-outlined cursor-pointer hoverIcon textColor text-3xl p-2 borderRound" 
                    @click="push(`/customer/${slotProps.data.id}`)">
                        visibility
                    </span>
                </div>
            </template>
        </Column>
            
        <template #empty> <InlineMessage severity="info">لا يوجد مشتركين</InlineMessage></template>
        <template #paginatorend>
            <Button type="button" icon="pi pi-download" @click="exportCSV($event)" text />
        </template>
        <template #footer> في المجموع هناك {{ privateSubscriptions ? privateSubscriptions.length : 0 }} مشتركين </template>
        </DataTable>
    </div>
    </div>
</template>
<style>
.failedDeletions .p-datatable .p-datatable-thead > tr > th {
    background: var(--background);
}
.p-datepicker .p-datepicker-header {
    direction: ltr; /* it's responsible for making the datepicker filter ltr */
}
.privateList .p-column-filter-overlay-menu .p-column-filter-constraint .p-column-filter-matchmode-dropdown {
    display: none; /* it hides the ability to choose the filter match mode */
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
