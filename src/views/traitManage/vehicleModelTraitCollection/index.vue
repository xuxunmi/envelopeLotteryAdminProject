<template>
  <div class="app-container">
      <div class="sf-container">
          <!-- <div class="sf-container-header">
            <div class="title">
              {{ t('vehicleModelTraitCollectionPage.title') }}
              <el-select
                v-model="selectObject.oid"
                size="small"
                style="width: 160px;"
                @change="handleSelectChange"
              >
                <el-option
                  v-for="item in options"
                  :key="item.oid"
                  :label="item.name"
                  :value="item.oid"
                />
              </el-select>
            </div>
          </div> -->
          <div class="sf-container-main">
            <drop-line left-width="200px">
              <template #left>
                <SetList
                  ref="SetListRef"
                  :topObject="selectObject"
                  @handleRowClick="handleRowClick_set"
                />
              </template>
              <template #right>
                <drop-line left-width="450px">
                  <template #left>
                    <Tree
                      ref="TreeRef"
                      :topObject="objectRow_set"
                      @handleRowClick="handleRowClick"
                    />
                  </template>
                  <template #right>
                    <ObjectDetail
                      id="ObjectDetail"
                      ref="ObjectDetailRef"
                      :objectRow="objectRow"
                      :topObject="objectRow_set"
                      onlyRead
                    />
                  </template>
                </drop-line>
              </template>
            </drop-line>
          </div>
      </div>
  </div>
</template>

<script setup lang="ts">
import { ref, getCurrentInstance } from "vue"
import DropLine from '@/components/dropLine/index.vue'
import SetList from "./components/setList.vue"
import Tree from "./components/tree.vue"
import ObjectDetail from "@/views/traitManage/enterpriseTraitLibrary/components/objectDetail.vue"
import { getProductList } from "@/api/traitManage/vehicleModelTraitCollection";
import { useI18n } from "vue-i18n"

//#region 参数和方法
defineOptions({
  name: "vehicleModelTraitCollection"
})
const instance: any = getCurrentInstance()
const { t, locale } = useI18n()
//#endregion

//#region 下拉 - 产品
const selectObject = reactive({
  oid: '',
  name: '',
  type: 'Product',
})
const options = ref<any[]>([])
const handleSelectChange = (oid: string) => {
  const find = options.value.find((ele: any) => ele.oid === oid)
  selectObject.name = find.name
  instance.refs.SetListRef.getList()
}
const getSelect = () => {
  getProductList({ type: selectObject.type }).then(data => {
    options.value = data.data
  })
}
// getSelect()
//#endregion

//#region 组件
const objectRow_set = ref()
const objectRow = ref()
// 点击特征集回调
const handleRowClick_set = (row: any) => {
  objectRow_set.value = row
  nextTick(() => instance.refs.TreeRef.getList())
}
const handleRowClick = (row: any) => {
  objectRow.value = row
  instance.refs.ObjectDetailRef.getDetail()
}
//#endregion

</script>

<style lang="scss" scoped>
:deep(#ObjectDetail) {
  .tab-wrapper {
    height: calc(var(--v3-container-height) - 50px);
  }
}
</style>
