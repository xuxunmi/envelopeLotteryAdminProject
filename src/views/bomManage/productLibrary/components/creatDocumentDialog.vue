<template>
    <div class="creatDocumentDialog" v-loading="loading">
        <el-form
            ref="documentFormRef"
            :model="documentForm"
            :rules="rules"
            size="small"
            label-width="120px"
            label-position="right"
        >
            <el-form-item :label="t('productLibraryPage.documentType') + '：'" prop="partType">
                <el-select
                    :loading="loading_select"
                    v-model="documentForm.partType"
                    :disabled="dialogType === 'edit' || dialogType === 'detail'"
                >
                    <el-option v-for="item in documnetTypeList" :key="item.id" :label="item.name" :value="item.id" />
                </el-select>
            </el-form-item>
            <!-- accept=".docx,.doc,.xlsx,.xls,.ppt,.pdf,.pptx" -->
            <el-form-item :label="t('productLibraryPage.mainContentSource') + '：'">
                <template v-if="dialogType === 'detail'">
                    <el-tree :data="documentForm.mainContentFileList" style="width: 100%">
                        <template #default="{ node, data }">
                            <div class="custom-tree-node">
                                <span>{{ data.name }}</span>
                                <span>
                                    <el-button
                                        type="primary"
                                        link
                                        @click="handleMainContentExcleDownload({ name: data.name } as any)"
                                        >下载</el-button
                                    >
                                    <el-button type="primary" link @click="goFileView('PRIMARY', data.name)"
                                        >预览</el-button
                                    >
                                </span>
                            </div>
                        </template>
                    </el-tree>
                </template>
                <template v-else>
                    <el-upload
                        style="width: 100%"
                        action="#"
                        ref="mainContentUploadRef"
                        :on-exceed="handleMainContentExceed"
                        :on-change="handleMainContentExcleChange"
                        :on-preview="handleMainContentExcleDownload"
                        :limit="fileLimit"
                        :file-list="documentForm.mainContentFileList"
                        :auto-upload="false"
                    >
                        <el-button type="primary" size="small">{{ t("productLibraryPage.selectFile") }}</el-button>
                    </el-upload>
                </template>
            </el-form-item>
            <!-- accept=".docx,.doc,.xlsx,.xls,.ppt,.pdf,.pptx" -->
            <el-form-item :label="t('productLibraryPage.attachment') + '：'">
                <template v-if="dialogType === 'detail'">
                    <el-tree :data="documentForm.attachmentFileList" style="width: 100%">
                        <template #default="{ node, data }">
                            <div class="custom-tree-node">
                                <span>{{ data.name }}</span>
                                <span>
                                    <el-button
                                        type="primary"
                                        link
                                        @click="handleAttachmentDownload({ name: data.name } as any)"
                                        >下载</el-button
                                    >
                                    <el-button type="primary" link @click="goFileView('SECONDARY', data.name)"
                                        >预览</el-button
                                    >
                                </span>
                            </div>
                        </template>
                    </el-tree>
                </template>
                <template v-else>
                    <el-upload
                        v-model:file-list="documentForm.attachmentFileList"
                        style="width: 100%"
                        action="#"
                        ref="attachmentUploadRef"
                        :on-change="handleAttachmentExcleChange"
                        :on-remove="handleAttachmentRemove"
                        :on-preview="handleAttachmentDownload"
                        :auto-upload="false"
                        multiple
                    >
                        <el-button type="primary" size="small">{{ t("productLibraryPage.selectFile") }}</el-button>
                    </el-upload>
                </template>
            </el-form-item>
            <pt-collapse id="explainList" :title="t('productLibraryPage.attribute')">
                <el-form-item :label="t('productLibraryPage.code') + '：'" prop="code">
                    <div class="w-full" @click="goEdit_number">
                        <el-input v-model="documentForm.code" disabled>
                            <template #suffix>
                                <el-button type="primary" icon="Search" link />
                            </template>
                        </el-input>
                        <div class="overlay" />
                    </div>
                </el-form-item>
                <dynamicFormItem
                    v-model:modelValue="documentForm"
                    :formItems="dynamicsFormItemConfig"
                    :onlyRead="dialogType === 'detail'"
                />
            </pt-collapse>
        </el-form>
        <div v-if="dialogType !== 'detail'" class="mt-6 text-center">
            <el-button size="small" type="primary" @click="handleConfirm(documentFormRef)">保存</el-button>
            <el-button size="small" type="primary" @click="emits('update:visible')">{{ t("productLibraryPage.cancel") }}</el-button>
        </div>

        <!-- 编号 - 编辑弹窗 -->
        <ConfigDocumentNumberDialog
            v-if="configDocumentNumberDialog.visible"
            :dialog="configDocumentNumberDialog"
            :advancedSearchPartParams="advancedSearchPartParams"
            @handleEditSuccess="handleEditSuccess_number"
        />
    </div>
</template>

<script setup lang="ts">
import type { FormInstance, FormRules, UploadInstance, UploadProps, UploadRawFile } from "element-plus"
import { genFileId } from "element-plus"
import PtCollapse from "@/components/ptCollapse/index.vue"
import dynamicFormItem from "@/components/dynamicFormItem/index.vue"
import ConfigDocumentNumberDialog from "@/views/bomManage/productLibrary/components/configDocumentNumberDialog.vue"
import { SelectInterface } from "@/interface/common"
import { getDictionarySelect } from "@/api/system/dataDictionary"
import { ProductListDataInterface } from "@/interface/product"
import { createDocument, downloadUploadFile } from "@/api/productLibrary"
import { getDocumentPartDetails, previewDoc } from "@/api/productDetail"
import { downloadFile } from "@/utils/exportTemplate"
import { useI18n } from "vue-i18n"

//#region 参数和方法
defineOptions({
    name: "creatDocumentDialog"
})
const props = defineProps({
    visible: {
        type: Boolean,
        required: true
    },
    currentRowData: {
        type: Object as () => ProductListDataInterface,
        required: true
    },
    parentNodeData: {
        type: Object as () => ProductListDataInterface,
    },
    dialogType: {
        type: String,
        default: "add"
    },
    advancedSearchPartParams: {
        type: Object,
        default: {}
    }
})
const emits = defineEmits(["update:visible", "confirmSuccess"])

const env = import.meta.env
const loading = ref(false)
const { t } = useI18n()
//#endregion

//#region 下拉数据
const loading_select = ref(false)
const documnetTypeList = ref<SelectInterface[]>([])
const getSelectData = async () => {
    try {
        loading_select.value = true
        const { data } = (await getDictionarySelect({ codes: "DOCUMENT_TYPE" })) as { data: any }
        documnetTypeList.value =
            data.DOCUMENT_TYPE.map((item: any) => {
                return {
                    id: item.code,
                    name: item.codeListNameC
                }
            }) || []
    } catch (error: any) {
        console.log(error)
    } finally {
        loading_select.value = false
    }
}
getSelectData()
//#endregion

//#region 表单
const documentFormRef = ref<FormInstance>()
const documentForm = reactive({
    oid: "",
    partType: "wt.doc.WTDocument|com.ptc.ReferenceDocument", // 类型
    mainContentFileList: [] as any[], // 主要内容源// 上传文件
    attachmentFileList: [] as any[], // 附件// 上传文件
    code: "", // 编号
    name: "", // 名称
    description: "", // 说明
    lifeCycleTemplate: "", // 生命周期模板
    teamTemplate: "", // 团队模板
    site: "" // 位置
})
const rules = reactive<FormRules>({
    partType: [{ required: true, message: t("productLibraryPage.requiredFields"), trigger: "change" }],
    site: [{ required: true, message: t("productLibraryPage.requiredFields"), trigger: "change" }],
    code: [{ required: true, message: t("productLibraryPage.requiredFields"), trigger: "blur" }]
})

// 动态表单配置项
const dynamicsFormItemConfig = ref<any[]>([
    {
        type: "input",
        field: "name",
        label: computed(() => t("productLibraryPage.name")) as any,
        rules: [{ required: true, message: t("productLibraryPage.requiredFields"), trigger: "blur" }]
    },
    {
        type: "textarea",
        field: "description",
        label: computed(() => t("productLibraryPage.desc")) as any,
        placeholder: t("productLibraryPage.pleaseEnter")
    }
])

// 获取产品详情
const getDocumentDetail = async (rowData: ProductListDataInterface) => {
    try {
        loading.value = true
        const params: {
            oid: string
            type: string
        } = {
            oid: rowData.oid,
            type: rowData.type
        }
        const { data } = (await getDocumentPartDetails(params)) as { data: any }
        loading.value = false
        // 用于上传回显
        const mainContentFileList = []
        if (data.location) {
            mainContentFileList.push({
                url: data.location,
                name: data.mainContent
            })
        }
        const secondaryFileList = data.secondary.map((item: any) => {
            return {
                name: item
            }
        })
        Object.assign(documentForm, {
            oid: data.oid,
            partType: data.type,
            mainContentFileList: mainContentFileList,
            attachmentFileList: secondaryFileList,
            code: data.number,
            name: data.name,
            description: data.desc
        })
    } catch (err: any) {
        loading.value = false
        console.log(err)
    }
}
//#endregion

//#region 主要内容上传文件相关事件
const mainContentUploadRef = ref<UploadInstance>()
// const excleFileType: string[] = ["docx", "doc", "xlsx", "xls", "ppt", "pdf", "pptx"] // 允许的文件类型
// const fileSize = 300 // 运行上传文件大小，单位 M
const fileLimit = 1 // 附件数量限制

const handleMainContentExcleChange: UploadProps["onChange"] = (uploadFile, uploadFiles) => {
    if (!uploadFiles.length) {
        ElMessage({
            type: "warning",
            message: t("productLibraryPage.selectFileUploadMsg"),
            center: true
        })
        return
    }
    // const FileSuffix = uploadFile.name.replace(/.+\./, "").toLowerCase()
    // if (uploadFile.size) {
    //     const isLt300M = uploadFile.size / 1024 / 1024 < fileSize //这里做文件大小限制
    //     if (!isLt300M) {
    //         ElMessage({
    //             type: "warning",
    //             message: "上传文件大小不能超过300M",
    //             center: true
    //         })
    //         Object.assign(documentForm, {
    //             ...documentForm,
    //             name: "",
    //             mainContentFileList: []
    //         })
    //         return false
    //     }
    // }
    // if (excleFileType.includes(FileSuffix)) {
    //     Object.assign(documentForm, {
    //         ...documentForm,
    //         name: uploadFile.name.replace(/\.[^.]+$/, ""),
    //         mainContentFileList: uploadFiles
    //     })
    //     return true
    // } else {
    //     ElMessage({
    //         type: "warning",
    //         message: "上传文件格式不正确，仅允许docx、doc、xlsx、xls、ppt、pptx、pdf等文件格式",
    //         center: true
    //     })
    //     Object.assign(documentForm, {
    //         ...documentForm,
    //         name: "",
    //         mainContentFileList: []
    //     })
    //     return false
    // }
    Object.assign(documentForm, {
        ...documentForm,
        name: uploadFile.name.replace(/\.[^.]+$/, ""),
        mainContentFileList: uploadFiles
    })
}

const handleMainContentExcleDownload: UploadProps["onPreview"] = async (uploadFile) => {
    try {
        loading.value = true
        const filename = uploadFile.name
        const params = {
            oid: props.currentRowData.oid,
            type: "主文档",
            name: filename
        }
        const res = await downloadUploadFile(params)
        loading.value = false
        downloadFile(res, filename)
    } catch (error: any) {
        loading.value = false
        console.error(error)
    }
}

// 文件超出个数限制时自动替换
const handleMainContentExceed: UploadProps["onExceed"] = (files) => {
    mainContentUploadRef.value!.clearFiles()
    const file = files[0] as UploadRawFile
    file.uid = genFileId()
    mainContentUploadRef.value!.handleStart(file)
}
// 预览文件
const goFileView = (type: string, fileName: string) => {
    const params = {
        oid: props.currentRowData.oid,
        fileName, // 文件名
        type // 类型，主内容-PRIMARY; 附件-SECONDARY;
    }
    loading.value = true
    previewDoc(params)
        .then((data) => {
            const url = data.data[0].url
            if (!url) {
                ElMessage.error("链接为空！")
                return false
            }
            window.open(env.VITE_APP_PDM + url, "_blank")
        })
        .finally(() => (loading.value = false))
}
//#endregion

//#region 附件上传文件相关事件
const attachmentUploadRef = ref<UploadInstance>()
const editDelFileNames = ref<string[]>([]) // 编辑删除的oid

const handleAttachmentExcleChange: UploadProps["onChange"] = (uploadFile, uploadFiles) => {
    if (!uploadFiles.length) {
        ElMessage({
            type: "warning",
            message: t("productLibraryPage.selectFileUploadMsg"),
            center: true
        })
        return
    }
    // uploadFiles.forEach((item, index) => {
    //     const FileSuffix = item.name.replace(/.+\./, "").toLowerCase()
    //     if (excleFileType.includes(FileSuffix)) {
    //         if (item.size) {
    //             const isLt300M = item.size / 1024 / 1024 < fileSize //这里做文件大小限制
    //             if (!isLt300M) {
    //                 ElMessage({
    //                     type: "warning",
    //                     message: "上传文件大小不能超过300M",
    //                     center: true
    //                 })
    //                 return false
    //             }
    //         }
    //     } else {
    //         ElMessage({
    //             type: "warning",
    //             message: "上传文件格式不正确，仅允许docx、doc、xlsx、xls、ppt、pptx、pdf等文件格式",
    //             center: true
    //         })
    //         uploadFiles.splice(index, 1)
    //         return false
    //     }
    // })
    Object.assign(documentForm, {
        ...documentForm,
        attachmentFileList: uploadFiles
    })
}

const handleAttachmentRemove: UploadProps["onRemove"] = (file, uploadFiles) => {
    console.log("uploadFiles:", uploadFiles)
    if (!file.raw) {
        editDelFileNames.value.push(file.name)
        console.log("editDelFileNames.value: ", editDelFileNames.value)
    }
}

const handleAttachmentDownload: UploadProps["onPreview"] = async (uploadFile) => {
    try {
        loading.value = true
        const filename = uploadFile.name
        const params = {
            oid: props.currentRowData.oid,
            type: "附件",
            name: filename
        }
        const res = await downloadUploadFile(params)
        loading.value = false
        downloadFile(res, filename)
    } catch (error: any) {
        loading.value = false
        console.error(error)
    }
}
//#endregion

const handleConfirm = async (formEl: FormInstance | undefined) => {
    if (!formEl) return
    await formEl.validate(async (valid) => {
        if (valid) {
            try {
                loading.value = true
                const formData: FormData = new FormData()
                let params: {
                    oid?: string
                    pid: string
                    type: string
                    number: string
                    name: string
                    desc: string
                    names: string[]
                } = {
                    pid: props.parentNodeData.oid,
                    type: documentForm.partType,
                    number: documentForm.code,
                    name: documentForm.name,
                    desc: documentForm.description,
                    names: editDelFileNames.value
                }
                if (props.dialogType === "edit") {
                    params = {
                        ...params,
                        oid: props.currentRowData.oid
                    }
                }
                formData.append("str", JSON.stringify(params))
                documentForm.mainContentFileList.forEach((file) => {
                    if (file.raw) {
                        formData.append("mainContent", file.raw)
                    }
                })
                documentForm.attachmentFileList.forEach((file) => {
                    if (file.raw) {
                        formData.append("secondary", file.raw)
                    }
                })
                await createDocument(formData)
                loading.value = false
                editDelFileNames.value = []
                ElMessage({
                    type: "success",
                    message:
                        props.dialogType === "add"
                            ? t("productLibraryPage.createSuccess")
                            : t("productLibraryPage.editSuccess"),
                    center: true
                })
                emits("confirmSuccess", props.parentNodeData.oid)
            } catch (err: any) {
                loading.value = false
                console.log(err)
            }
        }
    })
}

//#region 编号 - 编辑弹窗
const configDocumentNumberDialog = reactive<any>({
    visible: false,
    title: ""
})
// 编辑编号
const goEdit_number = () => {
    Object.assign(configDocumentNumberDialog, {
        visible: true,
        title: "编号配置"
    })
}
// 编号编辑成功回调
const handleEditSuccess_number = (number: string) => {
    documentForm.code = number
    Object.assign(configDocumentNumberDialog, {
        visible: false,
        title: ""
    })
    if (number) documentFormRef.value!.clearValidate("code")
}
//#endregion

watch(
    () => props.currentRowData,
    (val) => {
        if (props.dialogType === "add") return
        getDocumentDetail(val)
    },
    { immediate: true }
)
</script>

<style lang="scss" scoped>
.creatDocumentDialog {
    .custom-tree-node {
        width: 100%;
        display: flex;
        justify-content: space-between;
    }
    .w-full {
        position: relative;
    }
    .overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 1;
        cursor: pointer;
    }
}
</style>
