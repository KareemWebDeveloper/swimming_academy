<script setup lang="ts">
import { FormKit } from '@formkit/vue';
import Button from 'primevue/button';
import { onBeforeMount , ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios'
const { push , currentRoute } = useRouter();
const userType = ref()
const loading = ref(false)
const adminLoginError = ref(false)
const coachLoginError = ref(false)
const employeeLoginError = ref(false)
const customerLoginError = ref(false)
const internalServerError = ref(false)
onBeforeMount(() => {
    if(!currentRoute.value.query.userType){
        userType.value = 'admin'
    }
    if(currentRoute.value.query.userType == 'coach'){
        userType.value = 'coach'
    }
    if(currentRoute.value.query.userType == 'employee'){
        userType.value = 'employee'
    }
    if(currentRoute.value.query.userType == 'customer'){
        userType.value = 'customer'
    }
})

const handleViewPassword = (node : any, e : any) => {
    node.props.suffixIcon = node.props.suffixIcon === 'eye' ? 'eyeClosed' : 'eye'
    node.props.type = node.props.type === 'password' ? 'text' : 'password'
}

const adminLogin = (req : any) => {
    loading.value = true
    axios.post('https://akademia.website/api/adminLogin' , req).then((result) => {
        console.log(result);
        adminLoginError.value = false
        internalServerError.value = false
        loading.value = false
        let token = result.data.Token 
        // let encryptedToken = AES.encrypt(token , 'EncryptionKey_swimmingAcademy').toString()
        localStorage.setItem('SwimmingToken' , token)
        push('/')
    }).catch((err) => {
        loading.value = false
        if(err.response.data.message.includes('email or password not correct')){
            adminLoginError.value = true
        }
        else{
            internalServerError.value = true
        }
    });
} 

const coachLogin = (req : any) => {
    loading.value = true
    axios.post('https://akademia.website/api/coachLogin' , req).then((result) => {
        console.log(result);
        coachLoginError.value = false
        internalServerError.value = false
        loading.value = false
        let token = result.data.Token 
        // let encryptedToken = AES.encrypt(token , 'EncryptionKey_swimmingAcademy').toString()
        localStorage.setItem('SwimmingToken' , token)
        push({path : '/coach/profile' , query : {userType : 'coach'}})
    }).catch((err) => {
        loading.value = false
        if(err.response.data.message.includes('id or password not correct')){
            coachLoginError.value = true
        }
        else{
            internalServerError.value = true
        }
    });
} 
const employeeLogin = (req : any) => {
    loading.value = true
    axios.post('https://akademia.website/api/employeeLogin' , req).then((result) => {
        console.log(result);
        employeeLoginError.value = false
        internalServerError.value = false
        loading.value = false
        let token = result.data.Token 
        // let encryptedToken = AES.encrypt(token , 'EncryptionKey_swimmingAcademy').toString()
        localStorage.setItem('SwimmingToken' , token)
        push('/')
    }).catch((err) => {
        loading.value = false
        if(err.response.data.message.includes('id or password not correct')){
            employeeLoginError.value = true
        }
        else{
            internalServerError.value = true
        }
    });
} 
const customerLogin = (req : any) => {
    loading.value = true
    axios.post('https://akademia.website/api/customerLogin' , req).then((result) => {
        console.log(result);
        customerLoginError.value = false
        internalServerError.value = false
        loading.value = false
        let token = result.data.Token 
        // let encryptedToken = AES.encrypt(token , 'EncryptionKey_swimmingAcademy').toString()
        localStorage.setItem('SwimmingToken' , token)
        push({path : '/customer/profile' , query : {userType : 'customer'} })
    }).catch((err) => {
        loading.value = false
        if(err.response.data.message.includes('id is not correct')){
            customerLoginError.value = true
        }
        else{
            internalServerError.value = true
        }
    });
} 
</script>
<template>
    <div class="flex w-full align-items-center justify-content-center lg:justify-content-start">
        <img src="../assets/swimming_bg(1).jpg" class="max-h-screen hidden lg:flex" alt="">
        <div v-if="userType == 'admin'" class="marginnnx w-11 lg:w-3 m-auto">
            <h1 class="text-center py-5 lg:py-2 textColor">أكاديمية السباحة</h1>
            <br class="bg-white w-2 h-1">
            <FormKit type="form" :actions="false" @submit="adminLogin">
            <h5 v-if="adminLoginError" class="px-3 py-2 textColor text-center borderRound error">اسم المستخدم او كلمة المرور غير صحيح</h5>
            <h5 v-if="internalServerError" class="px-3 py-2 textColor text-center borderRound error">خطأ في الخادم الداخلي</h5>
                <div class="mt-3">
                    <div class="flex align-items-center">
                        <!-- <span class="material-symbols-outlined text-3xl">alternate_email</span> -->
                        <label for="username" class="px-3 py-1 text-white text-sm">اسم المستخدم</label>
                    </div>
                    <FormKit prefix-icon="people" id="username" type="text" label="اسم المستخدم" placeholder="أدخل اسم المستخدم" name="username" validation="required" />
                </div>

                <div class="mt-3">
                    <div class="flex align-items-center">
                        <!-- <span class="material-symbols-outlined text-3xl">vpn_key</span> -->
                        <label for="pw" class="px-3 py-1 text-white text-sm">كلمة السر</label>
                    </div>
                    <FormKit type="password" prefix-icon="password" suffix-icon="eyeClosed" @suffix-icon-click="handleViewPassword"
                    suffix-icon-class="hover:text-blue-500"  id="pw" label="كلمة السر" placeholder="أدخل كلمة السر" name="password" validation="required|password" />
                </div>
                <Button type="submit" class="submitBtn" label="تسجيل الدخول" :loading="loading" />
            </FormKit>
        </div>
        <div v-if="userType == 'coach'" class="marginnnx w-11 lg:w-3 m-auto">
                <h1 class="text-center py-5 lg:py-2 textColor">أكاديمية السباحة</h1>
                <br class="bg-white w-2 h-1">
                <h5 v-if="coachLoginError" class="px-3 py-2 textColor text-center borderRound error">كود المدرب او كلمة المرور غير صحيح</h5>
                <h5 v-if="internalServerError" class="px-3 py-2 textColor text-center borderRound error">خطأ في الخادم الداخلي</h5>
                <FormKit type="form" :actions="false" @submit="coachLogin">
                <div class="mt-3">
                    <div class="flex align-items-center">
                        <label for="emaill" class="px-3 py-1 text-white text-sm">كود المدرب</label>
                    </div>
                    <FormKit prefix-icon="number" id="emaill" type="text" label="كود المدرب" placeholder="أدخل الكود الخاص بك" name="id" validation="required" />
                </div>

                <div class="mt-3">
                    <div class="flex align-items-center">
                        <label for="pw" class="px-3 py-1 text-white text-sm">كلمة السر</label>
                    </div>
                    <FormKit type="password" prefix-icon="password"  suffix-icon="eyeClosed" @suffix-icon-click="handleViewPassword"
                    suffix-icon-class="hover:text-blue-500" id="pw" label="كلمة السر" placeholder="أدخل كلمة السر" name="password" validation="required|password" />
                </div>
                <Button type="submit" class="submitBtn" label="تسجيل الدخول" :loading="loading" />
            </FormKit>
        </div>
        <div v-if="userType == 'employee'" class="marginnnx w-11 lg:w-3 m-auto">
                <h1 class="text-center py-5 lg:py-2 textColor">أكاديمية السباحة</h1>
                <br class="bg-white w-2 h-1">
                <h5 v-if="employeeLoginError" class="px-3 py-2 textColor text-center borderRound error">كود الموظف او كلمة المرور غير صحيح</h5>
                <h5 v-if="internalServerError" class="px-3 py-2 textColor text-center borderRound error">خطأ في الخادم الداخلي</h5>
                <FormKit type="form" :actions="false" @submit="employeeLogin">
                <div class="mt-3">
                    <div class="flex align-items-center">
                        <label for="emp_id" class="px-3 py-1 text-white text-sm">كود الموظف</label>
                    </div>
                    <FormKit prefix-icon="number" id="emp_id" type="text" label="كود الموظف" placeholder="أدخل الكود الخاص بك" name="id" validation="required" />
                </div>

                <div class="mt-3">
                    <div class="flex align-items-center">
                        <label for="pw" class="px-3 py-1 text-white text-sm">كلمة السر</label>
                    </div>
                    <FormKit type="password" prefix-icon="password" suffix-icon="eyeClosed" @suffix-icon-click="handleViewPassword"
                    suffix-icon-class="hover:text-blue-500"  id="pw" label="كلمة السر" placeholder="أدخل كلمة السر" name="password" validation="required|password" />
                </div>
                <Button type="submit" class="submitBtn" label="تسجيل الدخول" :loading="loading" />
            </FormKit>
        </div>
        <div v-if="userType == 'customer'" class="marginnnx w-11 lg:w-3 m-auto">
                <h1 class="text-center py-5 lg:py-2 textColor">أكاديمية السباحة</h1>
                <br class="bg-white w-2 h-1">
                <h5 v-if="customerLoginError" class="px-3 py-2 textColor text-center borderRound error">كود اللاعب غير صحيح</h5>
                <h5 v-if="internalServerError" class="px-3 py-2 textColor text-center borderRound error">خطأ في الخادم الداخلي</h5>
                <FormKit type="form" :actions="false" @submit="customerLogin">
                <div class="mt-3">
                    <div class="flex align-items-center">
                        <label for="emaill" class="px-3 py-1 text-white text-sm">كود اللاعب</label>
                    </div>
                    <FormKit prefix-icon="number" id="emaill" type="text" label="كود اللاعب" placeholder="أدخل الكود الخاص بك" name="id" validation="required" />
                </div>
                <Button type="submit" class="submitBtn" label="تسجيل الدخول" :loading="loading" />
            </FormKit>
        </div>
    </div>
</template>
<style>
.formkit-outer .formkit-icon {
    color: white;
    width: 3.2rem !important;
    background: var(--background) !important;
}
.formkit-outer .formkit-icon svg {
    max-width: 2em;
}
.formkit-icon.formkit-suffix-icon{
    width: 2.2rem !important;
}
.formkit-input{
    padding: 1.8vh;
    margin: auto;
    border: none;
    border-radius: 3px;
    width: 100%;
    font-size: 13px;
    border: 1.4px solid rgba(0, 0, 0, 0.696);
    background-color: rgba(255, 255, 255, 0.723);
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
    width: 100%;
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
        width: 95% !important;

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