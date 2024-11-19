<template>
<el-dialog
  v-model="dialog.visible"
  :before-close="handleClose"
  :title="$t('forwardTypePage.material_title')"
  draggable
  overflow
  width="1200px"
>
<div v-loading="loading">
  <div class="descriptions">
    <template v-for="item in tableDataColumn">
      <div :class="{
        'descriptions-item': true,
        'fullLine': item.fullLine
      }">
        <div class="descriptions-item-label">{{ item.label }}: </div>
        <template v-if="tableData[item.prop]">
          <el-tooltip class="item" effect="dark" :content="tableData[item.prop]" placement="top">
            <div class="descriptions-item-text" :style="{color: item.color || '#000'}">{{ tableData[item.prop] }}</div>
          </el-tooltip>
        </template>
        <template v-else>
          <div class="descriptions-item-text" :style="{color: '#909399'}">无数据</div>
        </template>
      </div>
    </template>
  </div>
</div>
  </el-dialog>
</template>
<script>
import { getMaterialDetail } from '@/api/bomList'

export default {
  props: {
    dialog: Object,
  },
  data() {
    return {
      loading: false,
      tableData: {
        feature:'',
      },
      tableDataColumn:[
        {
          label: this.$t('forwardTypePage.material_Number'),
          prop: 'Number'
        },
        {
          label: this.$t('forwardTypePage.material_DevelopmentMaturity'),
          prop: 'DevelopmentMaturity'
        },
        {
          label: this.$t('forwardTypePage.material_Characteristic'),
          prop: 'Characteristic'
        },
        {
          label: this.$t('forwardTypePage.material_State'),
          prop: 'State'
        },
        {
          label: this.$t('forwardTypePage.material_MappableUnit'),
          prop: 'MappableUnit'
        },
        {
          label: this.$t('forwardTypePage.material_Name'),
          prop: 'Name'
        },
        {
          label: this.$t('forwardTypePage.material_Remark'),
          prop: 'Remark'
        },
        {
          label: this.$t('forwardTypePage.material_Details'),
          prop: 'Details'
        },
        {
          label: this.$t('forwardTypePage.material_ContactForm'),
          prop: 'ContactForm'
        },
        {
          label: this.$t('forwardTypePage.material_EnglishName'),
          prop: 'EnglishName'
        },
        {
          label: this.$t('forwardTypePage.material_Version'),
          prop: 'Version'
        },
        {
          label: this.$t('forwardTypePage.material_KeyParts'),
          prop: 'KeyParts'
        },
        {
          label: this.$t('forwardTypePage.material_Regulations'),
          prop: 'Regulations'
        },
        {
          label: this.$t('forwardTypePage.material_AdoptStanNum'),
          prop: 'AdoptStanNum'
        },
        {
          label: this.$t('forwardTypePage.material_feature'),
          prop: 'feature',
          fullLine: true
        },
      ]
    }
  },
  mounted() {
    this.init()
  },
  methods: {
    // 初始化
    init() {
      this.getList()
    },
      // 获取列表
  getList() {
    console.log(this.dialog.row);
    this.loading = true
    let params = {
      partOid: this.dialog.row?.partOid
    }
    getMaterialDetail(params).then(data => {
      console.log(data);
      this.tableData = data.data
      this.loading = false
      this.featureGroup()
    }).catch(err => {
      this.loading = false
      this.tableData = {}
    })

  },
    //关闭弹窗
    handleClose() {
      this.$emit('close')
    },
    //拼接特征值
    featureGroup() {
      const selectedKeys = []
      for(let i = 1; i <= 20; i++) {
          console.log(this.tableData[`Feature_${i}`])
          const featureI = this.tableData[`Feature_${i}`]
          if(featureI !== '') {
              selectedKeys.push(featureI)
          }
      }
      this.tableData.feature = selectedKeys.map(value => `^${value}^`).join(',')
    }
  }
}
</script>
<style lang="scss" scoped>
  .el-dialog__header {
      background-color: #f5f5f5; /* 将背景颜色设置为你想要的颜色 */
  }
  .descriptions {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      .descriptions-item {
          width: 285px;
          height: 28px;
          display: flex;
          gap: 12px;
          align-items: center;
          &.fullLine {
              width: 100%;
          }
          &.col2 {
              width: 400px;
          }
          .descriptions-item-text {
              flex: 1;
              width: 0;
              overflow: hidden;
              white-space: nowrap;
              text-overflow: ellipsis;
          }
      }
  }
</style>
