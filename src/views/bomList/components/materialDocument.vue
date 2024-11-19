<template>
  <div class='materialDocument'>
    <div class="tableWrapper">
      <el-table
        ref="tableRef"
        class="row-click"
        :data="tableData_file"
        border
        size="small"
        height="calc(50vh - 70px)"
        highlight-current-row
        @row-click="handleRowClick"
      >
        <el-table-column type="index" width="40" />
        <el-table-column prop="name" :label="$t('forwardTypePage.material_Name')" />
        <el-table-column prop="number" :label="$t('forwardTypePage.material_Number')" />
        <!-- <el-table-column label="操作" width="70" fixed="right">
          <template #default="scope">
            <el-button
              text
              size="small"
              @click="goDetail(scope.row)"
            >查看</el-button>
          </template>
        </el-table-column> -->
      </el-table>
    </div>
    <div class="tableWrapper">
      <ViewChart
        :data="chartData"
        style="width: 100%;height: calc(50vh - 70px);"
      />
    </div>
  </div>
</template>

<script>
import ViewChart from "@/components/viewChart";
const env = import.meta.env

export default {
  name: 'materialDocument',
  components: { ViewChart },
  data() {
    return {
      tableData_file: [],
      chartData: {
        doctype: '', // 文件类型
        url: '', // 实体文件地址
        number: '', // 文件编号
        modifyTime: '', // 最后修改日志
        State: '', // 状态
        modifyer: '', // 修改者
        name: '', // 名称
      }
    }
  },
  methods: {
    // 查看
    handleRowClick(row) {
      console.log(row);
      this.chartData = row
    },
    getChartList(arr) {
      this.chartData = {}
      this.tableData_file = arr || []
    },
  }
}
</script>
<style lang='scss' scoped>
.tableWrapper {
  padding: 0 4px;
  :deep(.el-table) {
    th.el-table__cell {
      background-color: #f5f7fa!important;
    }
  }
}
</style>
