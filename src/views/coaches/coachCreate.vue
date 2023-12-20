<script setup lang="ts">
import axios from 'axios';
import { ref, onBeforeMount } from 'vue';
import Button from 'primevue/button';
import { useRouter } from 'vue-router';
import successMsg from '../../components/successMsg.vue';
import { adminAuthorize } from '@/global-functions/checkUserRole';
import { employeeAuthorize } from '@/global-functions/isEmployeeAuthorized';
import InputSwitch from 'primevue/inputswitch';
import Dialog from 'primevue/dialog';
import { isEmpAuthorizedFor } from '@/global-functions/isEmployeeAuthorizedFor';
import type { Ref } from 'vue';
const { push , currentRoute } = useRouter();

const branches : any = ref([])
const createdSuccessfully = ref(false)
const isErrorReturned = ref(false)
const stayAtTheSamePage = ref(false)
const isFetched = ref(false)
const dbError = ref()
const isLoading = ref(false)
const createdCoach = ref()
const isDialogVisible = ref(false)

const createCoach = (req : any) => {
    isLoading.value = true
    console.log(req);
    axios.post('http://127.0.0.1:8000/api/createCoach' , req).then((result) => {
        createdCoach.value = result.data.coach
        isLoading.value = false
        isErrorReturned.value = false
        createdSuccessfully.value= true
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        setTimeout(() => {
            isDialogVisible.value = true
            createdSuccessfully.value= false
        }, 1400);
    }).catch((err) => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        isLoading.value = false
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
const getBranches = () => {
    axios.get('http://127.0.0.1:8000/api/branches').then((result) => {
        console.log(result.data);
        result.data.branches.forEach((branch : any) => {
            branches.value.push({label : branch.branch_name , value : branch.id})
        });
        isFetched.value = true
    }).catch((err) => {
        console.log(err);
    });
}

const handleDialogClosed = () => {
    if(!stayAtTheSamePage.value) {
        push('/coaches')
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
                    console.log('not employee');
                    push({path : '/login', query : currentRoute.value.query})
                }
                empPermissions.value = employee.permissions
                UserType.value = 'employee'
                if(!isEmpAuthorizedFor(empPermissions.value , 'تسجيل و تعديل المدربين' , UserType.value)){
                    localStorage.removeItem('SwimmingToken')
                    console.log('not authorized');
                    location.reload()
                    push({path : '/login', query : currentRoute.value.query})
                }
                console.log(empPermissions.value);
                getBranches()
            })
        }
        else{
            getBranches()
        }
    })
})

</script>
<template>
    <Dialog v-model:visible="isDialogVisible" @after-hide="handleDialogClosed" modal header="بيانات المدرب" :style="{ width: '50vw' }">
        <div class="flex align-items-center justify-content-center">
            <div class="flex align-items-center mx-5 justify-content-center flex-column">
                <div class="flex align-items-center my-2">
                    <span class="material-symbols-outlined mx-1 text-2xl">
                        tag
                    </span>
                    <h4>الكود</h4>
                </div>
                <p>{{ createdCoach.id }}</p>
            </div>
            <div class="flex align-items-center mx-5 justify-content-center flex-column">
                <div class="flex align-items-center my-2">
                    <h4>الاسم</h4>
                    <span class="material-symbols-outlined text-2xl">
                        scuba_diving
                    </span>
                </div>
                <p>كابتن / {{ createdCoach.name }}</p>
            </div>
            <div class="flex align-items-center mx-5 justify-content-center flex-column">
                <div class="flex align-items-center my-2">
                    <span class="material-symbols-outlined mx-1 text-2xl">
                        monetization_on
                    </span>
                    <h4>الراتب</h4>
                </div>
                <p>{{ createdCoach.salary_per_hour.toFixed(2) }} ج.م / ساعة</p>
            </div>
        </div>
        <template #footer>
            <Button label="تم" class="px-4 py-1" @click="isDialogVisible = false" autofocus />
        </template>
    </Dialog>
    <div class="w-12 md:w-10 m-auto p-2 md:p-5 branches">
        <h1 class="p-4 text-center textColor">تسجيل مدرب جديد</h1>
        <div class="w-8 m-auto">
            <success-msg v-if="createdSuccessfully" class="fadeinright animation-duration-1000 animation-iteration-1 "></success-msg>
            <h5 v-if="isErrorReturned" class="px-3 py-2 textColor text-center borderRound error">{{ dbError }}</h5>
        </div>
        <div v-if="isFetched">
            <FormKit type="form" :actions="false" @submit="createCoach">
                <div class="flex grid w-full">
                <div class="mt-3 col-12">
                    <div class="flex align-items-center">
                        <label for="name" class="px-3 py-1 text-white text-sm">اسم المدرب</label>
                    </div>
                    <FormKit prefix-icon="avatarMan" id="name" type="text" label="اسم المدرب" placeholder="أدخل اسم المدرب" name="name" validation="required|length:2" />
                </div>
                    <div class="mt-3 col-12 md:col-6">
                        <div class="flex align-items-center">
                            <label for="mail" class="px-3 py-1 text-white text-sm">البريد الالكتروني</label>
                        </div>
                        <FormKit prefix-icon="email" id="mail" type="email" label="البريد الالكتروني" placeholder="أدخل البريد الالكتروني" name="email" validation="required|email" />
                    </div>
                    <div class="mt-3 col-12 md:col-6">
                        <div class="flex align-items-center">
                            <label for="phone" class="px-3 py-1 text-white text-sm">رقم الهاتف</label>
                        </div>
                        <FormKit prefix-icon="telephone" id="phone" type="text" label="رقم الهاتف" placeholder="أدخل رقم هاتف المدرب" name="phone" validation="required|length:10" />
                    </div>
                    <div class="col-12 md:col-6">
                        <div class="flex align-items-center">
                            <label for="Pw" class="px-3 py-1 text-white text-sm">كلمة السر</label>
                        </div>
                        <FormKit prefix-icon="password" id="Pw" type="password" label="كلمة السر" placeholder="أدخل كلمة السر للمدرب" name="password" validation="required|length:8" />
                    </div>
                    <div class="col-12 md:col-6">
                        <div class="flex align-items-center">
                            <label for="salary_per_hour" class="px-3 py-1 text-white text-sm">الراتب في الساعة</label>
                        </div>
                        <FormKit prefix-icon="dollar" id="salary_per_hour" type="text" label="الراتب" placeholder="أدخل الراتب في الساعة للمدرب " number="float" name="salary_per_hour" validation="required|min:1" />
                    </div>
                    <div class="col-12">
                        <div class="flex align-items-center">
                            <label for="address" class="px-3 py-1 text-white text-sm">عنوان المدرب</label>
                        </div>
                        <FormKit prefix-icon="text" id="address" type="textarea" label="العنوان" placeholder="أدخل عنوان للمدرب " name="address" validation="required|length:3" />
                    </div>
                    <div class="col-12">
                        <div class="flex align-items-center">
                            <label for="address" class="px-3 py-1 text-white text-sm">الفروع التي يعمل بها</label>
                        </div>
                        <FormKit type="dropdown" name="branchIds" label="الفروع" placeholder="اختر الفروع التي يعمل بها المدرب" :options="branches" multiple />
                    </div>
                </div>
                <div class="flex justify-content-center align-items-center my-3">
                    <InputSwitch v-model="stayAtTheSamePage" />
                    <h4 class="text-sm mx-2 textColor">ابق في نفس الصفحة</h4>
                </div>
                <Button type="submit" class="submitBtn" label="تسجيل" :loading="isLoading" />
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