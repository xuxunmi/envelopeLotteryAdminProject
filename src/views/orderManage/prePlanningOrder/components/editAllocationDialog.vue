<template>
  <el-dialog
    v-model="dialog.visible"
    :title="dialog.title"
    width="90%"
    draggable
    overflow
    align-center
  >
    <div v-loading="loading||dialog.loading" class="editAllocationDialog">
      <div class="optionalFormWrapper">
        <el-descriptions style="display: inline-block;">
          <el-descriptions-item label="系列编码: ">
            <span style="margin-right: 40px;">{{ dialog.row.number }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="系列名称: ">{{ dialog.row.name }}</el-descriptions-item>
        </el-descriptions>
        <div class="allocations">
          <el-radio-group v-model="choosePartOid" size="small" @change="handleRadioChange">
            <el-radio-button
              v-for="part in partList"
              :key="part.PartOid"
              :value="part.PartOid"
            >{{ part.Name }}</el-radio-button>
          </el-radio-group>
        </div>
        <div v-if="choosePartOid" class="optionList">
          <OptionalForm
            v-if="optionalShow"
            ref="OptionalFormRef"
            :partOid="choosePartOid"
            :showColor="showColor"
            @startLoading="startLoading"
            @endLoading="endLoading"
          />
        </div>
      </div>
    </div>
    <template #footer>
      <el-button
        :loading="loading||dialog.loading"
        type="primary"
        @click="submit"
        size="small"
      >保存</el-button>
      <el-button type="primary" @click="dialog.visible = false" size="small">{{ t('dashboardPage.cancel') }}</el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, reactive, getCurrentInstance, nextTick } from "vue";
import { ElMessage } from "element-plus"
import OptionalForm from "./optionalForm.vue";
import { getProductPZBom } from "@/api/bomManage/productBom/index"
import { getColorDetails } from "@/api/configureManage/applicationConfiguration"
import { useI18n } from "vue-i18n"

//#region 参数和方法
const props = defineProps({
  dialog: {
    type: Object,
    default: {
      visible: false,
      title: '',
      row: {},
      loading: false
    }
  },
})
const emits = defineEmits(["handleEditSuccess"])
const instance: any = getCurrentInstance()
const { t, locale } = useI18n()
const loading = ref(false)
//#endregion

//#region 物料
const partList = ref<any[]>([])
const choosePart = ref<any>()
const choosePartOid = ref('')
// 获取物料列表
const getList_part = () => {
  console.log('getList_part', props.dialog.row);
  const params = {
    topPartoid: props.dialog.row.oid,
    Name: props.dialog.row.Name,
    Number: props.dialog.row.Number,
  }
  loading.value = true
  getProductPZBom(params).then(data => {
    const topPart = data.data[0].children[0]
    const list = data.data[0].children[0].children || []
    // 按整车、车身、门架、随车附件顺序排列（预计划分类）
    list.sort((a: any, b: any) => a.preparePlanType - b.preparePlanType)
    topPart.Name = '整车'
    topPart.preparePlanType = '1'
    partList.value = [
      topPart,
      ...list
    ]
  })
  .finally(() => loading.value = false)
}
getList_part()
const handleRadioChange = (val: any) => {
  console.log('handleRadioChange', val);
  const find = partList.value.find(item => item.PartOid === val)
  choosePart.value = find
  refresh_optional()
}
//#endregion

//#region 选配
// 刷新选配列表
const optionalShow = ref(false)
const refresh_optional = () => {
  optionalShow.value = false
  nextTick(() => optionalShow.value = true)
}
const startLoading = () => loading.value = true
const endLoading = () => loading.value = false
// 是否展示颜色选配（预计划分类为整机和车身才显示）
const showColor = computed(() => choosePart.value?.preparePlanType === '1' || choosePart.value?.preparePlanType === '2')
//#endregion

// 保存
const submit = () => {
  const optionList: any[] = instance.refs.OptionalFormRef.optionList || []
  const colorList: any[] = instance.refs.OptionalFormRef.colorList || []
  console.log('submit', choosePart.value, optionList, colorList);
  if (!choosePart.value) {
    ElMessage.error('请选择一个配置！')
    return false
  }
  // 1、校验选配项是否为空
  if (!optionList.length) {
    ElMessage.error('选配项为空！')
    return false
  }
  // 2、校验是否所有的选配项都选择了
  for (let i = 0; i < optionList.length; i++) {
    const ele = optionList[i];
    if (!ele.checkChoiceOid) {
      ElMessage.error('选配项需要全部选择！')
      return false
    }

  }
  emits('handleEditSuccess', {
    partOid: props.dialog.row.PartOid,
    partName: props.dialog.row.Name,
    partNum: props.dialog.row.Number,
    preparePlanType: choosePart.value.preparePlanType,
    materialName: choosePart.value.Name,
    materialOid: choosePart.value.PartOid,
    materialNum: choosePart.value.Number,
    optionList,
    colorItems: colorList.map(item => {
      return {
        optional: item.codeListNameC,
        value: item.value
      }
    })
  })
}
</script>
<style lang="scss" scoped>
.editAllocationDialog {
    height: calc(100vh - 200px);
  .optionList {
    margin-top: 10px;
  }
  .colorFrom {
    :deep(.el-form-item) {
        margin-bottom: 0;
        .el-form-item__label {
            padding-left: 10px;
            justify-content: center;
        }
        .el-form-item__content {
            padding: 0 10px;
        }
    }
  }
  .optionalFormWrapper {
    max-height: calc(100vh - 200px);
    overflow: auto;
  }
}
</style>
