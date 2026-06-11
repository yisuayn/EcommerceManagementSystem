import router from './index'

import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

import { useUserStore } from '@/stores/modules/user'

NProgress.configure({
  showSpinner:false
})

router.beforeEach((to, from, next) => {

  NProgress.start()

  const userStore = useUserStore()

  const whiteList = [
    '/login',
    '/register'
  ]

  if (
    !whiteList.includes(to.path)
    &&
    !userStore.token
  ) {
    next('/login')
    return
  }

  next()
})

router.afterEach(() => {
  NProgress.done()
})