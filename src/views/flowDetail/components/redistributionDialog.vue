<template>
  <el-dialog
    v-model="dialog.visible"
    title="重新分配"
    width="450px"
    top="7vh"
    draggable
    overflow
  >
    <div class="redistributionDialog">
      <el-form v-loading="loading" :inline="true" size="small">
        <el-form-item label="用户">
          <el-input
            v-model="userInput"
            placeholder="请输入用户"
            @keyup.enter="getList"
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="getList">查询</el-button>
        </el-form-item>
        <el-form-item>
          <el-table
            :data="tableData"
            border
            height="calc(70vh - 215px)"
            style="width: 392px;margin-bottom: 10px;"
          >
            <el-table-column width="40" align="center">
              <template #default="scope">
                <el-radio
                  v-if="scope.row.staffUsername&&scope.row.staffUsername!=='null'"
                  class="noLabel"
                  v-model="user"
                  :label="scope.row.staffUsername"
                ><span></span></el-radio>
              </template>
            </el-table-column>
            <el-table-column prop="staffUsername" label="员工编号" align="center" />
            <el-table-column prop="staffName" label="员工姓名" align="center" />
            <el-table-column
              label="在职状态"
              align="center"
            >
              <template #default="{ row }">
                <span v-if="row.status">在职</span>
                <span v-else>离职</span>
              </template>
            </el-table-column>
          </el-table>
          <el-pagination
            :layout="pageData.layout"
            :page-sizes="pageData.pageSizes"
            :total="pageData.total"
            :page-size="pageData.pageSize"
            :currentPage="pageData.currentPage"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            size="small"
          />
        </el-form-item>
        <el-form-item label="分配原因">
          <el-input
            type="textarea"
            :rows="4"
            placeholder="请输入分配原因"
            v-model="reason"
            style="width: 320px;">
          </el-input>
        </el-form-item>
      </el-form>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" size="small" @click="save">确认</el-button>
        <el-button size="small" type="primary" @click="dialog.visible=false">取消</el-button>
      </div>
    </template>
  </el-dialog>
</template>
<script lang="ts" setup>
import { reactive, ref } from "vue";
import { ElMessage } from "element-plus"
import { flowTaskReassign, getCountersignerList } from "@/api/flowDetail";
import { userList } from '@/api/system/staffManage/index'
import { usePagination } from "@/hooks/usePagination"
import { emit } from "process";
//#region 参数和方法
const props = defineProps({
  dialog: {
    type: Object,
    default: {
      visible: false,
      title: ''
    }
  },
  flowTaskID: String
})
const emits = defineEmits(["refreshList"])
const loading = ref(false)
//#endregion

const userInput = ref('')
const user = ref('')
const reason = ref('')
const tableData = ref([])
// 获取用户列表
const getList = () => {
  loading.value = true
  let params = {
    pageNo: pageData.currentPage,
    pageSize: pageData.pageSize,
    deptId: "", // 组
    codeName: userInput.value, // 编号/名称
    workStatus: '', // 在职状态
  }
  // 请求后端接口
  userList(params).then((data: any) => {
    console.log(data);

    tableData.value = data.data.data || []
    pageData.total = data.data.total
    loading.value = false
  }).catch(err => {
    console.log('获取用户列表', err);
    tableData.value = []
    pageData.total = 0
    loading.value = false
  })
}
// 重新分配
const save = () => {
  if (!user.value) {
    ElMessage.error('请选择一个用户！')
    return false
  }
  loading.value = true
  const params = {
    flowTaskID: props.flowTaskID,
    employeeNo: user.value,
    commont: reason.value
  }
  flowTaskReassign(params).then(res => {
    ElMessage.success('已重新分配！')
    emits('refreshList')
    props.dialog.visible = false
  }).catch(err => {
    console.log('重新分配', err);
    loading.value = false
  })
}
// 分页
const { pageData, handleCurrentChange, handleSizeChange } = usePagination()
// 监听分页参数的变化
watch([() => pageData.currentPage, () => pageData.pageSize], getList, { immediate: true })
</script>
<style scoped></style>
