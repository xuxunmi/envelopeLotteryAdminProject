import { type RouteRecordRaw, createRouter, createWebHashHistory, createWebHistory } from "vue-router"
const Layout = () => import("@/layout/index.vue")

/** 常驻路由 */
export const constantRoutes: RouteRecordRaw[] = [
    {
        path: "/redirect",
        component: Layout,
        meta: {
            hidden: true
        },
        children: [
            {
                path: "/redirect/:path(.*)",
                component: () => import("@/views/redirect/index.vue")
            }
        ]
    },
    {
        path: "/403",
        component: () => import("@/views/error-page/403.vue"),
        meta: {
            hidden: true
        }
    },
    {
        path: "/404",
        component: Layout,
        children: [
            {
                path: "",
                component: () => import("@/views/error-page/404.vue"),
                meta: {
                    hidden: true
                },
                alias: "/:pathMatch(.*)*"
            }
        ],
        meta: {
            hidden: true
        }
    },
    {
        path: "/login",
        name: "login",
        component: () => import("@/views/login/index.vue"),
        meta: {
            hidden: true
        }
    }
]

/**
 * 动态路由
 */
export const asyncRoutes: RouteRecordRaw[] = [
    {
        path: "/",
        component: Layout,
        name: "home",
        redirect: "/dashboard",
        children: [
            {
                path: "dashboard",
                component: () => import("@/views/dashboard/index.vue"),
                name: "dashboard",
                meta: {
                    title: "首页",
                    elIcon: "DataLine",
                    affix: true
                }
            }
        ]
    },
    {
        path: "/traitManage",
        component: Layout,
        name: "traitManage",
        redirect: "/traitManage/enterpriseTraitLibrary",
        meta: {
            title: "特征管理",
            elIcon: "Files",
            alwaysShow: true,
            hidden: true
        },
        children: [
            {
                path: "enterpriseTraitLibrary",
                component: () => import("@/views/traitManage/enterpriseTraitLibrary/index.vue"),
                name: "enterpriseTraitLibrary",
                meta: {
                    title: "特征管理",
                    elIcon: "Files",
                    keepAlive: true
                }
            },
            {
                path: "vehicleModelTraitCollection",
                component: () => import("@/views/traitManage/vehicleModelTraitCollection/index.vue"),
                name: "vehicleModelTraitCollection",
                meta: {
                    title: "车型特征集",
                    elIcon: "Memo",
                    keepAlive: true
                }
            },
            {
                path: "traitDetail",
                component: () => import("@/views/traitManage/traitDetail/index.vue"),
                name: "traitDetail",
                meta: {
                    title: "特征详情",
                    hidden: true,
                    alwaysChecked: true
                }
            }
        ]
    },
    {
        path: "/product",
        component: Layout,
        name: "productMange",
        redirect: "/product/materiel",
        meta: {
            title: "物料",
            elIcon: "Files",
            alwaysShow: false
        },
        children: [
            {
                path: "materiel",
                component: () => import("@/views/productMange/materiel/index.vue"),
                name: "materiel",
                meta: {
                    title: "工作区",
                    elIcon: "OfficeBuilding",
                    keepAlive: true
                }
            },
            {
                path: "productDetail",
                component: () => import("@/views/bomManage/productDetail/index.vue"),
                name: "productDetail",
                meta: {
                    title: "物料详情",
                    hidden: true,
                    alwaysChecked: true
                }
            },
            {
                path: "bomDetail/:oid",
                component: () => import("@/views/bomManage/bomDetail/index.vue"),
                name: "bomDetail",
                meta: {
                    title: "bom详情",
                    keepAlive: true,
                    hidden: true,
                    alwaysChecked: true
                }
            },
            {
                path: "materielQuery/:type",
                component: () => import("@/views/productMange/materielQuery/index.vue"),
                name: "materielQuery",
                meta: {
                    title: "物料查询",
                    keepAlive: true,
                    hidden: true,
                    alwaysChecked: true
                }
            }
        ]
    },
    {
        path: "/product",
        component: Layout,
        name: "libraryMange",
        redirect: "/product/productLibrary",
        meta: {
            title: "库",
            elIcon: "Files",
            alwaysShow: false
        },
        children: [
            {
                path: "productLibrary",
                component: () => import("@/views/bomManage/productLibrary/index.vue"),
                name: "productLibrary",
                meta: {
                    title: "文档管理",
                    elIcon: "Folder",
                    keepAlive: true
                }
            }
        ]
    },
    {
        path: "/configuration",
        component: Layout,
        name: "configuration",
        redirect: "/configuration/enterpriseTraitLibrary",
        meta: {
            title: "配置管理",
            elIcon: "Document",
            alwaysShow: true
        },
        children: [
            {
                path: "enterpriseTraitLibrary",
                component: () => import("@/views/traitManage/enterpriseTraitLibrary/index.vue"),
                name: "enterpriseTraitLibrary",
                meta: {
                    title: "特征管理",
                    elIcon: "Files",
                    keepAlive: true
                }
            },
            {
                path: "productListConfigure",
                component: () => import("@/views/configureManage/productListConfigure/index.vue"),
                name: "productListConfigure",
                meta: {
                    title: "查看配置",
                    elIcon: "SetUp",
                    keepAlive: true
                }
            },
            {
                path: "productionConfigurationDetail/:oid/:number",
                component: () => import("@/views/configureManage/productConfigure/detailIndex.vue"),
                name: "productionConfigurationDetail",
                meta: {
                    title: "查看配置",
                    elIcon: "Memo",
                    keepAlive: true,
                    hidden: true,
                    alwaysChecked: true
                }
            },
            {
                path: "productListProduct",
                component: () => import("@/views/configureManage/productListProduct/index.vue"),
                name: "productListProduct",
                meta: {
                    title: "维护配置",
                    elIcon: "Memo",
                    keepAlive: true
                }
            },
            {
                path: "productionConfiguration/:oid/:number",
                component: () => import("@/views/configureManage/productConfigure/index.vue"),
                name: "productionConfiguration",
                meta: {
                    title: "维护配置",
                    elIcon: "Memo",
                    keepAlive: true,
                    hidden: true,
                    alwaysChecked: true
                }
            },
            // {
            //     path: "productListApplication",
            //     component: () => import("@/views/configureManage/productListApplication/index.vue"),
            //     name: "productListApplication",
            //     meta: {
            //         title: "应用配置",
            //         elIcon: "Setting",
            //         keepAlive: true
            //     }
            // },
            // {
            //     path: "applicationConfiguration/:oid/:number",
            //     component: () => import("@/views/configureManage/applicationConfiguration/index.vue"),
            //     name: "applicationConfiguration",
            //     meta: {
            //         title: "配置应用",
            //         elIcon: "Setting",
            //         keepAlive: true,
            //         hidden: true
            //     }
            // },
            // {
            //     path: "defineBasicTypes",
            //     component: () => import("@/views/configureManage/defineBasicTypes/index.vue"),
            //     name: "defineBasicTypes",
            //     meta: {
            //         title: "基本型",
            //         elIcon: "Coin",
            //         keepAlive: true
            //     }
            // },
            // {
            //     path: "productNameSimplifyRules",
            //     component: () => import("@/views/configureManage/productNameSimplifyRules/index.vue"),
            //     name: "productNameSimplifyRules",
            //     meta: {
            //         title: "品名简化规则",
            //         elIcon: "Filter",
            //         keepAlive: true
            //     }
            // },
            {
                path: "cropSettings",
                component: () => import("@/views/configureManage/cropSettings/index.vue"),
                name: "cropSettings",
                meta: {
                    title: "裁剪设置",
                    elIcon: "Scissor",
                    keepAlive: true
                }
            }
        ]
    },
    {
        path: "/bomManage",
        name: "bomManage",
        component: Layout,
        redirect: "/bomManage/productBom",
        meta: {
            title: "BOM管理",
            elIcon: "Tickets",
            alwaysShow: true,
            hidden: true
        },
        children: [
            {
                path: "productBom",
                component: () => import("@/views/bomManage/productBom/index.vue"),
                name: "productBom",
                meta: {
                    title: "产品BOM",
                    elIcon: "Tickets",
                    keepAlive: true
                }
            },
            {
                path: "forwardType",
                component: () => import("@/views/bomList/forwardType.vue"),
                name: "forwardType",
                meta: {
                    title: "BOM查询",
                    elIcon: "Connection",
                    keepAlive: true
                }
            },
            {
                path: "reverseType",
                component: () => import("@/views/bomList/reverseType.vue"),
                name: "reverseType",
                meta: {
                    title: "BOM逆查",
                    elIcon: "Connection",
                    keepAlive: true,
                    hidden: true
                }
            },
            {
                path: "bomCompare",
                component: () => import("@/views/bomCompare/index.vue"),
                name: "bomCompare",
                meta: {
                    title: "BOM比较",
                    elIcon: "Connection",
                    keepAlive: true,
                    hidden: true
                }
            },
            {
                path: "bomHighEdit/:oid",
                component: () => import("@/views/bomManage/bomHighEdit/index.vue"),
                name: "bomHighEdit",
                meta: {
                    title: "BOM高级编辑",
                    keepAlive: true,
                    hidden: true,
                    alwaysChecked: true
                }
            }
        ]
    },
    {
        path: "/orders",
        component: Layout,
        name: "orders",
        redirect: "/orders/standingStockOrder",
        meta: {
            title: "订单管理",
            elIcon: "DataAnalysis",
            alwaysShow: true
        },
        children: [
            {
                path: "routineApolegamyOrder",
                component: () => import("@/views/orderManage/routineApolegamyOrder/index.vue"),
                name: "routineApolegamyOrder",
                meta: {
                    title: "常规订单",
                    elIcon: "Memo",
                    keepAlive: true
                }
            },
            {
                path: "specialConfigOrder",
                component: () => import("@/views/orderManage/specialConfigOrder/index.vue"),
                name: "specialConfigOrder",
                meta: {
                    title: "特殊订单",
                    elIcon: "Memo",
                    keepAlive: true
                }
            },
            {
                path: "libraryStockOrder",
                component: () => import("@/views/orderManage/libraryStockOrder/index.vue"),
                name: "libraryStockOrder",
                meta: {
                    title: "在库订单",
                    elIcon: "Memo",
                    keepAlive: true
                }
            },
            {
                path: "prePlanningOrder",
                component: () => import("@/views/orderManage/prePlanningOrder/index.vue"),
                name: "prePlanningOrder",
                meta: {
                    title: "预计划",
                    elIcon: "Memo",
                    keepAlive: true
                }
            },
            {
                path: "generalProductLibrary",
                component: () => import("@/views/orderManage/generalProductLibrary/index.vue"),
                name: "generalProductLibrary",
                meta: {
                    title: "通用产品库",
                    elIcon: "Memo",
                    keepAlive: true
                }
            },
            {
                path: "standingStockOrder",
                component: () => import("@/views/orderManage/standingStockOrder/index.vue"),
                name: "standingStockOrder",
                meta: {
                    title: "常备库存",
                    elIcon: "Memo",
                    keepAlive: true
                }
            },
            {
                path: "instanceProcessCenter",
                component: () => import("@/views/processManage/instanceProcessCenter/index.vue"),
                name: "instanceProcessCenter",
                meta: {
                    title: "实例化中心",
                    elIcon: "Tickets",
                    keepAlive: true
                }
            }
        ]
    },
    {
        path: "/change",
        component: Layout,
        name: "change",
        redirect: "/change/initiateChangeNotice",
        meta: {
            title: "变更通知",
            elIcon: "SetUp",
            alwaysShow: true
        },
        children: [
            {
                path: "initiateChangeNotice",
                component: () => import("@/views/changeManage/initiateChangeNotice/index.vue"),
                name: "initiateChangeNotice",
                meta: {
                    title: "我发起的",
                    elIcon: "Memo",
                    keepAlive: true
                }
            },
            {
                path: "sentChangeNoticeToMe",
                component: () => import("@/views/changeManage/sentChangeNoticeToMe/index.vue"),
                name: "sentChangeNoticeToMe",
                meta: {
                    title: "发给我的",
                    elIcon: "Memo",
                    keepAlive: true
                }
            }
        ]
    },
    {
        path: "/color",
        component: Layout,
        name: "colorManage",
        redirect: "/color/colorProfile",
        meta: {
            title: "颜色管理",
            elIcon: "SetUp",
            alwaysShow: true
        },
        children: [
            {
                path: "colorProfile",
                component: () => import("@/views/colorManage/colorProfile/index.vue"),
                name: "colorProfile",
                meta: {
                    title: "颜色档案",
                    elIcon: "Memo",
                    keepAlive: true
                }
            },
            {
                path: "colorGroup",
                component: () => import("@/views/colorManage/colorGroup/index.vue"),
                name: "colorGroup",
                meta: {
                    title: "颜色分组",
                    elIcon: "Memo",
                    keepAlive: true
                }
            },
            {
                path: "colorComponentManage",
                component: () => import("@/views/colorManage/colorComponentManage/index.vue"),
                name: "colorComponentManage",
                meta: {
                    title: "颜色件管理",
                    elIcon: "Memo",
                    keepAlive: true
                }
            }
        ]
    },
    {
        path: "/report",
        component: Layout,
        name: "reportManage",
        redirect: "/report/orderStatistics",
        meta: {
            title: "报表管理",
            elIcon: "Document",
            alwaysShow: true
        },
        children: [
            {
                path: "orderStatistics",
                component: () => import("@/views/reportManage/orderStatistics/index.vue"),
                name: "orderStatistics",
                meta: {
                    title: "订单统计报表",
                    elIcon: "Tickets",
                    keepAlive: true
                }
            }
        ]
    },
    {
        path: "/process",
        component: Layout,
        name: "processManage",
        redirect: "/report/processDefine",
        meta: {
            title: "流程管理",
            elIcon: "Document",
            alwaysShow: true
        },
        children: [
            {
                path: "processDefine",
                component: () => import("@/views/processManage/processDefine/index.vue"),
                name: "processDefine",
                meta: {
                    title: "流程定义",
                    elIcon: "Tickets",
                    keepAlive: true
                }
            }
        ]
    },
    {
        path: "/system",
        component: Layout,
        name: "system",
        redirect: "/system/staff",
        meta: {
            title: "系统管理",
            elIcon: "Setting",
            alwaysShow: true
        },
        children: [
            {
                path: "staff",
                component: () => import("@/views/system/staffManage/index.vue"),
                name: "staffManage",
                meta: {
                    title: "用户管理",
                    elIcon: "Tickets",
                    keepAlive: true
                }
            },
            {
                path: "group",
                component: () => import("@/views/system/groupManage/index.vue"),
                name: "groupManage",
                meta: {
                    title: "部门管理",
                    elIcon: "Tickets",
                    keepAlive: true
                }
            },
            {
                path: "organization",
                component: () => import("@/views/system/organizationManage/index.vue"),
                name: "organizationManage",
                meta: {
                    title: "组织管理",
                    elIcon: "Tickets",
                    keepAlive: true
                }
            },
            {
                path: "role",
                component: () => import("@/views/system/roleManage/index.vue"),
                name: "roleManage",
                meta: {
                    title: "角色管理",
                    elIcon: "Tickets",
                    keepAlive: true
                }
            },
            {
                path: "dictionary",
                component: () => import("@/views/system/dataDictionary/index.vue"),
                name: "dataDictionary",
                meta: {
                    title: "数据字典",
                    elIcon: "Tickets",
                    keepAlive: true
                }
            },
            {
                path: "multiLevelDictionary",
                component: () => import("@/views/system/multiLevelDictionary/index.vue"),
                name: "multiLevelDictionary",
                meta: {
                    title: "多级字典",
                    elIcon: "Tickets",
                    keepAlive: true
                }
            },
            {
                path: "language",
                component: () => import("@/views/system/systemLanguage/index.vue"),
                name: "systemLanguage",
                meta: {
                    title: "系统语言",
                    elIcon: "Tickets",
                    keepAlive: true
                }
            },
            {
                path: "log",
                component: () => import("@/views/system/systemLog/index.vue"),
                name: "systemLog",
                meta: {
                    title: "操作日志",
                    elIcon: "Tickets",
                    keepAlive: true
                }
            }
        ]
    }
    // {
    //     path: "/flowManage",
    //     component: Layout,
    //     name: "flowManage",
    //     redirect: "/flowManage/flowDetail",
    //     meta: {
    //         title: "流程管理",
    //         elIcon: "Connection",
    //         hidden: true
    //     },
    //     children: [
    //         {
    //             path: "flowDetail",
    //             component: () => import("@/views/flowDetail/index.vue"),
    //             name: "flowDetail",
    //             meta: {
    //                 title: "流程详情",
    //                 elIcon: "Connection"
    //             }
    //         }
    //     ]
    // }
]

const router = createRouter({
    history:
        import.meta.env.VITE_ROUTER_HISTORY === "hash"
            ? createWebHashHistory(import.meta.env.VITE_PUBLIC_PATH)
            : createWebHistory(import.meta.env.VITE_PUBLIC_PATH),
    routes: constantRoutes
})

/** 重置路由 */
export function resetRouter() {
    // 注意：所有动态路由路由必须带有 Name 属性，否则可能会不能完全重置干净
    try {
        router.getRoutes().forEach((route) => {
            const { name, meta } = route
            if (name && meta.roles?.length) {
                router.hasRoute(name) && router.removeRoute(name)
            }
        })
    } catch (error) {
        // 强制刷新浏览器也行，只是交互体验不是很好
        window.location.reload()
    }
}

export default router
