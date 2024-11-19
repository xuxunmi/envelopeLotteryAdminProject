<template>
    <div class="app-container">
        <div class="sf-container">
            <div class="sf-container-main">
                <drop-line left-width="450px">
                    <template #left>
                        <div class="sf-container-main-content">
                            <!-- <div class="sf-search-wrapper">
                                <el-form :model="formData" size="small">
                                  <el-form-item label="组织名称">
                                    <el-select v-model="formData.group" @change="handleSelectChange_group">
                                        <el-option
                                          v-for="item in options_group"
                                          :key="item.oid"
                                          :label="item.name"
                                          :value="item.name"
                                        />
                                    </el-select>
                                </el-form-item>
                                <el-form-item label="系列名称">
                                    <el-select v-model="formData.series" @change="handleSelectChange_series">
                                        <el-option
                                          v-for="item in options_series"
                                          :key="item.PartOid"
                                          :label="item.Name"
                                          :value="item.PartOid"
                                        />
                                    </el-select>
                                </el-form-item>
                                </el-form>
                            </div> -->
                            <div class="sf-table-wrapper">
                                <PBom
                                    ref="PBomRef"
                                    class="p_bom"
                                    :topObject="seriesObject"
                                    @handleRowClick="handleRowClick_PBom"
                                />
                            </div>
                        </div>
                    </template>
                    <template #right>
                        <applicationDetail ref="ConfigureDetailRef" :objectRow="objectRow" />
                    </template>
                </drop-line>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, getCurrentInstance } from "vue"
import { useRoute } from "vue-router"
import DropLine from "@/components/dropLine/index.vue"
import PBom from "@/views/bomManage/productBom/components/pBom.vue"
import applicationDetail from "./components/applicationDetail.vue"
import { productList } from "@/api/productLibrary"
import { getProductTopBom } from "@/api/bomManage/productBom/index"

//#region 参数和方法
defineOptions({
    name: "applicationConfiguration"
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
  nextTick(() => instance.refs.PBomRef.getList())
})
//#endregion

//#region 表单
const formData = reactive({
  group: "",
  series: ""
})

//#region 组织名称 - 下拉列表
const options_group = ref<any[]>([])
const handleSelectChange_group = (val: string) => {
  console.log('handleSelectChange_group', val);
  formData.series = ''
  options_series.value = []
  getProductTopBom({ ProductName: val }).then((data) => {
      console.log(data)
      options_series.value = data.data || []
  })
}
//#endregion

//#region 系列名称 - 下拉列表
const options_series = ref<any[]>([])
const seriesObject = ref({})
const handleSelectChange_series = (val: string) => {
  console.log('handleSelectChange_series', val);
  seriesObject.value = options_series.value.find(item => item.PartOid === val)
  instance.refs.PBomRef.getList(seriesObject.value)
}
//#endregion

const getSelect = () => {
  productList().then((data) => {
    console.log(data)
    options_group.value = data.data || []
  })
}
// getSelect()
//#endregion

//#region PBom
const objectRow = ref()
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
