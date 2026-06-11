import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      component: () =>
        import('@/views/login/Login.vue')
    },

    {
      path: '/register',
      component: () =>
        import('@/views/login/Register.vue')
    },

    {
      path: '/',
      component: () =>
        import('@/components/Layout/index.vue'),
      redirect: '/dashboard',
      children: [
        {
          path: 'dashboard',
          component: () =>
            import('@/components/Dashboard/index.vue'),
          meta: {
            title: '数据看板',
            icon: 'DataBoard',
            breadcrumb: true  // 是否显示在面包屑
          }
        },
        {
          path: 'orders',     // ✅ 相对路径，完整：/orders
          redirect: '/orders/list',  // 重定向到子路由
          meta: {
            title: '订单',
            icon: 'DataBoard',
            breadcrumb: true  // 是否显示在面包屑
          },
          children: [
            {
              path: 'list',   // ✅ 相对路径，完整：/orders/list
              component: () => import('@/views/orders/allorders.vue'),
              meta: {
                title: '列表中心',
                icon: 'DataBoard',
                breadcrumb: true  // 是否显示在面包屑
              },
            },
            {
              path: 'abnormal',  // 完整：/orders/abnormal
              component: () => import('@/views/orders/abnormal.vue'),
              meta: {
                title: '异常监控',
                icon: 'DataBoard',
                breadcrumb: true  // 是否显示在面包屑
              },
            },
            {
              path: 'aftersales',  // 完整：/orders/aftersales
              component: () => import('@/views/orders/aftersales.vue'),
              meta: {
                title: '售后管理',
                icon: 'DataBoard',
                breadcrumb: true  // 是否显示在面包屑
              },
            }
          ]
        },
        // ========== 商品管理 ==========
        {
          path: 'product',   // ✅ 相对路径，完整：/product
          redirect: '/product/list',
          meta: {
            title: '产品',
            icon: 'DataBoard',
            breadcrumb: true  // 是否显示在面包屑
          },
          children: [
            {
              path: 'list',  // ✅ 相对路径，完整：/product/list
              component: () => import('@/views/product/productlist.vue'),
              meta: {
                title: '列表栏',
                icon: 'DataBoard',
                breadcrumb: true  // 是否显示在面包屑
              }
            },
            {
              path: 'datareport',  // 完整：/product/datareport
              component: () => import('@/views/product/Datareport.vue'),
              meta: {
                title: '数据报表',
                icon: 'DataBoard',
                breadcrumb: true  // 是否显示在面包屑
              }
            },
            {
              path: 'inventory',  // 完整：/product/inventory
              component: () => import('@/views/product/Inventory.vue'),
              meta: {
                title: '库存管理',
                icon: 'DataBoard',
                breadcrumb: true  // 是否显示在面包屑
              }
            },
            {
              path: 'launch',  // 完整：/product/launch
              component: () => import('@/views/product/productlaunch.vue'),
              meta: {
                title: '商品发布',
                icon: 'DataBoard',
                breadcrumb: true  // 是否显示在面包屑
              }
            }
          ]
        },
      ]
    },

    {
      path: '/:pathMatch(.*)*',

      component: () =>
        import('@/components/404/index.vue')
    }
  ]
})

export default router
