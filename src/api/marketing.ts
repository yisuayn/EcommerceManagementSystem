import service from '@/utils/request'

/** 优惠券列表 */
export const getCouponList = (params?: any) => {
  return service({ url: '/marketing/coupon/list', method: 'get', params })
}

/** 保存优惠券 */
export const saveCoupon = (data: any) => {
  return service({ url: '/marketing/coupon/save', method: 'post', data })
}

/** 发放优惠券 */
export const sendCoupon = (data: any) => {
  return service({ url: '/marketing/coupon/send', method: 'post', data })
}

/** 秒杀活动列表 */
export const getSeckillList = (params?: any) => {
  return service({ url: '/marketing/seckill/list', method: 'get', params })
}

/** 保存秒杀活动 */
export const saveSeckill = (data: any) => {
  return service({ url: '/marketing/seckill/save', method: 'post', data })
}
