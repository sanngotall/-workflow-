<script setup lang="ts">import { RouterLink, useRouter } from 'vue-router';
import { LayoutDashboard, FolderOpen, KeyRound, Terminal, Settings, ChevronRight, Plus } from 'lucide-vue-next';
import ProjectSelector from '@/components/ProjectSelector.vue';
const router = useRouter();
const navItems = [
 { name: '仪表盘', icon: LayoutDashboard, path: '/' },
 { name: '项目管理', icon: FolderOpen, path: '/projects' },
 { name: '凭证管理', icon: KeyRound, path: '/credentials' },
 { name: '监控控制台', icon: Terminal, path: '/console' },
 { name: '配置中心', icon: Settings, path: '/config' }
];
const isActive = (path: string) => {
 return router.currentRoute.value.path.startsWith(path);
};
</script>

<template>
  <aside class="w-64 bg-bg-sidebar border-r border-bg-hover flex flex-col h-full shrink-0">
    <div class="p-4 border-b border-bg-hover">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
          <span class="text-primary font-bold text-lg">D</span>
        </div>
        <div>
          <div class="font-semibold text-text-main">DDT</div>
          <div class="text-xs text-text-muted">端端通网关</div>
        </div>
      </div>
    </div>
    
    <div class="p-4 border-b border-bg-hover">
      <ProjectSelector />
    </div>
    
    <nav class="flex-1 p-4 space-y-1">
      <RouterLink
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200"
        :class="isActive(item.path) 
          ? 'bg-primary/20 text-primary' 
          : 'text-text-secondary hover:bg-bg-hover hover:text-text-main'"
      >
        <component :is="item.icon" class="w-5 h-5" />
        {{ item.name }}
        <ChevronRight v-if="isActive(item.path)" class="w-4 h-4 ml-auto" />
      </RouterLink>
    </nav>
    
    <div class="p-4 border-t border-bg-hover">
      <RouterLink
        to="/projects"
        class="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-all duration-200"
      >
        <Plus class="w-4 h-4" />
        新建项目
      </RouterLink>
    </div>
  </aside>
</template>
