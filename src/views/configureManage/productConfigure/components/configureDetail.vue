<template>
    <div class="sf-container-main-content">
        <!-- 包裹一个相对定位的div -->
        <div class="tabs-container">
            <el-tabs ref="tabsRef" v-model="activeName" type="card" @tab-click="handleTabClick">
                <template v-if="type !== 'productionConfigurationDetail'">
                    <el-tab-pane
                      label="配置特征"
                      name="variable"
                      data-name="variable"
                    >
                        <div class="tab-wrapper">
                            <VariableTab v-if="tabShow.variable" ref="VariableTabRef" :objectRow="objectRow" />
                        </div>
                    </el-tab-pane>
                    <el-tab-pane
                        v-if="objectRow.materialType === 'wt.part.WTPart|com.pdinfo.kbomMODULE'"
                        label="配置待选项"
                        name="select"
                        data-name="select"
                    >
                        <div class="tab-wrapper">
                            <SelectTab v-if="tabShow.select" ref="SelectTabRef" :objectRow="objectRow" />
                        </div>
                    </el-tab-pane>
                </template>
                <el-tab-pane
                  v-if="objectRow.parentOid"
                  label="配置条件"
                  name="condition"
                  data-name="condition"
                >
                    <div class="tab-wrapper">
                        <ConditionTab
                            v-if="tabShow.condition"
                            ref="ConditionTabRef"
                            :onlyRead="type === 'productionConfigurationDetail'"
                            :objectRow="objectRow"
                        />
                    </div>
                </el-tab-pane>
                <el-tab-pane
                    v-if="(objectRow.isTop || objectRow.isSecond) && type !== 'productionConfigurationDetail'"
                    label="品名规则设置"
                    name="productName"
                    data-name="productName"
                >
                    <div class="tab-wrapper">
                        <ProductNameRule v-if="tabShow.productName" ref="ProductNameRuleRef" :objectRow="objectRow" />
                    </div>
                </el-tab-pane>
                <!-- <el-tab-pane
        v-if="objectRow.isTop&&type!=='productionConfigurationDetail'"
        label="颜色设置"
        name="color"
      >
        <div class="tab-wrapper">
          <ColorList
            v-if="tabShow.color"
            ref="ColorListRef"
            :objectRow="objectRow"
          />
        </div>
      </el-tab-pane> -->
            </el-tabs>
            <!-- 手动定位按钮 -->
            <div class="edit-btn">
              <el-button type="primary" size="small" @click="goOptionalPreview">
                  选配预览
              </el-button>
              <el-button type="primary" size="small" @click="handleRemoveClick">
                  同步特征约束
              </el-button>
            </div>
            <!-- <div v-loading="loading_rule" class="list">
    </div> -->
        </div>

        <!-- 选配预览 - 弹窗 -->
        <OptionalPreviewDialog
            v-if="optionalPreviewDialog.visible"
            :dialog="optionalPreviewDialog"
            @handleEditSuccess="handleEditSuccess_optional"
        />
    </div>
</template>

<script setup lang="ts">
import { ref, getCurrentInstance } from "vue"
import type { TabsPaneContext } from "element-plus"
import VariableTab from "./variableTab.vue"
import ConditionTab from "./conditionTab.vue"
import ColorList from "./colorList.vue"
import ProductNameRule from "./productNameRule.vue"
import SelectTab from "./selectTab.vue"
import OptionalPreviewDialog from "./optionalPreviewDialog.vue"
import { useI18n } from "vue-i18n"
import { sync_occ_crm_option, sync_occ_crm_rule } from "@/api/configureManage/productConfigure"

//#region 参数和方法
const props = defineProps({
    /**
     * 顶层系列
     */
    topObject: {
        type: Object,
        default: () => ({
            PartOid: "",
            Number: ""
        })
    },
    objectRow: {
        type: Object,
        default: {}
    },
    type: {
        type: String,
        default: ""
    }
})
const emits = defineEmits(["getLayerBomList"])
const instance: any = getCurrentInstance()
const { t, locale } = useI18n()
//#endregion

//#region 标签页
const activeName = ref("")
// 标签对应组件显示隐藏
const tabShow = reactive({
    variable: false, // 特征
    select: false, // 配置待选项
    condition: false, // 条件
    color: false, // 颜色设置
    productName: false // 品名规则设置
})
const handleTabClick = (pane: TabsPaneContext) => {
    const name = pane.paneName as any
    ;(tabShow as any)[name] = true
}
// 获取详情
const getDetail = () => {
    console.log("getDetail", props.objectRow)
    // instance.refs.VariableTabRef.getDetail()
    Object.keys(tabShow).forEach((key) => ((tabShow as any)[key] = false))
    setTimeout(() => {
        const tabListDom =  instance.refs.tabsRef.$el.querySelectorAll('.el-tabs__item') as HTMLDivElement[]
        let names: string[] = []
        tabListDom?.forEach(ele => names.push(ele.id.replace('tab-', '')));
        if (!names.includes(activeName.value)) activeName.value = names[0]
        ;(tabShow as any)[activeName.value] = true
    }, 1)
}

const handleRemoveClick = () => {
    console.log("同步按钮点击")
    fetchData()
}

// 定义子组件的 ref
const VariableTabRef = ref<{
    getAllData: () => Promise<{ optionData: any; ruleData: any }>
} | null>(null)

const loading_rule = ref(false)

// 调用 fetchData 方法
const fetchData = async () => {
    if (VariableTabRef.value) {
        interface MyResponse {
            resultCode: number
            data: object
            message: any
        }

        try {
            const { optionData, ruleData } = await VariableTabRef.value.getAllData()
            console.log("特征数据:", optionData)
            console.log("约束数据:", ruleData)

            loading_rule.value = true
            const optionJsonData = JSON.stringify(optionData)
            const ruleJsonData = JSON.stringify(ruleData)
            // 添加序号字段（configurationSeq）
            optionData?.data?.forEach((ele: any, i: number) => ele.configurationSeq = i + 1);
            sync_occ_crm_option({ ...optionData })
                .then((response) => {
                    const data = response as unknown as MyResponse
                    if (data.resultCode === 200) {
                        ElMessage.success("同步特征成功！")
                    } else {
                        ElMessage.error(data.message)
                    }
                })
                .catch((e) => {
                    ElMessage.error("同步特征失败: " + e)
                })

            sync_occ_crm_rule({ ...ruleData })
                .then((response) => {
                    const data = response as unknown as MyResponse
                    if (data.resultCode === 200) {
                        ElMessage.success("同步约束成功！")
                    } else {
                        ElMessage.error(data.message)
                    }
                })
                .catch((e) => {
                    ElMessage.error("同步约束失败: " + e)
                })
        } catch (error: any) {
            console.error("Error fetching data:", error)
        } finally {
            loading_rule.value = false
        }
    } else {
        console.error("VariableTabRef is null")
    }
}

//#endregion

//#region 选择系列 - 弹窗
const optionalPreviewDialog = reactive<any>({
    visible: false,
    title: "选配预览",
    row: null
})
const goOptionalPreview = () => {
    Object.assign(optionalPreviewDialog, {
      visible: true,
      row: props.topObject
    })
}
// 选择系列回调
const handleEditSuccess_optional = (row: any) => {
    console.log("handleEditSuccess_optional", row)
    Object.assign(optionalPreviewDialog, {
      visible: false,
      row: null
    })

}
//#endregion

defineExpose({
    getDetail,
    handleRemoveClick
})
</script>

<style lang="scss" scoped>
.tab-wrapper {
    position: relative;
    top: -1px;
    height: calc(var(--v3-container-height) - 49px);
}

.tabs-container {
    position: relative;
}

.edit-btn {
    position: absolute;
    right: 0;
    top: 0;
    z-index: 10;
    margin-top: 5px;
}

.list {
    flex: 1;
    height: 0;
}
</style>
