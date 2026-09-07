import { resolve } from 'path'
import { loadEnv } from 'vite'
import type { UserConfig, ConfigEnv } from 'vite'
import Vue from '@vitejs/plugin-vue'
import VueJsx from '@vitejs/plugin-vue-jsx'
import UnoCSS from 'unocss/vite'
import ElementPlus from 'unplugin-element-plus/vite'

const root = process.cwd()

function pathResolve(dir: string) {
  return resolve(root, '.', dir)
}

export default ({ mode }: ConfigEnv): UserConfig => {
  const env = loadEnv(mode, root)
  return {
    base: env.VITE_BASE_PATH,
    plugins: [Vue(), VueJsx(), ElementPlus(), UnoCSS()],

    resolve: {
      alias: [
        {
          find: /@\//,
          replacement: `${pathResolve('src')}/`
        }
      ]
    },
    build: {
      target: 'es2015',
      outDir: env.VITE_OUT_DIR || 'dist',
      sourcemap: env.VITE_SOURCEMAP === 'true',
      cssCodeSplit: !(env.VITE_USE_CSS_SPLIT === 'false'),
      cssTarget: ['chrome31'],
      rolldownOptions: {
        output: {
          codeSplitting: {
            groups: [
              {
                name: 'zrender',
                test: /node_modules[\\/]zrender[\\/]/
              }
            ]
          }
        }
      }
    },
    server: {
      port: 8001,
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:8000',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      },
      hmr: {
        overlay: false
      },
      host: '0.0.0.0'
    }
  }
}
