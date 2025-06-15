<script setup>
import { computed, onMounted, ref } from 'vue'
import { marked } from 'marked'
import debounce from 'debounce'
import { useAuthStore } from '@/stores/auth'
import { useTodosStore } from '@/stores/todos'

const authStore = useAuthStore()
const todosStore = useTodosStore()

const newTodo = ref('')
const todos = computed(() => todosStore.todos)
const visability = ref('all')
const editorShow = ref(false)
const saveShow = ref(false)
const input = ref('')
const output = computed(() => marked(input.value))
const currentEditContent = ref('')
const currentEditingId = ref(null)
const update = debounce((e) => {
  currentEditContent.value = e.target.value
  input.value = e.target.value
}, 100)

onMounted(async () => {
  if (authStore.isAuthenticated) {
    await todosStore.fetchTodos()
  }
})

const addTodo = async (e) => {
  const value = newTodo.value.trim()
  console.log(value)
  if (value) {
    // todos.value.push({
    //   id: nanoid(10),
    //   title: newTodo.value,
    //   completed: false,
    //   content: `# ${newTodo.value}`,
    // })
    const newTodoData = {
      title: newTodo.value,
      completed: false,
      content: `# ${newTodo.value}`,
    }
    await todosStore.addTodo(newTodoData)
    newTodo.value = ''
  }
}

const removeTodo = async (item) => {
  editorShow.value = false
  saveShow.value = false
  await todosStore.deleteTodo(item.id)
}

const editTodo = (item) => {
  editorShow.value = true
  saveShow.value = true
  currentEditContent.value = item.content
  input.value = item.content
  currentEditingId.value = item.id
}

const saveEdit = async () => {
  if (currentEditingId.value) {
    // 找到要更新的待辦事項
    const todoIndex = todos.value.findIndex((todo) => todo.id === currentEditingId.value)
    await todosStore.updateTodo(currentEditingId.value, {
      content: currentEditContent.value,
    })
    if (todoIndex !== -1) {
      // 更新內容
      todos.value[todoIndex].content = currentEditContent.value
    }
  }
  editorShow.value = false
  saveShow.value = false
}

// 更新 todo 完成狀態
const updateTodoStatus = async (todo) => {
  await todosStore.updateTodo(todo.id, {
    completed: todo.completed,
  })
}

const clearAll = async () => {
  await todosStore.clearAllTodos()
}

const filterTodos = computed(() => {
  let newTodos = []
  if (visability.value === 'all') {
    newTodos = todos.value
  } else if (visability.value === 'active') {
    newTodos = todos.value.filter((todo) => !todo.completed)
  } else if (visability.value === 'completed') {
    newTodos = todos.value.filter((todo) => todo.completed)
  }
  return newTodos
})

const unCompletedCounter = computed(() => {
  let counter = todos.value.map((todo) => {
    return todo.completed
  })
  let result = counter.filter((count) => {
    return count === false
  })

  return result.length
})
</script>

<template>
  <div class="container">
    <div class="input-group">
      <div class="input-group-prepend">
        <span class="input-group-text" id="basic-addon1">待辦事項</span>
      </div>
      <input
        type="text"
        class="form-control"
        placeholder="準備要做的任務"
        v-model="newTodo"
        @keyup.enter="addTodo"
      />
      <div class="input-group-append">
        <button class="btn" type="button" @click="addTodo">新增</button>
      </div>
    </div>
    <div class="card">
      <div class="card-header">
        <ul class="nav">
          <li class="nav-item">
            <a
              class="nav-link"
              href="#"
              @click.prevent="visability = 'all'"
              :class="{ active: visability === 'all' }"
              >全部</a
            >
          </li>
          <li class="nav-item">
            <a
              class="nav-link"
              href="#"
              @click.prevent="visability = 'active'"
              :class="{ active: visability === 'active' }"
              >進行中</a
            >
          </li>
          <li class="nav-item">
            <a
              class="nav-link"
              href="#"
              @click.prevent="visability = 'completed'"
              :class="{ active: visability === 'completed' }"
              >已完成</a
            >
          </li>
        </ul>
      </div>
      <ul class="list-group">
        <li class="list-group-item" v-for="item in filterTodos" :key="item.id">
          <div class="d-flex">
            <div class="form-check">
              <input
                type="checkbox"
                class="form-check-input"
                :id="item.id"
                v-model="item.completed"
                @change="updateTodoStatus(item)"
              />
              <label class="form-check-label" :for="item.id" :class="{ completed: item.completed }">
                {{ item.title }}
              </label>
            </div>
            <button type="button" class="edit" @click="editTodo(item)">
              <img src="@/assets/edit_icon.svg" alt="" />
            </button>
            <button type="button" class="close" @click="removeTodo(item)">
              <span> &times; </span>
            </button>
          </div>
        </li>
      </ul>
      <div class="card-footer d-flex">
        <span>還有 {{ unCompletedCounter }} 筆任務未完成</span>
        <a href="#" @click.prevent="clearAll">清除所有任務</a>
      </div>
    </div>

    <div v-if="editorShow" class="editor">
      <textarea class="editorInput" :value="currentEditContent" @input="update"></textarea>
      <div class="editorOutput" v-html="output"></div>
    </div>
    <div v-if="saveShow" class="save">
      <button class="saveButton" @click="saveEdit">儲存修改</button>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.container {
  width: 100%;
  padding: 0 16px;
  margin: 0 auto;
  max-width: 720px;
}
.input-group {
  margin-top: 50px;
  display: flex;
  .input-group-prepend {
    padding: 8px 16px;
    background: #4e4e4e;
    span {
      color: #fff;
    }
  }
  .form-control {
    flex-grow: 1;
    padding: 8px 16px;
    font-size: 16px;
  }
  .input-group-append {
    background: #ddd;
    .btn {
      cursor: pointer;
      border: none;
      padding: 8px 32px;
      display: block;
      background: transparent;
      width: 100%;
      height: 100%;
      transition: 0.25s linear;
      &:hover {
        background-color: #007bff;
        color: #fff;
      }
    }
  }
}
.card {
  position: relative;
  display: flex;
  text-align: center;
  -ms-flex-direction: column;
  flex-direction: column;
  word-wrap: break-word;
  background-color: #fff;
  background-clip: border-box;
  border: 1px solid rgba(0, 0, 0, 0.125);
  border-radius: 0.25rem;
  .card-header {
    padding: 0.75rem 1.25rem 0 1.25rem;
    margin-bottom: 0;
    background-color: rgba(0, 0, 0, 0.03);
    border-bottom: 1px solid rgba(0, 0, 0, 0.125);
    &:first-child {
      border-radius: calc(0.25rem - 1px) calc(0.25rem - 1px) 0 0;
    }
    .nav {
      display: flex;
      flex-wrap: wrap;
      padding-left: 0;
      margin-bottom: 0;
      list-style: none;
      .nav-link {
        display: block;
        padding: 0.5rem 1rem;
        margin-bottom: -1px;
        border: 1px solid transparent;
        border-top-left-radius: 0.25rem;
        border-top-right-radius: 0.25rem;
        text-decoration: none;
        color: #007bff;
        &.active {
          color: #495057;
          background-color: #fff;
          border-color: #dee2e6 #dee2e6 #fff;
        }
      }
    }
  }
  .list-group {
    .d-flex {
      display: flex;
    }
    .list-group-item {
      position: relative;
      display: block;
      padding: 0.75rem 1.25rem;
      background-color: #fff;
      border: 1px solid rgba(0, 0, 0, 0.125);
      .form-check {
        display: flex;
        padding-left: 1.25rem;
        align-items: center;
        width: 100%;
        cursor: pointer;
        .form-check-input {
          position: absolute;
          margin-top: 0.3rem;
          margin-left: -1.25rem;
        }
      }
      .edit {
        cursor: pointer;
        font-size: 1.5rem;
        font-weight: 700;
        line-height: 1;
        color: #000;
        opacity: 0.5;
        border: 0;
        padding: 5px;
      }
      .close {
        cursor: pointer;
        font-size: 1.5rem;
        font-weight: 700;
        line-height: 1;
        color: #000;
        opacity: 0.5;
        border: 0;
        padding: 5px;
      }
    }
  }
  .card-footer {
    padding: 0.5rem 1.25rem;
    display: flex;
    justify-content: space-between;
    a {
      text-decoration: none;
      color: #007bff;
    }
  }
  .completed {
    text-decoration: line-through;
  }
}

.editor {
  height: 50vh;
  overflow-y: auto;
  display: flex;
  .editorInput,
  .editorOutput {
    overflow: auto;
    width: 50%;
    height: 100%;
    box-sizing: border-box;
    padding: 0 20px;
  }

  .editorInput {
    border: none;
    border-right: 1px solid #ccc;
    resize: none;
    outline: none;
    background-color: #f6f6f6;
    font-size: 14px;
    font-family: 'Monaco', courier, monospace;
    padding: 20px;
  }
}
.save {
  padding: 1rem;
  background-color: #ddd;
  display: flex;
  justify-content: center;
  .saveButton {
    background-color: #4e4e4e;
    border: none;
    padding: 8px 16px;
    color: #ffffff;
    cursor: pointer;
    transition: 0.25s linear;
    &:hover {
      background-color: #007bff;
      color: #fff;
    }
  }
}

@media screen and (max-width: 768px) {
  .input-group {
 
  .form-control {
    padding: 4px 8px;
  }
  .input-group-append {
    .btn {
      padding: 8px 16px;
    }
  }
}
}
</style>
