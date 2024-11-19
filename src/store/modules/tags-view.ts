import { ref } from "vue"
import { defineStore } from "pinia"
import { type RouteLocationNormalized, useRoute } from "vue-router"

export type TagView = Partial<RouteLocationNormalized>

export const useTagsViewStore = defineStore(
    "tags-view",
    () => {
        const visitedViews = ref<TagView[]>([])
        const cachedViews = ref<string[]>([])

        //#region add
        const addVisitedView = (view: TagView) => {
            if (view.meta && view.query?.tagTitle) view.meta.title = (view.query?.tagTitle as any) // 自定义标签名称
            if (
                visitedViews.value.some((v, index) => {
                    if (v.path === view.path) {
                        if (v.fullPath !== view.fullPath) {
                            // 防止 query 参数丢失
                            visitedViews.value[index] = Object.assign({}, view)
                        }
                        return true
                    }
                })
            ) {
                return
            }
            visitedViews.value.push(Object.assign({}, view))
        }
        const addCachedView = (view: TagView) => {
            if (view.meta && view.query?.tagTitle) view.meta.title = (view.query?.tagTitle as any) // 自定义标签名称
            if (typeof view.name !== "string") return
            if (cachedViews.value.includes(view.name)) return
            if (view.meta?.keepAlive) {
                cachedViews.value.push(view.name)
            }
        }
        //#endregion

        //#region del
        const delVisitedView = (view: TagView) => {
            for (const [i, v] of visitedViews.value.entries()) {
                if (v.path === view.path) {
                    visitedViews.value.splice(i, 1)
                    break
                }
            }
        }
        const delCachedView = (view: TagView) => {
            if (typeof view.name !== "string") return
            const index = cachedViews.value.indexOf(view.name)
            index > -1 && cachedViews.value.splice(index, 1)
        }
        //#endregion

        //#region delOthers
        const delOthersVisitedViews = (view: TagView) => {
            visitedViews.value = visitedViews.value.filter((v) => {
                return v.meta?.affix || v.path === view.path
            })
        }
        const delOthersCachedViews = (view: TagView) => {
            if (typeof view.name !== "string") return
            const index = cachedViews.value.indexOf(view.name)
            if (index > -1) {
                cachedViews.value = cachedViews.value.slice(index, index + 1)
            } else {
                // 如果 index = -1, 没有缓存的 tags
                cachedViews.value = []
            }
        }
        //#endregion

        //#region delAll
        const delAllVisitedViews = () => {
            // keep affix tags
            const affixTags = visitedViews.value.filter((tag) => tag.meta?.affix)
            visitedViews.value = affixTags
        }
        const delAllCachedViews = () => {
            cachedViews.value = []
        }
        //#endregion

        //#region sortable
        const changeViewsOrder = (oldIndex: number, newIndex: number) => {
          const oldAffix = visitedViews.value[oldIndex]?.meta?.affix
          const newAffix = visitedViews.value[newIndex]?.meta?.affix
          if (!oldAffix && !newAffix) {
            const currentRow = visitedViews.value.splice(oldIndex, 1)[0]
            visitedViews.value.splice(newIndex, 0, currentRow)
          }
        }
        //#endregion

        return {
            visitedViews,
            cachedViews,
            addVisitedView,
            addCachedView,
            delVisitedView,
            delCachedView,
            delOthersVisitedViews,
            delOthersCachedViews,
            delAllVisitedViews,
            delAllCachedViews,
            changeViewsOrder,
        }
    },
    { persist: true }
)
