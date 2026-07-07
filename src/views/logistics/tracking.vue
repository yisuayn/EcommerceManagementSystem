<!-- LogisticsTracking.vue -->
<template>
  <div class="logistics-tracking">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>物流追踪</h2>
    </div>

    <!-- 搜索区域 -->
    <el-card class="search-card" shadow="never">
      <div class="search-container">
        <h3 class="search-title">快递单号查询</h3>
        <div class="search-input-wrapper">
          <el-input v-model="trackingNo" placeholder="请输入快递单号，如 SF1234567890" clearable size="large"
            @keyup.enter="handleSearch" class="search-input">
            <template #prefix>
              <el-icon>
                <Search />
              </el-icon>
            </template>
          </el-input>
          <el-button type="primary" size="large" @click="handleSearch" class="search-btn">
            查询
          </el-button>
        </div>
        <div class="search-hint">
          支持查询：SF1234567890、YT9876543210、ZT1122334455
        </div>
      </div>
    </el-card>

    <!-- 加载状态 -->
    <div v-if="searching" class="loading-container">
      <el-skeleton :rows="5" animated />
    </div>

    <!-- 搜索结果 -->
    <div v-if="!searching && trackingResult" class="result-container">
      <!-- 物流概览卡片 -->
      <el-card class="tracking-card" shadow="hover">
        <div class="tracking-header">
          <div class="tracking-summary">
            <div class="company-info">
              <el-icon :size="28" class="company-icon">
                <Van />
              </el-icon>
              <div>
                <div class="company-name">{{ trackingResult.company }}</div>
                <div class="tracking-number">运单号：{{ trackingResult.trackingNo }}</div>
              </div>
            </div>
            <div class="status-tag">
              <el-tag :type="getStatusType(trackingResult.status)" size="large" effect="dark">
                <el-icon style="margin-right: 4px; vertical-align: middle;">
                  <CircleCheck v-if="trackingResult.status === 'delivered'" />
                  <Clock v-else-if="trackingResult.status === 'transit'" />
                  <Warning v-else />
                </el-icon>
                {{ getStatusText(trackingResult.status) }}
              </el-tag>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 物流时间线 -->
      <el-card class="timeline-card" shadow="never">
        <template #header>
          <span class="card-title">物流动态</span>
        </template>
        <el-timeline>
          <el-timeline-item v-for="(event, index) in trackingResult.events" :key="index"
            :timestamp="event.time" placement="top" :color="index === 0 ? '#409eff' : '#c0c4cc'"
            :hollow="index !== 0">
            <div class="timeline-event">
              <p class="event-content">{{ event.content }}</p>
              <p v-if="event.location" class="event-location">
                <el-icon>
                  <Location />
                </el-icon>
                {{ event.location }}
              </p>
            </div>
          </el-timeline-item>
        </el-timeline>
      </el-card>
    </div>

    <!-- 未找到结果 -->
    <div v-if="!searching && notFound" class="not-found">
      <el-result icon="warning" title="未找到物流信息" sub-title="请检查运单号是否正确，或联系物流公司确认">
        <template #extra>
          <el-button type="primary" @click="trackingNo = ''">重新查询</el-button>
        </template>
      </el-result>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Van, CircleCheck, Clock, Warning, Location } from '@element-plus/icons-vue'

// 搜索关键词
const trackingNo = ref('')

// 状态
const searching = ref(false)
const notFound = ref(false)

// 物流追踪结果接口
interface TrackingEvent {
  time: string
  content: string
  location: string
}

interface TrackingResult {
  company: string
  trackingNo: string
  status: 'transit' | 'delivered' | 'exception'
  events: TrackingEvent[]
}

// 搜索结果
const trackingResult = ref<TrackingResult | null>(null)

// 模拟物流数据
const mockTrackingData: Record<string, TrackingResult> = {
  'SF1234567890': {
    company: '顺丰速运',
    trackingNo: 'SF1234567890',
    status: 'transit',
    events: [
      { time: '2024-06-14 08:30:00', content: '快件到达 深圳中转中心', location: '广东省深圳市' },
      { time: '2024-06-14 06:15:00', content: '快件已从 广州集散中心 发出', location: '广东省广州市' },
      { time: '2024-06-13 22:00:00', content: '快件到达 广州集散中心', location: '广东省广州市' },
      { time: '2024-06-13 18:30:00', content: '快件已从 东莞集散点 发出', location: '广东省东莞市' },
      { time: '2024-06-13 16:00:00', content: '快件到达 东莞长安营业点', location: '广东省东莞市' },
      { time: '2024-06-13 14:30:00', content: '快递员已揽收', location: '广东省东莞市' }
    ]
  },
  'YT9876543210': {
    company: '圆通速递',
    trackingNo: 'YT9876543210',
    status: 'delivered',
    events: [
      { time: '2024-06-13 16:30:00', content: '已签收，签收人：前台代收', location: '北京市朝阳区' },
      { time: '2024-06-13 14:00:00', content: '派送中，预计今天送达', location: '北京市朝阳区' },
      { time: '2024-06-13 10:30:00', content: '快件到达 北京朝阳区营业部', location: '北京市朝阳区' },
      { time: '2024-06-12 23:00:00', content: '快件到达 北京分拨中心', location: '北京市' },
      { time: '2024-06-12 15:00:00', content: '快件已从 杭州集散中心 发出', location: '浙江省杭州市' },
      { time: '2024-06-12 08:00:00', content: '快递员已揽收', location: '浙江省杭州市' }
    ]
  },
  'ZT1122334455': {
    company: '中通快递',
    trackingNo: 'ZT1122334455',
    status: 'exception',
    events: [
      { time: '2024-06-14 09:00:00', content: '快件异常，正在联系收件人重新派送', location: '上海市浦东新区' },
      { time: '2024-06-14 07:30:00', content: '派送失败，收件人电话无法接通', location: '上海市浦东新区' },
      { time: '2024-06-13 22:00:00', content: '快件到达 上海浦东新区营业部', location: '上海市浦东新区' },
      { time: '2024-06-13 16:00:00', content: '快件到达 上海分拨中心', location: '上海市' },
      { time: '2024-06-13 10:00:00', content: '快件已从 南京集散中心 发出', location: '江苏省南京市' },
      { time: '2024-06-12 20:00:00', content: '快递员已揽收', location: '江苏省南京市' }
    ]
  }
}

// 获取状态类型
const getStatusType = (status: string) => {
  const types: Record<string, string> = {
    transit: 'primary',
    delivered: 'success',
    exception: 'danger'
  }
  return types[status] || 'info'
}

// 获取状态文本
const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    transit: '运输中',
    delivered: '已签收',
    exception: '异常'
  }
  return texts[status] || status
}

// 搜索
const handleSearch = () => {
  const no = trackingNo.value.trim()
  if (!no) {
    ElMessage.warning('请输入快递单号')
    return
  }

  searching.value = true
  notFound.value = false
  trackingResult.value = null

  // 模拟查询延迟
  setTimeout(() => {
    searching.value = false
    const result = mockTrackingData[no]
    if (result) {
      trackingResult.value = result
      ElMessage.success('查询成功')
    } else {
      notFound.value = true
      ElMessage.error('未找到该运单的物流信息')
    }
  }, 800)
}
</script>

<style scoped lang="scss">
.logistics-tracking {
  min-height: 100vh;

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding: 0 20px;

    h2 {
      font-size: 20px;
      font-weight: 500;
      color: #303133;
    }
  }

  .search-card {
    margin-bottom: 20px;
    border-radius: 8px;

    .search-container {
      padding: 40px 20px;
      text-align: center;

      .search-title {
        font-size: 22px;
        font-weight: 500;
        color: #303133;
        margin-bottom: 24px;
      }

      .search-input-wrapper {
        display: flex;
        justify-content: center;
        gap: 12px;
        max-width: 600px;
        margin: 0 auto;

        .search-input {
          width: 420px;
        }

        .search-btn {
          min-width: 100px;
        }
      }

      .search-hint {
        margin-top: 12px;
        font-size: 13px;
        color: #909399;
      }
    }
  }

  .loading-container {
    padding: 0 20px;
    margin-bottom: 20px;
  }

  .result-container {
    padding: 0 20px;

    .tracking-card {
      margin-bottom: 20px;
      border-radius: 8px;

      .tracking-header {
        .tracking-summary {
          display: flex;
          justify-content: space-between;
          align-items: center;

          .company-info {
            display: flex;
            align-items: center;
            gap: 12px;

            .company-icon {
              color: #409eff;
            }

            .company-name {
              font-size: 18px;
              font-weight: 600;
              color: #303133;
            }

            .tracking-number {
              font-size: 14px;
              color: #909399;
              margin-top: 4px;
            }
          }

          .status-tag {
            :deep(.el-tag) {
              font-size: 14px;
              padding: 8px 16px;
              height: auto;
            }
          }
        }
      }
    }

    .timeline-card {
      border-radius: 8px;

      .card-title {
        font-size: 16px;
        font-weight: 500;
      }

      .timeline-event {
        .event-content {
          font-size: 14px;
          color: #303133;
          margin: 0;
          line-height: 1.6;
        }

        .event-location {
          font-size: 12px;
          color: #909399;
          margin: 4px 0 0;
          display: flex;
          align-items: center;
          gap: 4px;
        }
      }
    }
  }

  .not-found {
    padding: 0 20px;
  }
}
</style>
