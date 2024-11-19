<template>
  <div class='materialDetail'>
    <div class="materialDetail-info">
      <div class="descriptions">
        <template v-for="item in LabelPropData">
          <div :class="{
            'descriptions-item': true,
            'fullLine': item.fullLine
          }">
            <div class="descriptions-item-label">{{ item.label }}: </div>
            <template v-if="descriptionsData[item.prop]">
              <el-tooltip class="item" effect="dark" :content="descriptionsData[item.prop]" placement="top">
                <template v-if="item.prop === 'MDocument'">
                  <el-link type="primary" @click="goViewChart(descriptionsData.MDUrl)">{{ descriptionsData[item.prop] }}</el-link>
                </template>
                <template v-else-if="item.prop === 'TDocument'">
                  <el-link type="primary" @click="goViewChart(descriptionsData.TDUrl)">{{ descriptionsData[item.prop] }}</el-link>
                </template>
                <template v-else>
                  <div class="descriptions-item-text">{{ descriptionsData[item.prop] }}</div>
                </template>
              </el-tooltip>
            </template>
            <template v-else>
              <div class="descriptions-item-text" :style="{color: '#909399'}">{{ t('forwardTypePage.noData') }}</div>
            </template>
          </div>
        </template>
      </div>
    </div>
    <div class="materialDetail-image">
      <el-tabs v-model="activeName" type="card">
        <template v-for="(item, i) in tableData_file">
          <el-tab-pane :label="item.name" :name="i+''">
            <ViewChart
              :data="item"
              style="width: 100%;height: 50vh;"
            />
          </el-tab-pane>
        </template>
      </el-tabs>
    </div>

    <!-- 查看图纸弹窗 -->
    <ViewChartDialog
      v-if="viewChartDialog.visible"
      :dialog="viewChartDialog"
      :url="viewChartDialog.url"
    />
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref, onMounted } from "vue";
import { ElMessage } from "element-plus"
import { getMaterialDetail } from '@/api/bomList'
import ViewChart from "@/components/viewChart/index.vue";
import { decrypt, SECRET_KEY, SECRET_IV } from "@/utils";
import ViewChartDialog from "@/components/viewChart/components/viewChartDialog.vue";
import { useI18n } from "vue-i18n"

//#region 参数和方法
// const props = defineProps({})
const { t, locale } = useI18n()
onMounted(() => {
  // this.tableData_file = this.defaultFile
})
//#endregion

const showMpdfVisible = ref(false)
const showTpdfVisible = ref(false)
const tableData_file = ref<any[]>([])
const activeName = ref('1')
const descriptionsData = ref<any>({
  developmentMaturity: '', // 研发成熟度
  Name: '', // 名称
  Characteristic: '', // 特性
  State: '', // 状态
  LatestUpdateTime: '', // 上次修改时间
  MDocument: '', // M单单号
  TDocument: '', // T单单号
  MDUrl:"",  // M单链接
  TDUrl:"",  // T单链接
})
//#region 查看图纸弹窗
const viewChartDialog = reactive({
  visible: false,
  title: '',
  url: ''
})
//#endregion
const LabelPropData = ref([
  {
    label: computed(() => t("forwardTypePage.material_MDocument")) as any,
    prop: 'MDocument'
  },
  {
    label: computed(() => t("forwardTypePage.material_TDocument")) as any,
    prop: 'TDocument'
  },
  {
    label: computed(() => t("forwardTypePage.material_Number")) as any,
    prop: 'Number'
  },
  {
    label: computed(() => t("forwardTypePage.material_DevelopmentMaturity")) as any,
    prop: 'DevelopmentMaturity'
  },
  {
    label: computed(() => t("forwardTypePage.material_Name")) as any,
    prop: 'Name'
  },
  {
    label: computed(() => t("forwardTypePage.material_TechnicalReleaseLevel")) as any,
    prop: 'TechnicalReleaseLevel'
  },
  {
    label: computed(() => t("forwardTypePage.material_EstimatedAnnualUsage")) as any,
    prop: 'EstimatedAnnualUsage'
  },
  {
    label: computed(() => t("forwardTypePage.material_Characteristic")) as any,
    prop: 'Characteristic'
  },
  {
    label: computed(() => t("forwardTypePage.material_State")) as any,
    prop: 'State'
  },
  {
    label: computed(() => t("forwardTypePage.material_PartPhase")) as any,
    prop: 'PartPhase'
  },
  {
    label: computed(() => t("forwardTypePage.material_EnglishName")) as any,
    prop: 'EnglishName'
  },
  {
    label: computed(() => t("forwardTypePage.material_KeyParts")) as any,
    prop: 'KeyParts'
  },
  {
    label: computed(() => t("forwardTypePage.material_Regulations")) as any,
    prop: 'Regulations'
  },
  {
    label: computed(() => t("forwardTypePage.material_Version")) as any,
    prop: 'Version'
  },
  {
    label: computed(() => t("forwardTypePage.material_Details")) as any,
    prop: 'Details',
    fullLine: true
  },
  {
    label: computed(() => t("forwardTypePage.material_Remark")) as any,
    prop: 'Remark',
    fullLine: true
  },
  {
    label: computed(() => t("forwardTypePage.material_Modifier")) as any,
    prop: 'Modifier'
  },
  {
    label: computed(() => t("forwardTypePage.material_LatestUpdateTime")) as any,
    prop: 'LatestUpdateTime'
  },
  {
    label: computed(() => t("forwardTypePage.material_AdoptStanNum")) as any,
    prop: 'AdoptStanNum'
  },
])
const defaultFile = ref([
  {
    name: '3D图', // 名称
    doctype: "epm", // 文件类型
    number: "", // 文件编号
    modifyTime: "",  // 最后修改日志
    State: "",  // 状态
    modifyer: "",  // 修改者
    url: "sample-data/Fishing_Reel/fishing_reel.pvs"  // 实体文件地址
  },
  {
    name: '3D图2', // 名称
    doctype: "epm", // 文件类型
    number: "", // 文件编号
    modifyTime: "",  // 最后修改日志
    State: "",  // 状态
    modifyer: "",  // 修改者
    url: "http://localhost:8080/rd.pdm/netmarkets/jsp/ext/temp/cnhtcrduni/811-48200-6371/AXLE.ASM.pvs"  // 实体文件地址
  },
  {
    name: '图片', // 名称
    doctype: "img", // 文件类型
    number: "", // 文件编号
    modifyTime: "",  // 最后修改日志
    State: "",  // 状态
    modifyer: "",  // 修改者
    url: "http://localhost:6001/view.png"  // 实体文件地址
  },
  {
    name: 'pdf文档', // 名称
    doctype: "doc", // 文件类型
    number: "", // 文件编号
    modifyTime: "",  // 最后修改日志
    State: "",  // 状态
    modifyer: "",  // 修改者
    url: "/rd.pdm/netmarkets/jsp/ext/temp/cnhtcrduni/811-48200-6371/2023112100001.pdf"  // 实体文件地址
  },
])

// 获取列表
const getList = (row: any) => {
  let params = {
    partOid: row.oid
  }
  getMaterialDetail(params).then((data: any) => {
    console.log('========================',data);
    // url解密
    data.data.MDUrl = decrypt(data.data.MDUrl, SECRET_KEY, SECRET_IV)
    data.data.TDUrl = decrypt(data.data.TDUrl, SECRET_KEY, SECRET_IV)
    descriptionsData.value = data.data || {}
  }).catch(err => {
    console.log('属性参数', err);
    descriptionsData.value = {}
  })
}
const getChartList = (arr: any[]) => {
  tableData_file.value = arr || []
  activeName.value = '0'
}
// 预览图纸
const goViewChart = (url: string) => {
  if (url) {
    viewChartDialog.url = url || ''
    viewChartDialog.title = t('forwardTypePage.viewChart')
    viewChartDialog.visible = true
  } else {
    ElMessage.error(t('forwardTypePage.tip_url'))
  }

}
</script>
<style lang="scss" scoped>
.materialDetail {
  padding: 6px;
  .materialDetail-info {
    min-width: 200px;
  }
}
.descriptions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  .descriptions-item {
    width: 200px;
    height: 28px;
    display: flex;
    gap: 12px;
    align-items: center;
    &.fullLine {
      width: 100%;
    }
    .descriptions-item-text {
      flex: 1;
      width: 0;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
  }
  :deep(.el-button span) {
    font-size: inherit!important;
  }
}
</style>
