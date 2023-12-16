<script setup lang="ts">
import axios from 'axios';
import { ref, onBeforeMount, watch, type Ref } from 'vue';
import Button from 'primevue/button';
import { useRouter } from 'vue-router';
import { adminAuthorize } from '@/global-functions/checkUserRole';
import { employeeAuthorize } from '@/global-functions/isEmployeeAuthorized';
import Dialog from 'primevue/dialog';
import Breadcrumb from 'primevue/breadcrumb';
import Tag from 'primevue/tag';
const { push , currentRoute } = useRouter();
import successMsg from '../../components/successMsg.vue';
import TreeSelect from 'primevue/treeselect';

const breadCrumbs : any = ref([]);
breadCrumbs.value = [
    {label: 'المشتركين' , route: '/customers', to:'/customers'},
    {label: 'تفاصيل المشترك' , route: '/', to:'/' },
]; 
const home = ref({
    icon: 'pi pi-home',
    to: '/',
})

const SubscriptionId = parseInt(currentRoute.value.params.id as string)
const customerDetails = ref()
const yesterday = new Date().setDate(new Date().getDate() - 1)
const updatedSuccessfully = ref(false)
const levelsNodes = ref()
const customerNewLevel = ref()
const isCustomerFetched = ref(false)
const subLevel = ref()
const isFreezeLoading = ref(false)
const isFreezeCancellingLoading = ref(false)
const isDialogVisible = ref(false)
const isInstallmentLoading = ref(false)
const isPenultimateSubscriptionVisible = ref(false)
const maxFreezeDate = ref()
const daysLeftForFreezeStart = ref()
const PenultimateSubscription = ref()

watch((customerDetails) , (newValue, oldValue) => {    
    if(!oldValue){
        return
    }
    if(newValue.freeze_start_date !== oldValue.freeze_start_date){
        let maxFreeze = new Date(newValue.freeze_start_date)
        if(customerDetails.value.avail_freeze_days > 0) {
            maxFreeze.setDate(new Date(newValue.freeze_start_date).getDate()  + (customerDetails.value.avail_freeze_days + 1))
            console.log(maxFreeze , 'maxFreeze');
        }
        maxFreezeDate.value = maxFreeze
    }
});

const freezeSubscription = (req : any) => {
    isFreezeLoading.value = true
    const currentDate = new Date()
    req.freeze_start_date = new Date(req.freeze_start_date);
    req.freeze_start_date = new Date(req.freeze_start_date.getTime() + 5 * 60 * 60 * 1000);
    console.log(req.freeze_start_date , 'before');
    
    req.freeze_end_date = new Date(req.freeze_end_date);
    if(req.freeze_start_date > currentDate){
        req.state = 'active'
        req.isfrozen = false
    }
    else{
        req.state = 'frozen'
        req.isfrozen = true
    }
    const differenceInMS = req.freeze_end_date - req.freeze_start_date
    const freezeDays = Math.floor(differenceInMS / (1000 * 3600 * 24))
    console.log(freezeDays , 'freezeDays');
    req.freeze_start_date = req.freeze_start_date.toISOString().substr(0, 19).replace('T', ' ');
    console.log(req.freeze_start_date , 'after');
    req.freeze_end_date = req.freeze_end_date.toISOString().substr(0, 19).replace('T', ' ');
    let currentAvailFreezeDays = customerDetails.value.avail_freeze_days
    console.log(currentAvailFreezeDays , 'currentAvailFreezeDays');
    req.avail_freeze_days = parseInt(currentAvailFreezeDays) - freezeDays
    console.log(req.avail_freeze_days);
    let expirationDate =  new Date(customerDetails.value.expiration_date)
    expirationDate.setDate(expirationDate.getDate() + freezeDays)
    console.log(expirationDate);
    
    req.expiration_date = expirationDate.toISOString().substr(0, 19).replace('T', ' ');
    console.log(req);
    axios.put(`https://akademia.website/api/freezeSubscription/${SubscriptionId}` , req).then((result) => {
        console.log(result.data);
        isFreezeLoading.value = false
        updatedSuccessfully.value = true
        setTimeout(() => {
            location.reload()
        }, 1800);
    }).catch((err) => {
        console.log(err);
    });
}

const cancelFreeze = () => {
    isFreezeCancellingLoading.value = true
    const currentDate = new Date()
    const freezeEndDate = new Date(customerDetails.value.freeze_end_date) 
    const freezeStartDate = new Date(customerDetails.value.freeze_start_date) 
    let expirationDate = new Date(customerDetails.value.expiration_date)
    let availFreezeDays = customerDetails.value.avail_freeze_days
    if(freezeStartDate > currentDate){
        console.log('freezeStartDate > currentDate');
        let daysLeftInFreeze = freezeEndDate.getTime() - freezeStartDate.getTime()
        daysLeftInFreeze = Math.floor(daysLeftInFreeze / (1000 * 3600 * 24))
        console.log(expirationDate , 'before');
        expirationDate.setDate(expirationDate.getDate() - daysLeftInFreeze)
        console.log(expirationDate , 'after');
        availFreezeDays += daysLeftInFreeze;
        console.log(daysLeftInFreeze , 'daysLeftInFreeze');
        console.log(availFreezeDays , 'availFreezeDays');
    }
    else if((freezeEndDate > currentDate) && (freezeStartDate < currentDate)){
        console.log('(freezeEndDate > currentDate) && (freezeStartDate < currentDate)');
        let daysLeftInFreeze = freezeEndDate.getTime() - currentDate.getTime()
        daysLeftInFreeze = Math.ceil(daysLeftInFreeze / (1000 * 3600 * 24))
        expirationDate.setDate(expirationDate.getDate() - daysLeftInFreeze)
        availFreezeDays += daysLeftInFreeze;
    }
    let req = {
        expiration_date : expirationDate.toISOString().substr(0, 19).replace('T', ' ') ,
        avail_freeze_days : availFreezeDays
    }
    axios.put(`https://akademia.website/api/freezeCancellation/${SubscriptionId}` , req).then((result) => {
        console.log(result.data);
        isFreezeCancellingLoading.value = false
        updatedSuccessfully.value = true
        setTimeout(() => {
            location.reload()
        }, 1800);
    }).catch((err) => {
        console.log(err);
    });
}

const editInstallment = (installmentId : number , index : number) => {
    isInstallmentLoading.value = true
    let installmentData = customerDetails.value.installments[index]
    installmentData.due_date = new Date(installmentData.due_date)
    installmentData.due_date = installmentData.due_date.toISOString().substr(0, 19).replace('T', ' ');
    console.log(installmentData);
    console.log(installmentData.due_date);
    
    axios.put(`https://akademia.website/api/updateInstallment/${installmentId}` , installmentData).then((result) => {
        console.log(result.data);
        isInstallmentLoading.value = false
        // updatedSuccessfully.value = true
        setTimeout(() => {
            // location.reload()
        }, 500);
    }).catch((err) => {
        console.log(err);
    });
}

const payInstallment = (installmentId : number) => {
    axios.put(`https://akademia.website/api/payInstallment/${installmentId}`).then((result) => {
        console.log(result.data.installment);
        getCustomerDetailes()
    }).catch((err) => {
        console.log(err);
    });
}

const deleteInstallment = (installmentId : number) => {
    axios.delete(`https://akademia.website/api/deleteInstallment/${installmentId}`).then((result) => {
        console.log(result.data);
        getCustomerDetailes()
    }).catch((err) => {
        console.log(err);
    });
}
const getCustomerPenultimateSubscription = () => {
    axios.get(`https://akademia.website/api/customerPenultimateSubscription/${customerDetails.value.customer_id}`).then((result) => {
        console.log(result.data);
        PenultimateSubscription.value = result.data.penultimateSubscription
    }).catch((err) => {
        console.log(err);
    });
}

const getCustomerDetailes = () => {
    axios.get(`https://akademia.website/api/customerSubcription/${SubscriptionId}`).then((result) => {
        console.log(result.data);
        customerDetails.value = result.data.subscription 
        subLevel.value = result.data.sublevel 
        const differenceInMS = new Date(customerDetails.value.expiration_date).getTime() - new Date().getTime()
        customerDetails.value.daysLeft = Math.floor(differenceInMS / (1000 * 3600 * 24))
        let freeze_start = new Date(customerDetails.value.freeze_start_date)
        if(customerDetails.value.state == 'active' && (customerDetails.value.freeze_start_date && customerDetails.value.freeze_end_date)){
            let currentDate = new Date()
            daysLeftForFreezeStart.value = freeze_start.getTime() - currentDate.getTime() 
            daysLeftForFreezeStart.value = Math.ceil(daysLeftForFreezeStart.value / (1000 * 3600 * 24))
        }
        if(customerDetails.value.isfrozen == true) {
            freeze_start.setDate(freeze_start.getDate() + customerDetails.value.avail_freeze_days)
            maxFreezeDate.value = freeze_start
        }
        else{
            let currentDate = new Date()
            currentDate.setDate(currentDate.getDate() + (customerDetails.value.avail_freeze_days + 1))
            maxFreezeDate.value = currentDate
        }
        isCustomerFetched.value = true
        getCustomerPenultimateSubscription()
    }).catch((err) => {
        console.log(err);
    });
}
const getLevelsTree = () => {
    axios.get(`https://akademia.website/api/levelsTree`).then((result) => {
        console.log(result.data);
        levelsNodes.value = result.data.levelsTree
    }).catch((err) => {
        console.log(err);
    });
}
const updateCustomerLevel = () => {
    const LevelKey = Object.keys(customerNewLevel.value)[0]
    const req = {
        level_id : null,
        sublevel_id : null,
    }
    if(LevelKey.includes('-')){
        const [leftNumber, rightNumber] = LevelKey.split('-');
        req.level_id = parseInt(leftNumber) as any
        req.sublevel_id = parseInt(rightNumber) as any
    } 
    else{
        req.level_id = parseInt(LevelKey) as any
    }
    console.log(req , 'req');
    axios.put(`https://akademia.website/api/customerLevelUpdate/${customerDetails.value.customer_id}` , req).then((result) => {
        console.log(result.data);
        isDialogVisible.value = false
    }).catch((err) => {
        console.log(err);
    });
}

const handleDialogClosed = () => {
    getCustomerDetailes()
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

const subscriptionUpgrade = () => {
    localStorage.setItem('upgradeDetails' , JSON.stringify(customerDetails))
    push({path : 'customer/create' , query : {upgrade : 'true'}})
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
                getCustomerDetailes()    
                getLevelsTree()  
            })
        }   
        else{
            getCustomerDetailes()    
            getLevelsTree()        
        }
    })
})

</script>
<template>

    <!-- Update Customer Level Dialog -->
    <Dialog v-model:visible="isDialogVisible" @after-hide="handleDialogClosed" modal header="مستوي المشترك" :style="{ width: '50vw' }" :breakpoints="{ '960px': '75vw', '641px': '100vw' }">
        <div class="flex justify-content-center py-5" style="direction: ltr;">
            <TreeSelect v-model="customerNewLevel" :options="levelsNodes" placeholder="اختر المستوي الحالي للمشترك" class="md:w-25rem w-full" />
        </div>
        <!-- {{ customerNewLevel }} -->
        <template #footer>
            <Button label="تم" class="px-4 py-1" @click="updateCustomerLevel" autofocus />
        </template>
    </Dialog>
    <!-- Update Options  -->
    
    <Dialog v-model:visible="isPenultimateSubscriptionVisible" modal header="تفاصيل اخر اشتراك" :style="{ width: '55vw' }" :breakpoints="{ '960px': '75vw', '641px': '100vw' }">

        <div class="p-3 py-5 borderRound flex flex-wrap justify-content-center align-items-center" style="background: var(--background);">
            <div class="flex my-3 lg:my-1 align-items-center mx-5 justify-content-center flex-column">
                <div class="flex align-items-center my-2">
                    <h4 class="primaryColor">الحالة</h4>
                    <span class="material-symbols-outlined primaryColor mx-1 text-2xl">
                        live_help
                    </span>
                </div>
                <Tag :severity="getSeverity(PenultimateSubscription.state)" class="p-2 px-3" :value="getStateValue(PenultimateSubscription.state)"></Tag>
            </div>
            <div class="flex my-3 lg:my-1 align-items-center mx-5 justify-content-center flex-column">
                <div class="flex align-items-center my-2">
                    <h4 class="primaryColor">الفرع</h4>
                    <span class="material-symbols-outlined primaryColor mx-1 text-2xl">
                        home
                    </span>
                </div>
                <p class="textColor">{{ PenultimateSubscription.branch.branch_name }}</p>
            </div>
            <div class="flex my-3 lg:my-1 align-items-center mx-5 justify-content-center flex-column">
                <div class="flex align-items-center my-2">
                    <h4 class="primaryColor">الأكاديمية</h4>
                    <span class="material-symbols-outlined primaryColor mx-1 text-2xl">
                        group
                    </span>
                </div>
                <p class="textColor">{{ PenultimateSubscription.academy_name }}</p>
            </div>
            <div class="flex my-3 lg:my-1 align-items-center mx-5 justify-content-center flex-column">
                <div class="flex align-items-center my-2">
                    <h4 class="primaryColor">نوع التمرين</h4>
                    <span class="material-symbols-outlined primaryColor text-2xl mx-2">
                        category
                    </span>
                </div>
                <p style="color: white;">{{ PenultimateSubscription.category_name }}</p>
            </div>
            <div class="flex my-3 lg:my-4 align-items-center mx-5 justify-content-center flex-column">
                <div class="flex align-items-center my-2">
                    <h4 class="primaryColor">المدرب</h4>
                    <span class="material-symbols-outlined primaryColor text-2xl mx-2">
                        scuba_diving
                    </span>
                </div>
                <p style="color: white;">كابتن / {{ PenultimateSubscription.coach.name }}</p>
            </div>
            <div v-if="PenultimateSubscription.is_private" class="flex my-3 lg:my-4 align-items-center mx-5 justify-content-center flex-column">
                <div class="flex align-items-center my-2">
                    <h4 class="primaryColor">نوع الاشتراك</h4>
                    <span class="material-symbols-outlined primaryColor mx-1 text-2xl mx-2">
                        supervisor_account
                    </span>
                </div>
                <p class="textColor">برايفت</p>
            </div>
            <div class="flex my-3 lg:my-4 align-items-center mx-5 justify-content-center flex-column">
                <div class="flex align-items-center my-2">
                    <h4 class="primaryColor">طريقة الدفع</h4>
                    <span class="material-symbols-outlined primaryColor mx-1 text-2xl">
                        monetization_on
                    </span>
                </div>
                <p class="textColor" v-if="PenultimateSubscription.subscription_type == 'cash'">كاش</p>
                <p class="textColor" v-else>تقسيط</p>
            </div>
            <div class="flex my-3 lg:my-4 align-items-center mx-5 justify-content-center flex-column">
                <div class="flex align-items-center my-2">
                    <h4 class="primaryColor">الحصص المتبقية</h4>
                    <span class="material-symbols-outlined primaryColor mx-1 text-2xl">
                        today
                    </span>
                </div>
                <p class="textColor">{{ PenultimateSubscription.number_of_sessions }} حصص</p>
            </div>
            <div class="flex my-3 lg:my-4 align-items-center mx-5 justify-content-center flex-column">
                <div class="flex align-items-center my-2">
                    <h4 class="primaryColor">الدعوات المتاحة</h4>
                    <span class="material-symbols-outlined primaryColor mx-1 text-2xl">
                        today
                    </span>
                </div>
                <p class="textColor" v-if="PenultimateSubscription.invitations">{{ PenultimateSubscription.invitations }} دعوات</p>
                <p class="textColor" v-else>0 دعوات</p>
            </div>
            <div class="flex my-3 lg:my-4 align-items-center mx-5 justify-content-center flex-column">
                <div class="flex align-items-center my-2">
                    <h4 class="primaryColor">تاريخ الانتهاء</h4>
                    <span class="material-symbols-outlined primaryColor mx-1 text-2xl">
                        calendar_month
                    </span>
                </div>
                <p class="textColor">{{ PenultimateSubscription.expiration_date }}</p>
            </div>
            <div class="flex my-3 lg:my-4 align-items-center mx-5 justify-content-center flex-column">
                <div class="flex align-items-center my-2">
                    <h4 class="primaryColor">تاريخ الاشتراك</h4>
                    <span class="material-symbols-outlined primaryColor mx-1 text-2xl">
                        calendar_month
                    </span>
                </div>
                <p class="textColor">{{ PenultimateSubscription.subscription_date }}</p>
            </div>
        </div>
        <template #footer>
            <Button label="تم" class="px-4 py-1" @click="isPenultimateSubscriptionVisible = false" autofocus />
        </template>
    </Dialog>

    <div v-if="isCustomerFetched" class="w-12 md:w-10 my-5 py-5 m-auto md:p-5 customerFind" style="direction: rtl;">
        <div class="w-full m-auto flex justify-content-center p-4 MargAutoMob padding-1-breadcrumbs" style="direction: ltr;">
            <Breadcrumb :home="home" :model="breadCrumbs" />
        </div>    
        <h3 class="flex lg:hidden text-center my-2 m-auto justify-content-center textColor">البيانات الشخصية</h3>
        <h3 class="hidden lg:flex p-3 textColor">البيانات الشخصية</h3>
        <div class="p-3 py-5 bg-card borderRound flex flex-wrap justify-content-center align-items-center">
            <div class="flex my-3 lg:my-1 align-items-center mx-5 justify-content-center flex-column">
                <div class="flex align-items-center my-2">
                    <h4 class="primaryColor">الكود</h4>
                    <span class="material-symbols-outlined primaryColor mx-1 text-2xl">
                        fingerprint
                    </span>
                </div>
                <p class="textColor">{{ customerDetails.customer.id }}</p>
            </div>
            <div class="flex my-3 lg:my-1 align-items-center mx-5 justify-content-center flex-column">
                <div class="flex align-items-center my-2">
                    <h4 class="primaryColor">الاسم</h4>
                    <span class="material-symbols-outlined primaryColor text-2xl">
                        person
                    </span>
                </div>
                <p class="textColor">{{ customerDetails.customer.customer_name }}</p>
            </div>
            <div class="flex my-3 lg:my-1 align-items-center mx-5 justify-content-center flex-column">
                <div class="flex align-items-center my-2">
                    <h4 class="primaryColor">رقم الهاتف</h4>
                    <span class="material-symbols-outlined primaryColor mx-1 text-2xl">
                        call
                    </span>
                </div>
                <p class="textColor">{{ customerDetails.customer.customer_phone }}</p>
            </div>
            <div class="flex my-3 lg:my-1 align-items-center mx-5 justify-content-center flex-column">
                <div class="flex align-items-center my-2">
                    <h4 class="primaryColor">العنوان</h4>
                    <span class="material-symbols-outlined primaryColor mx-1 text-2xl">
                        import_contacts
                    </span>
                </div>
                <p class="textColor">{{ customerDetails.customer.customer_address }}</p>
            </div>
            <div class="flex my-3 lg:my-1 align-items-center mx-5 justify-content-center flex-column">
                <div class="flex align-items-center my-2">
                    <h4 class="primaryColor">البريد الالكتروني</h4>
                    <span class="material-symbols-outlined primaryColor mx-1 text-2xl">
                        call
                    </span>
                </div>
                <p class="textColor">{{ customerDetails.customer.customer_email }}</p>
            </div>
            <Button type="button" class="mb-3 px-5 lg:mb-0 mx-2 mt-3" @click="push({path : `/customer/update/${customerDetails.customer.id}` , 
            query : {isPrivate : customerDetails.is_private ? 'true' : 'false'} })" label="تعديل" />
        </div>
        
        <h3 class="flex lg:hidden text-center my-2 m-auto justify-content-center textColor">المستوي الحالي</h3>
        <h3 class="hidden lg:flex p-3 mt-4 textColor">المستوي الحالي</h3>
        <div class="p-3 py-5 bg-card borderRound flex flex-wrap justify-content-center align-items-center">
            <div class="flex my-3 lg:my-1 align-items-center mx-5 justify-content-center flex-column">
                <div class="flex align-items-center my-2">
                    <h4 class="primaryColor">المستوي</h4>
                    <span class="material-symbols-outlined primaryColor mx-1 text-2xl">
                        star
                    </span>
                </div>
                <p class="textColor" v-if="customerDetails.customer.level">{{ customerDetails.customer.level.level_name }}</p>
                <p class="textColor" v-else>غير محدد</p>
            </div>
            <div class="flex my-3 lg:my-1 align-items-center mx-5 justify-content-center flex-column">
                <div class="flex align-items-center my-2">
                    <h4 class="primaryColor">المستوي الفرعي</h4>
                    <span class="material-symbols-outlined primaryColor text-2xl">
                        star
                    </span>
                </div>
                <p class="textColor" v-if="subLevel">{{ subLevel.sublevel_name }}</p>
                <p class="textColor" v-else>غير محدد</p>
            </div>
            <Button type="button" class="mb-3 px-5 lg:mb-0 mx-2 mt-3" @click="isDialogVisible = true" label="تعديل" />
        </div>


        <div class="flex ">
            <h3 class="flex lg:hidden text-center mb-2 mt-5 m-auto justify-content-center textColor">بيانات الاشتراك</h3>
            <h3 class="hidden lg:flex py-3 textColor mt-5">بيانات الاشتراك</h3>
        </div>
        <div class="p-3 py-5 bg-card borderRound flex flex-wrap justify-content-center align-items-center">
            <div class="flex my-3 lg:my-1 align-items-center mx-5 justify-content-center flex-column">
                <div class="flex align-items-center my-2">
                    <h4 class="primaryColor">الحالة</h4>
                    <span class="material-symbols-outlined primaryColor mx-1 text-2xl">
                        live_help
                    </span>
                </div>
                <Tag :severity="getSeverity(customerDetails.state)" class="p-2 px-3" :value="getStateValue(customerDetails.state)"></Tag>
            </div>
            <div class="flex my-3 lg:my-1 align-items-center mx-5 justify-content-center flex-column">
                <div class="flex align-items-center my-2">
                    <h4 class="primaryColor">الفرع</h4>
                    <span class="material-symbols-outlined primaryColor mx-1 text-2xl">
                        home
                    </span>
                </div>
                <p class="textColor">{{ customerDetails.branch.branch_name }}</p>
            </div>
            <div class="flex my-3 lg:my-1 align-items-center mx-5 justify-content-center flex-column">
                <div class="flex align-items-center my-2">
                    <h4 class="primaryColor">الأكاديمية</h4>
                    <span class="material-symbols-outlined primaryColor mx-1 text-2xl">
                        group
                    </span>
                </div>
                <p class="textColor">{{ customerDetails.academy_name }}</p>
            </div>
            <div class="flex my-3 lg:my-1 align-items-center mx-5 justify-content-center flex-column">
                <div class="flex align-items-center my-2">
                    <h4 class="primaryColor">نوع التمرين</h4>
                    <span class="material-symbols-outlined primaryColor text-2xl mx-2">
                        category
                    </span>
                </div>
                <p style="color: white;">{{ customerDetails.category.category_name }}</p>
            </div>
            <div class="flex my-3 lg:my-4 align-items-center mx-5 justify-content-center flex-column">
                <div class="flex align-items-center my-2">
                    <h4 class="primaryColor">المدرب</h4>
                    <span class="material-symbols-outlined primaryColor text-2xl mx-2">
                        scuba_diving
                    </span>
                </div>
                <p style="color: white;">كابتن / {{ customerDetails.coach.name }}</p>
            </div>
            <div v-if="customerDetails.is_private" class="flex my-3 lg:my-4 align-items-center mx-5 justify-content-center flex-column">
                <div class="flex align-items-center my-2">
                    <h4 class="primaryColor">نوع الاشتراك</h4>
                    <span class="material-symbols-outlined primaryColor mx-1 text-2xl mx-2">
                        supervisor_account
                    </span>
                </div>
                <p class="textColor">برايفت</p>
            </div>
            <div class="flex my-3 lg:my-4 align-items-center mx-5 justify-content-center flex-column">
                <div class="flex align-items-center my-2">
                    <h4 class="primaryColor">طريقة الدفع</h4>
                    <span class="material-symbols-outlined primaryColor mx-1 text-2xl">
                        monetization_on
                    </span>
                </div>
                <p class="textColor" v-if="customerDetails.subscription_type == 'cash'">كاش</p>
                <p class="textColor" v-else>تقسيط</p>
            </div>
            <div class="flex my-3 lg:my-4 align-items-center mx-5 justify-content-center flex-column">
                <div class="flex align-items-center my-2">
                    <h4 class="primaryColor">الحصص المتبقية</h4>
                    <span class="material-symbols-outlined primaryColor mx-1 text-2xl">
                        today
                    </span>
                </div>
                <p class="textColor">{{ customerDetails.number_of_sessions }} حصص</p>
            </div>
            <div class="flex my-3 lg:my-4 align-items-center mx-5 justify-content-center flex-column">
                <div class="flex align-items-center my-2">
                    <h4 class="primaryColor">الدعوات المتاحة</h4>
                    <span class="material-symbols-outlined primaryColor mx-1 text-2xl">
                        today
                    </span>
                </div>
                <p class="textColor" v-if="customerDetails.invitations">{{ customerDetails.invitations }} دعوات</p>
                <p class="textColor" v-else>0 دعوات</p>
            </div>
            <div class="flex my-3 lg:my-4 align-items-center mx-5 justify-content-center flex-column">
                <div class="flex align-items-center my-2">
                    <h4 class="primaryColor">تاريخ الانتهاء</h4>
                    <span class="material-symbols-outlined primaryColor mx-1 text-2xl">
                        calendar_month
                    </span>
                </div>
                <p class="textColor">{{ customerDetails.expiration_date }}</p>
            </div>
            <div class="flex my-3 lg:my-4 align-items-center mx-5 justify-content-center flex-column">
                <div class="flex align-items-center my-2">
                    <h4 class="primaryColor">تاريخ الاشتراك</h4>
                    <span class="material-symbols-outlined primaryColor mx-1 text-2xl">
                        calendar_month
                    </span>
                </div>
                <p class="textColor">{{ customerDetails.subscription_date }}</p>
            </div>
            <div class="flex my-3 lg:my-4 align-items-center mx-5 justify-content-center flex-column">
                <div class="flex align-items-center my-2">
                    <h4 class="primaryColor">الأيام المتبقية</h4>
                    <span class="material-symbols-outlined primaryColor mx-1 text-2xl">
                        today
                    </span>
                </div>
                <p class="textColor">{{ customerDetails.daysLeft }} يوم</p>
            </div>
            <Button type="button" class="mb-3 px-5 lg:mb-0 mx-2 mt-3" label="تعديل"
             @click="push({path : `/customer/update/${customerDetails.customer.id}` , 
             query : {updateSubscription : 'true' , isPrivate : customerDetails.is_private ? 'true' : 'false'} })" />
        </div>
        <div>
            <h3 class="flex text-right sm:text-center mb-2 mt-5 m-auto textColor">تجميد الاشتراك</h3>
            <div class="p-3 py-5 bg-card borderRound ">
                <div class="flex flex-column md:flex-row align-items-center my-2" :class="{'justify-content-between' : customerDetails.isfrozen || daysLeftForFreezeStart , 'justify-content-center' : !customerDetails.isfrozen}">
                    <h3 v-if="customerDetails.avail_freeze_days == 0" class="textColor text-center my-2">انتهت الأيام المتاحة للتجميد</h3>
                    <h3 v-else class="textColor text-center my-2">الأيام المتاحة للتجميد : {{ customerDetails.avail_freeze_days }} يوم</h3>
                    <Button type="button" :loading="isFreezeCancellingLoading" v-if="customerDetails.isfrozen || daysLeftForFreezeStart" class="px-5 mx-2 my-2" @click="cancelFreeze()" label="الغاء التجميد" />
                </div>
                <hr/>
                <h4 v-if="daysLeftForFreezeStart" class="textColor bg-card p-3 borderRound text-center my-2">سيبدأ التجميد بعد : {{ daysLeftForFreezeStart }} يوم</h4>
                <div class="w-8 my-2 mx-auto">
                    <success-msg v-if="updatedSuccessfully" class="fadeinright animation-duration-1000 animation-iteration-1 "></success-msg>
                </div>
                <FormKit type="form" v-model="customerDetails" :actions="false" @submit="freezeSubscription">
                <div class="flex grid my-3 align-items-center">
                    <div class="col-12 md:col-6">
                        <div class="flex align-items-center">
                            <label for="freeze_start_date" class="px-3 py-1 text-white text-sm">تاريخ بداية التجميد</label>
                        </div>
                        <div v-if="customerDetails.state == 'frozen' || daysLeftForFreezeStart">
                            <FormKit
                            type="datepicker"
                            name="freeze_start_date"
                            label="تاريخ التجميد"
                            id="freeze_start_date"
                            :format="{ date: 'short' }"
                            validation="required"
                            :min-date="new Date(yesterday)"
                            :max-date="new Date(customerDetails.expiration_date)"
                            />
                        </div>
                        <div v-else>
                            <FormKit
                            type="datepicker"
                            name="freeze_start_date"
                            label="تاريخ التجميد"
                            id="freeze_start_date"
                            :format="{ date: 'short' }"
                            validation="required"
                            :min-date="new Date(yesterday)"
                            :value="new Date()"
                            :max-date="new Date(customerDetails.expiration_date)"
                            />
                        </div>
                    </div>
                    <div class="col-12 md:col-6">
                        <div class="flex align-items-center">
                            <label for="freeze_end_date" class="px-3 py-1 text-white text-sm">تاريخ انتهاء التجميد</label>
                        </div>
                        <FormKit
                        type="datepicker"
                        name="freeze_end_date"
                        label="تاريخ انتهاء التجميد"
                        id="freeze_end_date"
                        :min-date="new Date(customerDetails.freeze_start_date)"
                        :max-date="maxFreezeDate"
                        :format="{ date: 'short' }"
                        validation="required"
                        />
                    </div>
                    <Button type="submit" :disabled="customerDetails.avail_freeze_days == 0" class="mb-3 px-5 w-5 lg:mb-0 mx-auto mt-3" :loading="isFreezeLoading" label="تجميد" />
                </div>
                </FormKit>
            </div>
        </div>

        <!-- Installments details and management -->
        <h3 v-if="customerDetails.installments && customerDetails.installments.length > 0" class="flex text-right sm:text-center mt-5 m-auto textColor">الأقساط</h3>
        <div v-if="customerDetails.installments && customerDetails.installments.length > 0" 
            class="flex bg-card p-2 borderRound my-5 flex-wrap justify-content-center align-items-center w-full">
            <div v-for="(installment , index) in customerDetails.installments" class="max-w-30rem" :key="index">
                <div class="bg-card py-2 borderRound m-3">
                    <div v-if="!installment.paid">
                        <h3 class="textColor text-center py-2 bg-orange-600" v-if="new Date() < new Date(installment.due_date)">
                            موعد الاستحقاق بعد : {{ Math.ceil((new Date(installment.due_date).getTime() - new Date().getTime()) / (1000 * 3600 * 24)) }} يوم
                        </h3>
                        <h3 class="textColor text-center py-2 bg-red-600" v-else>
                            المبلغ المستحق متأخر : {{ Math.ceil((new Date().getTime() - new Date(installment.due_date).getTime()) / (1000 * 3600 * 24)) }} يوم
                        </h3>
                    </div>
                    <div v-else>
                        <h3 class="textColor text-center py-2 bg-green-500">تم الدفع</h3>
                    </div>
                    <FormKit type="form" v-model="customerDetails.installments[index]" :actions="false" @submit="editInstallment(installment.id , index)">
                    <div class="flex grid my-3 align-items-center">
                        <div class="col-12">
                            <div class="flex align-items-center">
                                <label for="due_date" class="px-3 py-1 text-white text-sm">تاريخ الاستحقاق</label>
                            </div>
                            <FormKit
                            type="datepicker"
                            name="due_date"
                            label="تاريخ الاستحقاق"
                            id="due_date"
                            :format="{ date: 'short' }"
                            validation="required"
                            :min-date="new Date(yesterday)"
                            :max-date="new Date(customerDetails.expiration_date)"
                            />
                        </div>
                        <div class="col-12">
                            <div class="flex align-items-center">
                                <label for="amount" class="px-3 py-1 text-white text-sm">المبلغ المستحق</label>
                            </div>
                            <FormKit type="number" id="amount" prefix-icon="dollar" number="float" name="amount" label="المبلغ المستحق"  />
                        </div>
                        <Button type="submit" :disabled="installment.paid"
                        class="mb-3 px-5 w-8 lg:mb-0 mx-auto mt-2" :loading="isInstallmentLoading" label="تعديل" />
                        <div class="flex flex-column lg:flex-row justify-content-center w-full" style="direction: ltr;">
                            <Button type="button" :disabled="installment.paid"
                             class="mb-3 px-5 w-6 lg:mb-0 mx-1 mt-2" icon="pi pi-dollar" @click="payInstallment(installment.id)" label="دفع" />
                            <Button type="button" :disabled="installment.paid"
                             class="mb-3 px-5 w-6 lg:mb-0 mx-1 mt-2" icon="pi pi-trash" @click="deleteInstallment(installment.id)" label="حذف" />
                        </div>
                    </div>
                    </FormKit>
                </div>
            </div>
        </div>

        <div v-if="PenultimateSubscription" class="mt-5 m-auto w-full flex justify-content-center flex-column">
            <Button type="button" :disabled="PenultimateSubscription.length == 0 || PenultimateSubscription.id == SubscriptionId"
            class="mb-3 px-5 w-6 lg:mb-0 m-auto" @click="isPenultimateSubscriptionVisible = true" label="تفاصيل اخر اشتراك" />
            <h4 v-if="PenultimateSubscription.length == 0 || PenultimateSubscription.id == SubscriptionId" class="text-center" style="color: rgba(255, 0, 0, 0.867);">ليس له اشتراكات سابقة</h4>
        </div>
        <div class="m-auto my-3 w-full flex justify-content-center flex-column">
            <Button type="button" :disabled="true"
            class="mb-3 px-5 w-6 lg:mb-0 m-auto" @click="subscriptionUpgrade" label="تجديد الاشتراك" />
            <!-- <h4  class="text-center" style="color: rgba(255, 0, 0, 0.867);">ليس له اشتراكات سابقة</h4> -->
        </div>

        <!-- training scheduels  -->
    <div class="flex justify-content-center m-auto w-full">
        <div class="w-full flex flex-column m-auto justify-content-center">
            <div class="flex m-auto">
                <h3 class="flex lg:hidden text-center mb-2 mt-5 m-auto justify-content-center textColor">جدول المواعيد</h3>
                <h3 class="hidden lg:flex py-3 textColor mt-5">جدول المواعيد</h3>
            </div>
            <div class="p-3 w-8 m-auto md:w-7 lg:w-5 py-5 bg-card borderRound flex flex-wrap justify-content-around align-items-center">
                <div class="flex">
                    <div class="flex my-3 lg:my-1 align-items-center mx-5 justify-content-center flex-column">
                        <div class="flex align-items-center my-2">
                            <h4 class="primaryColor">اليوم</h4>
                            <span class="material-symbols-outlined primaryColor mx-1 text-2xl">
                                today
                            </span>
                        </div>
                        <div class="flex flex-column align-items-center justify-content-center"
                        v-for="(schedule , index) in customerDetails.training_schedules" :key="index">
                            <p class="textColor my-3">{{ schedule.day }}</p>
                        </div>
                    </div>
                    <div class="flex my-3 lg:my-1 align-items-center mx-5 justify-content-center flex-column">
                        <div class="flex align-items-center my-2">
                            <h4 class="primaryColor">الساعة</h4>
                            <span class="material-symbols-outlined primaryColor mx-1 text-2xl">
                                hourglass_top
                            </span>
                        </div>
                        <div class="flex flex-column align-items-center justify-content-center"
                        v-for="(schedule , index) in customerDetails.training_schedules" :key="index">
                            <p class="textColor my-3">{{ schedule.time }}</p>
                        </div>
                    </div>
                </div>
                <Button type="button" class="mb-3 px-5 lg:mb-0 mx-2 mt-3" label="تعديل"
                 @click="push({path : `/customer/update/${customerDetails.customer.id}` , 
                 query : {updateSubscription : 'true' , isPrivate : customerDetails.is_private ? 'true' : 'false'} })" />
            </div>
        </div>
    </div>

    </div>


</template>
<style>
.p-treeselect-panel .p-treeselect-items-wrapper .p-tree {
    direction: ltr;
}
.bg-card{
    background-color: rgba(255, 255, 255, 0.029);
}
.primaryColor{
    color: #9b9bad;
}
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
    width: 70%;
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