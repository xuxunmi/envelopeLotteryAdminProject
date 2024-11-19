<template>
	<div v-if="show" class="pt-pagination">
		<el-pagination
			v-bind="$attrs"
			style="display: inline-flex;"
		/>
	</div>
</template>

<script setup lang="ts">
import { type PropType } from 'vue';
import { PtPaginationType } from "@/../types/PtTable/prop";

//#region 参数和方法
const props = defineProps({
	/**
   * 是否显示
   * @default true
   */
	 show: {
		type: Boolean,
		default: true
	}
})
//#endregion

//#region 分页

//#endregion

</script>
<style lang='scss' scoped src="../../../styles/index.scss"></style>
<style lang='scss' scoped>
.pt-pagination {
  display: flex;
  justify-content: flex-end;
	padding: 6px;
	border: 1px solid #ebeef5;
	border-top: none;
}
</style>