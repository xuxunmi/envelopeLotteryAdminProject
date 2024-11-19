const Layout = () => import("@/layout/index.vue")

const dashboard = {
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
}
export default dashboard
