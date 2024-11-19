/// <reference types="vitest" />

import { type ConfigEnv, type UserConfigExport, loadEnv } from "vite"
import path, { resolve } from "path"
import vue from "@vitejs/plugin-vue"
import vueJsx from "@vitejs/plugin-vue-jsx"
import { createSvgIconsPlugin } from "vite-plugin-svg-icons"
import svgLoader from "vite-svg-loader"
import UnoCSS from "unocss/vite"
import AutoImport from "unplugin-auto-import/vite"
import Components from "unplugin-vue-components/vite"
import { ElementPlusResolver } from "unplugin-vue-components/resolvers"
import vueSetupExtend from "vite-plugin-vue-setup-extend"

/** 配置项文档：https://cn.vitejs.dev/config */
export default (configEnv: ConfigEnv): UserConfigExport => {
    const viteEnv = loadEnv(configEnv.mode, process.cwd()) as ImportMetaEnv
    const { VITE_PUBLIC_PATH } = viteEnv
    return {
        /** 打包时根据实际情况修改 base */
        base: VITE_PUBLIC_PATH,
        resolve: {
            alias: {
                "@": resolve(__dirname, "./src")
            },
            extensions: [".js", ".ts", ".jsx", ".tsx", ".json", ".vue"]
        },
        server: {
            https: false,
            host: "0.0.0.0",
            port: 8080,
            open: true,
            strictPort: false,
            proxy: {
                "/api": {
                    target: "http://101.227.82.60:9097", // 测试环境接口
                    ws: true,
                    /** 是否允许跨域 */
                    changeOrigin: true,
                    secure: false, // 如果是https接口，需要配置这个参数
                    rewrite: (path) => path.replace("/api", "")
                },
                // pdm接口
                "/kbom": {
                    // target: "http://192.168.10.128/Windchill", // 后端本地接口
                    // target: "http://192.168.10.7:8096/kbom", // uat环境接口
                    // target: "http://192.168.10.30:8096/kbom", // 公司测试环境接口
                    target: "http://192.168.50.80:8096/kbom", // 客户测试环境接口
                    ws: true,
                    /** 是否允许跨域 */
                    changeOrigin: true,
                    secure: false, // 如果是https接口，需要配置这个参数
                    rewrite: (path) => path.replace("/kbom", "")
                }
            }
        },
        build: {
            /** 消除打包大小超过 500kb 警告 */
            chunkSizeWarningLimit: 2000,
            /** Vite 2.6.x 以上需要配置 minify: "terser", terserOptions 才能生效 */
            minify: "terser",
            /** 在打包代码时移除 console.log、debugger 和 注释 */
            terserOptions: {
                compress: {
                    drop_console: false,
                    drop_debugger: true,
                    pure_funcs: ["console.log"]
                },
                format: {
                    /** 删除注释 */
                    comments: false
                }
            },
            /** 打包后静态资源目录 */
            assetsDir: "static"
        },
        plugins: [
            vue(),
            vueJsx(),
            /** 将 SVG 静态图转化为 Vue 组件 */
            svgLoader({ defaultImport: "url" }),
            /** SVG */
            createSvgIconsPlugin({
                iconDirs: [path.resolve(process.cwd(), "src/icons/svg")],
                symbolId: "icon-[dir]-[name]"
            }),
            UnoCSS(),
            AutoImport({
                imports: ["vue", "vue-router"],
                dts: "./types/auto-imports.d.ts",
                resolvers: [ElementPlusResolver()]
                // eslintrc: {
                //     enabled: true,
                //     filepath: "./types/.eslintrc-auto-import.json",
                //     globalsPropValue: true
                // }
            }),
            Components({
                resolvers: [ElementPlusResolver()]
            }),
            vueSetupExtend()
        ],
        test: {
            include: ["tests/**/*.test.ts"],
            environment: "jsdom"
        }
    }
}
