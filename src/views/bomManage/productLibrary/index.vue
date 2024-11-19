<template>
    <div class="app-container">
        <div class="sf-container">
            <div class="sf-container-main">
                <!-- <drop-line left-width="300px" :minDropWidth="[150, 150]">
                  <template #left>
                      <productList class="product-list" />
                  </template>
                  <template #right>
                      <div class="sf-container-main-content">
                          <div class="sf-table-wrapper">
                              <drop-line left-width="40%" :minDropWidth="[150, 150]">
                                  <template #left>
                                      <productFolder class="product-folder" />
                                  </template>
                                  <template #right>
                                      <folderContent class="folder-content" />
                                  </template>
                              </drop-line>
                          </div>
                      </div>
                  </template>
              </drop-line> -->
                <drop-line left-width="400px" :minDropWidth="[150, 150]">
                    <template #left>
                        <productFolder class="product-folder" />
                    </template>
                    <template #right>
                        <folderContent class="folder-content" />
                    </template>
                </drop-line>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import productList from "./components/productList.vue"
import productFolder from "./components/productFolder.vue"
import folderContent from "./components/folderContent.vue"
import DropLine from "@/components/dropLine/index.vue"

//#region 参数和方法
defineOptions({
    name: "productLibrary"
})

//#endregion
</script>

<style lang="scss" scoped>
.sf-container {
    .sf-container-main {
        .product-list {
            width: 100%;
            padding: 10px 10px;
        }
        .sf-container-main-content {
            .sf-table-wrapper {
                .product-folder {
                    width: 100%;
                }
                .folder-content {
                    width: 100%;
                }
            }
        }
    }
}
</style>
