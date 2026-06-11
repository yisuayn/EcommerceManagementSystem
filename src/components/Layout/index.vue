<template>
    <div class="app-layout">
        <el-container class="layout-container">
            <!-- 顶部导航栏 -->
            <el-header height="70px" class="app-header">
                <Header :is-collapsed="isCollapsed" @toggle-sidebar="toggleSidebar" />
            </el-header>

            <el-container>
                <!-- 侧边栏 -->
                <el-aside :width="isCollapsed ? '80px' : '260px'" class="app-aside" :class="{ collapsed: isCollapsed }">
                    <Sidebar :is-collapsed="isCollapsed" />
                </el-aside>

                <!-- 主内容区域 -->
                <el-main class="app-main">
                    <!-- 面包屑导航 -->
                    <div class="breadcrumb-wrapper">
                        <el-breadcrumb separator="/">
                            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
                            <el-breadcrumb-item v-for="item in breadcrumbs" :key="item.path">
                                {{ item.name }}
                            </el-breadcrumb-item>
                        </el-breadcrumb>
                    </div>

                    <!-- 页面内容卡片 -->
                    <div class="content-card">
                        <router-view v-slot="{ Component }">
                            <transition name="fade-transform" mode="out-in">
                                <component :is="Component" />
                            </transition>
                        </router-view>
                    </div>
                </el-main>
            </el-container>
        </el-container>

        <!-- 回到顶部按钮 -->
        <el-backtop :bottom="50" :right="40" />
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import Header from '../Header/index.vue'
import Sidebar from '../Sidebar/index.vue'
import "./layout.scss"

const route = useRoute()
const isCollapsed = ref(false)

// 动态面包屑
const breadcrumbs = computed(() => {
    const matched = route.matched.filter(item => item.path !== '/')
    return matched.map(item => ({
        path: item.path,
        name: item.meta?.title || item.name
    }))
})

const toggleSidebar = () => {
    isCollapsed.value = !isCollapsed.value
}
</script>