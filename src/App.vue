<script setup>
import { RouterLink, RouterView } from 'vue-router'
import Header from './components/Header.vue'
</script>

<template>
  <Header></Header>

  <div class="project">
    <RouterView />
  </div>
</template>

<style scoped>
.project {
  background-color: #fff;
  padding-top: 150px;
  padding-bottom: 50px;
}
</style>
