<script setup lang="ts">
import axios from 'axios';
import { ref, onBeforeMount, type Ref } from 'vue';
import Button from 'primevue/button';
import { useRouter } from 'vue-router';
import successMsg from '../../components/successMsg.vue';
import { adminAuthorize } from '@/global-functions/checkUserRole';
import { employeeAuthorize } from '@/global-functions/isEmployeeAuthorized';
import InputSwitch from 'primevue/inputswitch';
import Dialog from 'primevue/dialog';
import SelectButton from 'primevue/selectbutton';
const { push , currentRoute } = useRouter();

const createdSuccessfully = ref(false)
const isErrorReturned = ref(false)
const stayAtTheSamePage = ref(false)
const sectionsFetched = ref(false)
const dbError = ref()
const isLoading = ref(false)
const isFetched = ref(false)
const createdProduct = ref()
const Sections : any = ref([])
const isDialogVisible = ref(false)
const optionsAvail = ref(['منتج جديد' , 'منتج موجود'])
const optionValue = ref('منتج جديد')
const productValues = ref()
const productsOptions : any = ref([])
const allProducts : any = ref()

const createProduct = (req : any) => {
    isLoading.value = true
    console.log(req);
    axios.post('http://127.0.0.1:8000/api/createProduct' , req).then((result) => {
        createdProduct.value = result.data.product
        isLoading.value = false
        isErrorReturned.value = false
        createdSuccessfully.value= true
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        createdSuccessfully.value= false
        setTimeout(() => {
            isDialogVisible.value = true            
        }, 1000);
    }).catch((err) => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        isLoading.value = false
        isErrorReturned.value = true
        if(err.response.data.message.includes('The product name has already been taken')){
            dbError.value = 'هذا المنتج موجود بالفعل'
        }
        else{
            dbError.value = err.response.data.message
        }
        console.log(err);
    });
}
const createBuyingOrder = (req : any) => {
    isLoading.value = true
    console.log(req);
    axios.post('http://127.0.0.1:8000/api/createBuyingOrder' , req).then((result) => {
        createdProduct.value = result.data.product
        isLoading.value = false
        isErrorReturned.value = false
        createdSuccessfully.value= true
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        createdSuccessfully.value= false
        setTimeout(() => {
            isDialogVisible.value = true            
        }, 1000);
    }).catch((err) => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        isLoading.value = false
        isErrorReturned.value = true
        dbError.value = err.response.data.message
        console.log(err);
    });
}

const calculateTotalPrcie = (type : 'new' | 'exists') => {
    if(type == 'new'){
        if(!productValues.value.product_cost || !productValues.value.product_count){
            return
        }
        productValues.value.total_price = parseFloat(productValues.value.product_cost) * parseFloat(productValues.value.product_count)
    }
    else{
        console.log('exists');
        if(!productValues.value.count || !productValues.value.product_id){
            return
        }
        const filteredProduct = allProducts.value.filter((product : any) => product.id == productValues.value.product_id) 
        if(filteredProduct.length > 0){
            productValues.value.total_price = parseFloat(filteredProduct[0].product_cost) * parseFloat(productValues.value.count)
            console.log(productValues.value.total_price);
        }
    }
}
const getProducts = () => {
    axios.get('http://127.0.0.1:8000/api/products').then((result) => {
        allProducts.value = result.data.products
        result.data.products.forEach((product : any) => {
            productsOptions.value.push({label : `${product.product_name} - ${product.product_count} قطع متاحة` , value : product.id})
        });
        console.log(productsOptions.value , 'products result');
        isFetched.value = true
    }).catch((err) => {
        console.log(err);
    });
}

const getProductSections = () => {
    axios.get('http://127.0.0.1:8000/api/productSections').then((result) => {
         result.data.sections.forEach((section : any) => {
            Sections.value.push({label : section.section_name , value : section.id})
         });
         sectionsFetched.value = true
    }).catch((err) => {
        console.log(err.response.data);
    });
}


const handleDialogClosed = () => {
    if(!stayAtTheSamePage.value) {
        push('/products')
    }
    else{
        setTimeout(() => {
            location.reload()
        }, 500);
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
                getProducts()
                getProductSections()
            })
        } 
        else{
            getProducts()
            getProductSections()
        }  
    })
})

</script>
<template>
    <Dialog v-model:visible="isDialogVisible" @after-hide="handleDialogClosed" modal header="بيانات المنتج" :style="{ width: '50vw' }">
        <div class="flex align-items-center justify-content-center">
            <div class="flex align-items-center mx-5 justify-content-center flex-column">
                <div class="flex align-items-center my-2">
                    <span class="material-symbols-outlined mx-1 text-2xl">
                        wysiwyg
                    </span>
                    <h4>المنتج</h4>
                </div>
                <p>{{ createdProduct.product_name }}</p>
            </div>
            <div class="flex align-items-center mx-5 justify-content-center flex-column">
                <div class="flex align-items-center my-2">
                    <h4>الكمية المتوفرة</h4>
                    <span class="material-symbols-outlined text-2xl">
                        inventory_2
                    </span>
                </div>
                <p>{{ createdProduct.product_count }}</p>
            </div>
            <div class="flex align-items-center mx-5 justify-content-center flex-column">
                <div class="flex align-items-center my-2">
                    <span class="material-symbols-outlined mx-1 text-2xl">
                        monetization_on
                    </span>
                    <h4>سعر الشراء</h4>
                </div>
                <p v-if="productValues.product_count">{{ productValues.total_price }} ج.م / {{ productValues.product_count }} قطع</p>
                <p v-else>{{ productValues.total_price }} ج.م / {{ productValues.count }} قطع</p>
            </div>
        </div>
        <template #footer>
            <Button label="تم" class="px-4 py-1" @click="isDialogVisible = false" autofocus />
        </template>
    </Dialog>
    <div class="w-12 md:w-10 m-auto p-2 md:p-5 branches">
        <div class="flex justify-content-center mt-5 pt-5 m-auto" style="direction: rtl;">
            <SelectButton v-model="optionValue" :options="optionsAvail" aria-labelledby="basic" />
        </div>
        <h1 v-if="optionValue == 'منتج جديد'" class="p-4 text-center textColor">تسجيل منتج جديد</h1>
        <h1 v-else class="p-4 text-center textColor">شراء كمية من منتج موجود</h1>
        <div class="w-8 my-4 m-auto">
            <success-msg v-if="createdSuccessfully" class="fadeinright animation-duration-1000 animation-iteration-1 "></success-msg>
            <h5 v-if="isErrorReturned" class="px-3 py-2 textColor text-center borderRound error">{{ dbError }}</h5>
        </div>
        <div v-if="optionValue == 'منتج جديد' && sectionsFetched">
            <FormKit type="form" v-model="productValues" :actions="false" @submit="createProduct">
                <div class="flex grid w-full">
                <div class="mt-3 col-12">
                    <div class="flex align-items-center">
                        <label for="name" class="px-3 py-1 text-white text-sm">اسم المنتج</label>
                    </div>
                    <FormKit prefix-icon="text" id="name" type="text" label="اسم المنتج" placeholder="أدخل اسم المنتج" name="product_name" validation="required|length:2" />
                </div>
                <div class="mt-3 col-12">
                    <div class="flex align-items-center">
                        <label for="product" class="px-3 py-1 text-white text-sm">القسم</label>
                    </div>
                    <FormKit type="dropdown" id="product" name="product_section_id" label="المنتجات" placeholder="اختر القسم لهذا المنتج" :options="Sections" />
                </div>
                    <div class="mt-3 col-12 md:col-6">
                        <div class="flex align-items-center">
                            <label for="price" class="px-3 py-1 text-white text-sm">سعر بيع المنتج</label>
                        </div>
                        <FormKit prefix-icon="dollar" id="price" type="number" number="float" label="سعر المنتج" placeholder="أدخل سعر المنتج" name="product_price" validation="required|min:0" />
                    </div>
                    <div class="mt-3 col-12 md:col-6">
                        <div class="flex align-items-center">
                            <label for="price" class="px-3 py-1 text-white text-sm">تكلفة المنتج ( الجملة )</label>
                        </div>
                        <FormKit prefix-icon="dollar" id="price" type="number" number="float" label="تكلفة المنتج" placeholder="أدخل تكلفة المنتج" name="product_cost" validation="required|min:0" />
                    </div>
                    <div class="mt-3 col-12 md:col-12">
                        <div class="flex align-items-center">
                            <label for="count" class="px-3 py-1 text-white text-sm">الكمية المتوفرة / كمية الشراء</label>
                        </div>
                        <FormKit prefix-icon="number" id="count" type="number" number="integer" label="كمية المنتج" placeholder="أدخل الكمية المتوفرة من المنتج" name="product_count" validation="min:0" />
                    </div>
                    <div class="mt-3 col-12 md:col-12">
                        <div class="flex align-items-center">
                            <label for="totalPrice" class="px-3 py-1 text-white text-sm">اجمالي المشتريات</label>
                        </div>
                        <FormKit prefix-icon="dollar" id="totalPrice" type="number" number="integer" label="اجمالي المشتريات" placeholder="أدخل سعر الشراء النهائي للمنتج" name="total_price" validation="min:0" />
                        <Button type="button" label="احسب اجمالي المشتريات" @click="calculateTotalPrcie('new')" />
                    </div>
                </div>
                <div class="flex justify-content-center align-items-center my-3">
                    <InputSwitch v-model="stayAtTheSamePage" />
                    <h4 class="text-sm mx-2 textColor">ابق في نفس الصفحة</h4>
                </div>
                <Button type="submit" class="submitBtn" label="تسجيل" :loading="isLoading" />
            </FormKit>
        </div>
        <div v-else>
            <FormKit v-if="isFetched" type="form" v-model="productValues" :actions="false" @submit="createBuyingOrder">
                <div class="flex grid w-full">
                <div class="mt-3 col-12">
                    <div class="flex align-items-center">
                        <label for="product" class="px-3 py-1 text-white text-sm">المنتجات</label>
                    </div>
                    <FormKit type="dropdown" id="product" name="product_id" label="المنتجات" placeholder="اختر المنتج الذي تريد شراؤه" :options="productsOptions" />
                </div>
                    <div class="mt-3 col-12 md:col-12">
                        <div class="flex align-items-center">
                            <label for="count" class="px-3 py-1 text-white text-sm">كمية الشراء</label>
                        </div>
                        <FormKit prefix-icon="number" id="count" type="number" number="integer" label="كمية المنتج" placeholder="أدخل الكمية التي تريد شراؤها من المنتج" name="count" validation="min:0" />
                    </div>
                    <div class="mt-3 col-12 md:col-12">
                        <div class="flex align-items-center">
                            <label for="totalPrice" class="px-3 py-1 text-white text-sm">سعر الشراء النهائي</label>
                        </div>
                        <FormKit prefix-icon="dollar" id="totalPrice" type="number" number="integer" label="كمية المنتج" placeholder="أدخل سعر الشراء النهائي للمنتج" name="total_price" validation="min:0" />
                        <Button type="button" label="احسب اجمالي المشتريات" @click="calculateTotalPrcie('exists')" />
                    </div>
                </div>
                <div class="flex justify-content-center align-items-center my-3">
                    <InputSwitch v-model="stayAtTheSamePage" />
                    <h4 class="text-sm mx-2 textColor">ابق في نفس الصفحة</h4>
                </div>
                <Button type="submit" class="submitBtn" label="حفظ" :loading="isLoading" />
            </FormKit>
        </div>
    </div>
</template>
<style>
.formkit-listbox .formkit-listitem .formkit-selected-icon {
    padding: 1.2vh;
    border-radius: 5px;
}
.formkit-legend{
    color: white;
    font-family: 'Lato', sans-serif;
    font-family: 'Lemonada', cursive;
}
.repeater .formkit-outer {
    margin: 0;
}
.branches li.formkit-item{
    border: none !important;
    background-color: rgba(255, 255, 255, 0.03);
}
.formkit-placeholder {
    font-family: 'Lato', sans-serif;
    font-family: 'Lemonada', cursive;
    font-size: 12px !important;
}
.branches .formkit-controls>li {
    margin: 0;
}
.branches .formkit-move-up-icon , .formkit-move-down-icon , .formkit-remove-icon{
    padding: 1vh;    
}
.branches  ul.formkit-controls , ul.formkit-controls button{
    background: none;
    color: white;
  }
.branches .formkit-controls>li>button:disabled {
    color: var(--fk-color-disabled);
    cursor: default;
  }
  
.branches .formkit-wrapper{
    max-width: 100%;
}
.formkit-outer .formkit-icon {
    color: white;
    width: 3.2rem !important;
    background: var(--background) !important;
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

@media screen and (max-width : 750px){
    .formkit-form{
        width: 90%;
    }    
}
@media screen and (max-width : 570px){
    .formkit-form{
        width: 100% !important;

    }
    .Column{
        flex-direction: column !important;
        margin: auto !important;
        width: 95% !important;
    }
    .width90{
        width: 90% !important;
    }
    .marginBtm{
        margin-bottom: 5vh !important;
    }
    .widthFull{
        width: 100% !important;
    }
    .formkit-message{
        font-size: 13px;
    }
    .padding1{
        padding: 1.5vh !important;
    }    
    .paddingTop{
        padding-top: 3.8vh !important;
        padding-bottom: 10vh !important;
    }
    .font21{
        font-size: 21px;
    }
}
</style>