<template>
    <el-dialog v-model="dialog.visible" :title="dialog.title" width="90%" draggable overflow align-center>
        <div class="insertPlanningDialog">
            <PlanList ref="PlanListRef" type="chooseRows" :from="from" />
        </div>
        <template #footer>
            <el-button type="primary" @click="submit" size="small">确定</el-button>
            <el-button type="primary" @click="dialog.visible = false" size="small">{{ t("dashboardPage.cancel") }}</el-button>
        </template>
    </el-dialog>
</template>

<script lang="ts" setup>
import { ref, reactive, getCurrentInstance } from "vue"
import { ElMessage } from "element-plus"
import PlanList from "./planList.vue"
import { useI18n } from "vue-i18n"

//#region 参数和方法
const props = defineProps({
    dialog: {
        type: Object,
        default: () => ({
            visible: false,
            title: "",
            row: {}
        })
    },
    /**
     * 页面（general：通用产品库；order：预计划选配）
     */
    from: {
        type: String,
        default: "order"
    }
})
const emits = defineEmits(["handleEditSuccess"])
const instance: any = getCurrentInstance()
const { t, locale } = useI18n()
//#endregion

// 保存
const submit = () => {
    console.log("submit", instance)
    const rows = instance.refs.PlanListRef.multipleSelection
    if (!rows.length) {
        ElMessage.error("请选择一条数据！")
        return false
    }
    emits("handleEditSuccess", rows)
}
</script>
<style lang="scss" scoped>
.insertPlanningDialog {
    height: calc(100vh - 160px);
}
</style>
