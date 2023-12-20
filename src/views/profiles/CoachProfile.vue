<script setup lang="ts">
import axios from 'axios';
import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';

import { useRouter } from 'vue-router';
const { push , currentRoute } = useRouter();
import { ref, onBeforeMount } from 'vue';
import { FilterMatchMode, FilterOperator } from 'primevue/api';
import InlineMessage from 'primevue/inlinemessage';
import Dialog from 'primevue/dialog';
import Timeline from 'primevue/timeline';
import type { Ref } from 'vue';
import Calendar from 'primevue/calendar';

const days = ['السبت' , 'الأحد' , 'الاثنين' , 'الثلاثاء' , 'الأربعاء' , 'الخميس' , 'الجمعة']
const isFetched : any = ref(false);
const updateLoading : any = ref(false);
const loading : any = ref(true);
const isCustomerFetched = ref(false)
const coach = ref()
const subscriptions = ref()
const trainingSchedules : any = ref([])
const attendances = ref()
const salaries = ref()
type views = 'home' | 'subscriptions' | 'installments'
const activeView : Ref<views> = ref('home')

const filters = ref(
    {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        category_name: { value: '', matchMode: FilterMatchMode.EQUALS },
        created_at: { value: null, matchMode: FilterMatchMode.DATE_AFTER },
        // id: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
    }
);

const options = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
    timeZone: 'Africa/Cairo',
    locale: 'ar'
};

const dateTimeFormatter = new Intl.DateTimeFormat('ar', options);

const coachAuthorize = () => {
    axios.post('http://127.0.0.1:8000/api/coachAuthorize').then((result) => {
        coach.value = result.data.coach
        subscriptions.value = result.data.subscriptions
        salaries.value = result.data.salaries
        attendances.value = result.data.attendances
        attendances.value.forEach((attendance : any) => {
            attendance.created_at = new Date(attendance.created_at)
        });
        subscriptions.value.forEach((subscription : any) => {
            subscription.training_schedules.forEach((schedule : any) => {
                schedule.branch = subscription.branch.branch_name
                schedule.category = subscription.category_name
                trainingSchedules.value.push(schedule) 
            });
        });
        isCustomerFetched.value = true
        solveSchedulesConflicts()
        console.log(trainingSchedules.value);
    }).catch((err) => {
        console.log(err);
        push({path : '/login' , query : currentRoute.value.query})
    });
}
const filteredData : any = ref([]);

const solveSchedulesConflicts = () => {

// Create a mapping of unique combinations of day, time, and branch
const uniqueCombinations : any = {};

// Loop through the data array
for (const schedule of trainingSchedules.value) {
  const { day, time, branch } = schedule;
  
  // Create a unique key based on day, time, and branch
  const key = `${day}-${time}`;
  
  // If the key already exists in uniqueCombinations
  if (uniqueCombinations[key]) {
    // Check if the branches conflict
    if (!uniqueCombinations[key].branches.includes(branch)) {
      // Add the conflicting branch to the existing object
      uniqueCombinations[key].branches.push(branch);
      uniqueCombinations[key].conflict = true;
    }
  } else {
    // Create a new object for the unique combination
    uniqueCombinations[key] = {
      day,
      time,
      branches: [branch],
      conflict: false
    };
  }
}

// Convert the unique combinations object back to an array
for (const key in uniqueCombinations) {
  filteredData.value.push(uniqueCombinations[key]);
}
console.log(filteredData.value);

}

onBeforeMount(() => {
    let token = localStorage.getItem('SwimmingToken');
    if (token) {      
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      coachAuthorize()
    }
    setTimeout(() => {
        loading.value = false
    }, 2400);
})
</script>

<template>
    <div v-if="!loading && isCustomerFetched" class="w-full md:w-9 p-5 mx-auto" style="margin-bottom: 12vh;">
        <div v-if="activeView == 'home'">
            <h2 class="text-center text-white fadein animation-duration-500 my-3 animation-iteration-1">الصفحة الشخصية</h2>
            <div class="flipright boxShadowRight animation-duration-1000 animation-iteration-1 p-3 py-2 bg-card borderRound flex justify-content-center align-items-center">
                <div class="flex my-3 lg:my-1 align-items-center mx-4 justify-content-center flex-column">
                    <div class="flex align-items-center my-2">
                        <h4 class="primaryColor">الاسم</h4>
                        <span class="material-symbols-outlined primaryColor text-2xl">
                            person
                        </span>
                    </div>
                    <p class="textColor">{{ coach.name.split(' ').slice(0, 2).join(" ") }}</p>
                </div>
                <div class="flex my-3 lg:my-1 align-items-center mx-4 justify-content-center flex-column">
                    <div class="flex align-items-center my-2">
                        <h4 class="primaryColor">الكود</h4>
                        <span class="material-symbols-outlined primaryColor mx-1 text-2xl">
                            fingerprint
                        </span>
                    </div>
                    <p class="textColor">{{ coach.id }}</p>
                </div>
            </div>

            <h2 class="textColor text-center my-5">جدول الحضور</h2>
            <div class="fadein animation-duration-1000 animation-iteration-1">
                <DataTable v-model:filters="filters" ref="dt"  stripedRows :value="attendances" paginator :rows="10"
                 :rowsPerPageOptions="[10, 20, 50 , 100]" filterDisplay="menu" dataKey="id" removableSort
                  :globalFilterFields="['id', 'category_name']" tableStyle="min-width: 50rem">
                    <template #header>
                    </template>
                    <Column field="session_duration" sortable  header="مدة التمرين" style="width: 20%;">
                        <template #body="slotProps" >
                            <p>{{ slotProps.data.session_duration }} ساعة</p>
                        </template>
                    </Column>
                    <Column field="branch.branch_name" sortable  header="الفرع" style="width: 15%;"></Column>
                    <Column field="created_at" sortable header="تاريخ الانشاء" style="30%">
                        <template #body="slotProps" >
                            <p>{{ dateTimeFormatter.format(new Date(slotProps.data.created_at)) }}</p>
                        </template>
                        <template #filter="{ filterModel, filterCallback }">
                            <Calendar v-model="filterModel.value" @input="filterCallback()" placeholder="تاريخ الحضور من بعد" showIcon showButtonBar inputId="created_at"></Calendar> 
                        </template>
                        <template #filterapply="{ filterCallback }">
                            <Button type="button" @click="filterCallback()" class="mb-3 lg:mb-0 mx-2" label="تفعيل" />
                        </template>
                        <template #filterclear="{ filterCallback }">
                            <Button type="button" @click="filterCallback()" class="mb-3 lg:mb-0 mx-2" label="الغاء" outlined />
                        </template>
                    </Column>
                    <Column field="category.category_name" sortable  header="نوع التمرين" style="width: 20%;"></Column>
                        
                    <template #empty> <InlineMessage severity="info">لا يوجد حضور</InlineMessage></template>
                    <template #footer> في المجموع هناك {{ attendances ? attendances.length : 0 }} حضور للتمارين </template>
                </DataTable>
            </div>
        </div>
        <!-- Coach sessions schedules -->

        <div v-if="activeView == 'installments'" style="direction: rtl;">
            <h2 class="text-center textColor">المرتبات</h2>
            <div v-for="salary in salaries">
                <div class="bg-card my-3 borderRound p-3 flex flex-wrap justify-content-between">
                    <div class="flex flex-column justify-content-center align-items-center">
                        <h4 class="primaryColor">الراتب</h4>
                        <h4 class="text-green-500">{{ parseFloat(salary.amount).toFixed(2) }} ج.م</h4>
                    </div>
                    <div class="flex flex-column justify-content-center align-items-center">
                        <h4 class="primaryColor">عدد ساعات العمل</h4>
                        <h4 class="text-green-500">{{ salary.hours_worked }} ساعات</h4>
                    </div>
                    <h5 v-if="salary.discount" class="w-full text-white text-center mt-3">تم صرف الراتب في : {{ new Date(salary.created_at).toLocaleDateString() }}</h5>
                    <div class="flex w-full flex-column justify-content-center align-items-center">
                        <h5 v-if="salary.discount" class="text-red-500 mt-3">خصم : -{{ parseFloat(salary.discount).toFixed(2) }} ج.م</h5>
                        <h5 v-if="salary.bonus" class="text-green-500 mt-2">بونص : +{{ parseFloat(salary.bonus).toFixed(2) }} ج.م</h5>
                        <div v-if="salary.notes" class="bg-card text-white my-2 text-xs p-2 borderRound">
                            <p>{{ salary.notes }}</p>
                        </div>
                    </div>
                    <!-- {{ salary }} -->
                </div>
            </div>
        </div>

        <!-- Coach sessions schedules -->
        <div v-if="activeView == 'subscriptions'">
            <h2 class="text-center textColor">مواعيد التمارين</h2>
            <div v-for="day in days" class="bg-card shadowBottom borderRound p-2 my-5 zoomin animation-duration-1000 animation-ease-in-out animation-iteration-1">
                <div class="flex align-items-center p-2">
                    <h2 class="primaryColor">{{ day }}</h2>
                    <span class="material-symbols-outlined primaryColor mx-1 text-2xl">
                        today
                    </span>
                </div>
                <div v-for="schedule in filteredData.filter((obj : any) => obj.day == day)" >
                    <div class="bg-card borderRound">
                        <div class="flex flex-wrap align-items-start justify-content-center" style="border-top: solid 2px white;">
                            <div class="flex my-3 lg:my-1 align-items-center mx-3 justify-content-center flex-column">
                                <div class="flex align-items-center my-2">
                                    <h4 class="primaryColor">الساعة</h4>
                                    <span class="material-symbols-outlined primaryColor mx-1 text-2xl">
                                        hourglass_top
                                    </span>
                                </div>
                                <div class="flex align-items-center justify-content-center">
                                    <p class="textColor my-2">{{ schedule.time.split(':').slice(0, 2).join(':') }}</p>
                                </div>
                            </div>
                            <div class="flex my-3 lg:my-1 align-items-center mx-3 justify-content-center flex-column">
                                <div class="flex align-items-center my-2">
                                    <h4 class="primaryColor">الفرع</h4>
                                    <span class="material-symbols-outlined primaryColor mx-1 text-2xl">
                                        home
                                    </span>
                                </div>
                                <div class="flex flex-column align-items-center justify-content-center">
                                    <p v-for="branch in schedule.branches" class="textColor my-2">{{ branch }}</p>
                                </div>
                            </div>
                        </div>
                        <div v-if="schedule.conflict" class="flex justify-content-center align-items-center">
                            <p class="textColor text-center borderRound py-2 px-2" style="background-color: rgba(201, 75, 99, 0.7);;">هناك تعارض في المواعيد يرجي التواصل مع الادارة لحل المشكلة</p>
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