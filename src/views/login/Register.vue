<template>
    <div class="register-container">
        <!-- 背景装饰 -->
        <div class="bg-gradient"></div>
        <div class="bg-blur-circles">
            <div class="circle circle-1"></div>
            <div class="circle circle-2"></div>
            <div class="circle circle-3"></div>
        </div>

        <!-- 注册卡片 -->
        <div class="register-card">
            <!-- Logo 和标题区域 -->
            <div class="register-header">
                <div class="logo">
                    <div class="logo-icon">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2"
                                stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                stroke-linejoin="round" />
                            <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                stroke-linejoin="round" />
                        </svg>
                    </div>
                    <span class="logo-text">星辰科技</span>
                </div>
                <h2 class="welcome-title">创建账户</h2>
                <p class="welcome-sub">立即注册，体验高效的企业服务</p>
            </div>

            <!-- 注册表单 -->
            <form @submit.prevent="handleRegister" class="register-form">
                <div class="input-group">
                    <div class="input-icon">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M20 21V19C20 16.8 18.2 15 16 15H8C5.8 15 4 16.8 4 19V21" stroke="currentColor"
                                stroke-width="2" stroke-linecap="round" />
                            <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2"
                                stroke-linecap="round" />
                        </svg>
                    </div>
                    <input type="text" v-model="registerForm.name" placeholder="姓名" required />
                </div>

                <div class="input-group">
                    <div class="input-icon">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z"
                                stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                            <path d="M22 6L12 13L2 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                        </svg>
                    </div>
                    <input type="email" v-model="registerForm.email" placeholder="电子邮箱" required />
                </div>

                <div class="input-group">
                    <div class="input-icon">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M17 2H7C5.9 2 5 2.9 5 4V20C5 21.1 5.9 22 7 22H17C18.1 22 19 21.1 19 20V4C19 2.9 18.1 2 17 2Z"
                                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M12 18H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                stroke-linejoin="round" />
                            <path d="M8 2H16" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                            <path d="M8 22H16" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                        </svg>
                    </div>
                    <input type="phone" v-model="registerForm.phone" placeholder="请输入手机号" required />
                </div>

                <div class="input-group">
                    <div class="input-icon">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M19 11H5C3.9 11 3 11.9 3 13V20C3 21.1 3.9 22 5 22H19C20.1 22 21 21.1 21 20V13C21 11.9 20.1 11 19 11Z"
                                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M7 11V7C7 5.7 7.6 4.5 8.8 3.8C10 3.1 11.5 3.1 12.7 3.8" stroke="currentColor"
                                stroke-width="2" stroke-linecap="round" />
                            <path d="M17 7V11" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                            <circle cx="12" cy="16" r="1.5" fill="currentColor" />
                        </svg>
                    </div>
                    <input :type="showPassword ? 'text' : 'password'" v-model="registerForm.password" placeholder="密码"
                        required />
                    <button type="button" class="password-toggle" @click="showPassword = !showPassword">
                        <svg v-if="!showPassword" viewBox="0 0 24 24" fill="none">
                            <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z"
                                stroke="currentColor" stroke-width="2" />
                            <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" />
                        </svg>
                        <svg v-else viewBox="0 0 24 24" fill="none">
                            <path d="M2 2L22 22" stroke="currentColor" stroke-width="2" />
                            <path d="M6.7 6.7C4.6 8.3 3 10.5 2 12C2 12 6 20 12 20C13.8 20 15.5 19.2 16.9 18"
                                stroke="currentColor" stroke-width="2" />
                            <path d="M19.2 15.8C20.6 14.3 21.8 12.5 22 12C22 12 18 4 12 4C11.2 4 10.5 4.2 9.8 4.5"
                                stroke="currentColor" stroke-width="2" />
                            <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" />
                        </svg>
                    </button>
                </div>

                <div class="input-group">
                    <div class="input-icon">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 8V12L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                            <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2" />
                        </svg>
                    </div>
                    <input :type="showConfirmPassword ? 'text' : 'password'" v-model="registerForm.confirmPassword"
                        placeholder="确认密码" required />
                    <button type="button" class="password-toggle" @click="showConfirmPassword = !showConfirmPassword">
                        <svg v-if="!showConfirmPassword" viewBox="0 0 24 24" fill="none">
                            <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z"
                                stroke="currentColor" stroke-width="2" />
                            <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" />
                        </svg>
                        <svg v-else viewBox="0 0 24 24" fill="none">
                            <path d="M2 2L22 22" stroke="currentColor" stroke-width="2" />
                            <path d="M6.7 6.7C4.6 8.3 3 10.5 2 12C2 12 6 20 12 20C13.8 20 15.5 19.2 16.9 18"
                                stroke="currentColor" stroke-width="2" />
                            <path d="M19.2 15.8C20.6 14.3 21.8 12.5 22 12C22 12 18 4 12 4C11.2 4 10.5 4.2 9.8 4.5"
                                stroke="currentColor" stroke-width="2" />
                            <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" />
                        </svg>
                    </button>
                </div>

                <div class="form-options">
                    <label class="checkbox-label">
                        <input type="checkbox" v-model="registerForm.agreeTerms" required>
                        <span>我已阅读并同意 <a href="#" class="terms-link">服务条款</a> 和 <a href="#"
                                class="terms-link">隐私政策</a></span>
                    </label>
                </div>

                <button type="submit" class="submit-btn" :disabled="loading">
                    <span v-if="!loading">注册</span>
                    <div v-else class="spinner"></div>
                </button>
            </form>

            <!-- 登录入口 -->
            <div class="login-prompt">
                已有账户？
                <router-link to="/login" class="login-link">立即登录</router-link>
            </div>

            <!-- 第三方注册 -->
            <div class="social-section">
                <div class="divider">
                    <span>或使用以下方式注册</span>
                </div>
                <div class="social-buttons">
                    <button class="social-btn">
                        <svg viewBox="0 0 24 24" width="20" height="20">
                            <path
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                fill="#4285F4" />
                            <path
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                fill="#34A853" />
                            <path
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                fill="#FBBC05" />
                            <path
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                fill="#EA4335" />
                        </svg>
                        Google
                    </button>
                    <button class="social-btn">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="#1877F2">
                            <path
                                d="M24 12.07C24 5.41 18.63 0 12 0S0 5.41 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.68 4.54-4.68 1.31 0 2.68.24 2.68.24v2.96h-1.51c-1.49 0-1.95.93-1.95 1.88v2.26h3.32l-.53 3.49h-2.79V24C19.61 23.1 24 18.1 24 12.07z" />
                        </svg>
                        微信
                    </button>
                    <button class="social-btn">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="#000">
                            <path
                                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                        </svg>
                        GitHub
                    </button>
                </div>
            </div>
        </div>

        <!-- Toast 提示 -->
        <div v-if="toast.show" :class="['toast', toast.type]">
            {{ toast.message }}
        </div>
    </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import '@/assets/style/register.scss'
import { registerApi } from '@/api/auth'

const router = useRouter()
// 注册表单数据
const registerForm = reactive({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false
})
// 密码显示切换
const showPassword = ref(false)
const showConfirmPassword = ref(false)

// 加载状态
const loading = ref(false)

// Toast 通知
const toast = reactive({
    show: false,
    message: '',
    type: 'info'
})

const handleRegister = async () => {

    if (!registerForm.name.trim()) {
        ElMessage.error('请输入姓名')
        return
    }
    if (registerForm.name.length < 2 || registerForm.name.length > 20) {
        ElMessage.error('姓名长度应在2-20个字符之间')
        return
    }

    // 2. 邮箱验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!registerForm.email) {
        ElMessage.error('请输入邮箱')
        return
    }
    if (!emailRegex.test(registerForm.email)) {
        ElMessage.error('请输入有效的邮箱地址')
        return
    }

    // 3. 手机号验证
    const phoneRegex = /^1[3-9]\d{9}$/
    if (!registerForm.phone) {
        ElMessage.error('请输入手机号')
        return
    }
    if (!phoneRegex.test(registerForm.phone)) {
        ElMessage.error('请输入有效的11位手机号码')
        return
    }

    // 4. 密码验证
    if (!registerForm.password) {
        ElMessage.error('请输入密码')
        return
    }
    if (registerForm.password.length < 6 || registerForm.password.length > 20) {
        ElMessage.error('密码长度必须在6-20个字符之间')
        return
    }
    const hasLetter = /[a-zA-Z]/.test(registerForm.password)
    const hasNumber = /\d/.test(registerForm.password)
    if (!hasLetter || !hasNumber) {
        ElMessage.error('密码必须同时包含字母和数字')
        return
    }
    // 5. 确认密码验证
    if (!registerForm.confirmPassword) {
        ElMessage.error('请确认密码')
        return
    }
    if (registerForm.password !== registerForm.confirmPassword) {
        ElMessage.error('两次输入的密码不一致')
        return
    }

    // 6. 同意条款验证
    if (!registerForm.agreeTerms) {
        ElMessage.error('请阅读并同意服务条款和隐私政策')
        return
    }

    try {
        const res = await registerApi({
            username: registerForm.name,
            email: registerForm.email,
            phone: registerForm.phone,
            password: registerForm.password,
            confirmPassword: registerForm.confirmPassword,
            agreeTerms: registerForm.agreeTerms
        }) as any
        // // 方式1: 根据 code 判断
        if (res.success = true) {
            ElMessage.success(res.message || '注册成功！')
            // 注册成功后跳转到登录页
            setTimeout(() => {
                router.push('/login')
            }, 1500)
        }
    } catch (error) {
        console.error('登录失败:', error);
    } finally {

    }
    // ElMessage.success('注册成功')
    // router.push('/login')
}
</script>