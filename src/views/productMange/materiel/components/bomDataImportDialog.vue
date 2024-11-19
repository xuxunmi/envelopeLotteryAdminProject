<template>
    <div v-loading="loading" :element-loading-text="elementLoadingText">
        <el-form
            ref="dataImportRef"
            :model="dataImport"
            :rules="rules"
            size="small"
            label-width="76px"
            label-position="right"
        >
            <el-form-item label="导入文件" prop="fileName">
                <el-input style="width: 180px" v-model="dataImport.fileName" disabled />
                <el-upload
                    class="ml-4"
                    action="#"
                    ref="uploadDataRef"
                    :on-exceed="handleExceed"
                    :limit="fileLimit"
                    :on-change="handleDataExcleChange"
                    :file-list="importForm.fileList"
                    :show-file-list="false"
                    :auto-upload="false"
                >
                    <el-button type="primary" size="small">上传Excel</el-button>
                </el-upload>
                <el-button class="ml-4" type="primary" size="small" @click="goDownload">下载模板</el-button>
            </el-form-item>
            <el-form-item>
                <div>提示：导入的文件后缀名为xls，xlsx，csv</div>
            </el-form-item>
            <el-form-item>
                <el-checkbox
                    class="checkbox-radio"
                    v-model="dataImport.objectImportValue"
                    label="对象导入"
                    :disabled="dataImport.relationImport"
                />
                <el-select
                    class="ml-6"
                    style="width: 180px"
                    v-model="dataImport.materialType"
                    clearable
                    filterable
                    :disabled="!dataImport.objectImportValue"
                >
                    <el-option v-for="item in materialTypeList" :key="item.id" :label="item.name" :value="item.id" />
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-checkbox
                    class="ml-23"
                    v-model="dataImport.updateDataValue"
                    label="更新已有数据"
                    :disabled="!dataImport.objectImportValue"
                />
            </el-form-item>
            <el-form-item>
                <el-checkbox
                    class="checkbox-radio"
                    v-model="dataImport.relationImport"
                    label="关系导入"
                    :disabled="dataImport.objectImportValue"
                />
                <el-select
                    class="ml-6"
                    style="width: 180px"
                    v-model="dataImport.relationImportValue"
                    clearable
                    filterable
                    :disabled="!dataImport.relationImport"
                >
                    <el-option v-for="item in relationImportList" :key="item.id" :label="item.name" :value="item.id" />
                </el-select>
            </el-form-item>
        </el-form>
        <div class="mt-6 text-center">
            <el-button size="small" type="primary" @click="handleConfirm(dataImportRef)">保存</el-button>
            <el-button size="small" type="primary" @click="emits('update:visible')">{{
                t("materielPage.cancel")
            }}</el-button>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { FormInstance, FormRules, UploadInstance, UploadProps, UploadRawFile } from "element-plus"
import { ElMessage, genFileId } from "element-plus"
import { SelectInterface } from "@/interface/common"
import { getDictionarySelect } from "@/api/system/dataDictionary"
import { dataImportBomTemplate, uploadPartOrBOMExcel } from "@/api/productMange/materiel"
import { downloadFile } from "@/utils/exportTemplate"
import { formatDateTime } from "@/utils"
import { useI18n } from "vue-i18n"

defineOptions({
    name: "bomDataImportDialog"
})

const { t } = useI18n()

const props = defineProps({
    visible: {
        type: Boolean,
        required: true
    }
    // currentTreeNodeData: {
    //     type: Object as () => MaterialTreeInterface,
    //     required: true
    // },
    // dialogType: {
    //     type: String,
    //     default: "add"
    // }
})

// console.log("props.currentTreeNodeData", props.currentTreeNodeData)

const emits = defineEmits(["update:visible", "confirm-success"])

const loading = ref(false)
const dataImportRef = ref<FormInstance>()
const dataImport = reactive({
    fileName: "", // 文件名称
    objectImportValue: false, // 对象导入
    materialType: "", // 物料类型
    updateDataValue: false, // 更新已有数据
    relationImport: false, // 关系导入
    relationImportValue: "" // 关系导入选择框值
})
const rules = reactive<FormRules>({
    fileName: [{ required: true, message: t("materielPage.requiredFields"), trigger: "blur" }]
})

//#region 下拉数据
const materialTypeList = ref<SelectInterface[]>([])
const relationImportList = ref<SelectInterface[]>([])
const getSelectData = async () => {
    try {
        const { data } = (await getDictionarySelect({ codes: "MATERIAL_TYPE,RELATION_IMPORT" })) as { data: any }
        materialTypeList.value =
            data.MATERIAL_TYPE.map((item: any) => {
                return {
                    id: item.codeListNameC,
                    name: item.codeListNameC
                }
            }) || []
        relationImportList.value =
            data.RELATION_IMPORT.map((item: any) => {
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

// 下载模板
const elementLoadingText = ref<string>("")
const goDownload = async () => {
    try {
        loading.value = true
        elementLoadingText.value = "正在下载导入模板，请稍等..."
        const res = await dataImportBomTemplate()
        const filename = `BOM导入模板_${formatDateTime(new Date(), "YYYY-MM-DD")}`
        downloadFile(res, filename, "xlsx")
    } catch (error: any) {
        console.error(error)
    } finally {
        loading.value = false
        elementLoadingText.value = ""
    }
}

//#region 处理数据导入按钮相关事件
const excleFileType: string[] = ["xls", "xlsx", "csv"] // 允许的文件类型
const fileSize = 500 // 运行上传文件大小，单位 M
const fileLimit = 1 // 附件数量限制
const importForm: { [key: string]: any } = reactive({
    fileList: [] as any[] // 上传后的文件列表
})
const uploadDataRef = ref<UploadInstance>()

// const uploadDataExcleFile = async (options: UploadRequestOptions) => {
//   console.log("options: ")
//     try {
//         const formData: FormData = new FormData()
//         formData.append("file", options.file)
//         // formData.forEach((value, key) => {
//         //     console.log("formdata值：", key, value)
//         // })
//         // await importUserExcel(formData)
//         // getList()
//         // importForm.fileList = []
//         // ElMessage({
//         //     type: "success",
//         //     message: "导入成功",
//         //     center: true
//         // })
//     } catch (err: any) {
//         importForm.fileList = []
//         if (err.msg)
//             ElMessage({
//                 type: "error",
//                 message: err.msg,
//                 center: true,
//                 dangerouslyUseHTMLString: true
//             })
//         return
//     }
// }

const handleDataExcleChange: UploadProps["onChange"] = (uploadFile, uploadFiles) => {
    console.log("uploadFile: ", uploadFile, uploadFiles)
    if (!uploadFiles.length) {
        ElMessage({
            type: "warning",
            message: "请选取文件后再上传",
            center: true
        })
        return
    }
    importForm.fileList = []
    dataImport.fileName = ""
    console.log("importForm.fileList: ", importForm.fileList)
    const FileSuffix = uploadFile.name.replace(/.+\./, "").toLowerCase()
    // const isLt500M = uploadFile.size / 1024 / 1024 < fileSize //这里做文件大小限制
    // if (!isLt500M) {
    //     ElMessage({
    //         type: "warning",
    //         message: "上传文件大小不能超过500M",
    //         center: true
    //     })
    //     return false
    // }
    if (!excleFileType.includes(FileSuffix)) {
        ElMessage({
            type: "warning",
            message: "上传文件格式不正确，仅允许xls, xlsx, csv的文件格式",
            center: true
        })
        return false
    }
    Object.assign(dataImport, {
        ...dataImport,
        fileName: uploadFile.name
    })
    if (dataImport.fileName) dataImportRef.value!.clearValidate("fileName")
    importForm.fileList = uploadFiles
}

// const handleBeforeDataExcleUpload: UploadProps["beforeUpload"] = (rawFile) => {
//     if (!rawFile) return
//     const FileSuffix = rawFile.name.replace(/.+\./, "").toLowerCase()
//     const isLt500M = rawFile.size / 1024 / 1024 < fileSize //这里做文件大小限制
//     if (!isLt500M) {
//         ElMessage({
//             type: "warning",
//             message: "上传文件大小不能超过500M",
//             center: true
//         })
//         return false
//     }
//     if (excleFileType.includes(FileSuffix)) {
//         return true
//     } else {
//         ElMessage({
//             type: "warning",
//             message: "上传文件格式不正确，仅允许xls, xlsx, csv的文件格式",
//             center: true
//         })
//         return false
//     }
// }
// 文件超出个数限制时自动替换
const handleExceed: UploadProps["onExceed"] = (files) => {
    uploadDataRef.value!.clearFiles()
    const file = files[0] as UploadRawFile
    file.uid = genFileId()
    uploadDataRef.value!.handleStart(file)
}
//#endregion

const handleConfirm = async (formEl: FormInstance | undefined) => {
    if (!formEl) return
    await formEl.validate(async (valid) => {
        if (valid) {
            if (!dataImport.objectImportValue && !dataImport.relationImport) {
                ElMessage({
                    type: "warning",
                    message: "请选择导入关系",
                    center: true
                })
                return
            }
            if (dataImport.objectImportValue && dataImport.relationImport) {
                ElMessage({
                    type: "warning",
                    message: "导入方式只能选择一种！",
                    center: true
                })
                return
            }
            if (dataImport.objectImportValue && !dataImport.materialType) {
                ElMessage({
                    type: "warning",
                    message: "请选择对象导入的物料类型！",
                    center: true
                })
                return
            }
            if (dataImport.relationImport && !dataImport.relationImportValue) {
                ElMessage({
                    type: "warning",
                    message: "请选择关系导入的类型！",
                    center: true
                })
                return
            }
            loading.value = true
            elementLoadingText.value = "正在导入，请稍等..."
            try {
                const formData: any = new FormData()
                formData.append("objectImport", dataImport.materialType) // 物料类型
                formData.append("update", dataImport.updateDataValue) // 更新已有数据
                formData.append("linkImport", dataImport.relationImportValue) // 关系导入
                importForm.fileList.forEach((file: any) => {
                    console.log("file： ", file)
                    if (file.raw) {
                        formData.append("file", file.raw)
                    }
                })
                await uploadPartOrBOMExcel(formData)
                ElMessage({
                    type: "success",
                    message: "导入成功！",
                    center: true
                })
                emits("confirm-success", "dataImport")
            } catch (err: any) {
                console.log(err)
            } finally {
                elementLoadingText.value = ""
                loading.value = false
            }
        }
    })
}
</script>

<style lang="scss" scoped>
.checkbox-radio {
    :deep(.el-checkbox__input) {
        .el-checkbox__inner {
            border-radius: 100%;
        }
    }
}
</style>
