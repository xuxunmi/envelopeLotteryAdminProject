<template>
    <div v-loading="loading">
        <!-- <el-card class="box-card"> -->
        <pt-collapse title="配置信息" hiddenClose>
            <el-scrollbar height="calc(100vh - 240px)">
              <el-descriptions class="px-2" :column="3" border>
                  <template v-for="item in descriptionsItemData" :key="item.label">
                      <el-descriptions-item :label="item.label + ':'">
                        {{ item.prop }}</el-descriptions-item>
                  </template>
              </el-descriptions>
            </el-scrollbar>
        </pt-collapse>
        <!-- </el-card> -->

        <div class="mt-6 text-center">
            <el-button size="small" type="primary" @click="emits('update:visible')">取消</el-button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue"
import PtCollapse from "@/components/ptCollapse/index.vue"
import { getSchemeByOid } from "@/api/orderManage/standingStockOrder/index"
import { useI18n } from "vue-i18n"

//#region 参数和方法
defineOptions({
    name: "checkConfigDialog"
})
const props = defineProps({
    visible: {
        type: Boolean,
        required: true
    },
    currentRowData: {
        type: Object,
        required: true
    }
})
const emits = defineEmits(["update:visible", "confirm-success"])

const { t } = useI18n()
const loading = ref(false)
//#endregion

const getData  = () => {
  const params = {
    oid: props.currentRowData.partOid,
    schemeOid: props.currentRowData.schemeOid
  }
  loading.value = true
  getSchemeByOid(params).then(data => {
    descriptionsItemData.value = data.data.choiceList.map((option: any) => {
      const choices: any[] = []
      Object.keys(option.selectedChoices).forEach((key: any) => {
        choices.push(option.selectedChoices[key].choiceName)
      })
      return {
        label: option.optionName,
        prop: choices.join(', ')
      }
    })
    console.log(descriptionsItemData.value);
  })
  .finally(() => loading.value = false)
}
getData()

//#region 描述列表
const descriptionsItemData = ref<any[]>([])
//#endregion
</script>

<style lang="scss" scoped></style>
