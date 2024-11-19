<template>
    <el-dialog
      v-model="dialog.visible"
      :title="dialog.title"
      top="17vh"
      width="600px"
      align-center
      append-to-body
      draggable
      overflow
    >
        <div v-loading="loading" class="configNumberDialog">
            <el-form
              ref="formRef"
              :model="formData"
              :rules="rules"
              size="small"
              label-width="80"
            >
                <el-form-item label="大类" prop="bigNumber">
                  <template v-if="dialog.partType==='wt.part.WTPart|com.pdinfo.kbomPHANTOM'">
                    <el-select
                      v-model="formData.bigNumber"
                      @change="handleSelectChange_bigNumber"
                      clearable
                    >
                      <el-option
                        v-for="item in options_big"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                      />
                    </el-select>
                  </template>
                  <template v-else>
                    <el-input v-model="formData.bigNumber" disabled />
                  </template>
                </el-form-item>
                <el-form-item label="中类" prop="middleNumber">
                    <el-select
                      v-model="formData.middleNumber"
                      @change="handleSelectChange_middleNumber"
                      clearable
                    >
                        <el-option
                          v-for="item in options_middle"
                          :key="item.value"
                          :label="`${item.value} ${item.label}`"
                          :value="item.value"
                        />
                    </el-select>
                </el-form-item>
                <el-form-item v-if="formData.bigNumber==='3'" label="车间总装" prop="workshop">
                    <el-input
                      v-model="formData.workshop"
                      maxlength="2"
                      clearable
                    />
                </el-form-item>
                <el-form-item label="流水码" prop="code">
                    <el-input v-model="formData.code" maxlength="6" :disabled="hasCode" />
                </el-form-item>
                <el-form-item label="编码值预览">
                    <div v-if="number" class="numberBox">{{ number }}</div>
                </el-form-item>
            </el-form>
        </div>
        <template #footer>
            <el-button
              :loading="loading"
              type="primary"
              @click="submit"
              size="small"
            >保存</el-button>
            <el-button type="primary" @click="dialog.visible = false" size="small">{{ t("dashboardPage.cancel") }}</el-button>
        </template>
    </el-dialog>
</template>

<script lang="ts" setup>
import { ref, reactive, computed } from "vue"
import type { FormInstance, FormRules } from "element-plus"
import { getSerialNumber } from '@/api/bomManage/productBom'
import { useI18n } from "vue-i18n"
//#region 参数和方法
const props = defineProps({
    dialog: {
        type: Object,
        default: () => ({
            visible: false,
            title: "",
            partType: ""
        })
    }
})
const emits = defineEmits(["handleEditSuccess"])
const { t } = useI18n()
const loading = ref(false)
//#endregion

//#region 表单
const number = computed(() => formData.bigNumber + formData.middleNumber + formData.workshop + formData.code) // 编号
const formRef = ref<FormInstance>()
const formData = reactive<any>({
    bigNumber: "", // 大类
    middleNumber: "", // 中类
    workshop: "", // 车间总装
    code: ""  // 流水码
})
const rules = reactive<FormRules>({
    bigNumber: [{ required: true, message: "必填项不能为空！", trigger: ["change", 'blur'] }],
    middleNumber: [{ required: true, message: "必填项不能为空！", trigger: "change" }],
    workshop: [
        { required: true, message: "必填项不能为空！", trigger: "blur" },
        { min: 2, max: 2, message: "请输入2位车间总装！", trigger: "blur" }
    ],
    code: [
        { required: true, message: "必填项不能为空！", trigger: ["blur", "change"] },
        { min: 6, max: 6, message: "请输入6位流水码！", trigger: ["blur", "change"] }
    ]
})
const options_big = ref([
    { value: "202", label: "202" },
    { value: "3", label: "3" },
])
const options_middle = ref([
    { value: "00", label: "平衡重叉车" },
    { value: "03", label: "滑移装载机" },
    { value: "05", label: "压路机" },
    { value: "06", label: "履带式挖掘机" },
    { value: "08", label: "轮式装载机" },
    { value: "15", label: "挖掘装载机" },
    { value: "20", label: "仓储式叉车" },
    { value: "30", label: "其他类叉车" }
])
// 确认
const submit = () => {
    formRef.value?.validate((valid) => {
        if (valid) {
            emits("handleEditSuccess", number.value)
        }
    })
}
if (props.dialog.partType === "wt.part.WTPart|com.pdinfo.kbomCAR") {
    // 整机配置
    formData.bigNumber = "201"
} else if (props.dialog.partType === "wt.part.WTPart|com.pdinfo.kbomPHANTOM") {
    // 零部件
    options_big.value.unshift({ value: "205", label: "205" })
    formData.bigNumber = "205"
} else if (props.dialog.partType === "wt.part.WTPart|com.pdinfo.kbomMODULE") {
    // 模块
    formData.bigNumber = "203"
}
// 生成流水码
const hasCode = ref(false)
const initSerialNumber = () => {
  formData.code = ''
  let flag = formData.bigNumber && formData.middleNumber
  if (formData.bigNumber === '3') flag = formData.bigNumber && formData.middleNumber && formData.workshop
  if (flag) {
    loading.value = true
    let number = formData.bigNumber + formData.middleNumber
    if (formData.bigNumber === '3') number = formData.bigNumber + formData.middleNumber + formData.workshop
    getSerialNumber({ number }).then(data => {
      if (data.data && data.data !== 'null') {
        formData.code = data.data
        hasCode.value = true
      } else {
        hasCode.value = false
      }
    })
    .finally(() => loading.value = false)
  }
}
// 大类选择回调
const handleSelectChange_bigNumber = (val: string) => {
  // 大类选3的时候，车间总装 默认 00
  formData.workshop = val === '3'?'00':''
  initSerialNumber()
}
// 中类选择回调
const handleSelectChange_middleNumber = (val: string) => {
  initSerialNumber()
}
//#endregion
</script>
<style lang="scss" scoped>
.numberBox {
    width: 100%;
    padding: 4px 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
}
</style>
