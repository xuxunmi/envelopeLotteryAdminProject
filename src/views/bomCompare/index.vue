<template>
  <div class="app-container">
    <div class='bomCompare'>
      <el-tabs v-model="activeName">
        <el-tab-pane :label="$t('bomComparePage.materialCompare')" name="1">
          <BomCompareList
            ref="BomCompareListRef1"
            type="物料比较"
            :isSharedAccount="isSharedAccount"
            :isRole = "isRole"
          />
        </el-tab-pane>
        <el-tab-pane :label="$t('bomComparePage.versionCompare')" name="2">
          <BomCompareList
            ref="BomCompareListRef2"
            type="版本比较"
            :isSharedAccount="isSharedAccount"
            :isRole = "isRole"
          />
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, getCurrentInstance, onMounted, onActivated } from "vue";
import { useRoute } from "vue-router"
import { ElMessage } from "element-plus"
import BomCompareList from "./components/bomCompareList.vue";
import { getUserAuth, getUserInfo } from "@/utils";
import { searchUserRoles } from '@/api/bomList'
//#region 参数和方法
defineOptions({
  name: "bomCompare"
})
const instance: any = getCurrentInstance()
const route = useRoute()
const loading = ref(false)
const userInfo = reactive({
  employeeNo: '',
  userName: '',
})
onMounted(() => {
  // init()
})
, onActivated(() => {
  if (isActivated.value) getHistoryData()
  isActivated.value = true
})
//#endregion

const activeName = ref('1')
const isActivated = ref(false)
const isSharedAccount = ref('')
const isRole = ref(true)
// 初始化
const init = () => {
  getHistoryData()
  searchUser()
}
// 判断有无pdm账户
const checkAccount = (data: any) => {
  if (data.data.isSharedAccount) {
    if (data.data.isSharedAccount === '0') {
      // 0：有 - 点击查询直接请求pdm数据；
      instance.refs.BomCompareListRef1.searchData.version = '0'
      instance.refs.BomCompareListRef2.searchData.version = '0'
    } else if (data.data.isSharedAccount === '1') {
      // 1：无 - 版本只能选已完成，点击查询校验工厂后再请求pdm数据；
      instance.refs.BomCompareListRef1.searchData.version = '1'
      instance.refs.BomCompareListRef2.searchData.version = '1'
    }
    isSharedAccount.value = data.data.isSharedAccount
    init() // 初始化
  } else {
    ElMessage.error('判断账户类型异常！')
  }
}
// 根据角色判断导出是否显示
const searchUser = () => {
  const userInfo = getUserInfo()
  console.log('userInfo', userInfo);
  let params = {
    userId: userInfo.userId
  }
  searchUserRoles(params).then((data: any) => {
    console.log(data);
    data.forEach((obj: any) => {
      // console.log('obj',obj.roleName);
      if(obj.roleName === 'WFA_BOMO') {
        isRole.value = true
      }
    })
  })
}
const getHistoryData = () => {
  console.log(route.query);
  if (route.query.type === 'version') {
    // 版本比较
    activeName.value = '2'
    instance.refs.BomCompareListRef2.searchData.partNumber = route.query.code
    instance.refs.BomCompareListRef2.goChooseHistory([
      { Oid: route.query.version1 },
      { Oid: route.query.version2 },
    ])
  }
}

</script>
<style lang="scss" scoped>
.bomCompare {
  padding: 4px;
  background-color: #fff;
  height: 100%;
}
</style>
