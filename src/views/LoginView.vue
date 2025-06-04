<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// 路由器實例，用於登入成功後跳轉
const router = useRouter()
// Auth store 實例，包含所有認證相關的狀態和方法
const authStore = useAuthStore()

// === 表單狀態 ===
// 控制顯示登入還是註冊表單
const isRegister = ref(false)

// === 登入表單資料 ===
const loginForm = ref({
  email: '',
  password: '',
})

// === 註冊表單資料 ===
const registerForm = ref({
  name: '',
  email: '',
  password: '',
})

// === 表單處理函數 ===

// 處理登入表單提交
const handleLogin = async (event) => {
  // 阻止表單預設提交行為
  event.preventDefault()

  // 清除之前的錯誤訊息
  authStore.clearError()

  // 基本驗證
  if (!loginForm.value.email || !loginForm.value.password) {
    return
  }

  // 呼叫 store 的登入方法
  const result = await authStore.login(loginForm.value.email, loginForm.value.password)

  // 登入成功後跳轉到首頁
  if (result.success) {
    router.push('/')
  }
}

// 處理註冊表單提交
const handleRegister = async (event) => {
  // 阻止表單預設提交行為
  event.preventDefault()

  // 清除之前的錯誤訊息
  authStore.clearError()

  // 基本驗證
  if (!registerForm.value.email || !registerForm.value.password || !registerForm.value.name) {
    return
  }

  // 呼叫 store 的註冊方法
  const result = await authStore.register(
    registerForm.value.email,
    registerForm.value.password,
    registerForm.value.name,
  )

  // 註冊成功後跳轉到首頁
  if (result.success) {
    router.push('/')
  }
  // 註冊失敗的錯誤訊息會顯示在頁面上
}

// 切換登入/註冊表單
const toggleForm = () => {
  isRegister.value = !isRegister.value
  // 切換表單時清除錯誤訊息
  authStore.clearError()
}
</script>

<template>
  <div class="login-page">
    <div class="form">
      <!-- 錯誤訊息顯示區域 -->
      <div v-if="authStore.error" class="error-message">
        {{ authStore.error }}
      </div>

      <!-- 註冊表單 -->
      <form class="register-form" :class="{ open: isRegister }" @submit="handleRegister">
        <input
          type="text"
          placeholder="姓名"
          v-model="registerForm.name"
          :disabled="authStore.loading"
          required
        />
        <input
          type="email"
          placeholder="Email"
          v-model="registerForm.email"
          :disabled="authStore.loading"
          required
        />
        <input
          type="password"
          placeholder="密碼"
          v-model="registerForm.password"
          :disabled="authStore.loading"
          required
        />
        <button type="submit" :disabled="authStore.loading">
          {{ authStore.loading ? '註冊中...' : '建立帳號' }}
        </button>
        <p class="message">已有帳號？ <a href="#" @click.prevent="toggleForm">登入</a></p>
      </form>

      <!-- 登入表單 -->
      <form class="login-form" :class="{ none: isRegister }" @submit="handleLogin">
        <input
          type="email"
          placeholder="Email"
          v-model="loginForm.email"
          :disabled="authStore.loading"
          required
        />
        <input
          type="password"
          placeholder="密碼"
          v-model="loginForm.password"
          :disabled="authStore.loading"
          required
        />
        <button type="submit" :disabled="authStore.loading">
          {{ authStore.loading ? '登入中...' : '登入' }}
        </button>
        <p class="message">還沒有帳號？ <a href="#" @click.prevent="toggleForm">建立帳號</a></p>
      </form>
    </div>
  </div>
</template>

<style scoped lang="scss">
.login-page {
  width: 100%;
  max-width: 360px;
  padding: 8% 0 0;
  margin: 100px auto;
}

.form {
  position: relative;
  z-index: 1;
  background: #ffffff;
  margin: 0 auto 100px;
  padding: 45px;
  text-align: center;
  box-shadow:
    0 0 20px 0 rgba(0, 0, 0, 0.2),
    0 5px 5px 0 rgba(0, 0, 0, 0.24);

  input {
    outline: 0;
    background: #f2f2f2;
    width: 100%;
    border: 0;
    margin: 0 0 15px;
    padding: 15px;
    box-sizing: border-box;
    font-size: 1rem;

    // 載入時的視覺效果
    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }

  button {
    outline: 0;
    background: #4e4e4e;
    width: 100%;
    border: 0;
    padding: 15px;
    color: #ffffff;
    font-size: 1rem;
    transition: all 0.3s linear;
    cursor: pointer;

    &:hover:not(:disabled) {
      background: #007bff;
    }

    // 載入時禁用按鈕
    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      background: #4e4e4e;
    }
  }

  .message {
    margin: 15px 0 0;
    color: #b3b3b3;
    font-size: 0.8rem;

    a {
      color: #4e4e4e;
      text-decoration: none;
      transition: all 0.3s linear;

      &:hover {
        color: #007bff;
      }
    }
  }

  .register-form {
    display: none;
  }
}

// 錯誤訊息樣式
.error-message {
  background: #fee;
  color: #c33;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 20px;
  font-size: 0.9rem;
  border: 1px solid #fcc;
}

.open {
  display: block !important;
}

.none {
  display: none !important;
}
</style>
