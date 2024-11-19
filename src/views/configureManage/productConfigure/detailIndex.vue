<template>
  <div class="app-container">
    <div class="sf-container">
        <div class="sf-container-main">
          <drop-line left-width="500px">
            <template #left>
              <div class="sf-container-main-content">
                <div class="sf-table-wrapper">
                  <PBom
                    ref="PBomRef"
                    class="p_bom"
                    onlyRead
                    from="productListConfigure"
                    :topObject="seriesObject"
                    @handleRowClick="handleRowClick_PBom"
                  />
                </div>
              </div>
            </template>
            <template #right>
              <ConfigureDetail
                v-if="objectRow"
                ref="ConfigureDetailRef"
                type="productionConfigurationDetail"
                :objectRow="objectRow"
              />
            </template>
          </drop-line>
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, getCurrentInstance, onMounted } from "vue"
import { useRoute } from "vue-router"
import DropLine from '@/components/dropLine/index.vue'
import PBom from "@/views/bomManage/productBom/components/pBom.vue"
import ConfigureDetail from "./components/configureDetail.vue"

//#region 参数和方法
defineOptions({
  name: "productionConfigurationDetail"
})
const route = useRoute()
const params: {
  oid: string // 物料id
  number: string // 物料编号
} = route.params as any
console.log("路由参数params：", params)
const instance: any = getCurrentInstance()

onMounted(() => {
  seriesObject.value = {
    PartOid: params.oid,
    Number: params.number
  }
  nextTick(() => instance.refs.PBomRef.getShowRuleDetails())
})
//#endregion

const seriesObject = ref({
  PartOid: '',
  Number: ''
})

//#region PBom
const objectRow = ref({})
const handleRowClick_PBom = (data: any) => {
  objectRow.value = {
    ...data.row,
    oid: data.row.PartOid,
  }
  nextTick(() => instance.refs.ConfigureDetailRef.getDetail())
}
//#endregion

</script>

<style lang="scss" scoped></style>
