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
        // ============营销中心===============
        {
          path: 'marketing',
          redirect: '/marketing/coupon',
          meta: {
            title: '订单',
            icon: 'DataBoard',
            breadcrumb: true  // 是否显示在面包屑
          },
          children: [
            {
              path: 'coupon',   // ✅ 相对路径，完整：/orders/list
              component: () => import('@/views/marketing/coupon.vue'),
              meta: {
                title: '优惠券管理',
                icon: 'DataBoard',
                breadcrumb: true  // 是否显示在面包屑
              }
            }, {
              path: 'seckill',   // ✅ 相对路径，完整：/orders/list
              component: () => import('@/views/marketing/seckill.vue'),
              meta: {
                title: '秒杀活动',
                icon: 'DataBoard',
                breadcrumb: true  // 是否显示在面包屑
              }
            }
          ]
        },
        // ========== 会员管理 ==========
        {
          path: 'member',
          redirect: '/member/list',
          meta: { title: '会员', icon: 'User', breadcrumb: true },
          children: [
            {
              path: 'list',
              component: () => import('@/views/member/list.vue'),
              meta: { title: '会员列表', icon: 'User', breadcrumb: true }
            },
            {
              path: 'level',
              component: () => import('@/views/member/level.vue'),
              meta: { title: '会员等级', icon: 'TrendCharts', breadcrumb: true }
            },
            {
              path: 'points',
              component: () => import('@/views/member/points.vue'),
              meta: { title: '积分管理', icon: 'Coin', breadcrumb: true }
            }
          ]
        },
        // ========== 物流系统 ==========
        {
          path: 'logistics',
          redirect: '/logistics/template',
          meta: { title: '物流', icon: 'Van', breadcrumb: true },
          children: [
            {
              path: 'template',
              component: () => import('@/views/logistics/template.vue'),
              meta: { title: '运费模板', icon: 'Document', breadcrumb: true }
            },
            {
              path: 'company',
              component: () => import('@/views/logistics/company.vue'),
              meta: { title: '物流公司', icon: 'Truck', breadcrumb: true }
            },
            {
              path: 'tracking',
              component: () => import('@/views/logistics/tracking.vue'),
              meta: { title: '物流追踪', icon: 'Search', breadcrumb: true }
            }
          ]
        },
        // ========== 内容管理（CMS） ==========
        {
          path: 'cms',
          redirect: '/cms/banner',
          meta: { title: '内容', icon: 'Picture', breadcrumb: true },
          children: [
            {
              path: 'banner',
              component: () => import('@/views/cms/banner.vue'),
              meta: { title: 'Banner 管理', icon: 'Picture', breadcrumb: true }
            },
            {
              path: 'article',
              component: () => import('@/views/cms/article.vue'),
              meta: { title: '文章管理', icon: 'Notebook', breadcrumb: true }
            }
          ]
        },
        // ========== 财务管理 ==========
        {
          path: 'finance',
          redirect: '/finance/transaction',
          meta: { title: '财务', icon: 'Money', breadcrumb: true },
          children: [
            {
              path: 'transaction',
              component: () => import('@/views/finance/transaction.vue'),
              meta: { title: '交易流水', icon: 'List', breadcrumb: true }
            },
            {
              path: 'refund',
              component: () => import('@/views/finance/refund.vue'),
              meta: { title: '退款管理', icon: 'Refund', breadcrumb: true }
            }
          ]
        },
        // ========== 评价管理 ==========
        {
          path: 'review',
          redirect: '/review/list',
          meta: { title: '评价', icon: 'Chat', breadcrumb: true },
          children: [
            {
              path: 'list',
              component: () => import('@/views/review/list.vue'),
              meta: { title: '评价管理', icon: 'Chat', breadcrumb: true }
            }
          ]
        },
        // ========== 通知系统 ==========
        {
          path: 'notification',
          redirect: '/notification/template',
          meta: { title: '通知', icon: 'Bell', breadcrumb: true },
          children: [
            {
              path: 'template',
              component: () => import('@/views/notification/template.vue'),
              meta: { title: '通知模板', icon: 'Document', breadcrumb: true }
            },
            {
              path: 'log',
              component: () => import('@/views/notification/log.vue'),
              meta: { title: '发送记录', icon: 'List', breadcrumb: true }
            }
          ]
        },
        //=============系统设置===============
        {
          path: 'system',
          redirect: '/system/admin',
          meta: {
            title: '系统设置',
            icon: 'DataBoard',
            breadcrumb: true  // 是否显示在面包屑
          },
          children: [
            {
              path: 'admin',
              component: () => import('@/views/system/user.vue'),
              meta: {
                title: '管理员管理',
                icon: 'DataBoard',
                breadcrumb: true  // 是否显示在面包屑
              },
            }, {
              path: 'role',
              component: () => import('@/views/system/role.vue'),
              meta: {
                title: '角色权限',
                icon: 'DataBoard',
                breadcrumb: true  // 是否显示在面包屑
              },
            }, {
              path: 'log',
              component: () => import('@/views/system/log.vue'),
              meta: {
                title: '操作日志',
                icon: 'DataBoard',
                breadcrumb: true  // 是否显示在面包屑
              },
            }
          ]
        }
      ]
    },

    {
      path: '/:pathMatch(.*)*',

      component: () =>
        import('@/components/404/index.vue')
    }
  ],
})

export default router
