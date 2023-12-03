<script setup lang="ts">
import axios from 'axios';
import { ref, onBeforeMount , watch } from 'vue';
import type {Ref} from 'vue'
import Button from 'primevue/button';
import { useRouter } from 'vue-router';
import successMsg from '../../components/successMsg.vue';
import { adminAuthorize } from '@/global-functions/checkUserRole';
import { employeeAuthorize } from '@/global-functions/isEmployeeAuthorized';
import InputSwitch from 'primevue/inputswitch';
import Dialog from 'primevue/dialog';
import SelectButton from 'primevue/selectbutton';
const { push , currentRoute } = useRouter();

const CustomerId = parseInt(currentRoute.value.params.id as string)
const branches : any = ref([])
const allBranches : any = ref()
// const lastSubscription : any = ref()
const coaches : any = ref([])
const categories : any = ref([])
const allAcademies : any = ref([])
const updatedSuccessfully = ref(false)
const createdSubscription = ref()
const showSavedPrice = ref(false)
const subscriptionSavedPrice = ref()
const isErrorReturned = ref(false)
const isSubscriptionDialogVisible = ref(false)
const isSubscriptionLoading = ref(false)
const stayAtTheSamePage = ref(false)
const isSaleFieldVisible = ref(false)
const installments = ref()
const isBranchesFetched = ref(false)
const customerInfo = ref()
const lastSubscription = ref()
const isCustomerFetched = ref(false)
const dbError = ref()
const isLoading = ref(false)
const createdCustomer = ref()
const isDialogVisible = ref(false)
const isPrivate = ref(false)
const updateCustomerView = ref(true)
const UpdateOptions = ref(["تعديل اللاعب" , "تعديل الاشتراك"])
const UpdateOptionsValue = ref("تعديل اللاعب")

const updateCustomer = (req : any) => {
    isLoading.value = true
    console.log(req);
    req.birthdate = new Date(req.birthdate);
    req.birthdate = req.birthdate.toISOString().substr(0, 19).replace('T', ' ');
    axios.put(`https://akademia.website/api/updateCustomer/${CustomerId}` , req).then((result) => {
        createdCustomer.value = result.data.customer
        isLoading.value = false
        isErrorReturned.value = false
        updatedSuccessfully.value= true
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        isDialogVisible.value = true
        setTimeout(() => {
            updatedSuccessfully.value= false
        }, 1600);
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
    axios.get('https://akademia.website/api/branches').then((result) => {
        console.log(result.data);
        allBranches.value = result.data.branches
        result.data.branches.forEach((branch : any) => {
            branches.value.push({label : branch.branch_name , value : branch.id})
        });
        isBranchesFetched.value = true
    }).catch((err) => {
        console.log(err);
    });
}

const coachesOptions = () => {
    return new Promise<any[]>((resolve) => {
        axios.get(`https://akademia.website/api/coachesOfBranch/${lastSubscription.value.branch_id}`).then((result) => {
        console.log(result.data);
        coaches.value = []
        result.data.coaches.forEach((coach : any) => {
            coaches.value.push({label : `كابتن / ${coach.name}` , value : coach.id})
        });
        resolve(coaches.value)
    })
})
}
const categoriesOptions = () => {
    return new Promise<any[]>((resolve) => {
        axios.get(`https://akademia.website/api/categoriesOfBranch/${lastSubscription.value.branch_id}`).then((result) => {
        console.log(result.data);
        categories.value = []
        result.data.categories.forEach((category : any) => {
            categories.value.push({label : category.category_name , value : category.id})
        });
        resolve(categories.value)
    })
})
}

const getCustomerDetailes = () => {
    axios.get(`https://akademia.website/api/customer/${CustomerId}`).then((result) => {
        console.log(result.data);
        customerInfo.value = result.data.customer
        lastSubscription.value = result.data.lastSubscription
        coachesOptions()
        isCustomerFetched.value = true
    }).catch((err) => {
        console.log(err);
    });
}
const getCustomerWithPrivateSubscription = () => {
    axios.get(`https://akademia.website/api/customer/private/${CustomerId}`).then((result) => {
        console.log(result.data);
        customerInfo.value = result.data.customer
        lastSubscription.value = result.data.lastSubscription
        coachesOptions()
        isCustomerFetched.value = true
    }).catch((err) => {
        console.log(err);
    });
}

const updateSubscription = () => {
    isSubscriptionLoading.value = true
    lastSubscription.value.subscription_date = new Date(lastSubscription.value.subscription_date);
    lastSubscription.value.subscription_date = lastSubscription.value.subscription_date.toISOString().substr(0, 19).replace('T', ' ');
    lastSubscription.value.expiration_date = new Date(lastSubscription.value.expiration_date);
    lastSubscription.value.expiration_date = lastSubscription.value.expiration_date.toISOString().substr(0, 19).replace('T', ' ');
    lastSubscription.value.customer_id = CustomerId
    let schedulesIds : any = []
    lastSubscription.value.training_schedules.forEach((schedule : any) => {
        schedulesIds.push(schedule.id)
    });
    lastSubscription.value.is_private = isPrivate.value
    lastSubscription.value.schedulesIds = schedulesIds
    console.log(lastSubscription.value);
    axios.put(`https://akademia.website/api/updateSubscription/${lastSubscription.value.id}` , lastSubscription.value).then((result) => {
        createdSubscription.value = result.data.subscription
        isSubscriptionLoading.value = false
        isErrorReturned.value = false
        updatedSuccessfully.value= true
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        isSubscriptionDialogVisible.value = true
        console.log(createdSubscription.value);
        
        setTimeout(() => {
            updatedSuccessfully.value= false
        }, 1600);
    }).catch((err) => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        isSubscriptionLoading.value = false
        isErrorReturned.value = true
        dbError.value = err.response.data.message
        console.log(err);
    });
}

const handleDialogClosed = () => {
    if(isPrivate.value) {
        push('/privateSubscriptions')
    }
    else{
        push('/customers')
    }
}

const getAcademies = () => {
    axios.get('https://akademia.website/api/academies').then((result) => {
        console.log(result.data);
        // allAcademies.value = result.data.academies
        result.data.academies.forEach((academy : any) => {
            allAcademies.value.push({label : academy.academy_name , value : academy.id})
        });
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
                updateCustomerView.value = true
                if(currentRoute.value.query.updateSubscription == 'true'){
                    UpdateOptionsValue.value = 'تعديل الاشتراك'
                }
                if(currentRoute.value.query.isPrivate == 'true'){
                    isPrivate.value = true
                    getCustomerWithPrivateSubscription()
                }
                else{
                    getCustomerDetailes()
                }
                getBranches()
                getAcademies()
            })
        } 
        else{
            updateCustomerView.value = true
            if(currentRoute.value.query.updateSubscription == 'true'){
                UpdateOptionsValue.value = 'تعديل الاشتراك'
            }
            if(currentRoute.value.query.isPrivate == 'true'){
                isPrivate.value = true
                getCustomerWithPrivateSubscription()
            }
            else{
                getCustomerDetailes()
            }
            getBranches()
            getAcademies()
        }
    })
})

</script>
<template>
    <Dialog v-model:visible="isDialogVisible" @after-hide="handleDialogClosed" modal header="بيانات الاشتراك" :style="{ width: '50vw' }" :breakpoints="{ '960px': '75vw', '641px': '100vw' }">
        <div class="flex align-items-center justify-content-center">
            <div class="flex align-items-center mx-5 justify-content-center flex-column">
                <div class="flex align-items-center my-2">
                    <span class="material-symbols-outlined mx-1 text-2xl">
                        tag
                    </span>
                    <h4>الكود</h4>
                </div>
                <p>{{ CustomerId }}</p>
            </div>
            <div class="flex align-items-center mx-5 justify-content-center flex-column">
                <div class="flex align-items-center my-2">
                    <h4>الاسم</h4>
                    <span class="material-symbols-outlined text-2xl">
                        scuba_diving
                    </span>
                </div>
                <p>{{ createdCustomer.customer_name }}</p>
            </div>
            <div class="flex align-items-center mx-5 justify-content-center flex-column">
                <div class="flex align-items-center my-2">
                    <span class="material-symbols-outlined mx-1 text-2xl">
                        call
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
    <Dialog v-model:visible="isSubscriptionDialogVisible" @after-hide="handleDialogClosed" modal header="بيانات الاشتراك" :style="{ width: '50vw' }" :breakpoints="{ '960px': '75vw', '641px': '100vw' }">
        <div v-if="createdSubscription" class="flex align-items-center justify-content-center">
            <div class="flex align-items-center mx-5 justify-content-center flex-column">
                <div class="flex align-items-center my-2">
                    <span class="material-symbols-outlined mx-1 text-2xl">
                        tag
                    </span>
                    <h4>الكود</h4>
                </div>
                <p>{{ CustomerId }}</p>
            </div>
            <div class="flex align-items-center mx-5 justify-content-center flex-column">
                <div class="flex align-items-center my-2">
                    <h4>تاريخ بداية الاشتراك</h4>
                    <span class="material-symbols-outlined text-2xl">
                        calendar_month
                    </span>
                </div>
                <p>{{ new Date(createdSubscription.subscription_date).toLocaleDateString() }}</p>
            </div>
            <div class="flex align-items-center mx-5 justify-content-center flex-column">
                <div class="flex align-items-center my-2">
                    <span class="material-symbols-outlined mx-1 text-2xl">
                        calendar_month
                    </span>
                    <h4>تاريخ انتهاء الاشتراك</h4>
                </div>
                <p>{{ new Date(createdSubscription.expiration_date).toLocaleDateString() }}</p>
            </div>
        </div>
        <template #footer>
            <Button label="تم" class="px-4 py-1" @click="isSubscriptionDialogVisible = false" autofocus />
        </template>
    </Dialog>

    <!-- Update Options  -->

    <div class="flex justify-content-center mt-5 pt-5 m-auto" style="direction: rtl;">
        <SelectButton v-model="UpdateOptionsValue" :options="UpdateOptions" aria-labelledby="basic" />
    </div>

    <div v-if="isCustomerFetched" class="w-12 md:w-10 m-auto p-2 md:p-5 customers">
        <div class="w-8 m-auto">
            <success-msg v-if="updatedSuccessfully" class="fadeinright animation-duration-1000 animation-iteration-1 "></success-msg>
            <h5 v-if="isErrorReturned" class="px-3 py-2 textColor text-center borderRound error">{{ dbError }}</h5>
        </div>
        <div v-if="UpdateOptionsValue == 'تعديل اللاعب'">
            <h1 class="p-4 text-center textColor">بيانات اللاعب</h1>
            <!-- Customer Update Form -->
            <FormKit type="form" v-model="customerInfo" :actions="false" @submit="updateCustomer">
                <div class="flex grid w-full">
                <div class="mt-3 col-12">
                    <div class="flex align-items-center">
                        <label for="name" class="px-3 py-1 text-white text-sm">اسم المشترك</label>
                    </div>
                    <FormKit prefix-icon="avatarMan" id="name" type="text" label="اسم المشترك" placeholder="أدخل اسم المشترك" name="customer_name" validation="required|length:2" />
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
                        <FormKit prefix-icon="text" id="address" type="textarea" label="العنوان" placeholder="أدخل عنوان للمشترك " name="customer_address" validation="required|length:3" />
                    </div>
                    <div class="col-12">
                        <div class="flex align-items-center">
                            <label for="gender" class="px-3 py-1 text-white text-sm">الجنس</label>
                        </div>
                        <FormKit id="gender" type="dropdown" :options="[{label : 'ذكر' , value : 'male'},{label : 'أنثي' , value : 'female'} ]" label="الجنس" placeholder="أختر جنس المشترك " name="gender" validation="required" />
                    </div>
                </div>
                <Button type="submit" class="submitBtn" label="حفظ" :loading="isLoading" />
            </FormKit>
        </div>

            <!-- Customer Update Form  End-->


        <!-- Update customer subscription -->

        <div v-else class="subscription w-full m-auto p-2 md:p-4 customers">
            <h1 class="p-4 text-center textColor">بيانات الاشتراك</h1>
            <FormKit type="form" v-model="lastSubscription" :actions="false" @submit="updateSubscription">
                <div class="flex grid w-full">
                    <div class="mt-3 col-12">
                        <div class="flex align-items-center">
                            <label for="name" class="px-3 py-1 text-white text-sm">الفرع</label>
                        </div>
                        <FormKit type="dropdown" name="branch_id" label="الفرع" placeholder="اختر الفرع الذي سيحضر فيه المشترك" :options="branches" />
                    </div>
                    <div class="flex grid w-full fadein animation-duration-300 animation-iteration-1">
                    <div class="mt-3 col-12 md:col-6" >
                        <div class="flex align-items-center">
                            <label for="name" class="px-3 py-1 text-white text-sm">المدرب</label>
                        </div>
                        <FormKit type="dropdown" name="coach_id" always-load-on-open="true" empty-message="لا يوجد مدربين لهذا الفرع" label="المدرب" placeholder="اختر المدرب الذي سيحضر معه المشترك" :options="coachesOptions" />
                    </div>
                    <div class="mt-3 col-12 md:col-6">
                        <div class="flex align-items-center">
                            <label for="name" class="px-3 py-1 text-white text-sm">نوع التمرين</label>
                        </div>
                        <FormKit type="dropdown" name="category_id" label="نوع التمرين" empty-message="لا يوجد تمارين في هذا الفرع"  placeholder="اختر نوع التمرين" :options="categoriesOptions" />
                    </div>
                        <div class="col-12 md:col-6">
                            <div class="flex align-items-center">
                                <label for="subscription_date" class="px-3 py-1 text-white text-sm">تاريخ بداية الاشتراك</label>
                            </div>
                            <FormKit
                            type="datepicker"
                            name="subscription_date"
                            label="تاريخ الاشتراك"
                            id="subscription_date"
                            :format="{ date: 'short' }"
                            validation="required"
                            :value="new Date()"
                        />
                        </div>
                        <div class="col-12 md:col-6">
                            <div class="flex align-items-center">
                                <label for="expiration_date" class="px-3 py-1 text-white text-sm">تاريخ انتهاء الاشتراك</label>
                            </div>
                            <FormKit type="datepicker" name="expiration_date"  label="تاريخ الانتهاء" id="expiration_date"
                            :min-date="new Date()" validation="required" :format="{ date: 'short' }" />
                        </div>
    
                        <div class="mt-3 col-12 md:col-6">
                            <div class="flex align-items-center">
                                <label for="academy" class="px-3 py-1 text-white text-sm">الأكاديمية</label>
                            </div>
                            <FormKit type="dropdown" id="academy" name="academy_id" label="الأكاديمية" placeholder="اختر الأكاديمية"
                            :options="allAcademies" validation="required"/>
                        </div>
                        <div class="mt-3 col-12 md:col-6">
                            <div class="flex align-items-center">
                                <label for="avail_freeze_days" class="px-3 py-1 text-white text-sm">الأيام المتاحة للتجميد</label>
                            </div>
                            <FormKit prefix-icon="number" number="integer" id="avail_freeze_days" type="number" label="أيام التجميد" placeholder="أدخل الأيام المتاحة لتجميد الاشتراك" name="avail_freeze_days" validation="required|min:0" />
                        </div>
                        <div class="mt-3 col-12 md:col-6">
                            <div class="flex align-items-center">
                                <label for="number_of_sessions" class="px-3 py-1 text-white text-sm">عدد الحصص في الاشتراك</label>
                            </div>
                            <FormKit prefix-icon="number" number="integer" id="number_of_sessions" type="number" label="عدد الحصص" placeholder="أدخل عدد حصص الاشتراك " name="number_of_sessions" validation="required|min:1" />
                        </div>
                        <div class="mt-3 col-12 md:col-6">
                            <div class="flex align-items-center">
                                <label for="sessions_per_week" class="px-3 py-1 text-white text-sm">عدد الحصص في الاسبوع</label>
                            </div>
                            <FormKit prefix-icon="number" number="integer" id="sessions_per_week" type="number" label="عدد الحصص الاسبوعية" placeholder="أدخل عدد الحصص في الاسبوع " name="sessions_per_week" validation="required|min:1" />
                        </div>

                        <div class="w-full m-auto repeater">
                            <FormKit id="repeater" name="training_schedules" type="repeater" add-label="اضافة موعد"
                             label="جدول المواعيد" #default="{ index }">
                             <div class="flex grid w-full align-items-center">
                                <FormKit type="dropdown" outer-class="col-12 md:col-6" name="day" :label="`${index + 1}. اليوم`" placeholder="اختر اليوم"
                                :options="['السبت','الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة']" validation="required"/>
                                <FormKit type="time" label="موعد بدء التمرين" outer-class="col-12 md:col-6" name="time" value="21:00" validation="required" />
                                </div>
                            </FormKit>
                        </div>

                        <div class="col-12" :class="{'md:col-6' : isSaleFieldVisible}">
                            <div class="flex align-items-center">
                                <label for="price" class="px-3 py-1 text-white text-sm">السعر</label>
                            </div>
                            <FormKit prefix-icon="dollar" id="price" type="number" label="سعر الاشتراك" placeholder="أدخل سعر الاشتراك" name="price" number="float" validation="required|min:1" />
                            <h5 v-if="showSavedPrice" class="fadein animation-duration-500 animation-iteration-1 text-center p-3 borderRound"
                             style="color: #256029; background-color: #c8e6c9d3;">السعر المسجل لهذا العدد من الحصص هو {{ subscriptionSavedPrice }} ج.م</h5>
                        </div>
                        <div class="col-12 md:col-6 fadein animation-duration-500 animation-iteration-1" v-if="isSaleFieldVisible">
                            <div class="flex align-items-center">
                                <label for="sessions_per_week" class="px-3 py-1 text-white text-sm">الخصم ( اختياري )</label>
                            </div>
                            <FormKit prefix-icon="dollar" id="sessions_per_week" type="number" label="الخصم" placeholder="أدخل مبلغ الخصم بالجنية " number="float" name="sale" validation="min:0" />
                        </div>
                        <div class="col-12 m-auto flex justify-content-center">
                            <Button type="button" v-if="!isSaleFieldVisible" class="" style="background: var(--background);" label="أدخل مبلغ خصم" @click="isSaleFieldVisible = true" />
                        </div>
                    </div>
                </div>
                <Button type="submit" class="submitBtn my-5 " label="تعديل الاشتراك" :loading="isSubscriptionLoading" />
            </FormKit>
        </div>
    </div>
</template>
<style>
.formkit-panel-wrapper{
    direction: ltr !important;
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