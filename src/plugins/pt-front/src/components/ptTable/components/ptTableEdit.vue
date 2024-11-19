<template>
  <div
    v-if="show"
    class="pt-table-edit"
  >
    <div class="pt-custom-edit">
      <slot name="slot-edit"></slot>
    </div>
    <div class="pt-default-edit">
      <!-- 全屏编辑 -->
      <el-button
        v-if="fullScreen"
        type="primary"
        icon="FullScreen"
        :size="size"
        @click="emits('goFullScreen')"
      >
        <span v-if="isFullscreen">{{ lang.pt.table.endFullScreen }}</span>
        <span v-else>{{ lang.pt.table.startFullScreen }}</span>
      </el-button>
      <!-- 列编辑 -->
      <el-dropdown
        v-if="colSetShow"
        ref="dropdown"
        trigger="click"
      >
        <el-button icon="Setting" :size="size">{{ lang.pt.table.colSet }}</el-button>
        <template #dropdown>
          <el-dropdown-menu>
              <el-scrollbar max-height="60vh">
                <div ref="dropdownMenuBoxRef" class="dropdown-menu-box">
                  <template v-for="(column, index) in tableColumns" :key="index">
                    <div v-if="!column.disabled" class="menu-list-li">
                      <el-button
                        class="drag-handler"
                        type="primary"
                        icon="Rank"
                        link
                      ></el-button>
                      <el-checkbox
                        v-model="column.show"
                        :label="column.label"
                        :size="size"
                      >
                        <template #default>
                          <el-icon v-if="column.colType==='drag'"><Rank /></el-icon>
                          <span v-else>{{ column.label }}</span>
                        </template>
                      </el-checkbox>
                    </div>
                  </template>
                </div>
              </el-scrollbar>
              <!-- <div class="dropdown-menu-box-btn">
                <el-button @click="changeColShow" type="primary" size="small">确认</el-button>
              </div> -->
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
import { type PropType, ref, onMounted } from 'vue';
import { PtTableEditConfigType, PtTableColumnsType } from "@/../types/PtTable/prop";
import { Rank } from "@element-plus/icons-vue"
import Sortable from 'sortablejs'

//#region 参数和方法
const props = defineProps({
  /**
   * 语言包
   */
   lang : {
    type: Object,
    default: {}
  },
  /**
   * 表格列
   * @default []
   */
   tableColumns: {
    type: Array as PropType<PtTableColumnsType>,
    default: () => []
  },
  /**
   * 列设置按钮显示/隐藏
   * @default true
   */
  show: {
    type: Boolean,
    default: true
  },
  /**
   * 尺寸
   * @default ''
   */
  size: {
    type: String as PropType<PtTableEditConfigType['size']>,
    default: ''
  },
  /**
   * 列设置功能
   * @default false
   */
   colSetShow: {
    type: Boolean,
    default: false
  },
  /**
   * 全屏编辑功能
   * @default false
   */
   fullScreen: {
    type: Boolean,
    default: false
  },
  /**
   * 是否全屏
   * @default false
   */
   isFullscreen: {
    type: Boolean,
    default: false
  }
})
const emits = defineEmits(['changeOnlyKey', 'goFullScreen'])
onMounted(() => {
  if (props.show) initSortable() // 初始化拖拽列
})
//#endregion

//#region 表格设置

//#region 列设置
const dropdownMenuBoxRef = ref<HTMLDivElement>()
// 初始化列排序
const sortable = ref<Sortable | null>(null)
const initSortable = () => {
  if (dropdownMenuBoxRef.value) {
    sortable.value = new Sortable(dropdownMenuBoxRef.value, {
      handle: '.drag-handler',
      draggable: '.menu-list-li',
      onEnd: ({ oldIndex, newIndex, from, to, item }) => {
        if (typeof oldIndex === 'number' && typeof newIndex === 'number') {
          // to.removeChild(item)
          // from.insertBefore(item, from.children[oldIndex])
          var currentRow = props.tableColumns.splice(oldIndex, 1)[0]
          props.tableColumns.splice(newIndex, 0, currentRow)
          emits('changeOnlyKey')
        }
      }
    })  
  }
}
//#endregion

//#endregion

</script>
<style lang='scss' scoped src="../../../styles/index.scss"></style>
<style lang='scss' scoped>
.pt-table-edit {
  display: flex;
  gap: 12px;
  justify-content: space-between;
  padding: 6px;
  border: 1px solid #ebeef5;
  border-bottom: none;
  overflow: hidden;
  .pt-default-edit {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    height: fit-content;
    justify-content: flex-end;
  }
}
</style>
  