<script setup lang="ts">
import {ref , onBeforeMount} from 'vue'
import type {Ref} from 'vue'
import Sidebar from 'primevue/sidebar';
import { useRouter } from 'vue-router';
import { adminAuthorize } from '@/global-functions/checkUserRole';
import { employeeAuthorize } from '@/global-functions/isEmployeeAuthorized';
import SplitButton from 'primevue/splitbutton';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import axios from 'axios';
const { push , currentRoute } = useRouter();
const isExpanded = ref(false)
const empPermissions = ref()
const showPrivateCategories = ref()
const isMobExpanded = ref(false)
const fetched = ref(false)
const visible = ref(true)
type userType = 'admin' | 'employee' 
const type : Ref<userType> = ref('admin')
const showEmployeeTypes = ref(false)
const showManagementCategories = ref(false)
const showProductsTypes = ref(false)
const showBracnhesCategories = ref(false)
const showFinancialsCategories = ref(false)
const showCustomersCategories = ref(false)

const isProfileDialogVisible = ref(false)
const isResetPasswordFormVisible = ref(false)
const isUserProfileUpdating = ref(false)
const errMsg = ref()

const loggedInUserInfo = ref()
const adminControlOptions = [
    {
        label: 'تعديل البيانات',
        icon: 'pi pi-pencil',
        command: () => {
          isProfileDialogVisible.value = true
        }
    },
    {
        label: 'تسجيل دخول كموظف',
        icon: 'pi pi-external-link',
        command: () => {
          localStorage.removeItem('SwimmingToken');
          push({
            path : '/login',
            query : {
              userType : 'employee'
            }
          })
        }
    },
    {
        label: 'تسجيل دخول كمدرب',
        icon: 'pi pi-external-link',
        command: () => {
          localStorage.removeItem('SwimmingToken');
          push({
            path : '/login',
            query : {
              userType : 'coach'
            }
          })
        }
    },
    { 
      label: 'تسجيل خروج', 
      icon: 'pi pi-sign-out',
      command: () => {
        logOut()
      }
    }
];
const employeeControlOptions = [
    {
        label: 'تعديل البيانات',
        icon: 'pi pi-pencil',
        command: () => {
          isProfileDialogVisible.value = true
        }
    },
    { 
      label: 'تسجيل خروج', 
      icon: 'pi pi-sign-out',
      command: () => {
        logOut()
      }
    }
];

const logOut = () => {
  localStorage.removeItem('SwimmingToken');
  if(type.value == 'employee'){
    push({name : 'login' , query : {userType : 'employee'}})
  }
  else{
    push({name : 'login'})
  }
}
onBeforeMount(() => {
    adminAuthorize().then((isAuthorized) => {
        if(isAuthorized == false){
            employeeAuthorize().then((employee) => {
                if(employee == false){
                  visible.value = false
                }
                empPermissions.value = employee.permissions
                type.value = 'employee'
                fetched.value = true
                loggedInUserInfo.value = JSON.parse(localStorage.getItem('user_info') as string)
                console.log(empPermissions.value);
            })
        }
        else{
          loggedInUserInfo.value = JSON.parse(localStorage.getItem('user_info') as string)
          type.value = 'admin'
          fetched.value = true
        }
    })
})

const updateUserProfile = (req : any) => {
  isUserProfileUpdating.value = true
  axios.post('http://127.0.0.1:8000/api/userUpdate', req).then((result) => {
    localStorage.setItem('user_info' , JSON.stringify(result.data.user))
    isUserProfileUpdating.value = false
    isProfileDialogVisible.value = false
  }).catch((err) => {
    errMsg.value = 'البريد الالكتروني موجود بالفعل'
    isUserProfileUpdating.value = false
  });
}
const resetUserPassword = (req : any) => {
  isUserProfileUpdating.value = true
  axios.post('http://127.0.0.1:8000/api/resetPw', req).then((result) => {
    isUserProfileUpdating.value = false
    isProfileDialogVisible.value = false
  }).catch((err) => {
    errMsg.value = 'كلمة السر الحالية غير صحيحة'
    isUserProfileUpdating.value = false
  });
}

const handleViewPassword = (node : any, e : any) => {
    node.props.suffixIcon = node.props.suffixIcon === 'eye' ? 'eyeClosed' : 'eye'
    node.props.type = node.props.type === 'password' ? 'text' : 'password'
}

const isEmpAuthorizedFor = (PermissionName : string) => {
  if(type.value == 'admin'){
    return true
  }
  else{
    let filteredPermission =  empPermissions.value.filter((permission : any) => permission.role_name == PermissionName)
    return filteredPermission.length > 0
  }
}
const expandSidebar = () => {
    isExpanded.value = true
}
const collapseSidebar = () => {
    isExpanded.value = false
}
const closeSideBar = () => {
  isMobExpanded.value = false
}
</script>
<template>

  <Dialog v-model:visible="isProfileDialogVisible" header="البيانات الشخصية" modal :style="{ width: '40rem' }" @after-hide="isResetPasswordFormVisible = false; errMsg = null">
    <div class="w-full py-1 p-4 flex flex-column justify-content-center">
      <div v-if="errMsg" class="formkit-message">
        <h4 class="text-center fadein animation-duration-200">{{ errMsg }}</h4>
      </div>
        <FormKit v-if="isResetPasswordFormVisible" :actions="false" type="form" @submit="resetUserPassword">
            <FormKit prefixIcon="password" name="current_password" outerClass="my-3" type="password" label="كلمة السر الحالية"
            placeholder="أدخل كلمة السر الحالية" suffix-icon="eyeClosed" @suffix-icon-click="handleViewPassword"
            suffix-icon-class="hover:text-blue-500" validation="required|length:8,16" />

            <FormKit prefixIcon="password" name="new_password" outerClass="my-3" type="password" label="كلمة السر"
            placeholder="أدخل كلمة السر" suffix-icon="eyeClosed" @suffix-icon-click="handleViewPassword"
            suffix-icon-class="hover:text-blue-500" validation="contains_numeric|contains_alpha|required|length:8,16" />

            <FormKit type="password" name="new_password_confirm" prefixIcon="password" label="تأكيد كلمة السر"
            placeholder="أعد ادخال كلمة السر" suffix-icon="eyeClosed" @suffix-icon-click="handleViewPassword"
            suffix-icon-class="hover:text-blue-500" validation="required|confirm" />

            <div class="flex my-3 justify-content-between my-2 p-3">
                <Button label="حفظ كلمة السر" :loading="isUserProfileUpdating" class="text-sm" type="submit" />
                <Button label="تعديل البيانات" @click="isResetPasswordFormVisible = false" class="text-sm" />
            </div>
        </FormKit>

        <FormKit v-else :actions="false" v-model="loggedInUserInfo" type="form" @submit="updateUserProfile"> 
            <FormKit type="text" name="name" prefixIcon="avatarMan" validation="required"
             outer-class="mx-auto my-2" label="الاسم" placeholder="Please enter your full name .." />

             <FormKit v-if="type == 'admin'" type="text" name="username" prefixIcon="telephone" outer-class="mx-auto my-2"
            label="اسم المستخدم" validation="required" />

            <FormKit type="email" name="email" prefixIcon="email" outer-class="mx-auto my-2"
             label="البريد الالكتروني" validation="required|email" />

            <FormKit v-if="type == 'employee'" type="text" name="phone" prefixIcon="telephone" outer-class="mx-auto my-2"
             label="رقم الهاتف" validation="required" />

             
            <div class="flex justify-content-between my-2 p-3">
                <Button label="حفظ" :loading="isUserProfileUpdating" class="text-sm" type="submit" />
                <Button label="تغيير كلمة المرور" @click="isResetPasswordFormVisible = true" class="text-sm" />
            </div>
        </FormKit>
    </div>
</Dialog>
  <div v-if="visible && fetched">
    <div class="fixed cursor-pointer" style="top: 2vh; left: 2vh; direction: ltr;">
      <SplitButton v-if="type == 'admin'" :model="adminControlOptions" menuButtonIcon="pi pi-cog"  :label="loggedInUserInfo.name" rounded severity="secondary"></SplitButton>
      <SplitButton v-else :model="employeeControlOptions" menuButtonIcon="pi pi-cog"  :label="loggedInUserInfo.name" rounded severity="secondary"></SplitButton>
    </div>
    <span @click="isMobExpanded = true; isExpanded = true" class="fixed top-0 right-0 m-3 material-symbols-outlined textColor text-4xl bgColor p-2 borderRound flex lg:hidden">
      menu
      </span>
  </div>
  <div v-if="visible && fetched" class="hidden lg:flex">
    <div class="sidebar" v-if="currentRoute.path !== '/login'" :class="{ 'expanded': isExpanded }" @mouseenter="expandSidebar" @mouseleave="collapseSidebar">
      <div class="text-center p-2 py-5">
      <span class="material-symbols-outlined textColor mb-3 text-4xl">
        pool
      </span>
          <div class="flex align-items-center my-5 div-hover" :class="{'justify-content-center' : !isExpanded }" >
            <span class="material-symbols-outlined text-3xl textColor" :class="{'mx-3' : isExpanded }">
              analytics
            </span>            
            <router-link v-if="isExpanded" to="/"><h5 class="textColor">لوحة التحكم</h5></router-link>
          </div>
          <div class="flex align-items-center my-2 div-hover" @click="showCustomersCategories = !showCustomersCategories;" :class="{'justify-content-center' : !isExpanded ,  'my-5' : !showCustomersCategories }" >
            <span class="material-symbols-outlined text-3xl textColor" :class="{'mx-3' : isExpanded }">
              group
            </span>            
            <h3 v-if="isExpanded"><h6 class="textColor">المشتركين و المستويات</h6></h3>
          </div>
          <!-- Sub Categories for Customers   -->
          <div v-if="showCustomersCategories" class="px-3 py-1 fadein animation-duration-400 animation-iteration-1 borderRound" style="background: rgba(255, 255, 255, 0.066);">
            <div v-if="isEmpAuthorizedFor('عرض المشتركين')"  class="flex align-items-center my-3 div-hover" @click="push('/customers')" :class="{'justify-content-center' : !isExpanded , 'activeDivBg' : currentRoute.path == ('/customers') }" >
              <span class="material-symbols-outlined text-3xl textColor" :class="{'mx-3' : isExpanded }">
                group
              </span>            
              <router-link v-if="isExpanded" to="/customers"><h5 class="textColor">المشتركين</h5></router-link>
            </div>
            <div v-if="isEmpAuthorizedFor('عرض عملاء حجز فقط')" class="flex align-items-center my-3 div-hover" @click="push('/customers/reservedOnly')" :class="{'justify-content-center' : !isExpanded , 'activeDivBg' : currentRoute.path.includes('/customers/reservedOnly') }" >
              <span class="material-symbols-outlined text-3xl textColor" :class="{'mx-3' : isExpanded }">
                group
              </span>            
              <router-link v-if="isExpanded" to="/customers/reservedOnly"><h5 class="textColor">عملاء - حجز فقط</h5></router-link>
            </div>
            <div v-if="isEmpAuthorizedFor('تجديد و تسجيل اشتراكات')" class="flex align-items-center my-3 div-hover" @click="push('/customer/create')" :class="{'justify-content-center' : !isExpanded , 'activeDivBg' : currentRoute.path.includes('/customer/create') }" >
              <span class="material-symbols-outlined text-3xl textColor" :class="{'mx-3' : isExpanded }">
                demography
              </span>            
              <router-link v-if="isExpanded" to="/customer/create"><h5 class="textColor">تسجيل اشتراك</h5></router-link>
            </div>
            <div v-if="isEmpAuthorizedFor('تسجيل و تعديل التمرينات الفردية')" class="flex align-items-center my-3 div-hover" @click="push({path :'/customer/create' , query : {isPrivate : 'true'}})" :class="{'justify-content-center' : !isExpanded , 'activeDivBg' : currentRoute.path.includes('/customer/create') }" >
              <span class="material-symbols-outlined text-3xl textColor" :class="{'mx-3' : isExpanded }">
                demography
              </span>            
              <router-link v-if="isExpanded" to=""><h5 class="textColor">تسجيل برايفت</h5></router-link>
            </div>
            <div v-if="isEmpAuthorizedFor('مدفوعات اللاعبين')" class="flex align-items-center my-3 div-hover" @click="push({path : '/revenues' , query : {branchId : 0} })" :class="{'justify-content-center' : !isExpanded , 'activeDivBg' : currentRoute.path.includes('/revenues') }" >
              <span class="material-symbols-outlined text-3xl textColor" :class="{'mx-3' : isExpanded }">
                price_check
              </span>            
              <router-link v-if="isExpanded" to=""><h5 class="textColor">مدفوعات اللاعبين</h5></router-link>
            </div>
            <div v-if="isEmpAuthorizedFor('مدفوعات اللاعبين')" class="flex align-items-center my-3 div-hover" @click="push({path : '/revenues' , query : {branchId : 0 , filter : 'installments'} })" :class="{'justify-content-center' : !isExpanded , 'activeDivBg' : currentRoute.path.includes('/revenue') }" >
              <span class="material-symbols-outlined text-3xl textColor" :class="{'mx-3' : isExpanded }">
                payments
              </span>            
              <router-link v-if="isExpanded" to=""><h5 class="textColor">جميع الأقساط</h5></router-link>
            </div>
            <div v-if="isEmpAuthorizedFor('الأقساط المطلوبة')" class="flex align-items-center my-3 div-hover" @click="push({path : '/customers' , query : {showInstallments : 'true' } })" :class="{'justify-content-center' : !isExpanded }" >
              <span class="material-symbols-outlined text-3xl textColor" :class="{'mx-3' : isExpanded }">
                payments
              </span>            
              <router-link v-if="isExpanded" to=""><h5 class="textColor">الأقساط المطلوبة</h5></router-link>
            </div>
            <div v-if="isEmpAuthorizedFor('المستويات')" class="flex align-items-center my-3 div-hover"  @click="push('/levels')" :class="{'justify-content-center' : !isExpanded }" >
              <span class="material-symbols-outlined text-3xl textColor" :class="{'mx-3' : isExpanded }">
                hotel_class
              </span>            
              <router-link v-if="isExpanded" to="/levels"><h5 class="textColor">المستويات</h5></router-link>
            </div>
          </div>

          <div class="flex align-items-center my-2 div-hover" @click="showBracnhesCategories = !showBracnhesCategories;" :class="{'justify-content-center' : !isExpanded }" >
            <span class="material-symbols-outlined text-3xl textColor" :class="{'mx-3' : isExpanded }">
              home
            </span>            
            <h4 v-if="isExpanded"><h5 class="textColor">الكيانات</h5></h4>
          </div>
          <!-- Sub Categories for Branches   -->
          <div v-if="showBracnhesCategories" class="px-3 py-1 fadein animation-duration-400 animation-iteration-1 borderRound" style="background: rgba(255, 255, 255, 0.066);">
            <div v-if="isEmpAuthorizedFor('عرض الفروع')" class="flex align-items-center my-3 div-hover" @click="push('/branches')" :class="{'justify-content-center' : !isExpanded , 'activeDivBg' : currentRoute.path.includes('/coach') }" >
              <span class="material-symbols-outlined text-3xl textColor" :class="{'mx-3' : isExpanded }">
                home
              </span>            
              <router-link v-if="isExpanded" to="/branches"><h5 class="textColor">الفروع</h5></router-link>
            </div>
            <div v-if="isEmpAuthorizedFor('عرض الأكاديميات') || isEmpAuthorizedFor('انشاء أكاديمية')" class="flex align-items-center my-3 div-hover"  @click="push('/academies')" :class="{'justify-content-center' : !isExpanded }" >
              <span class="material-symbols-outlined text-3xl textColor" :class="{'mx-3' : isExpanded }">
                groups_2
              </span>            
              <router-link v-if="isExpanded" to="/academies"><h5 class="textColor">الأكاديميات</h5></router-link>
            </div>
            <div v-if="isEmpAuthorizedFor('عرض أنواع التمارين')" class="flex align-items-center my-3 div-hover" @click="push('/categories')" :class="{'justify-content-center' : !isExpanded }" >
              <span class="material-symbols-outlined text-3xl textColor" :class="{'mx-3' : isExpanded }">
                category
              </span>            
              <router-link v-if="isExpanded" to="/categories"><h5 class="textColor">انواع التمارين</h5></router-link>
            </div>
          </div>
          <div class="flex align-items-center mt-5 mb-2 div-hover" @click="showEmployeeTypes = !showEmployeeTypes" :class="{'justify-content-center' : !isExpanded }" >
            <span class="material-symbols-outlined text-3xl textColor" :class="{'mx-3' : isExpanded }">
              badge
            </span>            
            <h4 v-if="isExpanded"><h5 class="textColor">الموظفين</h5></h4>
          </div>
          <!-- Sub Categories for Employees   -->
            <div v-if="showEmployeeTypes" class="px-3 py-1 fadein animation-duration-400 animation-iteration-1 borderRound" style="background: rgba(255, 255, 255, 0.066);">
                <div v-if="isEmpAuthorizedFor('عرض المدربين')" class="flex align-items-center my-3 div-hover" @click="push('/coaches')" :class="{'justify-content-center' : !isExpanded , 'activeDivBg' : currentRoute.path.includes('/coach') }" >
                  <span class="material-symbols-outlined text-3xl textColor" :class="{'mx-3' : isExpanded }">
                    scuba_diving
                  </span>            
                  <router-link v-if="isExpanded" to="/coaches"><h5 class="textColor">المدربين</h5></router-link>
                </div>
                <div v-if="isEmpAuthorizedFor('عرض الموظفين')" class="flex align-items-center my-3 div-hover"  @click="push('/employees')" :class="{'justify-content-center' : !isExpanded }" >
                  <span class="material-symbols-outlined text-3xl textColor" :class="{'mx-3' : isExpanded }">
                    groups_2
                  </span>            
                  <router-link v-if="isExpanded" to="/employees"><h5 class="textColor">الموظفين</h5></router-link>
                </div>
            </div>
          <div v-if="isEmpAuthorizedFor('تسجيل الحضور')" class="flex align-items-center my-5 div-hover" @click="push('/attendance')" :class="{'justify-content-center' : !isExpanded }" >
            <span class="material-symbols-outlined text-3xl textColor" :class="{'mx-3' : isExpanded }">
              format_list_numbered_rtl
            </span>            
            <router-link v-if="isExpanded" to="/attendance"><h5 class="textColor">تسجيل حضور</h5></router-link>
          </div>
          <div  v-if="isEmpAuthorizedFor('تقرير الحضور اليومي')" class="flex align-items-center my-5 div-hover" @click="push('/daily/attendances')" :class="{'justify-content-center' : !isExpanded }" >
            <span class="material-symbols-outlined text-3xl textColor" :class="{'mx-3' : isExpanded }">
              today
            </span>            
            <router-link v-if="isExpanded" to="/daily/attendances"><h5 class="textColor">الحضور اليومي</h5></router-link>
          </div>

          <div class="flex align-items-center mt-5 mb-3 div-hover" @click="showPrivateCategories = !showPrivateCategories" :class="{'justify-content-center' : !isExpanded }" >
            <span class="material-symbols-outlined text-3xl textColor" :class="{'mx-3' : isExpanded }">
              pool
            </span>            
            <h4 v-if="isExpanded"><h5 class="textColor">تمرينات برايفت</h5></h4>  
          </div>

          <div v-if="showPrivateCategories" class="px-4 py-1 fadein animation-duration-400 animation-iteration-1 borderRound" style="background: rgba(255, 255, 255, 0.066);">
            <div v-if="isEmpAuthorizedFor('تسجيل و تعديل التمرينات البرايفت')" class="flex align-items-center my-3 div-hover" @click="push({path : '/customer/create' , query : {isPrivate : 'true'} })" :class="{'justify-content-center' : !isExpanded }" >
              <span class="material-symbols-outlined text-3xl textColor" :class="{'mx-3' : isExpanded }">
                badge
              </span>            
              <router-link v-if="isExpanded" :to="{
                path : '/customer/create' , query : {isPrivate : 'true'}
              }"><h5 class="textColor">تسجيل برايفت</h5></router-link>
            </div>
            <div v-if="isEmpAuthorizedFor('تسجيل سيمي برايفت')" class="flex align-items-center my-3 div-hover" @click="push({path : '/customer/create' , query : {isPrivate : 'true' , isSemiPrivate : 'true'} })" :class="{'justify-content-center' : !isExpanded }" >
              <router-link v-if="isExpanded" :to="{
                path : '/customer/create' , query : {isPrivate : 'true' , isSemiPrivate : 'true'}
              }"><h5 class="textColor mx-3 text-center">تسجيل سيمي برايفت</h5></router-link>
            </div>
            <div v-if="isEmpAuthorizedFor('عرض التمرينات البرايفت')" class="flex align-items-center my-3 div-hover" @click="push('/privateSubscriptions')" :class="{'justify-content-center' : !isExpanded }" >
              <span class="material-symbols-outlined text-3xl textColor" :class="{'mx-3' : isExpanded }">
                pool
              </span>            
              <router-link v-if="isExpanded" to="/privateSubscriptions"><h5 class="textColor">تمرينات برايفت</h5></router-link>
            </div>
          </div>

          <div v-if="isEmpAuthorizedFor('السلف و الخصومات')" class="flex align-items-center mt-5 mb-3 div-hover" @click="showManagementCategories = !showManagementCategories" :class="{'justify-content-center' : !isExpanded }" >
            <span class="material-symbols-outlined text-3xl textColor" :class="{'mx-3' : isExpanded }">
              manage_accounts
            </span>            
            <h4 v-if="isExpanded"><h5 class="textColor">الإدارة</h5></h4>
          </div>
          <!-- Sub Categories for Management  -->
          <div v-if="showManagementCategories" class="px-4 py-1 fadein animation-duration-400 animation-iteration-1 borderRound" style="background: rgba(255, 255, 255, 0.066);">
            <div  class="flex align-items-center my-3 div-hover" @click="closeSideBar(); push('/management')" :class="{'justify-content-center' : !isExpanded }" >
              <span class="material-symbols-outlined text-3xl textColor" :class="{'mx-3' : isExpanded }">
                badge
              </span>            
              <router-link v-if="isExpanded" to="/management"><h6 class="textColor">السلف و الخصومات</h6></router-link>
            </div>
        </div>

          <div v-if="isEmpAuthorizedFor('الحسابات المالية')" class="flex align-items-center mt-5 mb-2 div-hover" @click="showFinancialsCategories = !showFinancialsCategories" :class="{'justify-content-center' : !isExpanded }" >
            <span class="material-symbols-outlined text-3xl textColor" :class="{'mx-3' : isExpanded }">
              payments
            </span>            
            <h4 v-if="isExpanded"><h5 class="textColor">حسابات مالية</h5></h4>
          </div>
          <!-- Sub Categories for Financials  -->

          <div v-if="showFinancialsCategories" class="px-3 py-1 fadein animation-duration-400 animation-iteration-1 borderRound" style="background: rgba(255, 255, 255, 0.066);">
            <div v-if="isEmpAuthorizedFor('تقرير الإيرادات')" class="flex align-items-center my-3 div-hover" @click="push('/revenues')" :class="{'justify-content-center' : !isExpanded , 'activeDivBg' : currentRoute.path.includes('/coach') }" >
              <span class="material-symbols-outlined text-3xl textColor" :class="{'mx-3' : isExpanded }">
                request_quote
              </span>            
              <router-link v-if="isExpanded" to="/revenues"><h5 class="textColor">الايرادات</h5></router-link>
            </div>
            <div v-if="isEmpAuthorizedFor('تقرير المبيعات')" class="flex align-items-center my-3 div-hover" @click="push('/orders')" :class="{'justify-content-center' : !isExpanded , 'activeDivBg' : currentRoute.path.includes('/coach') }" >
              <span class="material-symbols-outlined text-3xl textColor" :class="{'mx-3' : isExpanded }">
                list_alt
              </span>            
              <router-link v-if="isExpanded" to="/orders"><h5 class="textColor">المبيعات</h5></router-link>
            </div>
            <div v-if="isEmpAuthorizedFor('تقرير المصروفات')" class="flex align-items-center my-3 div-hover"  @click="push('/expenses')" :class="{'justify-content-center' : !isExpanded }" >
              <span class="material-symbols-outlined text-3xl textColor" :class="{'mx-3' : isExpanded }">
                call_received
              </span>            
              <router-link v-if="isExpanded" to="/expenses"><h5 class="textColor">المصروفات</h5></router-link>
            </div>

            <div v-if="isEmpAuthorizedFor('تقرير المرتبات')" class="flex align-items-center my-3 div-hover"  @click="push('/salaries')" :class="{'justify-content-center' : !isExpanded }" >
              <span class="material-symbols-outlined text-3xl textColor" :class="{'mx-3' : isExpanded }">
                payments
              </span>            
              <router-link v-if="isExpanded" to="/salaries"><h5 class="textColor">المرتبات</h5></router-link>
            </div>
            
            <div v-if="isEmpAuthorizedFor('تقرير الأرباح')" class="flex align-items-center my-3 div-hover"  @click="push('/profits')" :class="{'justify-content-center' : !isExpanded }" >
              <span class="material-symbols-outlined text-3xl textColor" :class="{'mx-3' : isExpanded }">
                query_stats
              </span>            
              <router-link v-if="isExpanded" to="/profits"><h5 class="textColor">الأرباح</h5></router-link>
            </div>
          </div>

          <div class="flex align-items-center mt-5 mb-2 div-hover" @click="showProductsTypes = !showProductsTypes" :class="{'justify-content-center' : !isExpanded }" >
            <span class="material-symbols-outlined text-3xl textColor" :class="{'mx-3' : isExpanded }">
              database
            </span>            
            <h3 v-if="isExpanded"><h5 class="textColor">المنتجات</h5></h3>
          </div>
          <!-- Sub Categories for Products   -->
          <div v-if="showProductsTypes" class="px-4 py-1 fadein animation-duration-400 animation-iteration-1 borderRound" style="background: rgba(255, 255, 255, 0.066);">
            <div  v-if="isEmpAuthorizedFor('عرض أقسام المنتجات')" class="flex align-items-center my-3 div-hover" @click="push('/productTypes')" :class="{'justify-content-center' : !isExpanded }" >
              <span class="material-symbols-outlined text-3xl textColor" :class="{'mx-3' : isExpanded }">
                category
              </span>            
              <router-link v-if="isExpanded" to="/productTypes"><h5 class="textColor">الأقسام</h5></router-link>
            </div>
            <div v-if="isEmpAuthorizedFor('تسجيل أقسام المنتجات')" class="flex align-items-center my-3 div-hover" @click="push('/productType/create')" :class="{'justify-content-center' : !isExpanded }" >
              <span class="material-symbols-outlined text-3xl textColor" :class="{'mx-3' : isExpanded }">
                edit_note
              </span>            
              <router-link v-if="isExpanded" to="/productType/create"><h5 class="textColor">تسجيل قسم</h5></router-link>
            </div>
            <div v-if="isEmpAuthorizedFor('تسجيل المنتجات')" class="flex align-items-center my-3 div-hover" @click="push('/products/create')" :class="{'justify-content-center' : !isExpanded }" >
              <span class="material-symbols-outlined text-3xl textColor" :class="{'mx-3' : isExpanded }">
                edit_note
              </span>            
              <router-link v-if="isExpanded" to="/products/create"><h5 class="textColor">تسجيل منتج</h5></router-link>
            </div>
            <div class="flex align-items-center my-3 div-hover" @click="push('/products')" :class="{'justify-content-center' : !isExpanded }" >
              <span class="material-symbols-outlined text-3xl textColor" :class="{'mx-3' : isExpanded }">
                database
              </span>            
              <router-link v-if="isExpanded" to="/products"><h5 class="textColor">المنتجات</h5></router-link>
            </div>
            <div v-if="isEmpAuthorizedFor('المرتجعات')" class="flex align-items-center my-3 div-hover" @click="push('/orders')" :class="{'justify-content-center' : !isExpanded }" >
              <span class="material-symbols-outlined text-3xl textColor" :class="{'mx-3' : isExpanded }">
                currency_exchange
              </span>            
              <router-link v-if="isExpanded" to="/orders"><h5 class="textColor">المرتجعات</h5></router-link>
            </div>
          </div>
      </div>
    </div>
  </div>


<!-- Mobile sidebar -->

  <Sidebar v-model:visible="isMobExpanded" >
    <div class="sidebar expanded" v-if="currentRoute.path !== '/login'">
      <span class="material-symbols-outlined textColor p-3 text-4xl" @click="isMobExpanded = false">
        close
      </span>
      <div class="text-center p-2 py-2">
      <!-- <span class="material-symbols-outlined textColor mb-3 text-4xl">
        pool
      </span> -->
          <div class="flex align-items-center my-5 div-hover" @click="closeSideBar(); push('/')" :class="{'justify-content-center' : !isExpanded }" >
            <span class="material-symbols-outlined text-3xl textColor" :class="{'mx-3' : isExpanded }">
              analytics
            </span>            
            <router-link v-if="isExpanded" to="/"><h5 class="textColor">لوحة التحكم</h5></router-link>
          </div>
          <div class="flex align-items-center mt-5 mb-2 div-hover" @click="showCustomersCategories = !showCustomersCategories" :class="{'justify-content-center' : !isExpanded , 'mb-4' : isExpanded}" >
            <span class="material-symbols-outlined text-3xl textColor" :class="{'mx-3' : isExpanded }">
              group
            </span>            
            <h3 v-if="isExpanded"><h6 class="textColor">المشتركين و المستويات</h6></h3>
          </div>
          <!-- Sub Categories for Customers   -->
          <div v-if="showCustomersCategories" class="px-3 py-1 fadein animation-duration-400 animation-iteration-1 borderRound" style="background: rgba(255, 255, 255, 0.066);">
            <div v-if="isEmpAuthorizedFor('عرض المشتركين')" class="flex align-items-center my-3 div-hover" @click="closeSideBar(); push('/customers')" :class="{'justify-content-center' : !isExpanded , 'activeDivBg' : currentRoute.path.includes('/customers') }" >
              <span class="material-symbols-outlined text-3xl textColor" :class="{'mx-3' : isExpanded }">
                group
              </span>            
              <router-link v-if="isExpanded" to="/customers"><h5 class="textColor">المشتركين</h5></router-link>
            </div>
            <div v-if="isEmpAuthorizedFor('عرض عملاء حجز فقط')" class="flex align-items-center my-3 div-hover" @click="closeSideBar(); push('/customers/reservedOnly')" :class="{'justify-content-center' : !isExpanded , 'activeDivBg' : currentRoute.path.includes('/customers/reservedOnly') }" >
              <span class="material-symbols-outlined text-3xl textColor" :class="{'mx-3' : isExpanded }">
                group
              </span>            
              <router-link v-if="isExpanded" to="/customers/reservedOnly"><h5 class="textColor">عملاء - حجز فقط</h5></router-link>
            </div>
            <div v-if="isEmpAuthorizedFor('تجديد و تسجيل اشتراكات')" class="flex align-items-center my-3 div-hover" @click="closeSideBar(); push('/customer/create')" :class="{'justify-content-center' : !isExpanded , 'activeDivBg' : currentRoute.path.includes('/customer/create') }" >
              <span class="material-symbols-outlined text-3xl textColor" :class="{'mx-3' : isExpanded }">
                demography
              </span>            
              <router-link v-if="isExpanded" to="/customer/create"><h5 class="textColor">تسجيل اشتراك</h5></router-link>
            </div>
            <div v-if="isEmpAuthorizedFor('تسجيل و تعديل التمرينات الفردية')" class="flex align-items-center my-3 div-hover" @click="closeSideBar(); push({path :'/customer/create' , query : {isPrivate : 'true'}})" :class="{'justify-content-center' : !isExpanded , 'activeDivBg' : currentRoute.path.includes('/customer/create') }" >
              <span class="material-symbols-outlined text-3xl textColor" :class="{'mx-3' : isExpanded }">
                demography
              </span>            
              <router-link v-if="isExpanded" to=""><h5 class="textColor">تسجيل برايفت</h5></router-link>
            </div>
            <div  v-if="isEmpAuthorizedFor('مدفوعات اللاعبين')" class="flex align-items-center my-3 div-hover" @click="closeSideBar(); push({path : '/revenues' , query : {branchId : 0} })" :class="{'justify-content-center' : !isExpanded , 'activeDivBg' : currentRoute.path.includes('/revenue') }" >
              <span class="material-symbols-outlined text-3xl textColor" :class="{'mx-3' : isExpanded }">
                price_check
              </span>            
              <router-link v-if="isExpanded" to=""><h5 class="textColor">مدفوعات اللاعبين</h5></router-link>
            </div>
            <div v-if="isEmpAuthorizedFor('مدفوعات اللاعبين')" class="flex align-items-center my-3 div-hover" @click="closeSideBar(); push({path : '/revenues' , query : {branchId : 0 , filter : 'installments'} })" :class="{'justify-content-center' : !isExpanded , 'activeDivBg' : currentRoute.path.includes('/revenue') }" >
              <span class="material-symbols-outlined text-3xl textColor" :class="{'mx-3' : isExpanded }">
                payments
              </span>            
              <router-link v-if="isExpanded" to=""><h5 class="textColor">جميع الأقساط</h5></router-link>
            </div>
            <div v-if="isEmpAuthorizedFor('الأقساط المطلوبة')" class="flex align-items-center my-3 div-hover" @click="closeSideBar(); push({path : '/customers' , query : {showInstallments : 'true' } })" :class="{'justify-content-center' : !isExpanded }" >
              <span class="material-symbols-outlined text-3xl textColor" :class="{'mx-3' : isExpanded }">
                payments
              </span>            
              <router-link v-if="isExpanded" to=""><h5 class="textColor">الأقساط المطلوبة</h5></router-link>
            </div>
            <div v-if="isEmpAuthorizedFor('المستويات')" class="flex align-items-center my-3 div-hover"  @click="closeSideBar(); push('/levels')" :class="{'justify-content-center' : !isExpanded }" >
              <span class="material-symbols-outlined text-3xl textColor" :class="{'mx-3' : isExpanded }">
                hotel_class
              </span>            
              <router-link v-if="isExpanded" to="/levels"><h5 class="textColor">المستويات</h5></router-link>
            </div>
          </div>
          <div class="flex align-items-center my-2 div-hover" @click="showBracnhesCategories = !showBracnhesCategories;" :class="{'justify-content-center' : !isExpanded }" >
            <span class="material-symbols-outlined text-3xl textColor" :class="{'mx-3' : isExpanded }">
              home
            </span>            
            <h4 v-if="isExpanded"><h5 class="textColor">الكيانات</h5></h4>
          </div>
          <!-- Sub Categories for Branches   -->
          <div v-if="showBracnhesCategories" class="px-3 py-1 fadein animation-duration-400 animation-iteration-1 borderRound" style="background: rgba(255, 255, 255, 0.066);">
            <div v-if="isEmpAuthorizedFor('عرض الفروع')" class="flex align-items-center my-3 div-hover" @click="closeSideBar(); push('/branches')" :class="{'justify-content-center' : !isExpanded , 'activeDivBg' : currentRoute.path.includes('/coach') }" >
              <span class="material-symbols-outlined text-3xl textColor" :class="{'mx-3' : isExpanded }">
                home
              </span>            
              <router-link v-if="isExpanded" to="/branches"><h5 class="textColor">الفروع</h5></router-link>
            </div>
            <div v-if="isEmpAuthorizedFor('عرض الأكاديميات')" class="flex align-items-center my-3 div-hover"  @click="closeSideBar(); push('/academies')" :class="{'justify-content-center' : !isExpanded }" >
              <span class="material-symbols-outlined text-3xl textColor" :class="{'mx-3' : isExpanded }">
                groups_2
              </span>            
              <router-link v-if="isExpanded" to="/academies"><h5 class="textColor">الأكاديميات</h5></router-link>
            </div>
            <div v-if="isEmpAuthorizedFor('عرض أنواع التمارين')" class="flex align-items-center my-5 div-hover" @click="closeSideBar(); push('/categories')" :class="{'justify-content-center' : !isExpanded }" >
              <span class="material-symbols-outlined text-3xl textColor" :class="{'mx-3' : isExpanded }">
                category
              </span>            
              <router-link v-if="isExpanded" to="/categories"><h5 class="textColor">انواع التمارين</h5></router-link>
            </div>
          </div>

          <div class="flex align-items-center mt-5 mb-2 div-hover" @click="showEmployeeTypes = !showEmployeeTypes" :class="{'justify-content-center' : !isExpanded }" >
            <span class="material-symbols-outlined text-3xl textColor" :class="{'mx-3' : isExpanded }">
              badge
            </span>            
            <h4 v-if="isExpanded"><h5 class="textColor">الموظفين</h5></h4>
          </div>
          <!-- Sub Categories for Employees   -->
            <div v-if="showEmployeeTypes" class="px-4 py-1 fadein animation-duration-400 animation-iteration-1 borderRound" style="background: rgba(255, 255, 255, 0.066);">
                <div v-if="isEmpAuthorizedFor('عرض المدربين')" class="flex align-items-center my-3 div-hover" @click="closeSideBar(); push('/coaches');" :class="{'justify-content-center' : !isExpanded }" >
                  <span class="material-symbols-outlined text-3xl textColor" :class="{'mx-3' : isExpanded }">
                    badge
                  </span>            
                  <router-link v-if="isExpanded" to="/coaches"><h5 class="textColor">المدربين</h5></router-link>
                </div>
                <div v-if="isEmpAuthorizedFor('عرض الموظفين')" class="flex align-items-center my-3 div-hover" @click="closeSideBar(); push('/employees');" :class="{'justify-content-center' : !isExpanded }" >
                  <span class="material-symbols-outlined text-3xl textColor" :class="{'mx-3' : isExpanded }">
                    badge
                  </span>            
                  <router-link v-if="isExpanded" to="/employees"><h5 class="textColor">الموظفين</h5></router-link>
                </div>
            </div>
          <div  v-if="isEmpAuthorizedFor('تسجيل الحضور')" class="flex align-items-center my-5 div-hover" @click="closeSideBar(); push('/attendance')" :class="{'justify-content-center' : !isExpanded }" >
            <span class="material-symbols-outlined text-3xl textColor" :class="{'mx-3' : isExpanded }">
              format_list_numbered_rtl
            </span>            
            <router-link v-if="isExpanded" to="/attendance"><h5 class="textColor">تسجيل حضور</h5></router-link>
          </div>
          <div v-if="isEmpAuthorizedFor('تقرير الحضور اليومي')" class="flex align-items-center my-5 div-hover" @click="closeSideBar(); push('/daily/attendances')" :class="{'justify-content-center' : !isExpanded }" >
            <span class="material-symbols-outlined text-3xl textColor" :class="{'mx-3' : isExpanded }">
              today
            </span>           
            <router-link v-if="isExpanded" to="/daily/attendances"><h5 class="textColor">الحضور اليومي</h5></router-link>
          </div>
          <div v-if="isEmpAuthorizedFor('عرض التمرينات البرايفت')" class="flex align-items-center mt-5 mb-3 div-hover" @click="showPrivateCategories = !showPrivateCategories" :class="{'justify-content-center' : !isExpanded }" >
            <span class="material-symbols-outlined text-3xl textColor" :class="{'mx-3' : isExpanded }">
              pool
            </span>            
            <h4 v-if="isExpanded"><h5 class="textColor">تمرينات برايفت</h5></h4>  
          </div>
          <div v-if="showPrivateCategories" class="px-4 py-1 fadein animation-duration-400 animation-iteration-1 borderRound" style="background: rgba(255, 255, 255, 0.066);">
            <div v-if="isEmpAuthorizedFor('تسجيل و تعديل التمرينات البرايفت')" class="flex align-items-center my-3 div-hover" @click="closeSideBar(); push({path : '/customer/create' , query : {isPrivate : 'true'} })" :class="{'justify-content-center' : !isExpanded }" >
              <span class="material-symbols-outlined text-3xl textColor" :class="{'mx-3' : isExpanded }">
                badge
              </span>            
              <router-link v-if="isExpanded" :to="{
                path : '/customer/create' , query : {isPrivate : 'true'}
              }"><h5 class="textColor">تسجيل برايفت</h5></router-link>
            </div>
            <div v-if="isEmpAuthorizedFor('تسجيل سيمي برايفت')" class="flex align-items-center my-3 div-hover" @click="closeSideBar(); push({path : '/customer/create' , query : {isPrivate : 'true' , isSemiPrivate : 'true'} })" :class="{'justify-content-center' : !isExpanded }" >
              <router-link v-if="isExpanded" :to="{
                path : '/customer/create' , query : {isPrivate : 'true' , isSemiPrivate : 'true'}
              }"><h5 class="textColor mx-3 text-center">تسجيل سيمي برايفت</h5></router-link>
            </div>
            <div v-if="isEmpAuthorizedFor('عرض التمرينات البرايفت')" class="flex align-items-center my-3 div-hover" @click="closeSideBar(); push('/privateSubscriptions')" :class="{'justify-content-center' : !isExpanded }" >
              <span class="material-symbols-outlined text-3xl textColor" :class="{'mx-3' : isExpanded }">
                pool
              </span>            
              <router-link v-if="isExpanded" to="/privateSubscriptions"><h5 class="textColor">تمرينات برايفت</h5></router-link>
            </div>
          </div>
          
          <div  v-if="isEmpAuthorizedFor('السلف و الخصومات')" class="flex align-items-center mt-5 mb-3 div-hover" @click="showManagementCategories = !showManagementCategories" :class="{'justify-content-center' : !isExpanded }" >
            <span class="material-symbols-outlined text-3xl textColor" :class="{'mx-3' : isExpanded }">
              manage_accounts
            </span>            
            <h4 v-if="isExpanded"><h5 class="textColor">الإدارة</h5></h4>
          </div>
          <!-- Sub Categories for Management  -->
          <div v-if="showManagementCategories" class="px-4 py-1 fadein animation-duration-400 animation-iteration-1 borderRound" style="background: rgba(255, 255, 255, 0.066);">
            <div  class="flex align-items-center my-3 div-hover" @click="closeSideBar(); push('/management')" :class="{'justify-content-center' : !isExpanded }" >
              <span class="material-symbols-outlined text-3xl textColor" :class="{'mx-3' : isExpanded }">
                badge
              </span>            
              <router-link v-if="isExpanded" to="/management"><h6 class="textColor">السلف و الخصومات</h6></router-link>
            </div>
        </div>

          <div v-if="isEmpAuthorizedFor('الحسابات المالية')" class="flex align-items-center mt-5 mb-3 div-hover" @click="showFinancialsCategories = !showFinancialsCategories" :class="{'justify-content-center' : !isExpanded }" >
            <span class="material-symbols-outlined text-3xl textColor" :class="{'mx-3' : isExpanded }">
              payments
            </span>            
            <h4 v-if="isExpanded"><h5 class="textColor">حسابات مالية</h5></h4>
          </div>
          <!-- Sub Categories for Financials  -->

          <div v-if="showFinancialsCategories" class="px-3 py-1 fadein animation-duration-400 animation-iteration-1 borderRound" style="background: rgba(255, 255, 255, 0.066);">
            <div v-if="isEmpAuthorizedFor('تقرير الإيرادات')" class="flex align-items-center my-3 div-hover" @click="closeSideBar(); push('/revenues')" :class="{'justify-content-center' : !isExpanded , 'activeDivBg' : currentRoute.path.includes('/coach') }" >
              <span class="material-symbols-outlined text-3xl textColor" :class="{'mx-3' : isExpanded }">
                request_quote
              </span>            
              <router-link v-if="isExpanded" to="/revenues"><h5 class="textColor">الايرادات</h5></router-link>
            </div>
            <div v-if="isEmpAuthorizedFor('تقرير المبيعات')" class="flex align-items-center my-3 div-hover" @click="closeSideBar(); push('/orders')" :class="{'justify-content-center' : !isExpanded , 'activeDivBg' : currentRoute.path.includes('/coach') }" >
              <span class="material-symbols-outlined text-3xl textColor" :class="{'mx-3' : isExpanded }">
                list_alt
              </span>            
              <router-link v-if="isExpanded" to="/orders"><h5 class="textColor">المبيعات</h5></router-link>
            </div>

            <div v-if="isEmpAuthorizedFor('تقرير المصروفات')" class="flex align-items-center my-3 div-hover"  @click="closeSideBar(); push('/expenses')" :class="{'justify-content-center' : !isExpanded }" >
              <span class="material-symbols-outlined text-3xl textColor" :class="{'mx-3' : isExpanded }">
                call_received
              </span>            
              <router-link v-if="isExpanded" to="/expenses"><h5 class="textColor">المصروفات</h5></router-link>
            </div>
            <div v-if="isEmpAuthorizedFor('تقرير المرتبات')" class="flex align-items-center my-3 div-hover"  @click="closeSideBar(); push('/salaries')" :class="{'justify-content-center' : !isExpanded }" >
              <span class="material-symbols-outlined text-3xl textColor" :class="{'mx-3' : isExpanded }">
                payments
              </span>            
              <router-link v-if="isExpanded" to="/salaries"><h5 class="textColor">المرتبات</h5></router-link>
            </div>
            <div v-if="isEmpAuthorizedFor('تقرير الأرباح')" class="flex align-items-center my-3 div-hover"  @click="closeSideBar(); push('/profits')" :class="{'justify-content-center' : !isExpanded }" >
              <span class="material-symbols-outlined text-3xl textColor" :class="{'mx-3' : isExpanded }">
                query_stats
              </span>            
              <router-link v-if="isExpanded" to="/profits"><h5 class="textColor">الأرباح</h5></router-link>
            </div>
          </div>

          <div class="flex align-items-center mt-5 mb-2 div-hover" @click="showProductsTypes = !showProductsTypes" :class="{'justify-content-center' : !isExpanded }" >
            <span class="material-symbols-outlined text-3xl textColor" :class="{'mx-3' : isExpanded }">
              database
            </span>            
            <h4 v-if="isExpanded"><h5 class="textColor">المنتجات</h5></h4>
          </div>
            <!-- Sub Categories for Products   -->
            <div v-if="showProductsTypes" class="px-4 py-1 fadein animation-duration-400 animation-iteration-1 borderRound" style="background: rgba(255, 255, 255, 0.066);">
              <div v-if="isEmpAuthorizedFor('عرض أقسام المنتجات')" class="flex align-items-center my-3 div-hover" @click="closeSideBar(); push('/productTypes')" :class="{'justify-content-center' : !isExpanded }" >
                <span class="material-symbols-outlined text-3xl textColor" :class="{'mx-3' : isExpanded }">
                  category
                </span>            
                <router-link v-if="isExpanded" to="/productTypes"><h5 class="textColor">الأقسام</h5></router-link>
              </div>
              <div v-if="isEmpAuthorizedFor('تسجيل أقسام المنتجات')" class="flex align-items-center my-3 div-hover" @click="closeSideBar(); push('/productType/create')" :class="{'justify-content-center' : !isExpanded }" >
                <span class="material-symbols-outlined text-3xl textColor" :class="{'mx-3' : isExpanded }">
                  edit_note
                </span>            
                <router-link v-if="isExpanded" to="/productType/create"><h5 class="textColor">تسجيل قسم</h5></router-link>
              </div>
              <div v-if="isEmpAuthorizedFor('تسجيل المنتجات')" class="flex align-items-center my-3 div-hover" @click="closeSideBar(); push('/products/create')" :class="{'justify-content-center' : !isExpanded }" >
                <span class="material-symbols-outlined text-3xl textColor" :class="{'mx-3' : isExpanded }">
                  edit_note
                </span>            
                <router-link v-if="isExpanded" to="/products/create"><h5 class="textColor">تسجيل منتج</h5></router-link>
              </div>
              <div class="flex align-items-center my-3 div-hover" @click="closeSideBar(); push('/products')" :class="{'justify-content-center' : !isExpanded }" >
                <span class="material-symbols-outlined text-3xl textColor" :class="{'mx-3' : isExpanded }">
                  database
                </span>            
                <router-link v-if="isExpanded" to="/products"><h5 class="textColor">المنتجات</h5></router-link>
              </div>
              <div v-if="isEmpAuthorizedFor('المرتجعات')" class="flex align-items-center my-3 div-hover" @click="closeSideBar(); push('/orders')" :class="{'justify-content-center' : !isExpanded }" >
                <span class="material-symbols-outlined text-3xl textColor" :class="{'mx-3' : isExpanded }">
                  currency_exchange
                </span>            
                <router-link v-if="isExpanded" to="/orders"><h5 class="textColor">المرتجعات</h5></router-link>
              </div>
            </div>
      </div>
    </div>
</Sidebar>
</template>

<style>
.formkit-messages{
  list-style: none;
  padding: 0;
}
.formkit-message{
  color: white !important;
  background-color: rgba(255, 0, 0, 0.684);
  padding: 1.5vh !important;
  margin: 1vh 2vh !important;
  border-radius: 3px;
}
.p-menuitem-link {
  font-size: 14px;
}
.p-menuitem{
  padding: 5px;
}
.p-menuitem-icon{
  margin: 0.5rem;
}
.p-splitbutton{
  background: var(--bg-card);
}
.p-splitbutton.p-button-secondary > .p-button {
  background: none !important;
  border: none !important;
  font-size: small;
  padding: 0.75rem 1rem;
}
.p-sidebar .p-sidebar-header .p-sidebar-close, .p-sidebar .p-sidebar-header .p-sidebar-icon {
  display: none !important ;
}
.p-sidebar-close-icon{
  display: none !important ;
}
.sidebar {
  background: var(--background);
  width: 100px;
  border-end-end-radius: 25px;
  border-start-end-radius: 25px;
  box-shadow: 2px 0px 10px rgba(0, 0, 0, 0.81);
  height: 100vh; /* Adjusts the height to take the full screen height */
  background-color: #f2f2f2;
  position: fixed; /* Positions the sidebar fixed */
  top: 0;
  right: 0;
  z-index: 100; /* Ensures the sidebar is on top of other elements */
  transition: width 0.3s ease;
  overflow-y: auto; /* Enables vertical scrolling if content exceeds the height */
}
li {
  padding: 10px;
  text-align: center;
}
.expanded {
    width: 260px;
}
.activeDivBg{
  background-color: rgba(255, 255, 255, 0.05);
  padding: 1vh;
}
.div-hover{
  cursor: pointer;
  transition-duration: 0.2s;
}
.div-hover:hover{
  background-color: rgba(255, 255, 255, 0.05);
  padding: 1.5vh 1vh;
  border-radius: 5px;
}
.p-sidebar {
   background: none !important; 
   color: #495057; 
   border: 0 none; 
   box-shadow: none !important; 
}
</style>