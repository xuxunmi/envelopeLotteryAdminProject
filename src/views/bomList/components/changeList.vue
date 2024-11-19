<template>
  <div class="changeList">
    <el-table
      :data="tableData"
      border
      size="small"
      height="calc(100vh - 134px)"
    >
      <el-table-column type="index" width="40" />
      <el-table-column prop="Name" :label="$t('forwardTypePage.changeList_name')" />
      <el-table-column prop="Number" :label="$t('forwardTypePage.changeList_number')" />
    </el-table>
  </div>
</template>

<script>
import { getMaterialChange } from '@/api/bomList'

export default {
  data() {
    return {
      tableData: [],
    }
  },
  methods: {
    // 获取列表
    getList(row) {
      let params = {
        materialNumber: row.SubDrawingNumber,
        materialName: row.Name,
        partOid: row.oid
        // materialNumber: 'Z7G0.ABBM.4441U0G.1M',
        // materialName: '2021版ZZ4187V441GF1L/A9UBM44-标运半挂牵引车基本装置(豪沃TX系列/集装箱运输)',
        // partOid: 'VR:wt.part.WTPart:8646977632'
      }
      getMaterialChange(params).then(data => {
        console.log(data);
        // 格式化数据
        this.tableData = data.data || []
      }).catch(err => {
        console.log('err', err);
        this.tableData = []
      })
    },
  }
}
</script>
<style lang="scss" scoped>
</style>
