<script setup lang="ts">
import axios from 'axios';
import { ref, onBeforeMount , watch, computed } from 'vue';
import type {Ref} from 'vue'
import Button from 'primevue/button';
import { useRouter } from 'vue-router';
import successMsg from '../../components/successMsg.vue';
import { adminAuthorize } from '@/global-functions/checkUserRole';
import { employeeAuthorize } from '@/global-functions/isEmployeeAuthorized';
import InputSwitch from 'primevue/inputswitch';
import Dialog from 'primevue/dialog';
const { push , currentRoute } = useRouter();


const createdSuccessfully = ref(false)
const isReservationOnly = ref(false)
const createdSubscription = ref()
const createCustomerSubscription = ref(false)
const isErrorReturned = ref(false)
const isSubscriptionLoading = ref(false)
const reservedCustomerId = ref()
const dbError = ref()
const isLoading = ref(false)
const createdCustomer = ref()

const isDialogVisible = ref(false)

const createCustomer = (req : any) => {
    isSubscriptionLoading.value = true
    req.customer_name = req.fname + ' ' + req.sname + ' ' + req.thirdName
    req.birthdate = new Date(req.birthdate);
    req.birthdate = req.birthdate.toISOString().substr(0, 19).replace('T', ' ');
    axios.post('https://akademia.website/api/unauthorized/customer/create' , req).then((result) => {
        createdCustomer.value = result.data.customer
        isSubscriptionLoading.value = false
        isErrorReturned.value = false
        isDialogVisible.value = true
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }).catch((err) => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        isSubscriptionLoading.value = false
        isErrorReturned.value = true
        if(err.response.data.message.includes('The phone has already been taken')){
            dbError.value = 'هذا الهاتف موجود بالفعل'
        }
        else if(err.response.data.message.includes('The email has already been taken')){
            dbError.value = 'هذا البريد الالكتروني موجود بالفعل'
        }
        else{
            dbError.value = err.response.data.message
        }
        console.log(err);
    });
}


const handleDialogClosed = () => {
    location.reload()
}

onBeforeMount(() => {

})

</script>
<template>
    <Dialog v-model:visible="isDialogVisible" @after-hide="handleDialogClosed" modal header="بيانات الحجز" :style="{ width: '58vw' }" :breakpoints="{ '960px': '75vw', '641px': '100vw' }">
        <div class="flex py-3 md:py-0 grid align-items-center justify-content-center">
            <div class="col flex align-items-center text-center mx-5 justify-content-center flex-column">
                <div class="flex align-items-center my-2">
                    <span class="material-symbols-outlined mx-1 text-2xl">
                        tag
                    </span>
                    <h4>الكود</h4>
                </div>
                <p>{{ createdCustomer.id }}</p>
            </div>
            <div class="col flex align-items-center text-center mx-5 justify-content-center flex-column">
                <div class="flex align-items-center my-2">
                    <h4>الاسم</h4>
                    <span class="material-symbols-outlined text-2xl">
                        scuba_diving
                    </span>
                </div>
                <p>{{ createdCustomer.customer_name }}</p>
            </div>
            <div class="col flex align-items-center text-center mx-5 justify-content-center flex-column">
                <div class="flex align-items-center my-2">
                    <span class="material-symbols-outlined mx-1 text-2xl">
                        phone_in_talk
                    </span>
                    <h4>رقم الهاتف</h4>
                </div>
                <p>{{ createdCustomer.customer_phone }}</p>
            </div>
        </div>
        <template #footer>
            <Button label="تم" class="px-4 py-1" @click="isDialogVisible = false" autofocus />
        </template>
    </Dialog>
    <div class="w-12 md:w-10 m-auto p-2 md:p-5 customers">
        <h1 class="p-4 text-center textColor">سجل بياناتك</h1>
        <div class="w-8 m-auto">
            <success-msg v-if="createdSuccessfully" class="fadeinright animation-duration-1000 animation-iteration-1 "></success-msg>
            <h5 v-if="isErrorReturned" class="px-3 py-2 textColor text-center borderRound error">{{ dbError }}</h5>
        </div>
        <div>
            <!-- Customer Create Form -->
            <FormKit type="form" :actions="false" @submit="createCustomer">
                <div class="flex grid w-full">
                    <div class="flex grid w-full col-12">
                        <div class="mt-3 md:col-6 col-12">
                            <div class="flex align-items-center">
                                <label for="name" class="px-3 py-1 text-white text-sm">الاسم الأول</label>
                            </div>
                            <FormKit prefix-icon="avatarMan" id="name" type="text" label="الاسم الأول للمشترك" placeholder="أدخل اسم المشترك الأول" name="fname" validation="required|length:2" />
                        </div>
                        <div class="mt-3 md:col-6 col-12">
                            <div class="flex align-items-center">
                                <label for="name" class="px-3 py-1 text-white text-sm">الاسم الثاني</label>
                            </div>
                            <FormKit prefix-icon="avatarMan" id="name" type="text" label="اسم الثاني للمشترك" placeholder="أدخل اسم المشترك الثاني" name="sname" validation="required|length:2" />
                        </div>
                        <div class="mt-3 col-12">
                            <div class="flex align-items-center">
                                <label for="name" class="px-3 py-1 text-white text-sm">اللقب</label>
                            </div>
                            <FormKit prefix-icon="avatarMan" id="name" type="text" label="لقب المشترك" placeholder="أدخل لقب المشترك" name="thirdName" validation="required|length:2" />
                        </div>
                    </div>
                    <div class="mt-3 col-12 md:col-6">
                        <div class="flex align-items-center">
                            <label for="mail" class="px-3 py-1 text-white text-sm">البريد الالكتروني</label>
                        </div>
                        <FormKit prefix-icon="email" id="mail" type="email" label="البريد الالكتروني" placeholder="أدخل البريد الالكتروني" name="customer_email" validation="required|email" />
                    </div>
                    <div class="mt-3 col-12 md:col-6">
                        <div class="flex align-items-center">
                            <label for="phone" class="px-3 py-1 text-white text-sm">رقم الهاتف</label>
                        </div>
                        <FormKit prefix-icon="telephone" id="phone" type="text" label="رقم الهاتف" placeholder="أدخل رقم هاتف المشترك" name="customer_phone" validation="required|length:10" />
                    </div>
                    <div class="col-12 md:col-6">
                        <div class="flex align-items-center">
                            <label for="birthdate" class="px-3 py-1 text-white text-sm">تاريخ الميلاد</label>
                        </div>
                        <FormKit
                        type="datepicker"
                        name="birthdate"
                        label="تاريخ الميلاد"
                        id="birthdate"
                        validation="required"
                        :format="{ date: 'short' }"
                      />
                    </div>
                    <div class="col-12 md:col-6">
                        <div class="flex align-items-center">
                            <label for="job" class="px-3 py-1 text-white text-sm">الوظيفة</label>
                        </div>
                        <FormKit prefix-icon="text" id="job" type="text" label="الوظيفة" placeholder="أدخل وظيفة المشترك " name="job" validation="required" />
                    </div>
                    <div class="col-12">
                        <div class="flex align-items-center">
                            <label for="address" class="px-3 py-1 text-white text-sm">عنوان المشترك</label>
                        </div>
                        <FormKit prefix-icon="text" id="address" type="textarea" label="العنوان" placeholder="أدخل عنوان " name="customer_address" validation="required|length:3" />
                    </div>
                    <div class="col-12">
                        <div class="flex align-items-center">
                            <label for="gender" class="px-3 py-1 text-white text-sm">الجنس</label>
                        </div>
                        <FormKit id="gender" type="dropdown" :options="[{label : 'ذكر' , value : 'male'},{label : 'أنثي' , value : 'female'} ]" label="الجنس" placeholder="أختر جنس المشترك " name="gender" validation="required" />
                    </div>
                </div>
                <Button type="submit" class="submitBtn" label="حفظ" :loading="isSubscriptionLoading" />
            </FormKit>
        </div>
    </div>
</template>
<style>
.formkit-panel-wrapper{
    direction: ltr !important;
}
.borderRight{
    border-right: solid 3px white;
}
.dialogForm .formkit-form {
    width: 95% !important;
}
[data-type="checkbox"] .formkit-input ~ .formkit-decorator .formkit-icon{
    background: none !important;
}
[data-type="checkbox"] .formkit-input{
    left: auto;
}
.activeButton{
    background-color: #009a33 !important;
}
.subscription .repeater .formkit-outer {
    margin: 0;
}
.subscription .repeater .formkit-label{
    display: flex;
    padding: 2vh;
    color: white;
    font-family: 'Lato', sans-serif;
    font-family: 'Lemonada', cursive;
}
.subscription .formkit-controls>li {
    margin: 0;
}
.subscription .formkit-move-up-icon , .formkit-move-down-icon , .formkit-remove-icon{
    padding: 1vh;    
}
.subscription  ul.formkit-controls , ul.formkit-controls button{
    background: none;
    color: white;
}
.subscription .formkit-controls>li>button:disabled {
    color: var(--fk-color-disabled);
    cursor: default;
  }
.subscription .formkit-listbox .formkit-listitem .formkit-selected-icon {
    padding: 1.2vh;
    border-radius: 5px;
}
.repeater .formkit-outer .formkit-icon {
    color: white;
    width: 3.2rem !important;
    background: var(--background) !important;
}
.formkit-legend{
    color: white;
    font-family: 'Lato', sans-serif;
    font-family: 'Lemonada', cursive;
}
.repeater .formkit-outer {
    margin: 0;
}
li.formkit-item{
    border: none !important;
    background-color: rgba(255, 255, 255, 0.03);
}
.formkit-placeholder {
    font-family: 'Lato', sans-serif;
    font-family: 'Lemonada', cursive;
    font-size: 12px !important;
}
 .formkit-controls>li {
    margin: 0;
}
 .formkit-move-up-icon , .formkit-move-down-icon , .formkit-remove-icon{
    padding: 1vh;    
}
  ul.formkit-controls , ul.formkit-controls button{
    background: none;
    color: white;
  }
 .formkit-controls>li>button:disabled {
    color: var(--fk-color-disabled);
    cursor: default;
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

@media screen and (max-width : 750px){
    .formkit-form{
        width: 90%;
    }    
}
@media screen and (max-width : 570px){
    .borderRight{
        border: none !important;
    }
    .dialogForm .formkit-form {
        width: 100% !important;
    }
    .p-dialog .p-dialog-content {
        padding: 0;
    }
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