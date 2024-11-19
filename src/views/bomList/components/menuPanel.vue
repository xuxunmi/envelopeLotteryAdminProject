<template>
  <ul ref="menuPanelRef" class="menuPanel">
    <li @click="$emit('checkMenu', '物料基础信息')">{{ $t('forwardTypePage.material_title') }}</li>
    <li @click="$emit('checkMenu', '历史版本')">{{ $t('forwardTypePage.historyList_title') }}</li>
  </ul>
</template>

<script>
export default {
  name: 'menuPanel',
  data() {
    return {

    }
  },
  mounted() {
    this.initMenu() // 初始化表格右键菜单
  },
  methods: {
    // 初始化表格右键菜单
    initMenu() {
      document.addEventListener('click', (e) => {
        const menu = this.$refs.menuPanelRef
        if (menu && !menu.contains(e.target)) this.hidden()
      }, false)
    },
    show(event, rect) {
      const menu = this.$refs.menuPanelRef
      //阻止元素发生默认的行为
      event.preventDefault();
      // 根据事件对象中鼠标点击的位置，进行定位
      menu.style.left = event.clientX - rect.x + "px";
      menu.style.top = event.clientY - rect.y + "px";
      // 改变自定义菜单的隐藏与显示
      menu.style.display = "block";
    },
    hidden() {
      const menu = this.$refs.menuPanelRef
      if (menu) menu.style.display = "none";
    }
  }
}
</script>
<style lang='scss' scoped>
.menuPanel {
  position: absolute;
  display: none;
  background-color: #f2f3f5;
  box-shadow: 0 0 8px #d9ecff;
  border: 1px solid #a0cfff;
  z-index: 1000;
  li {
    cursor: pointer;
    padding: 0 6px;
    &:hover {
      background-color: #a0cfff;
    }
    height: 24px;
    line-height: 24px;
  }
}
</style>
