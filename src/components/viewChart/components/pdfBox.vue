<template>
  <div ref="pdfBox" class="pdfBox">
    <iframe
      v-if="type==='pdfViewer'"
      :src="'/pdf_viewer/index.html?file=' + url"
      frameborder="0"
      style="width: 100%;height: 100%;"
    ></iframe>
    <div v-else class="scrollBox" @click="goEnlarge" :style="{ cursor: showMax?'pointer':'' }">
      <div class="pdfWrapper">
        <VuePdf
          v-for="page in pdfData.numPages"
          :key="page"
          :src="url"
          :page="page"
        />
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { reactive, ref, onMounted, nextTick, getCurrentInstance } from "vue";
import { useRoute } from "vue-router"
import { VuePdf, createLoadingTask } from 'vue3-pdfjs';
//#region 参数和方法
const props = defineProps({
  url: {
    type: String,
    default: ''
  },
  showMax: Boolean,
  type: String,
})
const emits = defineEmits(["goEnlarge"])
const instance: any = getCurrentInstance()
const route = useRoute()
onMounted(() => {
  if (props.type !== 'pdfViewer') {
    init()
  }
})
//#endregion
console.log(route);

//#region pdf预览
const pdfData = reactive<any>({
  pdfDoc: {},
  currentPage: 0,
  numPages: 0,
  loadedRatio: 0,
})
// 初始化
const init = () => {
  console.log('pdfUrl', props.url);
  prohibit()
  const loadingTask = createLoadingTask(props.url)
  loadingTask.promise.then((pdf: any) => {
    console.log(pdf);
    pdfData.numPages = pdf.numPages
    // nextTick(() => setTimeout(() => setScale(), 100))
  })
}
// 禁用鼠标右击
const prohibit = () => {
  nextTick(() => {
    instance.refs.pdfBox.oncontextmenu = () => {
      return false
    }
  })
}
const goEnlarge = () => {
  if (props.showMax) emits('goEnlarge')
}
//#endregion
</script>
<style lang="scss" scoped>
.pdfBox {
  height: 100%;
  .scrollBox {
    height: calc(100% - 36px);
    overflow: auto;
    .pdfWrapper {
      transform-origin: 0 0;
    }
  }
  .controlWrapper {
    width: 100%;
    padding: 4px;
    text-align: center;
  }
}
</style>
