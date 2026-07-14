<template>
  <div class="header">
    <div class="header-left">
      <el-button :icon="isCollapsed ? Expand : Fold" @click="$emit('toggleSidebar')" text class="toggle-btn" />
      <div class="header-logo">
        <div class="logo-icon">
          <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
            <rect width="48" height="48" rx="12" fill="#fff" fill-opacity="0.2" />
            <path d="M24 14L34 20V30L24 36L14 30V20L24 14Z" stroke="#fff" stroke-width="2" fill="none" />
            <circle cx="24" cy="24" r="4" fill="#fff" fill-opacity="0.8" />
          </svg>
        </div>
        <span class="header-logo-text">后台管理系统</span>
      </div>
    </div>

    <div class="header-right">
      <!-- 搜索框 -->
      <div class="search-box">
        <el-input v-model="searchKeyword" placeholder="搜索..." :prefix-icon="Search" size="large"
          class="header-search" />
      </div>

      <!-- 通知图标 -->
      <el-badge :value="5" :hidden="false" class="notification-badge">
        <el-button :icon="Bell" text class="icon-btn" />
      </el-badge>

      <!-- 用户下拉菜单 -->
      <el-dropdown trigger="click" @command="handleCommand">
        <div class="user-info">
          <el-avatar :size="40" :src="userAvatar" class="user-avatar" />
          <div class="user-detail">
            <span class="username">{{ userInfo.nickname }}</span>
            <span class="user-role">超级管理员</span>
          </div>
          <el-icon class="dropdown-icon">
            <ArrowDown />
          </el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="profile">
              <el-icon>
                <User />
              </el-icon>
              个人中心
            </el-dropdown-item>
            <el-dropdown-item command="settings">
              <el-icon>
                <Setting />
              </el-icon>
              系统设置
            </el-dropdown-item>
            <el-dropdown-item divided command="logout" @click="logout">
              <el-icon>
                <SwitchButton />
              </el-icon>
              退出登录
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>


<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/modules/user'
import { storeToRefs } from 'pinia'  // 保持响应式
import { ref } from 'vue'
import { Expand, Fold, Search, Bell, User, Setting, SwitchButton, ArrowDown } from '@element-plus/icons-vue'

defineProps<{
  isCollapsed: boolean
}>()

defineEmits<{
  toggleSidebar: []
}>()

const userAvatar = ref('https://picsum.photos/200/200?random=1')

const handleCommand = (command: string) => {
  console.log('command:', command)
  // 处理菜单点击
}
const searchKeyword = ref('')
const router = useRouter()
const userStore = useUserStore()
const { userInfo } = storeToRefs(userStore)

const logout = () => {

  userStore.logout()
  localStorage.removeItem('token')
  router.push('/login')
}
</script>
<style scoped lang="scss">
.header {
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;

  .header-left {
    display: flex !important;
    align-items: center !important;
    gap: 20px !important;

    .toggle-btn {
      font-size: 22px;
      color: #fff;
      padding: 8px;
      transition: transform 0.3s ease;

      &:hover {
        background: rgba(255, 255, 255, 0.15);
        transform: scale(1.05);
      }
    }

    .header-logo {
      display: flex !important;
      align-items: center !important;
      gap: 12px !important;

      .logo-icon {
        display: flex !important;
        align-items: center !important;
        animation: pulse 2s infinite !important;
      }

      .header-logo-text {
        font-size: 18px !important;
        font-weight: 600 !important;
        color: #fff !important;
        letter-spacing: 1px !important;
      }
    }
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 20px;

    .search-box {
      .header-search {
        :deep(.el-input__wrapper) {
          background: rgba(255, 255, 255, 0.15);
          border: none;
          border-radius: 40px;
          box-shadow: none;
          width: 260px;

          &:hover {
            background: rgba(255, 255, 255, 0.25);
          }

          .el-input__inner {
            color: #fff;

            &::placeholder {
              color: rgba(255, 255, 255, 0.7);
            }
          }

          .el-input__prefix {
            color: rgba(255, 255, 255, 0.7);
          }
        }
      }
    }

    .icon-btn {
      color: #fff;
      font-size: 20px;
      padding: 8px;

      &:hover {
        background: rgba(255, 255, 255, 0.15);
      }
    }

    .notification-badge {
      :deep(.el-badge__content) {
        background: #ff4d4f;
        border: none;
        top: 4px;
        right: 4px;
      }
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 6px 12px;
      border-radius: 40px;
      cursor: pointer;
      transition: background 0.3s ease;
      background: rgba(255, 255, 255, 0.1);

      &:hover {
        background: rgba(255, 255, 255, 0.2);
      }

      .user-avatar {
        border: 2px solid rgba(255, 255, 255, 0.5);
      }

      .user-detail {
        display: flex;
        flex-direction: column;

        .username {
          color: #fff;
          font-size: 14px;
          font-weight: 500;
        }

        .user-role {
          color: rgba(255, 255, 255, 0.7);
          font-size: 12px;
        }
      }

      .dropdown-icon {
        color: #fff;
        font-size: 14px;
      }
    }
  }
}

@keyframes pulse {

  0%,
  100% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.05);
  }
}
</style>
