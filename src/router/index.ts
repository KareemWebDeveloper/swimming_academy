import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '../views/dashboard/dashboardView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: DashboardView
    },
    {
      path: '/login',
      name: 'login',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/LoginView.vue')
    },
    {
      path: '/branches',
      name: 'branches_list',
      component: () => import('../views/branches/branchesList.vue')
    },
    {
      path: '/branch/create',
      name: 'branch_create',
      component: () => import('../views/branches/branchCreate.vue')
    },
    {
      path: '/branch/update/:id',
      name: 'branch_update',
      component: () => import('../views/branches/branchUpdate.vue')
    },
    {
      path: '/branch/:id',
      name: 'branch_find',
      component: () => import('../views/branches/branchCreate.vue')
    },
    {
      path: '/category/create',
      name: 'category_create',
      component: () => import('../views/categories/createCategory.vue')
    },
    {
      path: '/categories',
      name: 'categories_list',
      component: () => import('../views/categories/categoriesList.vue')
    },
    {
      path: '/coach/create',
      name: 'coach_create',
      component: () => import('../views/coaches/coachCreate.vue')
    },
    {
      path: '/coaches',
      name: 'coaches_list',
      component: () => import('../views/coaches/coachesList.vue')
    },
    {
      path: '/coach/update/:id',
      name: 'coaches_update',
      component: () => import('../views/coaches/coachUpdate.vue')
    },
    {
      path: '/employee/create',
      name: 'employee_create',
      component: () => import('../views/employees/employeeCreate.vue')
    },
    {
      path: '/employees',
      name: 'employees_list',
      component: () => import('../views/employees/employeesList.vue')
    },
    {
      path: '/employee/update/:id',
      name: 'employees_update',
      component: () => import('../views/employees/employeeUpdate.vue')
    },
    {
      path: '/customer/create',
      name: 'customer_create',
      component: () => import('../views/customers/customerCreate.vue')
    },
    {
      path: '/customers',
      name: 'customers_list',
      component: () => import('../views/customers/customersList.vue')
    },
    {
      path: '/customers/reservedOnly',
      name: 'customers_reservedOnly',
      component: () => import('../views/customers/reservedOnlyCustomers.vue')
    },
    {
      path: '/customer/update/:id',
      name: 'customers_update',
      component: () => import('../views/customers/customerUpdate.vue')
    },
    {
      path: '/customer/:id',
      name: 'customer_find',
      component: () => import('../views/customers/customerFind.vue')
    },
    {
      path: '/customers/submission/form',
      name: 'customers_submissionForm',
      component: () => import('../views/customers/unAuthorizedCustomerCreate.vue')
    },
    {
      path: '/privateSubscriptions',
      name: 'privateSubscriptions_list',
      component: () => import('../views/privateSubscriptions/privateList.vue')
    },
    {
      path: '/privateSubscriptions/create',
      name: 'privateSubscriptions_create',
      component: () => import('../views/privateSubscriptions/privateSubsciptionCreate.vue')
    },
    {
      path: '/privateSubscription/update/:id',
      name: 'privateSubscriptions_update',
      component: () => import('../views/privateSubscriptions/privateSubscriptionUpdate.vue')
    },
    {
      path: '/products',
      name: 'products_list',
      component: () => import('../views/products/productsList.vue')
    },
    {
      path: '/products/create',
      name: 'products_create',
      component: () => import('../views/products/productCreate.vue')
    },
    {
      path: '/product/update/:id',
      name: 'products_update',
      component: () => import('../views/products/productUpdate.vue')
    },
    {
      path: '/productTypes',
      name: 'products_sections',
      component: () => import('../views/products/productTypesList.vue')
    },
    {
      path: '/productType/create',
      name: 'products_section_create',
      component: () => import('../views/products/productTypeCreate.vue')
    },
    {
      path: '/levels',
      name: 'levels_list',
      component: () => import('../views/Levels/LevelsList.vue')
    },
    {
      path: '/levels/create',
      name: 'levels_create',
      component: () => import('../views/Levels/LevelCreate.vue')
    },
    {
      path: '/level/update/:id',
      name: 'level_update',
      component: () => import('../views/Levels/LevelUpdate.vue')
    },
    {
      path: '/academies',
      name: 'academies_list',
      component: () => import('../views/academies/academiesList.vue')
    },
    {
      path: '/academies/create',
      name: 'academies_create',
      component: () => import('../views/academies/academyCreate.vue')
    },
    {
      path: '/attendance',
      name: 'attendance_list',
      component: () => import('../views/attendance/AttendanceList.vue')
    },
    {
      path: '/management',
      name: 'management_list',
      component: () => import('../views/management/managementList.vue')
    },
    {
      path: '/daily/attendances',
      name: 'daily_attendances',
      component: () => import('../views/attendance/DailyAttendances.vue')
    },
    {
      path: '/customer/profile',
      name: 'customer_profile',
      component: () => import('../views/profiles/CustomerProfile.vue')
    },
    {
      path: '/coach/profile',
      name: 'coach_profile',
      component: () => import('../views/profiles/CoachProfile.vue')
    },
    {
      path: '/revenues',
      name: 'revenues',
      component: () => import('../views/financialsManagement/Revenues.vue')
    },
    {
      path: '/orders',
      name: 'orders',
      component: () => import('../views/financialsManagement/Orders.vue')
    },
    {
      path: '/salaries',
      name: 'salaries',
      component: () => import('../views/financialsManagement/Salaries.vue')
    },
    {
      path: '/profits',
      name: 'profits',
      component: () => import('../views/financialsManagement/Profits.vue')
    },
    {
      path: '/expenses',
      name: 'expenses',
      component: () => import('../views/financialsManagement/Expenses.vue')
    },
  ]
})

export default router
