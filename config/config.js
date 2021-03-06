import os from "os";
import pageRoutes from "./router.config";
import webpackPlugin from "./plugin.config";
import defaultSettings from "../src/defaultSettings";

const plugins = [
    [
        "umi-plugin-react",
        {
            antd: true,
            dva: {
                hmr: true
            },
            locale: {
                enable: true, // default false
                default: "zh-CN", // default zh-CN
                baseNavigator: true // default true, when it is true, will use `navigator.language` overwrite default
            },
            dynamicImport: {
                loadingComponent: "./components/pageLoading/index"
            },
            pwa: {
                workboxPluginMode: "InjectManifest",
                workboxOptions: {
                    importWorkboxFrom: "local"
                }
            },
            ...(!process.env.TEST && os.platform() === "darwin"
                ? {
                    dll: {
                        include: ["dva", "dva/router", "dva/saga", "dva/fetch"],
                        exclude: ["@babel/runtime"]
                    },
                    hardSource: false
                }
                : {})
        }
    ]
];

export default {
    // add for transfer to umi
    plugins,
    targets: {
        ie: 11
    },
    define: {
        APP_TYPE: process.env.APP_TYPE || "",
        "process.env.dev": {
            websocket:{
                host:'ws://127.0.0.1:9510'
            },
            // 开发环境下的api走proxy
        },
        "process.env.production": {
            websocket:{
                host:'wss://demo.fashop.cn'
            },
            api: {
                url: "https://demo.fashop.cn"
            }
        },

    },
    // 路由配置
    routes: pageRoutes,
    // Theme for antd
    // https://ant.design/docs/react/customize-theme-cn
    theme: {
        "primary-color": defaultSettings.primaryColor,
        "layout-header-background": "#000",
        "menu-bg": "#000",
        "menu-dark-bg": "#000",
        "menu-dark-submenu-bg": "#151515"
    },
    externals: {
        "@antv/data-set": "DataSet"
    },
    /**
     * 部署（build）模式下无效，仅供开发环境下
     */
    proxy: {
        "/admin": {
            target: "https://v2-api.fashop.cn",
            // target: "https://demo.fashop.cn",
            // target: "http://127.0.0.1:9510",
            // target: 'http://192.168.1.115:9510',
            changeOrigin: true,
            pathRewrite: { "^/admin": "/admin" },
            secure: false
        }
    },
    ignoreMomentLocale: true,
    lessLoaderOptions: {
        javascriptEnabled: true
    },
    disableRedirectHoist: true,
    cssLoaderOptions: {
        modules: true,
        getLocalIdent: (context, localIdentName, localName) => {
            if (
                context.resourcePath.includes("node_modules") ||
                context.resourcePath.includes("ant.design.pro.less") ||
                context.resourcePath.includes("global.less")
            ) {
                return localName;
            }
            const match = context.resourcePath.match(/src(.*)/);
            if (match && match[1]) {
                const antdProPath = match[1].replace(".less", "");
                const arr = antdProPath
                    .split("/")
                    .map(a => a.replace(/([A-Z])/g, "-$1"))
                    .map(a => a.toLowerCase());
                return `antd-pro${arr.join("-")}-${localName}`.replace(/--/g, "-");
            }
            return localName;
        }
    },
    manifest: {
        basePath: "/"
    },

    chainWebpack: webpackPlugin
};
