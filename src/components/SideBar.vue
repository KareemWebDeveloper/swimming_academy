<script setup lang="ts">
import {ref , onBeforeMount} from 'vue'
import type {Ref} from 'vue'
import Sidebar from 'primevue/sidebar';
import { useRouter } from 'vue-router';
import { adminAuthorize } from '@/global-functions/checkUserRole';
import { employeeAuthorize } from '@/global-functions/isEmployeeAuthorized';
const { push , currentRoute } = useRouter();
const isExpanded = ref(false)
const empPermissions = ref()
const isMobExpanded = ref(false)
const fetched = ref(false)
const visible = ref(true)
type userType = 'admin' | 'employee' 
const type : Ref<userType> = ref('admin')
const showEmployeeTypes = ref(false)
const showBracnhesCategories = ref(false)
const showFinancialsCategories = ref(false)
const showCustomersCategories = ref(false)

const logOut = () => {
  localStorage.removeItem('SwimmingToken');
  location.reload()
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
                console.log(empPermissions.value);
            })
        }
        else{
          type.value = 'admin'
          fetched.value = true
        }
    })
})

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
  <div class="fixed cursor-pointer" style="top: 2vh; left: 2vh;" @click="logOut">
    <span class="material-symbols-outlined bg-card text-white p-3 borderRound" >
      logout
    </span>
  </div>
  <div v-if="visible && fetched">
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
            <div class="flex align-items-center my-3 div-hover" @click="push('/customers')" :class="{'justify-content-center' : !isExpanded , 'activeDivBg' : currentRoute.path.includes('/customers') }" >
              <span class="material-symbols-outlined text-3xl textColor" :class="{'mx-3' : isExpanded }">
                group
              </span>            
              <router-link v-if="isExpanded" to="/customers"><h5 class="textColor">المشتركين</h5></router-link>
            </div>
            <div class="flex align-items-center my-3 div-hover" @click="push('/customer/create')" :class="{'justify-content-center' : !isExpanded , 'activeDivBg' : currentRoute.path.includes('/customer/create') }" >
              <span class="material-symbols-outlined text-3xl textColor" :class="{'mx-3' : isExpanded }">
                demography
              </span>            
              <router-link v-if="isExpanded" to="/customer/create"><h5 class="textColor">تسجيل اشتراك</h5></router-link>
            </div>
            <div class="flex align-items-center my-3 div-hover" @click="push({path :'/customer/create' , query : {isPrivate : 'true'}})" :class="{'justify-content-center' : !isExpanded , 'activeDivBg' : currentRoute.path.includes('/customer/create') }" >
              <span class="material-symbols-outlined text-3xl textColor" :class="{'mx-3' : isExpanded }">
                demography
              </span>            
              <router-link v-if="isExpanded" to=""><h5 class="textColor">تسجيل برايفت</h5></router-link>
            </div>
            <div class="flex align-items-center my-3 div-hover" @click="push({path : '/revenues' , query : {branchId : 0} })" :class="{'justify-content-center' : !isExpanded , 'activeDivBg' : currentRoute.path.includes('/revenues') }" >
              <span class="material-symbols-outlined text-3xl textColor" :class="{'mx-3' : isExpanded }">
                price_check
              </span>            
              <router-link v-if="isExpanded" to=""><h5 class="textColor">مدفوعات اللاعبين</h5></router-link>
            </div>
            <div class="flex align-items-center my-3 div-hover" @click="push({path : '/revenues' , query : {branchId : 0 , filter : 'installments'} })" :class="{'justify-content-center' : !isExpanded , 'activeDivBg' : currentRoute.path.includes('/revenue') }" >
              <span class="material-symbols-outlined text-3xl textColor" :class="{'mx-3' : isExpanded }">
                payments
              </span>            
              <router-link v-if="isExpanded" to=""><h5 class="textColor">جميع الأقساط</h5></router-link>
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
            <div v-if="isEmpAuthorizedFor('انشاء أكاديمية')" class="flex align-items-center my-3 div-hover"  @click="push('/academies/create')" :class="{'justify-content-center' : !isExpanded }" >
              <span class="material-symbols-outlined text-3xl textColor" :class="{'mx-3' : isExpanded }">
                groups_2
              </span>            
              <router-link v-if="isExpanded" to="/academies/create"><h5 class="textColor">انشاء أكاديمية</h5></router-link>
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
          <div class="flex align-items-center my-5 div-hover" @click="push('/attendance')" :class="{'justify-content-center' : !isExpanded }" >
            <span class="material-symbols-outlined text-3xl textColor" :class="{'mx-3' : isExpanded }">
              format_list_numbered_rtl
            </span>            
            <router-link v-if="isExpanded" to="/attendance"><h5 class="textColor">تسجيل حضور</h5></router-link>
          </div>
          <div v-if="isEmpAuthorizedFor('عرض التمرينات الفردية')" class="flex align-items-center my-5 div-hover" @click="push('/privateSubscriptions')" :class="{'justify-content-center' : !isExpanded }" >
            <span class="material-symbols-outlined text-3xl textColor" :class="{'mx-3' : isExpanded }">
              pool
            </span>            
            <router-link v-if="isExpanded" to="/privateSubscriptions"><h5 class="textColor">تمرينات فردية</h5></router-link>
          </div>
          <div v-if="isEmpAuthorizedFor('الحسابات المالية')" class="flex align-items-center mt-5 mb-2 div-hover" @click="showFinancialsCategories = !showFinancialsCategories" :class="{'justify-content-center' : !isExpanded }" >
            <span class="material-symbols-outlined text-3xl textColor" :class="{'mx-3' : isExpanded }">
              payments
            </span>            
            <h4 v-if="isExpanded"><h5 class="textColor">حسابات مالية</h5></h4>
          </div>
          <!-- Sub Categories for Financials  -->

          <div v-if="showFinancialsCategories" class="px-3 py-1 fadein animation-duration-400 animation-iteration-1 borderRound" style="background: rgba(255, 255, 255, 0.066);">
            <div class="flex align-items-center my-3 div-hover" @click="push('/revenues')" :class="{'justify-content-center' : !isExpanded , 'activeDivBg' : currentRoute.path.includes('/coach') }" >
              <span class="material-symbols-outlined text-3xl textColor" :class="{'mx-3' : isExpanded }">
                request_quote
              </span>            
              <router-link v-if="isExpanded" to="/revenues"><h5 class="textColor">الايرادات</h5></router-link>
            </div>
            <div class="flex align-items-center my-3 div-hover" @click="push('/orders')" :class="{'justify-content-center' : !isExpanded , 'activeDivBg' : currentRoute.path.includes('/coach') }" >
              <span class="material-symbols-outlined text-3xl textColor" :class="{'mx-3' : isExpanded }">
                list_alt
              </span>            
              <router-link v-if="isExpanded" to="/orders"><h5 class="textColor">المبيعات</h5></router-link>
            </div>
            <div class="flex align-items-center my-3 div-hover"  @click="push('/expenses')" :class="{'justify-content-center' : !isExpanded }" >
              <span class="material-symbols-outlined text-3xl textColor" :class="{'mx-3' : isExpanded }">
                call_received
              </span>            
              <router-link v-if="isExpanded" to="/expenses"><h5 class="textColor">المصروفات</h5></router-link>
            </div>

            <div class="flex align-items-center my-3 div-hover"  @click="push('/salaries')" :class="{'justify-content-center' : !isExpanded }" >
              <span class="material-symbols-outlined text-3xl textColor" :class="{'mx-3' : isExpanded }">
                payments
              </span>            
              <router-link v-if="isExpanded" to="/salaries"><h5 class="textColor">المرتبات</h5></router-link>
            </div>
            
            <div class="flex align-items-center my-3 div-hover"  @click="push('/profits')" :class="{'justify-content-center' : !isExpanded }" >
              <span class="material-symbols-outlined text-3xl textColor" :class="{'mx-3' : isExpanded }">
                query_stats
              </span>            
              <router-link v-if="isExpanded" to="/profits"><h5 class="textColor">الأرباح</h5></router-link>
            </div>
          </div>

          <div class="flex align-items-center my-5 div-hover" @click="push('/products')" :class="{'justify-content-center' : !isExpanded }" >
            <span class="material-symbols-outlined text-3xl textColor" :class="{'mx-3' : isExpanded }">
              database
            </span>            
            <router-link v-if="isExpanded" to="/products"><h5 class="textColor">المنتجات</h5></router-link>
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
            <div class="flex align-items-center my-3 div-hover" @click="closeSideBar(); push('/customers')" :class="{'justify-content-center' : !isExpanded , 'activeDivBg' : currentRoute.path.includes('/customers') }" >
              <span class="material-symbols-outlined text-3xl textColor" :class="{'mx-3' : isExpanded }">
                home
              </span>            
              <router-link v-if="isExpanded" to="/customers"><h5 class="textColor">المشتركين</h5></router-link>
            </div>
            <div class="flex align-items-center my-3 div-hover" @click="closeSideBar(); push('/customer/create')" :class="{'justify-content-center' : !isExpanded , 'activeDivBg' : currentRoute.path.includes('/customer/create') }" >
              <span class="material-symbols-outlined text-3xl textColor" :class="{'mx-3' : isExpanded }">
                demography
              </span>            
              <router-link v-if="isExpanded" to="/customer/create"><h5 class="textColor">تسجيل اشتراك</h5></router-link>
            </div>
            <div class="flex align-items-center my-3 div-hover" @click="closeSideBar(); push({path :'/customer/create' , query : {isPrivate : 'true'}})" :class="{'justify-content-center' : !isExpanded , 'activeDivBg' : currentRoute.path.includes('/customer/create') }" >
              <span class="material-symbols-outlined text-3xl textColor" :class="{'mx-3' : isExpanded }">
                demography
              </span>            
              <router-link v-if="isExpanded" to=""><h5 class="textColor">تسجيل برايفت</h5></router-link>
            </div>
            <div class="flex align-items-center my-3 div-hover" @click="closeSideBar(); push({path : '/revenues' , query : {branchId : 0} })" :class="{'justify-content-center' : !isExpanded , 'activeDivBg' : currentRoute.path.includes('/revenue') }" >
              <span class="material-symbols-outlined text-3xl textColor" :class="{'mx-3' : isExpanded }">
                price_check
              </span>            
              <router-link v-if="isExpanded" to=""><h5 class="textColor">مدفوعات اللاعبين</h5></router-link>
            </div>
            <div class="flex align-items-center my-3 div-hover" @click="closeSideBar(); push({path : '/revenues' , query : {branchId : 0 , filter : 'installments'} })" :class="{'justify-content-center' : !isExpanded , 'activeDivBg' : currentRoute.path.includes('/revenue') }" >
              <span class="material-symbols-outlined text-3xl textColor" :class="{'mx-3' : isExpanded }">
                payments
              </span>            
              <router-link v-if="isExpanded" to=""><h5 class="textColor">جميع الأقساط</h5></router-link>
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
            <div v-if="isEmpAuthorizedFor('انشاء أكاديمية')" class="flex align-items-center my-3 div-hover"  @click="closeSideBar(); push('/academies/create')" :class="{'justify-content-center' : !isExpanded }" >
              <span class="material-symbols-outlined text-3xl textColor" :class="{'mx-3' : isExpanded }">
                groups_2
              </span>            
              <router-link v-if="isExpanded" to="/academies/create"><h5 class="textColor">انشاء أكاديمية</h5></router-link>
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
                <div v-if="isEmpAuthorizedFor('عرض المدربين')" class="flex align-items-center my-3 div-hover" @click="push('/coaches')" :class="{'justify-content-center' : !isExpanded }" >
                  <span class="material-symbols-outlined text-3xl textColor" :class="{'mx-3' : isExpanded }">
                    badge
                  </span>            
                  <router-link v-if="isExpanded" to="/coaches"><h5 class="textColor">المدربين</h5></router-link>
                </div>
                <div v-if="isEmpAuthorizedFor('عرض الموظفين')" class="flex align-items-center my-3 div-hover" @click="push('/employees')" :class="{'justify-content-center' : !isExpanded }" >
                  <span class="material-symbols-outlined text-3xl textColor" :class="{'mx-3' : isExpanded }">
                    badge
                  </span>            
                  <router-link v-if="isExpanded" to="/employees"><h5 class="textColor">الموظفين</h5></router-link>
                </div>
            </div>
          <div class="flex align-items-center my-5 div-hover" @click="closeSideBar(); push('/attendance')" :class="{'justify-content-center' : !isExpanded }" >
            <span class="material-symbols-outlined text-3xl textColor" :class="{'mx-3' : isExpanded }">
              format_list_numbered_rtl
            </span>            
            <router-link v-if="isExpanded" to="/attendance"><h5 class="textColor">حضور و انصراف</h5></router-link>
          </div>
          <div v-if="isEmpAuthorizedFor('عرض التمرينات الفردية')" class="flex align-items-center my-5 div-hover" @click="closeSideBar(); push('/privateSubscriptions')" :class="{'justify-content-center' : !isExpanded }" >
            <span class="material-symbols-outlined text-3xl textColor" :class="{'mx-3' : isExpanded }">
              pool
            </span>            
            <router-link v-if="isExpanded" to="/privateSubscriptions"><h5 class="textColor">تمرينات فردية</h5></router-link>
          </div>
          <div v-if="isEmpAuthorizedFor('الحسابات المالية')" class="flex align-items-center mt-5 mb-3 div-hover" @click="showFinancialsCategories = !showFinancialsCategories" :class="{'justify-content-center' : !isExpanded }" >
            <span class="material-symbols-outlined text-3xl textColor" :class="{'mx-3' : isExpanded }">
              payments
            </span>            
            <h4 v-if="isExpanded"><h5 class="textColor">حسابات مالية</h5></h4>
          </div>
          <!-- Sub Categories for Financials  -->

          <div v-if="showFinancialsCategories" class="px-3 py-1 fadein animation-duration-400 animation-iteration-1 borderRound" style="background: rgba(255, 255, 255, 0.066);">
            <div class="flex align-items-center my-3 div-hover" @click="closeSideBar(); push('/revenues')" :class="{'justify-content-center' : !isExpanded , 'activeDivBg' : currentRoute.path.includes('/coach') }" >
              <span class="material-symbols-outlined text-3xl textColor" :class="{'mx-3' : isExpanded }">
                request_quote
              </span>            
              <router-link v-if="isExpanded" to="/revenues"><h5 class="textColor">الايرادات</h5></router-link>
            </div>
            <div class="flex align-items-center my-3 div-hover" @click="closeSideBar(); push('/orders')" :class="{'justify-content-center' : !isExpanded , 'activeDivBg' : currentRoute.path.includes('/coach') }" >
              <span class="material-symbols-outlined text-3xl textColor" :class="{'mx-3' : isExpanded }">
                list_alt
              </span>            
              <router-link v-if="isExpanded" to="/orders"><h5 class="textColor">المبيعات</h5></router-link>
            </div>

            <div class="flex align-items-center my-3 div-hover"  @click="closeSideBar(); push('/expenses')" :class="{'justify-content-center' : !isExpanded }" >
              <span class="material-symbols-outlined text-3xl textColor" :class="{'mx-3' : isExpanded }">
                call_received
              </span>            
              <router-link v-if="isExpanded" to="/expenses"><h5 class="textColor">المصروفات</h5></router-link>
            </div>
            <div class="flex align-items-center my-3 div-hover"  @click="closeSideBar(); push('/salaries')" :class="{'justify-content-center' : !isExpanded }" >
              <span class="material-symbols-outlined text-3xl textColor" :class="{'mx-3' : isExpanded }">
                payments
              </span>            
              <router-link v-if="isExpanded" to="/salaries"><h5 class="textColor">المرتبات</h5></router-link>
            </div>
            <div class="flex align-items-center my-3 div-hover"  @click="closeSideBar(); push('/profits')" :class="{'justify-content-center' : !isExpanded }" >
              <span class="material-symbols-outlined text-3xl textColor" :class="{'mx-3' : isExpanded }">
                query_stats
              </span>            
              <router-link v-if="isExpanded" to="/profits"><h5 class="textColor">الأرباح</h5></router-link>
            </div>
          </div>

          <div class="flex align-items-center my-5 div-hover" @click="closeSideBar(); push('/products')" :class="{'justify-content-center' : !isExpanded }" >
            <span class="material-symbols-outlined text-3xl textColor" :class="{'mx-3' : isExpanded }">
              database
            </span>            
            <router-link v-if="isExpanded" to="/products"><h5 class="textColor">المنتجات</h5></router-link>
          </div>
      </div>
    </div>
</Sidebar>
</template>

<style>

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