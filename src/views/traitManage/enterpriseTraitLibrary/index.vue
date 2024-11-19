<template>
    <div class="app-container">
        <div class="sf-container">
            <div class="search-container">
              <el-form ref="searchFormRef" :inline="true" :model="searchForm" size="small" label-width="80">
                  <el-form-item label="组织名称">
                    <el-select
                      :loading="loading_list"
                      v-model="searchForm.oid"
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
                  </el-form-item>
                  <el-form-item label="特征名称">
                    <el-input v-model="searchForm.name" placeholder="请输入" clearable @keyup.enter="getList" />
                  </el-form-item>
                  <el-form-item label="特征编码">
                    <el-input v-model="searchForm.number" placeholder="请输入" clearable @keyup.enter="getList" />
                  </el-form-item>
                  <el-form-item>
                      <el-button type="primary" @click="getList">查询</el-button>
                      <el-button type="primary" @click="handleClearBtn">清空</el-button>
                  </el-form-item>
              </el-form>
            </div>
            <div class="sf-container-main">
              <drop-line left-width="450px">
                <template #left>
                  <Tree
                    ref="TreeRef"
                    :topObject="selectObject"
                    :searchForm="searchForm"
                    :productTypeList="productTypeList"
                    @handleRowClick="handleRowClick"
                  />
                </template>
                <template #right>
                  <ObjectDetail
                    ref="ObjectDetailRef"
                    :objectRow="objectRow"
                    :productTypeList="productTypeList"
                  />
                </template>
              </drop-line>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, getCurrentInstance } from "vue"
import DropLine from '@/components/dropLine/index.vue'
import Tree from "./components/tree.vue"
import ObjectDetail from "./components/objectDetail.vue"
import { productList } from "@/api/productLibrary"
import { SelectInterface } from "@/interface/common"
import { getDictionarySelect } from "@/api/system/dataDictionary"

//#region 参数和方法
defineOptions({
    name: "enterpriseTraitLibrary"
})
const instance: any = getCurrentInstance()
//#endregion

//#region 头部搜索
const searchForm = reactive({
  oid: '',  // 组织名称
  name: '',  // 特征名称
  number: '',  // 特征编码
})
const getList = () => {
  instance.refs.TreeRef.getList()
}
const handleClearBtn = () => {
  Object.assign(searchForm, {
    name: '',  // 特征名称
    number: '',  // 特征编码
  })
  getList()
}
//#endregion

//#region 下拉 - 特征库
const selectObject = reactive({
  oid: '',
  name: '',
  type: 'Product',
})
const options = ref<any[]>([
  // { oid: '叉车企业特征库', name: '叉车企业特征库' }
])
const handleSelectChange = (oid: string) => {
  const find = options.value.find((ele: any) => ele.oid === oid)
  selectObject.name = find.name || ''
  instance.refs.TreeRef.getList()
}
const loading_list = ref(false)
const getSelect = () => {
  loading_list.value = true
  productList().then(data => {
    options.value = data.data
    const oid = data.data[0].oid
    if (oid) {
      searchForm.oid = selectObject.oid = oid
      handleSelectChange(oid)
    }
  })
  .finally(() => loading_list.value = false)
}
getSelect()
//#endregion

//#region 下拉数据
const productTypeList = ref<SelectInterface[]>([])
const getSelectData = async () => {
    try {
        const { data } = (await getDictionarySelect({ codes: "PRODUCT_TYPE" })) as { data: any }
        productTypeList.value =
            data.PRODUCT_TYPE.map((item: any) => {
                return {
                    id: item.code,
                    name: item.codeListNameC
                }
            }) || []
    } catch (error: any) {
        console.log(error)
    }
}
getSelectData()
//#endregion

//#region 组件
const objectRow = ref()
const handleRowClick = (row: any) => {
  objectRow.value = row
  instance.refs.ObjectDetailRef.getDetail()
}
//#endregion

</script>

<style lang="scss" scoped>
.sf-container {
    .search-container {
        .el-form-item {
            margin-bottom: 10px;
        }
    }
}
</style>
