<template>
  <div class="h-screen flex flex-col bg-gray-50">
    <TopBar />
    <div class="flex-1 flex overflow-hidden">
      <SideNav />
      <main
        class="flex-1 overflow-y-auto p-6 transition-all duration-300"
        :class="appStore.sidebarCollapsed ? 'ml-16' : 'ml-60'"
      >
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>

    <!-- 全局向导抽屉 -->
    <TransitWizard v-if="appStore.wizardOpen" />
  </div>
</template>

<script setup lang="ts">
import TopBar from '@/components/TopBar.vue'
import SideNav from '@/components/SideNav.vue'
import TransitWizard from '@/components/TransitWizard.vue'
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
