<script setup lang="ts">
import axios from 'axios';
import {adminAuthorize} from '../../global-functions/checkUserRole'
import { ref, onBeforeMount, type Ref } from 'vue';
import Button from 'primevue/button';
import successMsg from '../../components/successMsg.vue';
import InputSwitch from 'primevue/inputswitch';
import { useRouter } from 'vue-router';
import { isEmpAuthorizedFor } from '@/global-functions/isEmployeeAuthorizedFor';
import { employeeAuthorize } from '@/global-functions/isEmployeeAuthorized';
const { push , currentRoute } = useRouter();
const categories = ref([{ label: 'React', value: 'react' }, { label: 'Vue', value: 'vue' }, { label: 'Angular', value: 'angular' }, { label: 'Svelte', value: 'svelte' }])
const loading = ref(false)
const categoryData = ref()
const stayAtTheSamePage = ref(false)
const createdSuccessfully = ref(false)
const isErrorReturned = ref(false)
const dbError = ref()

const createAcademy = (req : any) => {
    console.log(req);
    loading.value = true
    axios.post('http://127.0.0.1:8000/api/createAcademy' , req).then((result) => {
        createdSuccessfully.value = true
        isErrorReturned.value = false
        loading.value = false
        if(stayAtTheSamePage.value){
            setTimeout(() => {
                createdSuccessfully.value = false
                location.reload()
            }, 1700);
        }
        else{
            setTimeout(() => {
                push('/academies')
            }, 2500);
        }
    }).catch((err) => {
        isErrorReturned.value = true
        if(err.response.data.message.includes('The academy name has already been taken.')){
            dbError.value = 'هذه الأكاديمية موجودة بالفعل'
            loading.value = false
        }
        else{
            dbError.value = err.response.data.message
            loading.value = false
        }
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
                    push({path : '/login', query : currentRoute.value.query})
                }
                empPermissions.value = employee.permissions
                UserType.value = 'employee'
                if(!isEmpAuthorizedFor(empPermissions.value , 'انشاء أكاديمية' , UserType.value)){
                    localStorage.removeItem('SwimmingToken')
                    push({path : '/login', query : {userType : 'employee'}})
                }
            })
        }   
    })
})
</script>
<template>
    <div class="w-12 md:w-10 m-auto p-2 md:p-5 branches">
        <h1 class="p-4 text-center textColor">انشاء أكاديمية جديدة</h1>
        <div class="w-8 m-auto">
            <successMsg v-if="createdSuccessfully" class="fadeinright animation-duration-1000 animation-iteration-1 "></successMsg>
            <h5 v-if="isErrorReturned" class="px-3 py-2 textColor text-center borderRound error">{{ dbError }}</h5>
        </div>
        <div>
            <FormKit v-model="categoryData" type="form" :actions="false" @submit="createAcademy">
                <div class="mt-3">
                    <div class="flex align-items-center">
                        <label for="academy_name" class="px-3 py-1 text-white text-sm">اسم الأكاديمية</label>
                    </div>
                    <FormKit prefix-icon="text" id="academy_name" type="text" label="اسم الأكاديمية" placeholder="أدخل اسم الأكاديمية" name="academy_name" validation="required|length:2" />
                </div>
                <div class="flex justify-content-center align-items-center">
                    <InputSwitch v-model="stayAtTheSamePage" />
                    <h4 class="text-sm mx-2 textColor">ابق في نفس الصفحة</h4>
                </div>
                <Button type="submit" class="submitBtn" label="انشاء" :loading="loading" />
            </FormKit>
        </div>
    </div>
</template>
<style>
.formkit-placeholder {
    font-family: 'Lato', sans-serif;
    font-family: 'Lemonada', cursive;
    font-size: 12px !important;
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