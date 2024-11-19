<template>
  <div class="pt-collapse">
    <div class="pt-collapse-head">
      <div class="pt-collapse-head-title">
        <slot name="title">{{ title }}</slot>
      </div>
      <div class="pt-collapse-head-btn">
        <slot name="head-btn"></slot>
        <el-button
          v-if="!hiddenClose"
          :icon="isActive?'ArrowDown':'ArrowRight'"
          size="small"
          circle
          @click="changeActive(!isActive)"
        ></el-button>
      </div>
    </div>
    <el-collapse-transition>
      <div v-show="isActive">
        <el-divider></el-divider>
        <el-scrollbar class="pt-collapse-content" :style="{ height: contentHeight }">
          <slot></slot>
        </el-scrollbar>
        <div
          v-if="editHeight"
          v-drag
          class="dragLine"
        ></div>
      </div>
    </el-collapse-transition>
  </div>
</template>

<script lang="ts" setup>
import { Directive } from 'vue'
//#region 参数和方法
const props = defineProps({
  /**
   * 标题
   * @default ''
   */
  title: {
    type: String,
    default: ''
  },
  /**
   * 展开/关闭
   * @default true
   */
  active: {
    type: Boolean,
    default: true
  },
  /**
   * 隐藏展开按钮
   * @default false
   */
   hiddenClose: {
    type: Boolean,
    default: false
  },
  /**
   * 拖拽改变高度
   * @default false
   */
   editHeight: {
    type: Boolean,
    default: false
  },
  /**
   * 默认内容高度
   * @default false
   */
   defaultContentHeight: {
    type: String,
    default: '100%'
  },
})
const emits = defineEmits(["update:active", "activeChange"])
//#endregion

const isActive = ref<boolean>(true)
if (props.active === false) isActive.value = props.active
const changeActive = (val: boolean) => {
  isActive.value = val
  emits('activeChange', val)
}

//#region 拖拽修改高度
const contentHeight = ref(props.defaultContentHeight)
const vDrag: Directive = {
  mounted(el) {
    console.log('v-drag', el);
    let starY:number, startHeight:number
    const preDom = el.previousElementSibling
    el.onmousedown = (e: any) => {
      starY = e.clientY
      startHeight = preDom.clientHeight
      e.preventDefault()
      document.onmousemove = (e: any) => {
        const preHeight = startHeight + e.clientY - starY
        if (preHeight > 0) {
          contentHeight.value = startHeight + e.clientY - starY + 'px'
        }
      }
      document.onmouseup = () => {
        document.onmousemove = null
        document.onmouseup = null
      }
    }
  }
}
//#endregion

</script>

<style lang="scss" scoped>
.pt-collapse {
    position: relative;
    padding: 6px;
    background-color: #fff;
    border-radius: 4px;
    border: 1px solid #ebeef5;
    box-shadow: 0px 0px 12px rgba(0, 0, 0, .12);
    &+.pt-collapse {
      margin-top: 16px;
    }
    .pt-collapse-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      min-height: 24px;
      .pt-collapse-head-title {
        font-size: 14px;
        font-weight: bold;
      }
      .pt-collapse-head-btn {
        display: flex;
      }
    }
    .pt-collapse-content {
      .descriptions {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        align-items: center;
        .descriptions-item {
          display: flex;
          gap: 12px;
          align-items: center;
        }
        :deep(.el-button span) {
          font-size: inherit!important;
        }
      }
      .descriptions2 {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        .descriptions-item {
          width: 320px;
          height: 28px;
          display: flex;
          gap: 12px;
          align-items: center;
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
        :deep(.el-button span) {
          font-size: inherit!important;
        }
      }
    }
    .el-divider--horizontal {
      margin: 10px 0 !important;
    }
    .dragLine {
      width: 100%;
      height: 4px;
      margin: 0 1px;
      background-color: #ddd;
      cursor: row-resize;
      &:hover {
          box-shadow: 0 0 0 1px #03328d;
          background-color: #03328d;
      }
    }
  }
</style>
