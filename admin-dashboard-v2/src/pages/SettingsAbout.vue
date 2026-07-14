<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-gray-800">关于系统</h1>
      <p class="text-gray-500 mt-1">查看系统信息和版本详情</p>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
      <div class="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <Zap class="w-10 h-10 text-white" />
      </div>
      <h2 class="text-2xl font-bold text-gray-800">端端通</h2>
      <p class="text-gray-500 mt-1">可视化后端网关管理平台</p>
      <div class="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-primary-50 rounded-full">
        <span class="text-sm font-semibold text-primary-600">v1.0.0</span>
        <span class="text-xs text-primary-400">Community Edition</span>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">系统信息</h3>
        <div class="space-y-4">
          <div class="flex items-center justify-between py-2 border-b border-gray-50">
            <span class="text-sm text-gray-500">系统版本</span>
            <span class="text-sm font-medium text-gray-800">v1.0.0</span>
          </div>
          <div class="flex items-center justify-between py-2 border-b border-gray-50">
            <span class="text-sm text-gray-500">构建号</span>
            <span class="text-sm font-medium text-gray-800 font-mono">#2024011501</span>
          </div>
          <div class="flex items-center justify-between py-2 border-b border-gray-50">
            <span class="text-sm text-gray-500">发布日期</span>
            <span class="text-sm font-medium text-gray-800">2024-01-15</span>
          </div>
          <div class="flex items-center justify-between py-2 border-b border-gray-50">
            <span class="text-sm text-gray-500">运行环境</span>
            <span class="text-sm font-medium text-gray-800">Production</span>
          </div>
          <div class="flex items-center justify-between py-2">
            <span class="text-sm text-gray-500">运行时间</span>
            <span class="text-sm font-medium text-gray-800">15 天 8 小时</span>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">技术栈</h3>
        <div class="space-y-4">
          <div class="flex items-center justify-between py-2 border-b border-gray-50">
            <span class="text-sm text-gray-500">Node.js</span>
            <span class="text-sm font-medium text-gray-800">v20.10.0</span>
          </div>
          <div class="flex items-center justify-between py-2 border-b border-gray-50">
            <span class="text-sm text-gray-500">Fastify</span>
            <span class="text-sm font-medium text-gray-800">v4.25.0</span>
          </div>
          <div class="flex items-center justify-between py-2 border-b border-gray-50">
            <span class="text-sm text-gray-500">Vue.js</span>
            <span class="text-sm font-medium text-gray-800">v3.4.21</span>
          </div>
          <div class="flex items-center justify-between py-2 border-b border-gray-50">
            <span class="text-sm text-gray-500">PostgreSQL</span>
            <span class="text-sm font-medium text-gray-800">v16.1</span>
          </div>
          <div class="flex items-center justify-between py-2">
            <span class="text-sm text-gray-500">Redis</span>
            <span class="text-sm font-medium text-gray-800">v7.2.3</span>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 class="text-lg font-semibold text-gray-800 mb-4">许可证</h3>
      <div class="p-4 bg-gray-50 rounded-lg">
        <p class="text-sm text-gray-600 leading-relaxed">
          本软件采用 MIT 许可证发布。
        </p>
        <p class="text-sm text-gray-600 leading-relaxed mt-2">
          Permission is hereby granted, free of charge, to any person obtaining a copy
          of this software and associated documentation files (the "Software"), to deal
          in the Software without restriction, including without limitation the rights
          to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
          copies of the Software, and to permit persons to whom the Software is
          furnished to do so, subject to the following conditions:
        </p>
        <p class="text-sm text-gray-600 leading-relaxed mt-2">
          The above copyright notice and this permission notice shall be included in all
          copies or substantial portions of the Software.
        </p>
      </div>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 class="text-lg font-semibold text-gray-800 mb-4">联系我们</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="p-4 border border-gray-200 rounded-lg text-center">
          <Globe class="w-8 h-8 text-primary-500 mx-auto mb-2" />
          <p class="text-sm font-medium text-gray-800">官方网站</p>
          <p class="text-xs text-gray-500 mt-1">duanduantong.com</p>
        </div>
        <div class="p-4 border border-gray-200 rounded-lg text-center">
          <Mail class="w-8 h-8 text-primary-500 mx-auto mb-2" />
          <p class="text-sm font-medium text-gray-800">技术支持</p>
          <p class="text-xs text-gray-500 mt-1">support@duanduantong.com</p>
        </div>
        <div class="p-4 border border-gray-200 rounded-lg text-center">
          <Github class="w-8 h-8 text-primary-500 mx-auto mb-2" />
          <p class="text-sm font-medium text-gray-800">开源地址</p>
          <p class="text-xs text-gray-500 mt-1">github.com/duanduantong</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Zap, Globe, Mail, Github } from 'lucide-vue-next'
</script>
