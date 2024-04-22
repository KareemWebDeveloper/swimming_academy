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
import Tag from 'primevue/tag';
import PickList from 'primevue/picklist';
import InputNumber from 'primevue/inputnumber';
import { isEmpAuthorizedFor } from '@/global-functions/isEmployeeAuthorizedFor';

const confirm = useConfirm();

const isFetched : any = ref(false);
const isDialogVisible : any = ref(false);
const isPosView : any = ref(false);
const selectedProducts : any = ref([]);
const deletedSuccessfully = ref(false)
const productsSearchQuery = ref()
const Customers : any = ref([]);
const isCustomersFetched = ref(false)
const posProducts : any = ref()
const totalPrice : any = ref(0)
const createdOrder : any = ref()
const isOrderLoading : any = ref(false)


// breadCrumbs
const breadCrumbs : any = ref([]);
breadCrumbs.value = [
    {label: 'المنتجات' , route: '/products', to:'/products'},
    {label: 'عرض المنتجات' , route: '/products', to:'/products' },
]; 
const home = ref({
    icon: 'pi pi-home',
    to: '/',
},
);

const confirmDeletion = (event : any) => {
    confirm.require({
        target: event.currentTarget,
        message: 'هل متأكد أنك تريد حذف هذا المنتج ؟',
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

const products = ref()
const filters = ref(
    {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        product_name: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
        product_section: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
        id: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
    }
);

const updateTotalPrice = () => {
    totalPrice.value = 0
    posProducts.value[1].forEach((product : any) => {
        totalPrice.value +=  (product.product_price * product.amount)
    });
}

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

const getProducts = () => {
    axios.get('http://127.0.0.1:8000/api/products').then((result) => {
        console.log(result.data);
        products.value = result.data.products
        isFetched.value = true
        products.value.forEach((product : any) => {
            product.created_at = new Date(product.created_at)
            if(product.product_section && product.product_section.section_name){
                product.product_section = product.product_section.section_name
            }
            else{
                product.product_section = 'غير محدد'
            }
            product.amount = 0
        });
        posProducts.value = [result.data.products, []]
    }).catch((err) => {
        console.log(err);
    });
}

const createSellingOrder = (req : any) => {
    isOrderLoading.value = true
    if(posProducts.value[1].length == 0){
        return
    }
    const request = {
        branch_id : req.branch_id,
        customer_id : req.customer_id ? req.customer_id : null,
        order_items : posProducts.value[1],
        total_price : totalPrice.value
    }
    console.log(request);
    axios.post('http://127.0.0.1:8000/api/createSellingOrder', request ).then((result) => {
        console.log(result.data.order);
        createdOrder.value = result.data.order
        isDialogVisible.value = true
        isOrderLoading.value = false
    }).catch((err) => {
        selectedProducts.value = []
        console.log(err);
    });
}

const bulkDelete = () => {
    console.log(selectedProducts.value);
    let product_ids : any = [];
    selectedProducts.value.forEach((product:any) => {
        product_ids.push(product.id)
    });
    let req : any = {
        product_ids : product_ids
    }
    axios.post('http://127.0.0.1:8000/api/productsBulkDelete', req ).then((result) => {
        console.log(result);
        deletedSuccessfully.value = true
        getProducts()
        selectedProducts.value = []
        setTimeout(() => {
            deletedSuccessfully.value = false
        }, 4500);
    }).catch((err) => {
        selectedProducts.value = []
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
                getProducts()
                getCustomers()
            })
        } 
        else{
            getProducts()
            getCustomers()
        }
    })
})
const getBranches = () => {
    return new Promise<any[]>((resolve) => {
    axios.get('http://127.0.0.1:8000/api/branches').then((result) => {
        console.log(result.data);
        const branches : any = []
        result.data.branches.forEach((branch : any) => {
            branches.push({label : branch.branch_name , value : branch.id})
        });
        resolve(branches) 
    }).catch((err) => {
        console.log(err);
    });
})
}

const filterProducts = (query : any) => {
    console.log(query , 'query');
    const tmp = products.value
    let filteredProducts = tmp.filter((product : any) => product.product_name.toLowerCase().includes(query.toLowerCase()))
    posProducts.value[0] = filteredProducts
    console.log(filteredProducts);
    
}
const getCustomers = () => {
    axios.get('http://127.0.0.1:8000/api/customers').then((result) => {
        console.log(result.data);
        result.data.customers.forEach((customer : any) => {
            Customers.value.push({label : customer.customer_name , value : customer.id})
        });
        isCustomersFetched.value = true
    }).catch((err) => {
        console.log(err);
    });
}
const handleDialogClosed = () => {
    location.reload()
}
const getSeverity = (count : number) => {
    if(count <= 3){
        return 'danger'
    }
    if(count <= 10 && count > 3){
        return 'info'
    }
    if(count > 10){
        return 'success'
    }
}

const dt = ref();
const exportCSV = () => {
    dt.value.exportCSV();
};
</script>

<template>
    <Dialog v-model:visible="isDialogVisible" @after-hide="handleDialogClosed" modal header="الفاتورة" :style="{ width: '60vw' }">
        <div class="flex flex-column align-items-center justify-content-center">
            <div class="flex align-items-center mx-5 justify-content-center flex-column">
                <div class="flex align-items-center my-2">
                    <span class="material-symbols-outlined mx-1 text-2xl">
                        receipt_long
                    </span>
                    <h4>الطلب</h4>
                </div>
                <div class="reciept">            
                    <DataTable :value="posProducts[1]" showGridlines tableStyle="min-width: 50rem">
                        <Column field="product_name" header="المنتج"></Column>
                        <Column field="amount" header="الكمية"></Column>
                        <Column field="product_price" header="السعر">
                            <template #body="slotProps">
                                <p>{{ (slotProps.data.product_price * slotProps.data.amount).toFixed(2) }} ج.م</p>
                            </template>
                        </Column>
                    </DataTable>
                    <p class="text-center mt-5">اجمالي : {{ totalPrice.toFixed(2) }} ج.م</p>
                </div>
            </div>
            <div>

            </div>
        </div>
        <template #footer>
            <Button label="تم" class="px-4 py-1" @click="isDialogVisible = false" autofocus />
        </template>
    </Dialog>


    <div class="w-12 md:w-10 my-5 m-auto p-2 md:p-5 productsList" style="direction: rtl;">
            <!-- Breadcrumb -->
    <div class="w-full m-auto flex justify-content-center p-4 MargAutoMob padding-1-breadcrumbs" style="direction: ltr;">
        <Breadcrumb :home="home" :model="breadCrumbs" />
    </div>    
    <div v-if="!isPosView && isEmpAuthorizedFor(empPermissions , 'بيع المنتجات' , UserType)" class="flex textColor mb-4 flex-column align-items-center justify-content-center m-auto" @click="isPosView = !isPosView">
        <span class="material-symbols-outlined cursor-pointer text-7xl posHover">
            point_of_sale
        </span>
        <h4 class="cursor-pointer greenHover">بيع المنتجات</h4> 
    </div>
    <div v-else class="flex textColor mb-4 align-items-center p-5 m-auto" >
        <h4 class="cursor-pointer" @click="isPosView = !isPosView">رجوع</h4> 
        <span class="material-symbols-outlined cursor-pointer mx-2 text-5xl" @click="isPosView = !isPosView">
            arrow_back
        </span>
    </div>

    <ConfirmPopup></ConfirmPopup>
        <!-- data Table -->
        <successMsg v-if="deletedSuccessfully" class="fadeinright animation-duration-500 animation-iteration-1 my-4">تم الحذف بنجاح</successMsg>
    <div v-if="!isPosView">
        <DataTable v-model:filters="filters" ref="dt"  stripedRows :value="products"  v-model:selection="selectedProducts" :loading="!isFetched"
        stateStorage="session" stateKey="products-state-session" paginator :rows="10" :rowsPerPageOptions="[10, 20, 50]" filterDisplay="menu"
         dataKey="id" removableSort export-filename="المنتجات" :globalFilterFields="['id', 'product_name' , 'product_section']" tableStyle="min-width: 50rem">
        <template #header>
            <div class="flex flex-column lg:flex-row justify-content-between align-items-center">
                <div class="flex align-items-center">
                    <Button type="button" v-if="isEmpAuthorizedFor(empPermissions , 'تسجيل المنتجات' , UserType)" class="mb-3 lg:mb-0 mx-2" @click="push('/products/create')" label="تسجيل منتج" />
                    <Button type="button" v-if="isEmpAuthorizedFor(empPermissions , 'تسجيل المنتجات' , UserType)" @click="bulkDelete" :disabled="selectedProducts.length == 0" severity="danger" class="mb-3 lg:mb-0 mx-2" label="حذف المحدد" />
                </div>
                <span class="p-input-icon-left">
                    <i class="pi pi-search" />
                    <InputText v-model="filters['global'].value" placeholder="بحث شامل" />
                </span>
            </div>
        </template>
        <template #loading> برجاء الانتظار .. جاري تحميل بيانات المنتجات ... </template>
        <!-- <Column field="id" header="Code"></Column> -->
        <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
        <Column field="id" sortable  header="الكود"></Column>
        <Column field="product_name" sortable  header="المنتج" style="min-width: 11rem;"></Column>
        <Column field="product_section" sortable  header="القسم">
        </Column>
        <Column field="product_count" sortable  header="الكمية">
            <template #body="slotProps" >
                <!-- <p>{{ slotProps.data.product_count }} قطعة</p> -->
                <Tag :value="`${slotProps.data.product_count} قطعة`" :severity="getSeverity(slotProps.data.product_count)" />

            </template>
        </Column>
        <Column field="product_price" sortable  header="سعر المنتج" style="min-width: 10rem;">
            <template #body="slotProps" >
                <p>{{ slotProps.data.product_price.toFixed(2) }} ج.م</p>
            </template>
        </Column>
        <Column field="created_at" sortable  header="تاريخ التسجيل" style="width: 36%;">
            <template #body="slotProps" >
                <p>{{ dateTimeFormatter.format(slotProps.data.created_at) }}</p>
            </template>
        </Column>
        <Column  header="تعديل">
            <template #body="slotProps">
                <div class="flex align-items-center">
                <span v-if="isEmpAuthorizedFor(empPermissions , 'تسجيل المنتجات' , UserType)" class="material-symbols-outlined cursor-pointer hoverIcon textColor text-3xl p-2 borderRound" 
                    @click="selectedProducts = [{id : slotProps.data.id}]; confirmDeletion($event)">
                    delete_forever
                </span>
                <span v-if="isEmpAuthorizedFor(empPermissions , 'تسجيل المنتجات' , UserType)" @click="push(`/product/update/${slotProps.data.id}`)" class="material-symbols-outlined cursor-pointer hoverIcon mx-2 textColor text-3xl p-2 borderRound">
                    edit
                </span>
                <!-- <span class="material-symbols-outlined cursor-pointer hoverIcon textColor text-3xl p-2 borderRound" 
                @click="">
                    visibility
                </span> -->
                </div>
            </template>
        </Column>
            
        <template #empty> <InlineMessage severity="info">لا يوجد منتجات</InlineMessage></template>
        <template #paginatorend>
            <Button type="button" icon="pi pi-download" @click="exportCSV($event)" text />
        </template>
        <!-- <template #footer> In total there are {{ products ? products.length : 0 }} products. </template> -->
        <template #footer> في المجموع هناك {{ products ? products.length : 0 }} منتجات </template>
        </DataTable>
    </div>

    <!-- pos view -->
    <div v-else style="direction: ltr;">
        <PickList v-model="posProducts" @move-to-source="updateTotalPrice" @move-to-target="updateTotalPrice" listStyle="height:442px" dataKey="id" breakpoint="1400px">
            <template #sourceheader> 
                <div class="flex justify-content-between align-items-center">
                    <h4>المنتجات</h4>
                    <InputText @update:modelValue="filterProducts" v-model="productsSearchQuery" placeholder="ابحث في المنتجات" />
                </div>
            </template>
            <template #targetheader> الطلب <span class="material-symbols-outlined">
                receipt_long
                </span></template>
            <template #item="slotProps">
                <div v-if="slotProps.item.product_count > 0" class="flex flex-column">
                    <h3 class="font-bold">{{ slotProps.item.product_name }}</h3>
                    <div class="flex justify-content-center">
                        <p class="my-2 mx-4 text-sm">السعر : {{ slotProps.item.product_price.toFixed(2) }} ج.م</p>
                        <p class="my-2 text-sm"> الكمية المتاحة: {{ slotProps.item.product_count }}</p>
                    </div>
                    <div class="flex justify-content-center m-auto w-8">
                        <InputNumber @click="updateTotalPrice" v-model="slotProps.item.amount" :min="0" :max="slotProps.item.product_count" showButtons buttonLayout="horizontal"
                        decrementButtonClassName="p-button-secondary" incrementButtonClassName="p-button-secondary" incrementButtonIcon="pi pi-plus" decrementButtonIcon="pi pi-minus" />
                    </div>
                </div>
            </template>
        </PickList>
        <h3 class="text-center my-4 textColor" style="direction: rtl;">السعر النهائي : {{ totalPrice.toFixed(2) }} ج.م</h3>
        <!-- {{ posProducts[1] }} -->
        <FormKit type="form" style="direction: rtl;" :actions="false" @submit="createSellingOrder">
            <div v-if="isCustomersFetched" class="mt-3 col-12">
                <div class="flex align-items-center">
                    <label for="name" class="px-3 py-1 text-white text-sm">العميل ( اختياري )</label>
                </div>
                <FormKit
                type="autocomplete" name="customer_id"  placeholder="اختر العميل لقيام الطلب" label="المشترك"
                :options="Customers" validation=""
                />
            </div>
            <div class="mt-3 col-12">
                <div class="flex align-items-center">
                    <label for="name" class="px-3 py-1 text-white text-sm">الفرع</label>
                </div>
                <FormKit type="dropdown" validation="required" name="branch_id" label="الفرع" placeholder="اختر الفرع" :options="getBranches" />
            </div>
            <Button type="submit" class="submitBtn" label="تسجيل الطلب" :loading="isOrderLoading" />
        </FormKit>
    </div>
</div>
</template>
<style>
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
