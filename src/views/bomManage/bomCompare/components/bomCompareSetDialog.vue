<template>
    <el-dialog v-model="dialog.visible" :title="dialog.title" width="800px" draggable overflow align-center>
        <div v-loading="loading" class="compareSetDialog fromWrapper">
            <el-form ref="formRef" :model="formData" :rules="rules" label-width="100" size="small" inline>
                <el-form-item label="比较对象-1： ">
                    <div class="fromWrapper_text">
                        <el-button type="primary" icon="Search" style="width: 24px" @click="goChoose('1')" />
                        <el-checkbox
                            v-model="checkedBaseLine.line1"
                            label="基线比较"
                            @change="(val) => handleCheckboxChange(val, formData.material1)"
                            style="margin-left: 24px"
                        />
                    </div>
                </el-form-item>
                <el-form-item label="比较对象-2：">
                    <div class="fromWrapper_text">
                        <el-button type="primary" icon="Search" style="width: 24px" @click="goChoose('2')" />
                        <el-checkbox
                            v-model="checkedBaseLine.line2"
                            label="基线比较"
                            @change="(val) => handleCheckboxChange(val, formData.material1)"
                            style="margin-left: 24px"
                        />
                    </div>
                </el-form-item>
                <el-form-item label="编码：" prop="material1.number">
                    <div class="fromWrapper_text">{{ formData.material1.number }}</div>
                </el-form-item>
                <el-form-item label="编码：" prop="material2.number">
                    <div class="fromWrapper_text">{{ formData.material2.number }}</div>
                </el-form-item>
                <el-form-item label="基线编码：">
                    <div class="fromWrapper_text">{{ formData.material1.baseLineNumber }}</div>
                </el-form-item>
                <el-form-item label="基线编码：">
                    <div class="fromWrapper_text">{{ formData.material2.baseLineNumber }}</div>
                </el-form-item>
                <el-form-item label="版本：" prop="material1.version">
                    <el-select v-model="formData.material1.version" @change="(val) => handleSelectChange(val, '1')">
                        <el-option
                            v-for="item in options_version1"
                            :key="item.version"
                            :label="item.version"
                            :value="item.version"
                        />
                    </el-select>
                </el-form-item>
                <el-form-item label="版本：" prop="material2.version">
                    <el-select v-model="formData.material2.version" @change="(val) => handleSelectChange(val, '2')">
                        <el-option
                            v-for="item in options_version2"
                            :key="item.version"
                            :label="item.version"
                            :value="item.version"
                        />
                    </el-select>
                </el-form-item>
                <el-form-item label="版次：" prop="material1.iteration">
                    <el-select
                        v-model="formData.material1.iteration"
                        @change="(val) => handleSelectChange_iteration(val, '1')"
                    >
                        <el-option
                            v-for="item in options_iteration1"
                            :key="item.iteration"
                            :label="item.iteration"
                            :value="item.iteration"
                        />
                    </el-select>
                </el-form-item>
                <el-form-item label="版次：" prop="material2.iteration">
                    <el-select
                        v-model="formData.material2.iteration"
                        @change="(val) => handleSelectChange_iteration(val, '2')"
                    >
                        <el-option
                            v-for="item in options_iteration2"
                            :key="item.iteration"
                            :label="item.iteration"
                            :value="item.iteration"
                        />
                    </el-select>
                </el-form-item>
                <el-form-item label="类型：">
                    <div class="fromWrapper_text">{{ formData.material1.typeName }}</div>
                </el-form-item>
                <el-form-item label="类型：">
                    <div class="fromWrapper_text">{{ formData.material2.typeName }}</div>
                </el-form-item>
                <el-form-item label="有效性规则：" prop="material1.validityRule">
                    <el-select v-model="formData.material1.validityRule">
                        <el-option
                            v-for="item in options_rules"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value"
                        />
                    </el-select>
                </el-form-item>
                <el-form-item label="有效性规则：" prop="material2.validityRule">
                    <el-select v-model="formData.material2.validityRule">
                        <el-option
                            v-for="item in options_rules"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value"
                        />
                    </el-select>
                </el-form-item>
            </el-form>

            <!-- 选择物料弹窗 -->
            <dialogFrame
                :title="materialDialog.title"
                v-model:visible="materialDialog.visible"
                :footer="false"
                width="94%"
            >
                <MaterialDialog
                    v-if="materialDialog.visible"
                    v-model:visible="materialDialog.visible"
                    type="choose"
                    @confirm-success="handleConfirmSuccess_material"
                />
            </dialogFrame>
            <!-- 基线管理 - 弹窗 -->
            <BaselineManageDialog
                v-if="baselineManageDialog.visible"
                :dialog="baselineManageDialog"
                @handleEditSuccess="handleEditSuccess_baseline"
            />
            <!-- BOM比较结果 - 弹窗 -->
            <BomCompareResultDialog
                v-if="bomCompareResultDialog.visible"
                :dialog="bomCompareResultDialog"
                :materialName="materialName"
                @handleEditSuccess="handleEditSuccess_compareResult"
            />
        </div>
        <template #footer>
            <el-button :loading="loading" type="primary" @click="submit(formRef)" size="small">确定</el-button>
            <el-button type="primary" @click="dialog.visible = false" size="small">{{
                t("dashboardPage.cancel")
            }}</el-button>
        </template>
    </el-dialog>
</template>

<script lang="ts" setup>
import { ref, reactive } from "vue"
import type { FormInstance, FormRules } from "element-plus"
import dialogFrame from "@/components/dialogFrame/index.vue"
import MaterialDialog from "@/views/productMange/materiel/components/materialDialog.vue"
import BaselineManageDialog from "@/views/bomManage/productBom/components/baselineManageDialog.vue"
import BomCompareResultDialog from "@/views/bomManage/bomCompare/components/bomCompareResultDialog.vue"
import { MaterialInterface } from "@/interface/materiel"
import { getAllVerAndIter, getPartByNoAndVersionIteration } from "@/api/bomManage/bomCompare"
import { useI18n } from "vue-i18n"

//#region 参数和方法
defineOptions({
    name: "changeOwnerDialog"
})
const props = defineProps({
    dialog: {
        type: Object,
        default: {
            visible: false,
            title: "",
            material1: null,
            material2: null
        }
    }
})
const emits = defineEmits(["handleEditSuccess"])

const { t, locale } = useI18n()
const loading = ref(false)
// 物料标题
const materialName = reactive({
    material1: computed(
        () =>
            `${formData.material1.number}, ${formData.material1.name}, ${formData.material1.version}.${formData.material1.iteration}(${formData.material1.typeName})`
    ),
    material2: computed(
        () =>
            `${formData.material2.number}, ${formData.material2.name}, ${formData.material2.version}.${formData.material2.iteration}(${formData.material2.typeName})`
    )
})
//#endregion

//#region 表单
const formRef = ref<FormInstance>()
const formData = reactive({
    material1: {
        oid: "", // 物料oid
        name: "", // 名称
        number: "", // 编号
        version: "", // 版本
        iteration: "", // 版次
        typeName: "", // 类型名称
        baseLineNumber: "", // 基线编码
        validityRule: "0" // 有效性规则
    },
    material2: {
        oid: "",
        number: "",
        name: "",
        version: "",
        iteration: "",
        typeName: "",
        baseLineNumber: "",
        validityRule: "0"
    }
})
const rules = reactive<FormRules>({
    "material1.version": [{ required: true, message: "请选择版本！", trigger: "change" }],
    "material2.version": [{ required: true, message: "请选择版本！", trigger: "change" }],
    "material1.iteration": [{ required: true, message: "请选择版次！", trigger: "change" }],
    "material2.iteration": [{ required: true, message: "请选择版次！", trigger: "change" }],
    "material1.validityRule": [{ required: true, message: "请选择有效性规则！", trigger: "change" }],
    "material2.validityRule": [{ required: true, message: "请选择有效性规则！", trigger: "change" }]
})
// 确认
const submit = async (formEl: FormInstance | undefined) => {
    if (!formEl) return
    await formEl.validate((valid) => {
        if (valid) {
            goBomCompareResult()
        }
    })
}

// 基线比较
const checkedBaseLine = reactive({
    line1: false,
    line2: false
})
const handleCheckboxChange = (val: any, obj: any) => {
    // console.log('handleCheckboxChange', val, type);
    if (val) goBaselineManage(obj)
}
// 有效性规则
const options_rules = ref<any[]>([
    { value: "0", label: "最新版本" },
    { value: "1", label: "已完成" }
])

//#region 版本&版次
const options_version1 = ref<any[]>([]) // 物料1版本
const options_iteration1 = ref<any[]>([]) // 物料1版次

const options_version2 = ref<any[]>([]) // 物料2版本
const options_iteration2 = ref<any[]>([]) // 物料2版次
/**
 * 获取版本下拉
 * @param partOid // 物料oid
 * @param type // 0：获取物料1和物料2；1：获取物料1；2：获取物料2
 */
const getSelect_version = (partOid: string, type: "0" | "1" | "2") => {
    if (!partOid) {
        ElMessage.error("物料oid异常！")
        return false
    }
    loading.value = true
    getAllVerAndIter({ partOid })
        .then((data) => {
            switch (type) {
                case "0":
                    options_version1.value = data.data || []
                    options_version2.value = data.data || []
                    // 初始化版次列表
                    handleSelectChange(formData.material1.version, "1", true)
                    handleSelectChange(formData.material2.version, "2", true)
                case "1":
                    options_version1.value = data.data || []
                    // 初始化版次列表
                    handleSelectChange(formData.material1.version, "1", true)
                    break
                case "2":
                    options_version2.value = data.data || []
                    // 初始化版次列表
                    handleSelectChange(formData.material2.version, "2", true)
                    break
            }
        })
        .finally(() => (loading.value = false))
}
/**
 * 修改版本回调
 * @param val // 版本值
 * @param type // 1：修改物料1；2：修改物料2
 * @param isInit // 是否初始化
 */
const handleSelectChange = (val: any, type: "1" | "2", isInit?: boolean) => {
    // console.log('handleSelectChange', isInit);
    switch (type) {
        case "1":
            const version1 = options_version1.value.find((item) => item.version === val)
            options_iteration1.value = version1?.iterations || []
            if (isInit) {
                // 版次下拉如果没有对应版次，清空版次
                const find = options_iteration1.value.find((item) => item.iteration === formData.material1.iteration)
                if (!find) formData.material1.iteration = ""
            } else {
                formData.material1.iteration = ""
            }
            break
        case "2":
            const version2 = options_version2.value.find((item) => item.version === val)
            options_iteration2.value = version2?.iterations || []
            if (isInit) {
                // 版次下拉如果没有对应版次，清空版次
                const find = options_iteration2.value.find((item) => item.iteration === formData.material2.iteration)
                if (!find) formData.material2.iteration = ""
            } else {
                formData.material2.iteration = ""
            }
            break
    }
}
/**
 * 修改版次回调
 * @param val // 版次值
 * @param type // 1：修改物料1；2：修改物料2
 */
const handleSelectChange_iteration = (val: any, type: "1" | "2") => {
    switch (type) {
        case "1":
            formData.material1.oid = ""
            getPartOid(formData.material1).then((material: any) => {
                formData.material1.oid = material.oid
            })
            break
        case "2":
            formData.material2.oid = ""
            getPartOid(formData.material2).then((material: any) => {
                formData.material2.oid = material.oid
            })
            break
    }
}
// 根据编号、大版本、小版本查询物料
const getPartOid = (material: typeof formData.material1) => {
    return new Promise((resolve, reject) => {
        const params = {
            number: material.number, // 物料oid
            version: material.version, // 版本
            iteration: material.iteration // 版次
        }
        loading.value = true
        getPartByNoAndVersionIteration(params)
            .then((data) => {
                resolve(data.data[0])
            })
            .finally(() => (loading.value = false))
    })
}
//#endregion

// 获取数据
const getData = () => {
    console.log("getData", props.dialog)
    const { material1, material2 } = props.dialog
    if (material1.oid === material2.oid) {
        getSelect_version(material1.oid, "0")
    } else {
        getSelect_version(material1.oid, "1")
        getSelect_version(material2.oid, "2")
    }
    if (material1) Object.assign(formData.material1, { ...material1 })
    if (material2) Object.assign(formData.material2, { ...material2 })
}
getData()
//#endregion

//#region 选择物料 - 弹窗
const materialDialog = reactive<any>({
    visible: false,
    title: "选择物料",
    type: ""
})
// 选择物料（type - 1：获取物料1；2：获取物料2）
const goChoose = (type: "1" | "2") => {
    console.log("选择物料")
    Object.assign(materialDialog, {
        visible: true,
        type
    })
}
// 选择物料回调
const handleConfirmSuccess_material = (row: MaterialInterface) => {
    console.log("handleConfirmSuccess_material", row, materialDialog.type)
    if (!row) {
        ElMessage.error("请选择一个物料！")
        return false
    }
    const versionArr = row.version.split(".")
    const data = {
        oid: row.oid,
        number: row.code,
        name: row.name,
        typeName: row.type,
        version: versionArr[0],
        iteration: versionArr[1]
    }
    getSelect_version(row.oid, materialDialog.type)
    switch (materialDialog.type) {
        case "1":
            Object.assign(formData.material1, data)
            break
        case "2":
            Object.assign(formData.material2, data)
            break
    }

    Object.assign(materialDialog, {
        visible: false,
        type: ""
    })
}
//#endregion

//#region 选择基线 - 弹窗
const baselineManageDialog = reactive<any>({
    visible: false,
    title: "选择基线",
    row: null,
    type: "choose"
})
// 基线管理
const goBaselineManage = (obj: any) => {
    // console.log('goBaselineManage', props.topObject);
    Object.assign(baselineManageDialog, {
        visible: true,
        row: obj
    })
}
// 选择基线回调
const handleEditSuccess_baseline = (row: any) => {
    console.log("handleEditSuccess_baseline", row)
    if (!row) {
        ElMessage.error("请选择一条数据！")
        return false
    }
    Object.assign(baselineManageDialog, {
        visible: false,
        row: null
    })
}
//#endregion

//#region BOM比较结果 - 弹窗
const bomCompareResultDialog = reactive<any>({
    visible: false,
    title: "BOM比较结果",
    params: null
})
// BOM比较结果
const goBomCompareResult = () => {
    // console.log('goBaselineManage');
    // 格式化参数
    const params = {
        partNumber: formData.material1.number,
        comparePartNumber: formData.material2.number,
        partOid: formData.material1.oid,
        comparePartOid: formData.material2.oid,
        version: "0",
        type: "3",
        dimension: "0",
        displayMethod: "0"
    }
    if (params) {
        Object.assign(bomCompareResultDialog, {
            visible: true,
            params
        })
    }
}
// BOM比较结果回调
const handleEditSuccess_compareResult = () => {
    console.log("handleEditSuccess_compareResult")
    Object.assign(bomCompareResultDialog, {
        visible: false,
        params: null
    })
}
//#endregion
</script>
<style lang="scss" scoped>
.el-form--inline {
    .el-form-item {
        margin-right: 100px;
    }
}
.fromWrapper_text {
    display: flex;
    align-items: center;
}
</style>
