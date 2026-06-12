/// <reference types="vite/client" />
import type { ECharts } from 'echarts'

declare module '@vue/runtime-core' {
    export interface ComponentCustomProperties {
        $echarts: typeof import('echarts')
        $switchTheme: (theme: string) => void
    }
}

declare global {
    interface Window {
        ResizeObserver: any
    }
}

export { }