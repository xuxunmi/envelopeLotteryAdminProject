<template>
  <el-dialog
    v-model="dialog.visible"
    :title="dialog.title"
    top="7vh"
    width="600px"
    draggable
    overflow
  >
    <div class="editGroupDialog">
      <div class="title">
        <div>
          <b>{{ t('vehicleModelTraitCollectionPage.context') }}</b>
          <span class="name">{{ selectObject.name }}</span>
        </div>
        <div v-if="treeData.length">
          <el-button
            type="primary"
            size="small"
            @click="setAllSelected"
          >
            <span v-if="selectedAll">{{ t('vehicleModelTraitCollectionPage.selectNone') }}</span>
            <span v-else>{{ t('vehicleModelTraitCollectionPage.selectAll') }}</span>
          </el-button>
          <el-button
            type="primary"
            size="small"
            @click="setAllExpand"
          >
            <span v-if="defaultExpandAll">{{ t('vehicleModelTraitCollectionPage.foldAll') }}</span>
            <span v-else>{{ t('vehicleModelTraitCollectionPage.expandAll') }}</span>
          </el-button>
        </div>
      </div>
      <el-scrollbar height="calc(86vh - 204px)">
        <el-tree
          ref="treeRef"
          :data="treeData"
          node-key="oid"
          show-checkbox
          :default-expand-all="defaultExpandAll"
          @check-change="handleCheckChange"
          :props="{ children: 'choiceList', label: 'name' }"
          :render-after-expand="false"
        >
          <template #default="{ node, data }">
            <div style="position: relative;top: -1px;">
              <ObjectIcon
                :objectType="data.type"
                style="margin-right: 6px;"
              />
              <span>{{ node.label }}</span>
            </div>
          </template>
        </el-tree>
      </el-scrollbar>
    </div>
    <template #footer>
      <el-button
        type="primary"
        @click="submit"
        size="small"
      >保存</el-button>
      <el-button
        type="primary"
        @click="dialog.visible=false"
        size="small"
      >{{ t('dashboardPage.cancel') }}</el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, reactive, getCurrentInstance } from "vue";
import type { ElTree } from "element-plus"
import ObjectIcon from "@/views/traitManage/enterpriseTraitLibrary/components/objectIcon.vue";
import { getFeatureNames } from "@/api/traitManage/enterpriseTraitLibrary";
import { getOptionListOfMangerOption, mangerOptionOfOptionSet } from "@/api/traitManage/vehicleModelTraitCollection";
import { recursionArray, filterArray } from "@/utils";
import { useI18n } from "vue-i18n"

//#region 参数和方法
const props = defineProps({
  dialog: {
    type: Object,
    default: {
      visible: false,
      title: '',
      row: {},
      type: ''
    }
  },
})
const instance: any = getCurrentInstance()
const emits = defineEmits(["handleEditSuccess"])
const { t, locale } = useI18n()
//#endregion

//#region 特征库
const selectObject = reactive({
  name: '',
  oid: ''
})
// 获取特征库下拉
const getSelect = () => {
  getFeatureNames().then(data => {
    selectObject.name = data.data[0].name
    selectObject.oid = data.data[0].oid
    getList()
  })
}
getSelect()
//#endregion

//#region 树
const treeRef = ref<InstanceType<typeof ElTree>>() // 树组件dom
const treeData = ref<any[]>([])
const defaultExpandAll = ref(false) // 折叠/展开
const selectedAll = ref(false) // 全选/全不选
// 设置全部折叠/展开
const setAllExpand = () => {
  defaultExpandAll.value = !defaultExpandAll.value
  treeRef.value?.store._getAllNodes().forEach(ele => {
    ele.expanded = defaultExpandAll.value
  })
}
// 设置全选
const setAllSelected = () => {
  selectedAll.value = !selectedAll.value
  if (selectedAll.value) {
    treeRef.value?.setCheckedNodes(treeData.value as any)
    recursionArray(treeData.value, (ele: any) => ele.checked = true, 'choiceList')
  } else {
    treeRef.value?.setCheckedNodes([])
    recursionArray(treeData.value, (ele: any) => ele.checked = false, 'choiceList')
  }
  console.log(treeData.value);
}
// 获取列表
const getList = () => {
  let params = {
    oid: props.dialog.row.oid,
    pid: selectObject.oid,
  }
  getOptionListOfMangerOption(params).then(data => {
    // console.log(data);
    treeData.value = data.data
    // 默认选中
    recursionArray(treeData.value, (item: any) => {
      nextTick(() => item.checked ? treeRef.value?.setChecked(item, true, false) : "")
    }, 'choiceList')
  })
}
const filterCheckedArr = (tree: any[], arr: any[] = []) => {
  if (!tree.length) return [];
  for (let item of tree) {
    if (item.checked === false) {
      continue;
    }
    let node = { ...item, choiceList: [] };
    arr.push(node);
    if (item.choiceList && item.choiceList.length) {
      filterCheckedArr(item.choiceList, node.choiceList);
    }
  }
  return arr;
}
// 确认
const submit = () => {
  console.log(treeData.value);
  // 筛选树
  const checkedArr = filterCheckedArr(treeData.value)
  let params = {
    data: checkedArr,
    oid: props.dialog.row.oid
  }
  mangerOptionOfOptionSet(params).then(data => {
    ElMessage.success(t('vehicleModelTraitCollectionPage.tip_option'))
    emits('handleEditSuccess')
  })
}
// 树选择回调
const handleCheckChange = (data: any, isChecked: boolean, hasChildChecked: boolean) => {
  console.log(data, isChecked, hasChildChecked);
  data.checked = isChecked || hasChildChecked
}
//#endregion

</script>
<style lang="scss" scoped>
.editGroupDialog {
  .title {
    display: flex;
    justify-content: space-between;
    margin-bottom: 12px;
    .name {
      margin-left: 20px;
      padding: 4px 8px;
      font-size: 12px;
      border: 1px solid #e4e7ed;
      border-radius: 4px;
    }
  }
}
</style>
