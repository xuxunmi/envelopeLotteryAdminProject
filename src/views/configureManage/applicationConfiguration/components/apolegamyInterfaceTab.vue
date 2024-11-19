<template>
    <div v-fullScreen="fullScreen" ref="apolegamyPlanWrapperRef" class="apolegamy-plan-wrapper">
        <div class="mt-2 flex justify-between">
            <div>
                <el-button type="primary" size="small" icon="View" @click="handlePreviewBtn">预览</el-button>
                <el-button type="primary" size="small" @click="handleApolegamyPlanBtn">选配方案</el-button>
                <el-button type="primary" size="small" @click="handleInstantiationBtn">实例化</el-button>
            </div>
            <div>
                <!-- <el-button type="primary" size="small" icon="FullScreen" @click="handleFullScreenEditBtn">{{
                    isFullscreen ? "退出全屏" : "全屏编辑"
                }}</el-button> -->
                <el-button
                  type="primary"
                  icon="FullScreen"
                  size="small"
                  @click="changeFullScreen(!fullScreen)"
                >
                  <span v-if="fullScreen">退出全屏</span>
                  <span v-else>全屏编辑</span>
                </el-button>
            </div>
        </div>
        <el-scrollbar style="flex: 1">
            <div class="mt-2">选配方案</div>

            <el-form
                class="apolegamy-plan-form"
                ref="apolegamyPlanRef"
                :model="apolegamyPlanForm"
                :rules="rules"
                size="small"
                label-width="136px"
                label-position="left"
            >
                <template v-for="option in optionList" :key="option.oid">
                    <el-form-item :label="option.name">
                        <el-radio-group v-model="option.checkChoiceOid" @change="handleRadioChange">
                            <template v-for="choice in option.choice" :key="choice.oid">
                              <el-radio
                                v-if="choice.enable==='true'"
                                :label="choice.oid"
                              >{{ choice.name }}</el-radio>
                          </template>
                        </el-radio-group>
                    </el-form-item>
                </template>
            </el-form>
        </el-scrollbar>
    </div>

    <!-- 预览BOM弹窗 -->
    <dialogFrame :title="dialogTitle" v-model:visible="dialogVisible.previewBom" :footer="false" width="50%">
        <previewBomDialog
            v-if="dialogVisible.previewBom"
            v-model:visible="dialogVisible.previewBom"
            :objectRow="objectRow"
            :optionList="optionList"
            @confirm-success="handleConfirmSuccess"
        />
    </dialogFrame>

    <!-- 新建配置方案弹窗 -->
    <dialogFrame :title="dialogTitle" v-model:visible="dialogVisible.createConfigPlan" :footer="false" width="50%">
        <createConfigPlanDialog
            v-if="dialogVisible.createConfigPlan"
            v-model:visible="dialogVisible.createConfigPlan"
            :objectRow="objectRow"
            :optionList="optionList"
            @confirm-success="handleConfirmSuccess"
        />
    </dialogFrame>

    <!-- 新建零部件弹窗 -->
    <dialogFrame :title="dialogTitle" v-model:visible="dialogVisible.part" :footer="false" width="90%">
        <creatPartDialog
            v-if="dialogVisible.part"
            v-model:visible="dialogVisible.part"
            :currentRowData="currentRowData"
            :dialogType="dialogType"
            :defaultPartType="defaultPartType"
            @confirm-success="handleConfirmSuccess_part"
        />
    </dialogFrame>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue"
import type { FormInstance, FormRules } from "element-plus"
// import { SelectInterface } from "@/interface/common"
import dialogFrame from "@/components/dialogFrame/index.vue"
import previewBomDialog from "./previewBomDialog.vue"
import createConfigPlanDialog from "./createConfigPlanDialog.vue"
import creatPartDialog from "@/views/bomManage/components/creatPartDialog/index.vue"
import { useFullscreen } from "@vueuse/core"
import { getOptionListOfPartApply } from '@/api/configureManage/applicationConfiguration'

defineOptions({
    name: "apolegamyInterfaceTab"
})

const props = defineProps({
    objectRow: {
        type: Object,
        default: () => ({})
    }
})

// #region 弹窗
const dialogTitle = ref<string>("") // 弹窗标题
const dialogType = ref<string>("") // 弹窗类型
const defaultPartType = ref<string>("整机配置") // 页面类型
// 显示不同的弹窗
const dialogVisible: { [key: string]: boolean } = reactive({
    previewBom: false, // 预览BOM对话框
    createConfigPlan: false, // 新建配置方案对话框
    part: false // 新建零部件对话框
})
const currentRowData = ref<any>({
    oid: ""
}) // 当前行数据
//#endregion

// #region 关闭弹窗
const handleConfirmSuccess = (dialogType: string) => {
    dialogVisible[dialogType] = false
    // if (dialogType.value === "edit") {
    //     // 如果是编辑弹窗，则更新父节点数据
    //     emitter.emit("localRefreshProductParentNodeOId", parentRowData.value.oid)
    //     getProductFolderContentList(parentRowData.value.oid)
    // } else {
    //     emitter.emit("localRefreshProductParentNodeOId", oid)
    //     getProductFolderContentList(oid)
    // }

    // resetDialog()
}

// 关闭实例化弹窗
const handleConfirmSuccess_part = (oid: string) => {
    ElMessage({
        type: "success",
        message: "<div>实例化完成，执行附件拷贝！</div><div>实例化编码：10010189712-0001</div>",
        center: true,
        dangerouslyUseHTMLString: true
    })
    dialogVisible.part = false
}

//#endregion

//#region 预览、选配方案、实例化、查
// 处理预览按钮
const handlePreviewBtn = () => {
    dialogTitle.value = "预览BOM"
    const dialogType = "previewBom"
    dialogVisible[dialogType] = true
}

// 处理选配方案按钮
const handleApolegamyPlanBtn = () => {
    ElMessageBox.confirm(
        "<div>如果界面变量与已有部分方案变量数量不一致时是否忽略该变量(点击取消则可能产生新方案)？</div>",
        "确认选配变量",
        {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            confirmButtonClass: "confirmButton",
            cancelButtonClass: "cancelButton",
            type: "warning",
            center: true,
            dangerouslyUseHTMLString: true,
            buttonSize: "small"
        }
    )
        .then(() => {
            dialogTitle.value = "新建配置方案"
            const dialogType = "createConfigPlan"
            dialogVisible[dialogType] = true
        })
        .catch(() => {
            ElMessage({
                type: "info",
                message: "已取消操作"
            })
        })
}

// 处理实例化按钮
const handleInstantiationBtn = () => {
    ElMessageBox.confirm("<div>确定需要实例化吗？</div>", "确认实例化", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        confirmButtonClass: "confirmButton",
        cancelButtonClass: "cancelButton",
        type: "warning",
        center: true,
        dangerouslyUseHTMLString: true,
        buttonSize: "small"
    })
        .then(() => {
            dialogTitle.value = "新建零部件"
            dialogType.value = "add"
            dialogVisible.part = true
        })
        .catch(() => {
            ElMessage({
                type: "info",
                message: "已取消操作"
            })
        })
}

// 处理全屏编辑按钮
const isFullscreen = ref(false)
const apolegamyPlanWrapperRef = ref<HTMLElement | null>(null)
const { toggle } = useFullscreen(apolegamyPlanWrapperRef)

const handleFullScreenEditBtn = () => {
    console.log("处理全屏编辑按钮")
    isFullscreen.value = !isFullscreen.value
    toggle()
}

//#region 设置全屏
const fullScreen = ref(false)
const changeFullScreen = (type: boolean) => {
  fullScreen.value = type
}
//#endregion

//#endregion

//#region 表单
const apolegamyPlanRef = ref<FormInstance>()
const apolegamyPlanForm = reactive<any>({})
const rules = reactive<FormRules>({})
// 获取数据
const optionList = ref<any[]>([])
const rulesSessionId = ref('')
const getData = (actionName: 'init' | 'choiceselect', choiceOid?: string) => {
  const params = {
    oid: props.objectRow.oid,
    actionName
  }
  if (actionName === 'choiceselect') {
    Object.assign(params, {
      rulesSessionId: rulesSessionId.value,
      choiceOid,
      selected: true
    })
  }
  optionList.value = []
  getOptionListOfPartApply(params).then(data => {
    const list = data.data.choices || []
    list.forEach((option: any) => {
      option.checkChoiceOid = ''
      option.checkChoiceName = ''
      option.choice?.forEach((choice: any) => {
        if (choice.checked === 'true') {
          option.checkChoiceOid = choice.oid
          option.checkChoiceName = choice.name
        }
      })
    })
    optionList.value = list
    rulesSessionId.value = data.data.rulesSessionId || ''
  })
}
getData('init')
// 特征值选择回调
const handleRadioChange = (val: any) => {
  console.log('handleRadioChange', val);
  getData('choiceselect', val)
}
//#endregion
</script>

<style lang="scss" scoped>
$gap10: 10px;
$border-color: #bfcbd9;

.apolegamy-plan-wrapper {
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: 0 10px;
    background-color: #fff;
    .apolegamy-plan-form {
        margin-top: $gap10;
        border: 1px solid $border-color;
        border-bottom: none;
        :deep(.el-form-item) {
            margin-bottom: 0;
            border-bottom: 1px solid $border-color;
            .el-form-item__label {
                height: auto;
                padding-left: $gap10;
                font-weight: 600;
            }
            .el-form-item__content {
                padding: 0 $gap10;
                border-left: 1px solid $border-color;
            }
        }
    }
}
</style>
