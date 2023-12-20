<script setup lang="ts">
import axios from 'axios';
import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';

import { useRouter } from 'vue-router';
const { push , currentRoute } = useRouter();
import { ref, onBeforeMount } from 'vue';
import { FilterMatchMode, FilterOperator } from 'primevue/api';
import { adminAuthorize } from '@/global-functions/checkUserRole';
import { employeeAuthorize } from '@/global-functions/isEmployeeAuthorized';
import successMsg from '../../components/successMsg.vue'
import InlineMessage from 'primevue/inlinemessage';
import ConfirmPopup from 'primevue/confirmpopup';
import { useConfirm } from "primevue/useconfirm";
import Dialog from 'primevue/dialog';
import Timeline from 'primevue/timeline';
import type { Ref } from 'vue';

const isFetched : any = ref(false);
const updateLoading : any = ref(false);
const loading : any = ref(true);
const isCustomerFetched = ref(false)
const customer = ref()
const subscriptions = ref()
const installments = ref()
const sublevel = ref()
type views = 'home' | 'subscriptions' | 'installments'
const activeView : Ref<views> = ref('home')

const checkpoints : any = ref([]);

const customerAuthorize = () => {
    axios.post('http://127.0.0.1:8000/api/customerAuthorize').then((result) => {
        customer.value = result.data.customer
        subscriptions.value = result.data.subscriptions
        sublevel.value = result.data.sublevel
        installments.value = result.data.installments
        sublevel.value[0].checkpoints.forEach((checkpoint : any) => {
            checkpoints.value.push({status : checkpoint.checkpoint_name}) 
        });
        isCustomerFetched.value = true
    }).catch((err) => {
        push({path : '/login' , query : currentRoute.value.query})
    });
}

onBeforeMount(() => {
    let token = localStorage.getItem('SwimmingToken');
    if (token) {      
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      customerAuthorize()
    }
    setTimeout(() => {
        loading.value = false
    }, 2400);
})
</script>

<template>
    <div v-if="!loading && isCustomerFetched" class="p-5 mx-auto" style="margin-bottom: 12vh;">
        <div class="w-full md:w-9 mx-auto" v-if="activeView == 'home'">
            <h2 class="text-center text-white fadein animation-duration-500 my-3 animation-iteration-1">الصفحة الشخصية</h2>
            <div class="flipright boxShadowRight animation-duration-1000 animation-iteration-1 p-3 py-2 bg-card borderRound flex justify-content-center align-items-center">
                <div class="flex my-3 lg:my-1 align-items-center mx-4 justify-content-center flex-column">
                    <div class="flex align-items-center my-2">
                        <h4 class="primaryColor">الاسم</h4>
                        <span class="material-symbols-outlined primaryColor text-2xl">
                            person
                        </span>
                    </div>
                    <p class="textColor">{{ customer.customer_name.split(' ').slice(0, 2).join(" ") }}</p>
                </div>
                <div class="flex my-3 lg:my-1 align-items-center mx-4 justify-content-center flex-column">
                    <div class="flex align-items-center my-2">
                        <h4 class="primaryColor">الكود</h4>
                        <span class="material-symbols-outlined primaryColor mx-1 text-2xl">
                            fingerprint
                        </span>
                    </div>
                    <p class="textColor">{{ customer.id }}</p>
                </div>
            </div>
            <div style="padding-bottom: 5vh;">
                <h3 class="textColor text-center marginTop mb-3">المستوي الحالي</h3>
                <div class="flipleft boxShadowLeft animation-duration-1000 animation-iteration-1  py-3 bg-card borderRound flex flex-wrap justify-content-center align-items-center">
                    <div class="flex my-3 lg:my-1 align-items-center mx-4 justify-content-center flex-column">
                        <div class="flex align-items-center my-2">
                            <h3 class="primaryColor">المستوي</h3>
                            <span class="material-symbols-outlined primaryColor text-2xl">
                                star
                            </span>
                        </div>
                        <p v-if="customer.level.level_name" class="textColor text-xl text-center">{{ customer.level.level_name }}</p>
                        <p v-else class="textColor text-xl text-center">غير محدد</p>
                    </div>
                    <div v-if="sublevel[0].sublevel_name" class="flex my-3 lg:my-1 align-items-center mx-4 justify-content-center flex-column">
                        <div class="flex align-items-center my-2">
                            <h3 class="primaryColor">المستوي الفرعي</h3>
                            <span class="material-symbols-outlined primaryColor mx-1 text-2xl">
                                hotel_class
                            </span>
                        </div>
                        <p class="textColor text-center">{{ sublevel[0].sublevel_name }}</p>
                    </div>
                    <div class="zoomin animation-duration-2000 animation-iteration-1">
                        <div class="card flex flex-wrap gap-6 mt-2">
                            <Timeline :value="checkpoints" align="alternate" class="w-full md:w-20rem">
                                <template #content="slotProps">
                                    <p style="background: rgba(0, 128, 0, 0.932); font-size: 13px; width: 105%;"  class="textColor text-center p-2 borderRound m-auto">{{ slotProps.item.status }}</p>
                                </template>
                            </Timeline>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!-- Customer Installments -->
        <div class="w-full md:w-9 mx-auto" v-if="activeView == 'installments'" style="direction: rtl;">
            <h2 class="text-center textColor">الأقساط المستحقة</h2>
            <div v-for="installment in installments" class="bg-card borderRound p-3 my-4 zoomin animation-duration-1000 animation-ease-in-out animation-iteration-1">
                <h4 class="textColor text-center py-2 bg-orange-600 px-2" v-if="new Date() < new Date(installment.due_date)">
                    موعد الاستحقاق بعد : {{ Math.ceil((new Date(installment.due_date).getTime() - new Date().getTime()) / (1000 * 3600 * 24)) }} يوم
                </h4>
                <h4 class="textColor text-center py-2 bg-red-600 px-2" v-else>
                    المبلغ المستحق متأخر : {{ Math.ceil((new Date().getTime() - new Date(installment.due_date).getTime()) / (1000 * 3600 * 24)) }} يوم
                </h4>
                <div class="flex my-3 lg:my-1 align-items-center mx-4 justify-content-center flex-column">
                    <div class="flex align-items-center my-2">
                        <h4 class="primaryColor">تاريخ الاستحقاق</h4>
                        <span class="material-symbols-outlined primaryColor mx-1 text-2xl">
                            today
                        </span>
                    </div>
                    <p class="textColor">{{ installment.due_date }}</p>
                </div>
                <div class="flex my-3 lg:my-1 align-items-center mx-4 justify-content-center flex-column">
                    <div class="flex align-items-center my-2">
                        <h4 class="primaryColor">مبلغ القسط</h4>
                        <span class="material-symbols-outlined primaryColor mx-1 text-2xl">
                            attach_money
                        </span>
                    </div>
                    <p class="textColor">{{ installment.amount }} ج.م</p>
                </div>
            </div>
        </div>

        <!-- Subscription details -->
        <div class="w-full md:w-9 mx-auto" v-if="activeView == 'subscriptions'">
            <h2 class="text-center textColor">اشتراكاتك</h2>
            <div v-for="subscription in subscriptions" class="bg-card shadowBottom borderRound p-2 my-4 zoomin animation-duration-1000 animation-ease-in-out animation-iteration-1">
                <h4 class="textColor text-center py-2 bg-orange-600 px-2 flex align-items-center justify-content-center borderRound" v-if="subscription.is_private">
                    برايفت
                    <span class="material-symbols-outlined textColor mx-1 text-2xl">
                        lock
                    </span>
                </h4>
                <div class="flex flex-wrap  justify-content-center">
                    <div class="flex my-2 lg:my-1 align-items-center mx-4 justify-content-center flex-column">
                        <div class="flex align-items-center my-2">
                            <h4 class="primaryColor">الفرع</h4>
                            <span class="material-symbols-outlined primaryColor mx-1 text-2xl">
                                home
                            </span>
                        </div>
                        <p class="textColor text-sm">{{ subscription.branch.branch_name }}</p>
                    </div>
                    <div class="flex my-2 lg:my-1 align-items-center mx-4 justify-content-center flex-column ">
                        <div class="flex align-items-center my-2">
                            <h4 class="primaryColor">المدرب</h4>
                            <span class="material-symbols-outlined primaryColor mx-1 text-2xl">
                                scuba_diving
                            </span>
                        </div>
                        <p class="textColor text-sm">كابتن / {{ subscription.coach.name}}</p>
                    </div>
                    <div class="flex my-2 lg:my-1 align-items-center mx-4 justify-content-center flex-column ">
                        <div class="flex align-items-center my-2">
                            <h4 class="primaryColor">نوع التمرين</h4>
                            <span class="material-symbols-outlined primaryColor mx-1 text-2xl">
                                category
                            </span>
                        </div>
                        <p class="textColor text-sm"> {{ subscription.category_name}}</p>
                    </div>
                    <div class="flex my-2 lg:my-1 align-items-center mx-4 justify-content-center flex-column ">
                        <div class="flex align-items-center my-2">
                            <h4 class="primaryColor">الحصص المتبقية</h4>
                            <span class="material-symbols-outlined primaryColor mx-1 text-2xl">
                                today
                            </span>
                        </div>
                        <p class="textColor text-sm"> {{ subscription.number_of_sessions}} حصص</p>
                    </div>
                    <div class="flex my-2 lg:my-1 align-items-center mx-4 justify-content-center flex-column ">
                        <div class="flex align-items-center my-2">
                            <h4 class="primaryColor">الأيام المتاحة للتجميد</h4>
                            <span class="material-symbols-outlined primaryColor mx-1 text-2xl">
                                today
                            </span>
                        </div>
                        <p class="textColor text-sm"> {{ subscription.avail_freeze_days}} أيام</p>
                    </div>
                    <div class="flex bg-card borderRound" style="border-top: solid 2px white;">
                        <div class="flex my-3 lg:my-1 align-items-center mx-5 justify-content-center flex-column">
                            <div class="flex align-items-center my-2">
                                <h4 class="primaryColor">اليوم</h4>
                                <span class="material-symbols-outlined primaryColor mx-1 text-2xl">
                                    today
                                </span>
                            </div>
                            <div class="flex flex-column align-items-center justify-content-center"
                            v-for="(schedule , index) in subscription.training_schedules" :key="index">
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
                            v-for="(schedule , index) in subscription.training_schedules" :key="index">
                                <p class="textColor my-3">{{ schedule.time }}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    </div>
    <!-- NavBar -->
    <nav class="fixed z-5 p-4 gredBgg w-full flex justify-content-center" style="bottom: 2px; margin-top: 4vh;">
        <span class="material-symbols-outlined text-5xl mx-5 textColor" @click="activeView = 'installments'" :class="{'underline' : activeView == 'installments'}">
            monetization_on
        </span>            
        <span class="material-symbols-outlined text-5xl mx-5 textColor" @click="activeView = 'subscriptions'" :class="{'underline' : activeView == 'subscriptions'}">
            supervisor_account
        </span>            
        <span class="material-symbols-outlined text-5xl mx-5 textColor" @click="activeView = 'home'" :class="{'underline' : activeView == 'home'}">
            home
        </span>            
    </nav>
</template>
<style>
.p-confirm-popup .p-confirm-popup-icon {
    margin: 0 2vh;
}
.shadowBottom{
    box-shadow: rgba(240, 46, 170, 0.4) 0px 5px, rgba(240, 46, 170, 0.3) 0px 10px, rgba(240, 46, 170, 0.2) 0px 15px, rgba(240, 46, 170, 0.1) 0px 20px, rgba(240, 46, 170, 0.05) 0px 25px;
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
.p-datatable .p-datatable-header {
    background: rgba(255, 255, 255, 0.025);
    color: white;
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
.p-timeline .p-timeline-event-marker {
    border: 4.5px solid #009a33;
}
.gredBgg{
    background: linear-gradient(to top , #060e2cf0 0% , #1c1e396f 100%);
}
.marginTop{
    margin: 10vh auto;
    text-align: center;
}
.bg-card{
    background-color: rgba(255, 255, 255, 0.029);
}
.darkShadow{
    box-shadow: rgba(0, 0, 0, 0.16) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 3px 6px;
}
.boxShadowRight{
    box-shadow: rgba(240, 46, 170, 0.4) 5px 5px, rgba(240, 46, 170, 0.3) 10px 10px, rgba(240, 46, 170, 0.2) 15px 15px, rgba(240, 46, 170, 0.1) 20px 20px, rgba(240, 46, 170, 0.05) 25px 25px;
}
.boxShadowLeft{
    box-shadow: rgba(240, 46, 170, 0.4) -5px 5px, rgba(240, 46, 170, 0.3) -10px 10px, rgba(240, 46, 170, 0.2) -15px 15px, rgba(240, 46, 170, 0.1) -20px 20px, rgba(240, 46, 170, 0.05) -25px 25px;
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

.formkit-legend{
    color: white;
    font-family: 'Lato', sans-serif;
    font-family: 'Lemonada', cursive;
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