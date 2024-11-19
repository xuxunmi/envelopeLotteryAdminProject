<template>
    <el-scrollbar v-loading="loading" height="calc(100vh - 210px)">
        <el-tree
            :data="treeData"
            :props="defaultProps"
            :default-expanded-keys="defaultExpandedKeys"
            node-key="PartOid"
            check-strictly
            check-on-click-node
        >
            <template #default="{ node, data }">
                <part-icon :type="data.materialType" />
                <span v-text="getText(data)" />
            </template>
        </el-tree>
    </el-scrollbar>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue"
import PartIcon from "@/views/bomManage/productBom/components/partIcon.vue"
import { previewBOM } from "@/api/configureManage/applicationConfiguration"

//#region 参数和方法
defineOptions({
    name: "previewBomDialog"
})
const props = defineProps({
    visible: {
        type: Boolean,
        required: true
    },
    objectRow: {
        type: Object,
        default: () => ({})
    },
    optionList: {
        type: Array,
        default: []
    }
})
const emits = defineEmits(["update:visible", "confirmSuccess"])

const loading = ref(false)
//#endregion

//#region 系统菜单树
const defaultProps = {
    children: "children",
    label: "Name"
}
const defaultExpandedKeys = ref<string[]>([])
const treeData = ref<any[]>([])
// 获取列表
const getList = () => {
    const params = {
        oid: props.objectRow.partOid,
        choiceList: [] as any[]
    }
    props.optionList.forEach((ele: any) => {
        if (ele.checkChoiceOid) params.choiceList.push(ele.checkChoiceOid)
    })
    loading.value = true
    previewBOM(params)
        .then((data) => {
            console.log("previewBOM", data)
            treeData.value = [data.data] || []
            defaultExpandedKeys.value = [data.data.PartOid]
        })
        .finally(() => (loading.value = false))
}
getList()
const getText = (row: any) => {
    return row.materialType === "wt.part.WTPart|com.pdinfo.kbomCAR"
        ? [
              row.partCategory, // 零件类型
              row.Number, // 编码
              row.Name, // 名称
              row.materialSymbol, // 代号
              row.Version // 版本
          ].join(",")
        : row.isCropping
        ? [
              row.isCropping ? "是" : "否", // 是否裁剪
              row.partCategory, // 零件类型
              row.Number, // 编码
              row.Name, // 名称
              row.materialSymbol, // 代号
              row.Amount, // 数量
              row.Version // 版本
          ].join(",")
        : [
              row.partCategory, // 零件类型
              row.Number, // 编码
              row.Name, // 名称
              row.materialSymbol, // 代号
              row.Amount, // 数量
              row.Version // 版本
          ].join(",")
}
//#endregion
</script>

<style lang="scss" scoped></style>
