import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '@/services/firebase'
import { useAuthStore } from './auth'

export const useTodosStore = defineStore('todos', () => {
  // State
  const todos = ref([])
  const error = ref(null)

  // 清除錯誤訊息
  const clearError = () => {
    error.value = null
  }

  // 獲取當前用戶的所有 todos
  const fetchTodos = async () => {
    const authStore = useAuthStore()

    if (!authStore.isAuthenticated) {
      return
    }

    try {
      const todosRef = collection(db, 'todos')
      const q = query(
        todosRef,
        where('userId', '==', authStore.userId),
        orderBy('createdAt', 'desc'),
      )

      const querySnapshot = await getDocs(q)
      const fetchedTodos = []

      querySnapshot.forEach((doc) => {
        fetchedTodos.push({
          id: doc.id,
          ...doc.data(),
        })
      })

      todos.value = fetchedTodos
    } catch (err) {
      console.error('獲取 todos 失敗:', err)
      error.value = '獲取待辦事項失敗'
    }
  }

  // 新增 todo
  const addTodo = async (todoData) => {
    const authStore = useAuthStore()

    if (!authStore.isAuthenticated) {
      return
    }

    try {
      const todosRef = collection(db, 'todos')
      const docRef = await addDoc(todosRef, {
        ...todoData,
        userId: authStore.userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })

      // 將新 todo 加入本地狀態（使用 Firestore 生成的 ID）
      const newTodo = {
        id: docRef.id,
        ...todoData,
        userId: authStore.userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      todos.value.unshift(newTodo) // 加在最前面
    } catch (err) {
      console.error('新增 todo 失敗:', err)
      error.value = '新增待辦事項失敗'
    }
  }

  // 更新 todo
  const updateTodo = async (todoId, updateData) => {
    const authStore = useAuthStore()

    if (!authStore.isAuthenticated) {
      return
    }

    try {
      const todoRef = doc(db, 'todos', todoId)
      await updateDoc(todoRef, {
        ...updateData,
        updatedAt: serverTimestamp(),
      })

      // 更新本地狀態
      const todoIndex = todos.value.findIndex((todo) => todo.id === todoId)
      if (todoIndex !== -1) {
        todos.value[todoIndex] = {
          ...todos.value[todoIndex],
          //completed 與否
          ...updateData,
          updatedAt: new Date(),
        }
      }
    } catch (err) {
      console.error('更新 todo 失敗:', err)
      error.value = '更新待辦事項失敗'
    }
  }

  // 刪除 todo
  const deleteTodo = async (todoId) => {
    const authStore = useAuthStore()

    if (!authStore.isAuthenticated) {
      return
    }

    try {
      const todoRef = doc(db, 'todos', todoId)
      await deleteDoc(todoRef)

      // 從本地狀態移除
      todos.value = todos.value.filter((todo) => todo.id !== todoId)
    } catch (err) {
      console.error('刪除 todo 失敗:', err)
      error.value = '刪除待辦事項失敗'
    }
  }

  // 清除所有 todos
  const clearAllTodos = async () => {
    const authStore = useAuthStore()

    if (!authStore.isAuthenticated) {
      return
    }

    try {
      // 獲取所有用戶的 todos
      const todosRef = collection(db, 'todos')
      const q = query(todosRef, where('userId', '==', authStore.userId))
      const querySnapshot = await getDocs(q)

      // 批次刪除所有 todos
      const deletePromises = []
      querySnapshot.forEach((document) => {
        deletePromises.push(deleteDoc(doc(db, 'todos', document.id)))
      })

      await Promise.all(deletePromises)

      // 清空本地狀態
      todos.value = []
    } catch (err) {
      console.error('清除所有 todos 失敗:', err)
      error.value = '清除所有待辦事項失敗'
    }
  }

  return {
    // State
    todos,
    error,
    // Actions
    fetchTodos,
    addTodo,
    updateTodo,
    deleteTodo,
    clearAllTodos,
    clearError,
  }
})
