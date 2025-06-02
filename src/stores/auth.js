import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { auth } from '@/services/firebase'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile, // 新增：用於更新用戶資料
} from 'firebase/auth'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const initialized = ref(false)
  const loading = ref(false)
  const error = ref(null)

  const isAuthenticated = computed(() => user.value !== null)
  const userId = computed(() => user.value?.uid || null)
  // 新增：取得用戶顯示名稱
  const userDisplayName = computed(() => {
    return user.value?.displayName || user.value?.email || '用戶'
  })

  // Actions
  // 初始化認證狀態監聽
  const checkAuth = async () => {
    return new Promise((resolve) => {
      onAuthStateChanged(auth, (authUser) => {
        user.value = authUser
        initialized.value = true
        resolve(authUser)
      })
    })
  }

  // 登入
  const login = (email, password) => {
    loading.value = true
    error.value = null

    return signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // 登入成功
        user.value = userCredential.user
        return { success: true }
      })
      .catch((err) => {
        // 登入失敗
        error.value = getErrorMessage(err.code)
        return { success: false, error: error.value }
      })
      .finally(() => {
        // 無論成功失敗都執行
        loading.value = false
      })
  }

  // 註冊（加入 name 參數）
  const register = (email, password, name) => {
    loading.value = true
    error.value = null

    return createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // 第一步：帳號建立成功
        // 第二步：更新用戶的 displayName
        return updateProfile(userCredential.user, {
          displayName: name,
        }).then(() => {
          // displayName 更新成功，回傳包含 displayName 的用戶物件
          return {
            ...userCredential.user,
            displayName: name,
          }
        })
      })
      .then((updatedUser) => {
        // 第三步：更新本地狀態
        user.value = updatedUser
        return { success: true }
      })
      .catch((err) => {
        // 任何步驟失敗都會到這裡
        error.value = getErrorMessage(err.code)
        return { success: false, error: error.value }
      })
      .finally(() => {
        // 無論成功失敗都關閉載入狀態
        loading.value = false
      })
  }

  // 登出
  const logout = () => {
    loading.value = true

    return signOut(auth)
      .then(() => {
        // 登出成功
        user.value = null
        return { success: true }
      })
      .catch((err) => {
        // 登出失敗
        error.value = getErrorMessage(err.code)
        return { success: false, error: error.value }
      })
      .finally(() => {
        // 結束載入狀態
        loading.value = false
      })
  }

  // 清除錯誤訊息
  const clearError = () => {
    error.value = null
  }

  // 錯誤訊息轉換
  const getErrorMessage = (errorCode) => {
    const errorMessages = {
      'auth/user-not-found': '找不到此用戶',
      'auth/wrong-password': '密碼錯誤',
      'auth/email-already-in-use': '此 Email 已被使用',
      'auth/weak-password': '密碼強度不足',
      'auth/invalid-email': 'Email 格式不正確',
      'auth/too-many-requests': '請求過於頻繁，請稍後再試',
      'auth/network-request-failed': '網路連接失敗',
    }

    return errorMessages[errorCode] || '發生未知錯誤'
  }

  return {
    // State
    user,
    initialized,
    loading,
    error,
    // Getters
    isAuthenticated,
    userId,
    userDisplayName, // 新增
    // Actions
    checkAuth,
    login,
    register,
    logout,
    clearError,
    getErrorMessage,
  }
})
