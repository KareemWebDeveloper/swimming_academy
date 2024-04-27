<script setup lang="ts">
import { RouterView } from 'vue-router'
import SideBar from './components/SideBar.vue'
import { useRouter } from 'vue-router';
import loading from './components/loadingComponent.vue'
import { onMounted, ref , onBeforeMount } from 'vue';
import axios from 'axios';
import { userAuthorize } from './global-functions/isUserAuthorized';
import { adminAuthorize } from './global-functions/checkUserRole';
import { employeeAuthorize } from './global-functions/isEmployeeAuthorized';
const { push , currentRoute } = useRouter();
let token = localStorage.getItem('SwimmingToken')
const isloading = ref(true)
const renderView = ref(false)
const isSideBarVisible = ref(true)
onMounted(() => {
  const urlParams = new URLSearchParams(window.location.search);
  const userType = urlParams.get('userType');

  setTimeout(() => {
    if(currentRoute.value.path.includes('/customers/submission/form')){
      setTimeout(() => {
        isloading.value = false
      }, 2000);
      renderView.value = true
      return
    }
    if(!token){
      push({ path : '/login' , query : userType ? {userType : userType} : undefined})
    }
    setTimeout(() => {
      renderView.value = true
    }, 200);
    setTimeout(() => {
      isloading.value = false
    }, 3000);
    userAuthorize().then((isAuthorized) => {
      if(isAuthorized == false){
        push({ path : '/login' , query : userType ? {userType : userType} : undefined})
      }  
      else{
        axios.post('https://akademia.website/api/checkFreezeStatuses').then((result) => {
          console.log(result.data);
          axios.post('https://akademia.website/api/checkSubscriptionStatuses').then((result) => {
          console.log(result.data); 
          }).catch((err) => {
              console.log(err);
          });
        }).catch((err) => {
            console.log(err);
        });
      }
  })
  }, 200);
})

const router = useRouter()
router.beforeEach(() => {
    isloading.value = true;
    setTimeout(() => {
      isloading.value = false
    }, 2800);
});

</script>

<template>
  <loading v-if="isloading"></loading>
  <header v-if="renderView">
    <SideBar :key="$route.fullPath" v-if="!currentRoute.path.includes('/login') && !currentRoute.path.includes('/profile') &&
    !currentRoute.path.includes('/customers/submission/form')"></SideBar>
    <RouterView :key="$route.fullPath" />
  </header>
</template>

<style scoped>

</style>
