<script setup lang="ts">
import axios from 'axios';
import { ref, onBeforeMount, type Ref } from 'vue';
import Button from 'primevue/button';
import { useRouter } from 'vue-router';
import successMsg from '../../components/successMsg.vue';
import { adminAuthorize } from '@/global-functions/checkUserRole';
import { employeeAuthorize } from '@/global-functions/isEmployeeAuthorized';
import InputSwitch from 'primevue/inputswitch';
import { isEmpAuthorizedFor } from '@/global-functions/isEmployeeAuthorizedFor';
const { push , currentRoute } = useRouter();

const LevelId = parseInt(currentRoute.value.params.id as string) 
const level : any = ref()
const createdSuccessfully = ref(false)
const isErrorReturned = ref(false)
const stayAtTheSamePage = ref(false)
const isFetched = ref(false)
const dbError = ref()
const isLoading = ref(false)

const updateLevel = (req : any) => {
    isLoading.value = true
    console.log(req);
        axios.post(`http://127.0.0.1:8000/api/updateLevel/${LevelId}` , req).then((result) => {
            console.log(result.data);
            isLoading.value = false
            isErrorReturned.value = false
            createdSuccessfully.value= true
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
            if(stayAtTheSamePage.value){
                setTimeout(() => {
                    location.reload()
                }, 1600);
            }
            else{
                setTimeout(() => {
                    push('/levels')
                }, 1600);
            }
        }).catch((err) => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
            isLoading.value = false
            isErrorReturned.value = true
            if(err.response.data.message.includes('The level name has already been taken')){
                dbError.value = 'هذا المستوي موجود بالفعل'
            }
            else if(err.response.data.message.includes('The sublevel name has already been taken')){
                dbError.value = 'هناك مستوي الفرعي موجود بالفعل'
            }
            else    {
                dbError.value = err.response.data.message
            }
            console.log(err);
        });
}

const getLevel = () => {
    axios.get(`http://127.0.0.1:8000/api/level/${LevelId}`).then((result) => {
        console.log(result.data);
        level.value = result.data.level
        isFetched.value = true
    }).catch((err) => {
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
                if(!isEmpAuthorizedFor(empPermissions.value , 'المستويات' , UserType.value)){
                    localStorage.removeItem('SwimmingToken')
                    push({path : '/login', query : {userType : 'employee'}})
                }
                getLevel()
            })
        }
        else{
            getLevel()
        }
    })
})
</script>
<template>
    <div class="w-12 md:w-10 m-auto p-2 md:p-5 branches">
        <h1 class="p-4 text-center textColor">انشاء مستوي جديد</h1>
        <div class="w-8 m-auto">
            <success-msg v-if="createdSuccessfully" class="fadeinright animation-duration-1000 animation-iteration-1 "></success-msg>
            <h5 v-if="isErrorReturned" class="px-3 py-2 textColor text-center borderRound error">{{ dbError }}</h5>
        </div>
        <div>
            <FormKit type="form" v-model="level" :actions="false" @submit="updateLevel">
                <div class="mt-3">
                    <div class="flex align-items-center">
                        <label for="levelName" class="px-3 py-1 text-white text-sm">اسم المستوي</label>
                    </div>
                    <FormKit prefix-icon="text" id="levelName" type="text" label="اسم المستوي" placeholder="أدخل اسم المستوي" name="level_name" validation="required|length:3" />
                </div>
                <div class="mt-3">
                    <div class="flex align-items-center">
                        <label for="description" class="px-3 py-1 text-white text-sm">وصف المستوي</label>
                    </div>
                    <FormKit prefix-icon="tools" id="description" type="textarea" label="وصف المستوي" placeholder="أدخل وصف المستوي" name="level_description" validation="length:3" />
                </div>


                <div class="w-full m-auto repeater">
                    <FormKit
                        id="repeater"
                        name="sublevels"
                        type="repeater"
                        label="المستوىات الفرعية"
                        add-label="اضافة مستوي فرعي"
                        #default="{ index }">
                        <FormKit type="text" prefix-icon="text" name="sublevel_name" :label="`${index + 1}. اسم المستوي الفرعي`" placeholder="أدخل اسم المستوي" validation="required|length:3"/>
                            <div class="col-12 flex grid w-full mt-3">
                                <FormKit id="repeater" name="checkpoints" type="repeater" add-label="اضافة مهارة" label="مهارات المستوي" #default="{ index }">
                                <div class="flex grid w-full">
                                        <FormKit type="text" name="checkpoint_name" outer-class="col-12" :label="`${index + 1}. المهارة`"
                                         placeholder="أدخل المهارة المكتسبة" prefix-icon="text" validation="required|length:3"/>
                                        <FormKit type="textarea" name="checkpoint_description" outer-class="col-12" 
                                        label="وصف المهارة" placeholder="أدخل وصف المهارة" prefix-icon="tools" validation=""/>
                                </div>
                                </FormKit>
                            </div>
                    </FormKit>
                </div>
                <Button type="submit" class="submitBtn" label="انشاء" :loading="isLoading" />
            </FormKit>
        </div>
    </div>
</template>
<style>
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