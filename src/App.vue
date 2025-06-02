<script setup>
import { RouterLink, RouterView } from 'vue-router'
import Header from './components/Header.vue'
</script>

<template>
  <Header></Header>

  <div>
    <RouterView />
  </div>
</template>

<style scoped></style>
