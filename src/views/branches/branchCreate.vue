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

const categories : any = ref([])
const allAcademies : any = ref([])
const createdSuccessfully = ref(false)
const isErrorReturned = ref(false)
const stayAtTheSamePage = ref(false)
const isCategoriesFetched = ref(false)
const isAcademiesFetched = ref(false)
const dbError = ref()
const isLoading = ref(false)

const createBranch = (req : any) => {
    isLoading.value = true
    console.log(req);
    req.categories.forEach((category : any , index : number) => {
        let jsonString = JSON.stringify(category.session_prices) 
        req.categories[index].session_prices = jsonString
        console.log(req , 'req after stringfy');
        console.log(jsonString , 'jsonString');
    });
    axios.post('https://akademia.website/api/createBranch' , req).then((result) => {
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
                push('/branches')
            }, 1600);
        }
    }).catch((err) => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        isLoading.value = false
        isErrorReturned.value = true
        if(err.response.data.message.includes('The branch name has already been taken')){
            dbError.value = 'هذا الفرع موجود بالفعل'
        }
        else    {
            dbError.value = err.response.data.message
        }
        console.log(err);
    });
}
const getCategories = () => {
    axios.get('https://akademia.website/api/categories').then((result) => {
        console.log(result.data);
        result.data.categories.forEach((category : any) => {
            categories.value.push({label : category.category_name , value : category.id})
        });
        isCategoriesFetched.value = true
    }).catch((err) => {
        console.log(err);
    });
}

const getAcademies = () => {
    axios.get('https://akademia.website/api/academies').then((result) => {
        console.log(result.data);
        result.data.academies.forEach((academy : any) => {
            allAcademies.value.push({label : academy.academy_name , value : academy.id})
        });
        isAcademiesFetched.value = true
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
                    push({path : '/login', query : currentRoute.value.query})
                }
                empPermissions.value = employee.permissions
                UserType.value = 'employee'
                if(!isEmpAuthorizedFor(empPermissions.value , 'تسجيل و تعديل الفروع' , UserType.value)){
                    localStorage.removeItem('SwimmingToken')
                    push({path : '/login', query : {userType : 'employee'}})
                }
                console.log(empPermissions.value);
                getCategories()
                getAcademies()
            })
        }
        else{
            getCategories()
            getAcademies()
        }
    })
})

</script>
<template>
    <div class="w-12 md:w-10 m-auto p-2 md:p-5 branches">
        <h1 class="p-4 text-center textColor">انشاء فرع جديد</h1>
        <div class="w-8 m-auto">
            <success-msg v-if="createdSuccessfully" class="fadeinright animation-duration-1000 animation-iteration-1 "></success-msg>
            <h5 v-if="isErrorReturned" class="px-3 py-2 textColor text-center borderRound error">{{ dbError }}</h5>
        </div>
        <div v-if="isCategoriesFetched && isAcademiesFetched">
            <FormKit type="form" :actions="false" @submit="createBranch">
                <div class="mt-3">
                    <div class="flex align-items-center">
                        <label for="branchName" class="px-3 py-1 text-white text-sm">اسم الفرع</label>
                    </div>
                    <FormKit prefix-icon="text" id="branchName" type="text" label="اسم الفرع" placeholder="أدخل اسم الفرع" name="branch_name" validation="required|length:3" />
                </div>
                <div class="mt-3">
                    <div class="flex align-items-center">
                        <label for="academies" class="px-3 py-1 text-white text-sm">الأكاديميات</label>
                    </div>
                    <FormKit type="dropdown" outer-class="col-12" name="academies" label="الأكاديميات" placeholder="اختر الأكاديميات المتاحة لهذا الفرع"
                    :options="allAcademies" :multiple="true" validation="required"/>
                </div>
                <div class="my-4 repeater">
                    <FormKit id="repeater" name="working_days" type="repeater" label="مواعيد العمل للفرع" #default="{ index }">
                        <div class="flex grid w-full">
                            <FormKit type="dropdown" outer-class="col-12" name="day" label="أيام العمل" placeholder="اختر أيام العمل المتاحة لهذا الفرع"
                            :options="['السبت','الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة']" validation="required"/>
                            <FormKit type="time" id="start_time" label=" موعد البداية ( من )" value="21:00" outer-class="col-12 md:col-6" name="start_time" validation="required" />
                            <FormKit type="time" id="end_time" label="موعد النهاية ( إلي )" value="23:00" outer-class="col-12 md:col-6" name="end_time" validation="required" />
                        </div>
                    </FormKit>
                </div>
                <div class="w-full my-4 m-auto repeater">
                    <FormKit
                        id="repeater"
                        name="categories"
                        type="repeater"
                        label="نوع التمرينة"
                        #default="{ index }">
                        <FormKit
                        type="dropdown"
                        name="categoryId"
                        :label="`${index + 1}. نوع التمرين`"
                        placeholder="اختر نوع تمرينة"
                        :options="categories"
                        validation="required"/>
                        <div class="flex grid w-full">
                            <FormKit
                            type="text"
                            name="duration"
                            number="float"
                            outer-class="col-12 md:col-6"
                            label="مدة التمرينة"
                            placeholder="أدخل مدة التمرينة بالساعة" 
                            prefix-icon="number"
                            validation="required|min:0"/>

                            <FormKit
                            type="text"
                            name="price_per_session"
                            number="float"
                            outer-class="col-12 md:col-6"
                            label="سعر التمرينة"
                            placeholder="أدخل سعر التمرينة"
                            prefix-icon="number"
                            validation="required|min:0"/>
                            <div class="col-12 flex grid w-full mt-3">
                                <FormKit id="repeater" name="session_prices" type="repeater" label="عروض علي أسعار التمارين" #default="{ index }">
                                <div class="flex grid w-full">
                                        <FormKit type="text" name="sessions" number="integer" outer-class="col-12 md:col-6" label="عدد الحصص"
                                         placeholder="أدخل عدد الحصص" prefix-icon="number" validation="required|min:0"/>
                                        <FormKit type="text" name="price" number="float" outer-class="col-12 md:col-6" 
                                        label="السعر" placeholder="أدخل سعر التمارين" prefix-icon="dollar" validation="required|min:0"/>
                                </div>
                                </FormKit>
                            </div>
                        </div>
                    </FormKit>
                </div>
                <div class="flex justify-content-center align-items-center my-3">
                    <InputSwitch v-model="stayAtTheSamePage" />
                    <h4 class="text-sm mx-2 textColor">ابق في نفس الصفحة</h4>
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