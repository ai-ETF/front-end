import { defineStore } from 'pinia'

interface SidebarState {
  collapsed: boolean
}

export const useSidebarStore = defineStore('sidebar', {
  state: (): SidebarState => ({
    collapsed: false
  }),
  
  actions: {
    toggleCollapsed() {
      this.collapsed = !this.collapsed
    },
    
    setCollapsed(value: boolean) {
      this.collapsed = value
    }
  },
  
  persist: {
    key: 'sidebar-settings',
    storage: localStorage
  }
})