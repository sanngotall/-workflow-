import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '@/api'
import type { Project } from '@/types'

export const useProjectStore = defineStore('project', () => {
  const currentProjectId = ref<string | null>(null)
  const currentProject = ref<Project | null>(null)
  const projects = ref<Project[]>([])

  const setCurrentProject = (projectId: string) => {
    currentProjectId.value = projectId
    currentProject.value = projects.value.find(p => p.id === projectId) || null
    localStorage.setItem('currentProjectId', projectId)
  }

  const loadProjects = async () => {
    projects.value = await api.projects.getAll()
    const savedId = localStorage.getItem('currentProjectId')
    if (savedId && projects.value.some(p => p.id === savedId)) {
      setCurrentProject(savedId)
    } else if (projects.value.length > 0) {
      setCurrentProject(projects.value[0].id)
    }
  }

  const createProject = async (data: { name: string; description?: string }) => {
    const project = await api.projects.create(data)
    projects.value.unshift(project)
    if (!currentProjectId.value) {
      setCurrentProject(project.id)
    }
    return project
  }

  const updateProject = async (id: string, data: { name?: string; description?: string }) => {
    const project = await api.projects.update(id, data)
    const index = projects.value.findIndex(p => p.id === id)
    if (index !== -1) {
      projects.value[index] = project
      if (currentProjectId.value === id) {
        currentProject.value = project
      }
    }
    return project
  }

  const deleteProject = async (id: string) => {
    await api.projects.delete(id)
    projects.value = projects.value.filter(p => p.id !== id)
    if (currentProjectId.value === id) {
      if (projects.value.length > 0) {
        setCurrentProject(projects.value[0].id)
      } else {
        currentProjectId.value = null
        currentProject.value = null
        localStorage.removeItem('currentProjectId')
      }
    }
  }

  return {
    currentProjectId,
    currentProject,
    projects,
    setCurrentProject,
    loadProjects,
    createProject,
    updateProject,
    deleteProject
  }
})
