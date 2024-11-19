<template>
  <el-dialog
    v-model="dialog.visible"
    :title="dialog.title"
    draggable
    overflow
    width="500px"
  >
    <div>
      <el-form
        ref="completeTaskFormRef"
        :model="completeTaskForm"
        label-width="90px"
      >
        <el-form-item v-if="dialog.title==='完成任务'" label="意见: " prop="approvalOpinion">
          <el-input
            style="width: 100%"
            v-model="completeTaskForm.approvalOpinion"
            type="textarea"
            :rows="4"
          />
        </el-form-item>
        <el-form-item v-else-if="dialog.title==='驳回任务'" label="驳回意见: " prop="approvalOpinion">
          <el-input
            style="width: 100%"
            v-model="completeTaskForm.approvalOpinion"
            type="textarea"
            :rows="4"
          />
        </el-form-item>
      </el-form>
    </div>
    <template #footer>
      <div>
        <el-button @click="dialog.visible = false">取 消</el-button>
        <el-button v-else-if="dialog.title==='驳回任务'" type="warning" @click="dialog.visible = false">驳 回</el-button>
        <el-button v-if="dialog.title==='完成任务'" type="primary" @click="dialog.visible = false">通 过</el-button>
      </div>
    </template>
  </el-dialog>
</template>
<script lang="ts" setup>
import { reactive, ref, onMounted } from "vue";
import { ElMessage } from "element-plus"
import type { TableColumnCtx } from 'element-plus'
import { getBOMChangeInfo } from "@/api/flowDetail";
//#region 参数和方法
const props = defineProps({
  dialog: {
    type: Object,
    default: {
      visible: false,
      title: ''
    }
  }
})
onMounted(() => {
  init()
})
//#endregion

// 初始化
const init = () => {
}
const completeTaskForm = ref({
  approvalOpinion: ''
})
</script>
<style scoped></style>
