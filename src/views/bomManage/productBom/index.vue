<template>
    <div class="app-container">
        <div class="sf-container">
            <div class="sf-container-main">
                <drop-line left-width="320px">
                    <template #left>
                        <PList
                            ref="PListRef"
                            class="p_list"
                            @handleProductClick="handleProductClick"
                        />
                    </template>
                    <template #right>
                        <div class="sf-container-main-content">
                            <div class="title">
                                {{ $t("productBomPage.title") }}
                                <span v-if="topObject.PartOid">（{{ topObject.PartOid }}）</span>
                            </div>
                            <div class="sf-search-wrapper">
                                <el-form :model="topObject" size="small">
                                    <el-form-item :label="$t('productBomPage.Number')">
                                        <el-input v-model="topObject.Number" disabled />
                                    </el-form-item>
                                </el-form>
                            </div>
                            <div class="sf-table-wrapper">
                                <!-- <drop-line left-width="50%" :minContainerWidth="[200, 100]">
                                    <template #left>
                                        <PBom
                                            ref="PBomRef"
                                            class="p_bom"
                                            :topObject="topObject"
                                            @getLayerBomList="getLayerBomList"
                                        />
                                    </template>
                                    <template #right>
                                        <PChild ref="PChildRef" class="p_child" @partRefresh="partRefresh" />
                                    </template>
                                </drop-line> -->
                                <PBom
                                    ref="PBomRef"
                                    class="p_bom"
                                    :topObject="topObject"
                                    @handleRowClick="handleRowClick_PBom"
                                    @checkTopObject="checkTopObject"
                                />
                            </div>
                        </div>
                    </template>
                </drop-line>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, getCurrentInstance } from "vue"
import PList from "./components/pList.vue"
import PBom from "./components/pBom.vue"
import PChild from "./components/pChild.vue"
import DropLine from "@/components/dropLine/index.vue"

//#region 参数和方法
defineOptions({
    name: "productBom"
})
const instance: any = getCurrentInstance()
//#endregion


// 刷新产品列表
const checkTopObject = (id: string) => {
  instance.refs.PListRef.getList(id)
}

//#region PList
const topObject = ref({
    PartOid: "",
    Number: ""
})
const handleProductClick = (row: any) => {
    topObject.value = row
    nextTick(() => instance.refs.PBomRef.getList())
    // instance.refs.PChildRef.tableData = []
}
//#endregion

const handleRowClick_PBom = (data: any) => {
    // instance.refs.PChildRef.getList(data)
}
// BOM局部刷新
const partRefresh = (row: any) => {
    instance.refs.PBomRef.partRefresh(row)
}
</script>

<style lang="scss" scoped>
.sf-container {
    .sf-container-main {
        .p_list {
            width: 100%;
        }
        .sf-container-main-content {
            .title {
                height: 31px;
                line-height: 31px;
                background: #409eff;
                color: #fff;
                font-weight: bold;
                padding-left: 12px;
            }
        }
        .sf-table-wrapper {
            .p_bom {
                padding-right: 5px;
            }
            .p_child {
                width: 100%;
                height: 100%;
                padding-left: 5px;
            }
        }
    }
}
</style>
