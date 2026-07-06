<script setup lang="ts">
import { useRoute } from "vue-router";
import { computed } from "vue";
import AppHeader from "./components/layout/AppHeader.vue";
import AppFooter from "./components/layout/AppFooter.vue";

const route = useRoute();
const isAdmin = computed(() => route.path.startsWith("/admin"));
</script>

<template>
  <div class="flex flex-col min-h-screen">
    <AppHeader v-if="!isAdmin" />
    <main class="flex-1">
      <router-view />
    </main>
    <AppFooter v-if="!isAdmin" />
  </div>
</template>
