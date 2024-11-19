import { recursionArray } from "@/utils/index"

/** 格式化组织树 */
export function formatData_orgTree(arr: any[]) {
  if (arr.length) {
    recursionArray(arr, (item: any) => {
        // 把id和parentId拼接成唯一id
        if (item.type === 1) {
            // 角色里的parentId是groupId
            item.key = (item.id || "") + "&" + (item.groupId || "")
        } else if (item.type === 2) {
            // 用户key需要三个id保证唯一性
            item.key = (item.id || "") + "&" + (item.groupId || "") + "&" + (item.parentId || "")
        } else {
            item.key = (item.id || "") + "&" + (item.parentId || "")
        }
    })
}
}
