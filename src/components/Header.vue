<script setup>
import { RouterLink, useRouter } from 'vue-router'
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'

// 手機版選單開關狀態
const isOpen = ref(false)

// 路由器實例，用於登出後跳轉
const router = useRouter()

// Auth store 實例，取得認證狀態和登出功能
const authStore = useAuthStore()

// 處理登出
const handleLogout = async () => {
  // 關閉手機版選單
  isOpen.value = false

  // 呼叫 store 的登出方法
  const result = await authStore.logout()

  // 登出成功後跳轉到登入頁面
  if (result.success) {
    router.push('/login')
  }
}

// 關閉手機版選單的輔助函數
const closeMenu = () => {
  isOpen.value = false
}
</script>

<template>
  <div class="menuBtn" :class="{ closeBtn: isOpen }" @click="isOpen = !isOpen">
    <span></span>
    <span></span>
  </div>
  <header class="header fix" :class="{ open: isOpen }">
    <div class="container">
      <div class="logo">
        <RouterLink to="/" @click="closeMenu">
          <img src="@/assets/chemistry_icon.svg" alt="Logo" />
        </RouterLink>
      </div>
      <nav class="nav">
        <ul class="row">
          <li>
            <RouterLink to="/" @click="closeMenu">首頁</RouterLink>
          </li>

          <!-- 未登入時顯示登入按鈕 -->
          <li v-if="!authStore.isAuthenticated">
            <RouterLink :to="{ name: 'Login' }" @click="closeMenu">登入</RouterLink>
          </li>

          <!-- 已登入時顯示用戶資訊和登出按鈕 -->
          <template v-if="authStore.isAuthenticated">
            <li class="user-info">
              <span class="user-name">{{ authStore.userDisplayName }}</span>
            </li>
            <li>
              <a href="#" @click.prevent="handleLogout" class="logout-btn">
                <span v-if="authStore.loading">登出中...</span>
                <span v-else>登出</span>
              </a>
            </li>
          </template>
        </ul>
      </nav>
    </div>
  </header>
</template>

<style scoped lang="scss">
header {
  background-color: #fff;
  border-bottom: 2px solid #ddd;
  border-image-slice: 1;
  position: relative;

  .container {
    max-width: 95%;
    margin-left: auto;
    margin-right: auto;
    display: flex;
    justify-content: space-between;
    align-items: center;

    @media screen and (max-width: 1280px) {
      margin-right: auto;
    }
  }

  .logo {
    max-width: 175px;

    a {
      display: block;

      img {
        display: block;
        border: none;
        width: 100%;
      }
    }
  }

  nav {
    display: flex;
    justify-content: center;
    align-items: center;

    ul {
      margin-left: 60px;
      height: 90px;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 58px;

      @media screen and (max-width: 1280px) {
        margin-left: 30px;
        gap: 35px;
      }

      li {
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;

        &:hover a {
          color: #007bff;
        }

        > a {
          display: flex;
          flex-direction: column;
          align-items: center;
          font-size: 18px;
          color: #4e4e4e;
          font-weight: bold;
          transition: 0.25s linear;
          height: 100%;
          justify-content: center;
          z-index: 2;
          text-decoration: none;

          span {
            display: block;
            text-align: center;
            font-size: 18px;
            color: #4e4e4e;
            font-weight: bold;
          }
        }

        // 用戶資訊樣式
        &.user-info {
          .user-name {
            font-size: 18px;
            color: #4e4e4e;
            padding: 0 10px;
            font-weight: bold;
            text-transform: capitalize;
          }
        }

        // 登出按鈕樣式
        .logout-btn {
          cursor: pointer;

          &:hover {
            color: #dc3545 !important; // 紅色表示登出
          }
        }
      }
    }
  }
}

.menuBtn {
  cursor: pointer;
  display: none;
  width: 55px;
  height: 55px;
  border-radius: 50%;
  position: fixed;
  top: 15px;
  right: 15px;
  z-index: 200;
  background-color: #fff;
  border: 2px solid #4e4e4e;

  .close {
    display: none;
  }
}

@media screen and (min-width: 981px) {
  header.fix {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 149;
  }
}

@media screen and (max-width: 980px) {
  header {
    width: 100%;
    position: fixed;
    background-color: unset;
    border-bottom: 2px solid transparent;
    .container {
      flex-direction: column;
      gap: 20px;
      height: 80px;
    }

    .logo {
      position: absolute;
      left: 24px;
      max-width: 150px;
      display: none;
      top: 24px;
    }

    nav {
      transition: 0.25s ease-in-out;
      padding-bottom: 60px;
      height: auto;
      margin-top: 1.5rem;
      display: flex;
      flex-direction: column;
      height: 0;
      z-index: 99;
      justify-content: normal;
      align-items: normal;

      position: fixed;
      width: 100%;
      top: -200vh;
      height: 100vh;
      z-index: 200;
      background: #fff;
      padding: 150px 10px 30px;
      transition: 0.25s;
      margin: 0;
    }

    nav ul.row {
      width: 100%;
      flex-direction: column;
      gap: 16px;
    }

    nav ul {
      height: auto;
      margin: 0 auto;
    }

    nav ul li {
      width: 100%;

      &:last-child {
        border-bottom: none;
      }

      // 手機版用戶資訊樣式
      &.user-info {
        .user-name {
          text-align: center;
          font-size: 16px;
          color: #007bff;
          font-weight: bold;
          padding: 10px 0;
        }
      }
    }

    nav ul li a {
      display: block;
      text-align: center;
      font-size: 24px;
      font-weight: normal;
      transition: 0.5s ease-in-out;
      border-bottom: unset;

      &:hover {
        border-bottom: unset;
      }

      // 手機版登出按鈕
      &.logout-btn:hover {
        color: #dc3545 !important;
      }
    }

    nav ul li.icon {
      display: flex;
      gap: 20px;
      justify-content: center;

      a.home {
        max-width: 21px;
      }

      a {
        max-width: 12px;
        border-bottom: none;

        &:hover {
          border-bottom: none;
        }
      }
    }
  }

  header.open {
    height: 100vh;
    border-image: unset;
    z-index: 199;
    width: 100%;
  }

  header.open .container {
    padding-top: 100px;
  }

  header.open .logo {
    position: relative;
    display: block;
    max-width: 200px;
    margin: 0 auto 1.25rem auto;
    z-index: 100;
    display: none;
    animation: totop;

    animation-delay: 0s;
    animation-duration: 0.25s;
    top: unset;
    left: unset;
    transform: unset;
  }

  header.open nav {
    height: 100vh;
    z-index: 99;

    top: 0;

    width: 100%;
  }

  @keyframes totop {
    0% {
      transform: translateY(-150%);
      opacity: 0;
    }
    100% {
      transform: translateY(0%);
      opacity: 1;
    }
  }

  @keyframes toright {
    0% {
      transform: translateX(-150%);
      opacity: 0;
    }
    100% {
      transform: translateY(0%);
      opacity: 1;
    }
  }

  @keyframes toleft {
    0% {
      transform: translateX(150%);
      opacity: 0;
    }
    100% {
      transform: translateY(0%);
      opacity: 1;
    }
  }

  .menuBtn {
    display: flex;
    justify-content: center;
    align-items: center;
    opacity: 1;

    > span {
      display: block;
      position: absolute;
      width: 55%;
      height: 2px;
      background-color: #4e4e4e;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      transform-origin: center;
      transition: all ease 0.3s;
    }
  }

  .menuBtn > span:first-child {
    transform: translate(-50%, -5px);
  }
  .menuBtn > span:nth-child(2) {
    transform: translate(-50%, 5px);
  }

  .closeBtn {
    span:first-child {
      transform: translate(-50%, -50%) rotate(45deg);
      height: 1.5px;
    }

    span:nth-child(2) {
      transform: translate(-50%, -50%) rotate(-45deg);
      height: 1.5px;
    }

    span:nth-child(3) {
      opacity: 0;
    }
  }
}
</style>
