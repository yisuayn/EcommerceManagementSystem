<!-- components/Sidebar.vue -->
<template>
    <div class="sidebar">
        <el-menu :default-active="activeMenu" :collapse="isCollapsed" :collapse-transition="false"
            background-color="transparent" text-color="rgba(255, 255, 255, 0.7)" active-text-color="#667eea" router
            unique-opened>
            <el-menu-item index="/dashboard">
                <el-icon>
                    <DataAnalysis />
                </el-icon>
                <template #title>
                    <span>数据看板</span>
                </template>
            </el-menu-item>

            <el-sub-menu index="/product">
                <template #title>
                    <el-icon>
                        <ShoppingCart />
                    </el-icon>
                    <span>商品管理</span>
                </template>
                <el-menu-item index="/product/list">
                    <el-icon>
                        <Goods />
                    </el-icon>
                    <span>产品列表</span>
                </el-menu-item>
                <el-menu-item index="/product/inventory">
                    <el-icon>
                        <Monitor />
                    </el-icon>
                    <span>库存管理</span>
                </el-menu-item>
                <el-menu-item index="/product/launch">
                    <el-icon>
                        <Shop />
                    </el-icon>
                    <span>商品发布</span>
                </el-menu-item>
                <el-menu-item index="/product/datareport">
                    <el-icon>
                        <DataBoard />
                    </el-icon>
                    <span>数据报表</span>
                </el-menu-item>
            </el-sub-menu>

            <el-sub-menu index="/orders">
                <template #title>
                    <el-icon>
                        <Present />
                    </el-icon>
                    <span>订单管理</span>
                </template>
                <el-menu-item index="/orders/list">
                    <el-icon>
                        <Ticket />
                    </el-icon>
                    <span>订单列表</span>
                </el-menu-item>
                <el-menu-item index="/orders/aftersales">
                    <el-icon>
                        <Timer />
                    </el-icon>
                    <span>售后管理</span>
                </el-menu-item>
                <el-menu-item index="/orders/abnormal">
                    <el-icon>
                        <Timer />
                    </el-icon>
                    <span>异常监控</span>
                </el-menu-item>
            </el-sub-menu>

            <el-sub-menu index="marketing">
                <template #title>
                    <el-icon>
                        <Present />
                    </el-icon>
                    <span>营销中心</span>
                </template>
                <el-menu-item index="/marketing/coupon">
                    <el-icon>
                        <Ticket />
                    </el-icon>
                    <span>优惠券管理</span>
                </el-menu-item>
                <el-menu-item index="/marketing/seckill">
                    <el-icon>
                        <Timer />
                    </el-icon>
                    <span>秒杀活动</span>
                </el-menu-item>
            </el-sub-menu>

            <el-sub-menu index="/system">
                <template #title>
                    <el-icon>
                        <Setting />
                    </el-icon>
                    <span>系统设置</span>
                </template>
                <el-menu-item index="/system/user">
                    <el-icon>
                        <UserFilled />
                    </el-icon>
                    <span>管理员管理</span>
                </el-menu-item>
                <el-menu-item index="/system/role">
                    <el-icon>
                        <Avatar />
                    </el-icon>
                    <span>角色权限</span>
                </el-menu-item>
                <el-menu-item index="/system/log">
                    <el-icon>
                        <Document />
                    </el-icon>
                    <span>操作日志</span>
                </el-menu-item>
            </el-sub-menu>
        </el-menu>

        <!-- 收起时的悬浮提示 -->
        <div v-if="isCollapsed" class="collapsed-tip">
            <el-icon>
                <Expand />
            </el-icon>
            <span>点击展开菜单</span>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import {
    DataBoard, ShoppingCart, Goods, Shop, Present, Ticket, Timer, Monitor, DataAnalysis,
    Setting, UserFilled, Avatar, Document, Expand
} from '@element-plus/icons-vue'

defineProps<{
    isCollapsed: boolean
}>()

const route = useRoute()
const activeMenu = computed(() => route.path)
</script>

<style scoped lang="scss">
.sidebar {
    height: 100%;
    position: relative;

    :deep(.el-menu) {
        border-right: none;
        height: 100%;
        width: 100%;
        padding: 20px 0;

        &:not(.el-menu--collapse) {
            width: 260px;
        }

        .el-menu-item,
        .el-sub-menu__title {
            height: 52px;
            line-height: 52px;
            margin: 4px 12px;
            border-radius: 12px;
            transition: all 0.3s ease;

            &:hover {
                background: rgba(102, 126, 234, 0.2) !important;
                color: #fff !important;
            }

            &.is-active {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
                color: #fff !important;
                box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
            }
        }

        .el-sub-menu.is-active .el-sub-menu__title {
            color: #667eea !important;
        }

        .el-menu--inline {
            background: rgba(0, 0, 0, 0.2);
            border-radius: 12px;
            margin: 0 12px;

            .el-menu-item {
                padding-left: 52px !important;
                margin: 2px 0;
            }
        }

        .menu-badge {
            margin-left: 8px;

            :deep(.el-badge__content) {
                transform: scale(0.8);
            }
        }
    }

    .collapsed-tip {
        position: absolute;
        bottom: 20px;
        left: 0;
        right: 0;
        text-align: center;
        color: rgba(255, 255, 255, 0.5);
        font-size: 12px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;

        .el-icon {
            font-size: 20px;
        }
    }
}
</style>