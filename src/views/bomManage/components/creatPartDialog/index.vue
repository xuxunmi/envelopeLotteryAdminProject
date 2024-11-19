<template>
    <div class="fromWrapper">
        <el-form
            v-loading="loading"
            ref="partFormRef"
            :model="partForm"
            :rules="rules"
            :inline="true"
            size="small"
            label-width="164px"
            label-position="right"
        >
            <el-row class="topFormItem">
                <el-col :span="6">
                    <el-form-item :label="t('productLibraryPage.partType') + '：'" prop="partType">
                        <el-select
                            :loading="loading_option"
                            style="width: 180px"
                            v-model="partForm.partType"
                            clearable
                            filterable
                            :disabled="dialogType === 'edit'"
                            @change="handleSelectChange_partType"
                        >
                            <el-option v-for="item in typeList" :key="item.id" :label="item.name" :value="item.id" />
                        </el-select>
                    </el-form-item>
                </el-col>
                <el-col :span="6">
                    <el-form-item :label="t('productLibraryPage.componentType') + '：'" prop="lgPartType">
                        <el-select
                            style="width: 180px"
                            clearable
                            filterable
                            v-model="partForm.lgPartType"
                            @change="handleSelectChange_lgPartType"
                        >
                            <el-option
                                v-for="item in partTypeList"
                                :key="item.id"
                                :label="item.name"
                                :value="item.id"
                            />
                        </el-select>
                    </el-form-item>
                </el-col>
                <el-col :span="6">
                    <el-form-item :label="t('productLibraryPage.selectProduct') + '：'" prop="selectProductOid">
                        <span v-if="dialogType === 'edit'" class="fromWrapper_text">{{ partForm.productName }}</span>
                        <el-select
                            v-else
                            style="width: 180px"
                            clearable
                            filterable
                            v-model="partForm.selectProductOid"
                            @change="handleSelectChange_selectProductOid"
                        >
                            <el-option
                                v-for="item in selectProductList"
                                :key="item.id"
                                :label="item.name"
                                :value="item.id"
                            />
                        </el-select>
                    </el-form-item>
                </el-col>
                <el-col v-if="dialogType !== 'edit'" :span="6">
                    <el-form-item :label="t('productLibraryPage.selectFolder') + '：'" prop="selectFolderOid">
                        <el-tree-select
                            style="width: 180px"
                            v-model="partForm.selectFolderOid"
                            :data="selectFolderList"
                            node-key="oid"
                            lazy
                            :load="loadFolderData"
                            :props="defaultProps"
                            :render-after-expand="false"
                            :cache-data="cacheData"
                            check-strictly
                            check-on-click-node
                            clearable
                            :disabled="dialogType === 'edit'"
                        />
                    </el-form-item>
                </el-col>
            </el-row>
            <pt-collapse :title="t('productLibraryPage.partAttribute')">
                <!-- <dynamicFormItem v-model:modelValue="partForm" :formItems="dynamicsFormItemConfig" /> -->
                <el-row>
                    <el-col :span="8">
                        <el-form-item :label="t('productLibraryPage.code') + '：'" prop="code">
                            <div class="w-full" @click="goEdit_number">
                                <el-input style="width: 180px" v-model="partForm.code" disabled>
                                    <template #suffix>
                                        <el-button
                                            v-if="dialogType === 'add' || dialogType === 'insert'"
                                            type="primary"
                                            icon="Search"
                                            link
                                        />
                                    </template>
                                </el-input>
                                <div class="overlay" />
                            </div>
                        </el-form-item>
                    </el-col>
                    <el-col :span="8">
                        <el-form-item :label="t('productLibraryPage.name') + '：'" prop="name">
                            <el-input
                                style="width: 180px"
                                v-model="partForm.name"
                                :placeholder="t('productLibraryPage.pleaseEnter')"
                            />
                        </el-form-item>
                    </el-col>
                    <el-col :span="8">
                        <el-form-item :label="t('productLibraryPage.symbolCode') + '：'">
                            <el-input
                                style="width: 180px"
                                v-model="partForm.lgDrawingNo"
                                :placeholder="t('productLibraryPage.pleaseEnter')"
                            />
                        </el-form-item>
                    </el-col>
                    <el-col :span="8">
                        <el-form-item :label="t('productLibraryPage.belongCompany') + '：'">
                            <el-input
                                style="width: 180px"
                                v-model="partForm.lgBelongCompany"
                                :placeholder="t('productLibraryPage.pleaseEnter')"
                            />
                        </el-form-item>
                    </el-col>
                    <el-col :span="8">
                        <el-form-item :label="'裁剪方式' + '：'">
                            <el-select
                                :loading="loading_option"
                                style="width: 180px"
                                clearable
                                filterable
                                v-model="partForm.trimMethod"
                            >
                                <el-option
                                    v-for="item in option_trim"
                                    :key="item.id"
                                    :label="item.name"
                                    :value="item.id"
                                />
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <!-- 物料/零部件 -->
                    <template
                        v-if="
                            partForm.partType === 'wt.part.WTPart' ||
                            partForm.partType === 'wt.part.WTPart|com.ptc.ElectricalPart' ||
                            partForm.partType === 'wt.part.WTPart|com.pdinfo.kbomMATERIAL' ||
                            partForm.partType === 'wt.part.WTPart|com.pdinfo.kbomPHANTOM'
                        "
                    >
                        <el-col :span="8">
                            <el-form-item :label="t('productLibraryPage.material') + '：'">
                                <el-input
                                    style="width: 180px"
                                    v-model="partForm.material"
                                    :placeholder="t('productLibraryPage.pleaseEnter')"
                                />
                            </el-form-item>
                        </el-col>
                        <el-col :span="8">
                            <el-form-item :label="t('productLibraryPage.machineModel') + '：'">
                                <el-input
                                    style="width: 180px"
                                    v-model="partForm.lgModel"
                                    :placeholder="t('productLibraryPage.pleaseEnter')"
                                />
                            </el-form-item>
                        </el-col>
                        <el-col :span="8">
                            <el-form-item :label="t('productLibraryPage.impodegree') + '：'">
                                <el-select style="width: 180px" clearable filterable v-model="partForm.lgImpodegree">
                                    <el-option
                                        v-for="item in impodegreeList"
                                        :key="item.id"
                                        :label="item.name"
                                        :value="item.id"
                                    />
                                </el-select>
                            </el-form-item>
                        </el-col>
                        <el-col :span="8">
                            <el-form-item :label="t('productLibraryPage.lifeCycleTemplate') + '：'">
                                <el-select
                                    style="width: 180px"
                                    clearable
                                    filterable
                                    v-model="partForm.lifeCycleTemplate"
                                >
                                    <el-option
                                        v-for="item in lifeCycleTemplateList"
                                        :key="item.id"
                                        :label="item.name"
                                        :value="item.id"
                                    />
                                </el-select>
                            </el-form-item>
                        </el-col>
                        <el-col :span="8">
                            <el-form-item :label="t('productLibraryPage.processStatus') + '：'">
                                <el-select style="width: 180px" clearable filterable v-model="partForm.processStatus">
                                    <el-option
                                        v-for="item in processStatusList"
                                        :key="item.id"
                                        :label="item.name"
                                        :value="item.id"
                                    />
                                </el-select>
                            </el-form-item>
                        </el-col>
                        <el-col :span="8">
                            <el-form-item :label="t('productLibraryPage.weight') + '：'">
                                <el-input-number
                                    style="width: 180px"
                                    v-model="partForm.weight"
                                    :controls="false"
                                    :min="0"
                                    :precision="0"
                                />
                            </el-form-item>
                        </el-col>
                        <el-col :span="8">
                            <el-form-item :label="t('productLibraryPage.grossWeight') + '：'">
                                <el-input-number
                                    style="width: 180px"
                                    v-model="partForm.lgGrossWeight"
                                    :controls="false"
                                    :min="0"
                                    :precision="0"
                                />
                            </el-form-item>
                        </el-col>
                        <el-col :span="8">
                            <el-form-item :label="t('productLibraryPage.rawMaterialCode') + '：'">
                                <el-input
                                    style="width: 180px"
                                    v-model="partForm.lgRawpartCode"
                                    :placeholder="t('productLibraryPage.pleaseEnter')"
                                />
                            </el-form-item>
                        </el-col>
                        <el-col :span="8">
                            <el-form-item :label="t('productLibraryPage.blankStandard') + '：'">
                                <el-input
                                    style="width: 180px"
                                    v-model="partForm.lgBlankStandard"
                                    :placeholder="t('productLibraryPage.pleaseEnter')"
                                />
                            </el-form-item>
                        </el-col>
                        <el-col :span="8">
                            <el-form-item :label="t('productLibraryPage.blankType') + '：'">
                                <el-input
                                    style="width: 180px"
                                    v-model="partForm.lgBlankType"
                                    :placeholder="t('productLibraryPage.pleaseEnter')"
                                />
                            </el-form-item>
                        </el-col>
                        <el-col :span="8">
                            <el-form-item :label="t('productLibraryPage.blankSize') + '：'">
                                <el-input
                                    style="width: 180px"
                                    v-model="partForm.lgBlankSize"
                                    :placeholder="t('productLibraryPage.pleaseEnter')"
                                />
                            </el-form-item>
                        </el-col>
                        <el-col :span="8">
                            <el-form-item :label="t('productLibraryPage.eachBlankNumber') + '：'">
                                <el-input-number
                                    style="width: 180px"
                                    v-model="partForm.lgEachBlankNumber"
                                    :controls="false"
                                    :min="0"
                                    :precision="0"
                                />
                            </el-form-item>
                        </el-col>
                        <el-col :span="8">
                            <el-form-item :label="t('productLibraryPage.feedSection') + '：'">
                                <el-input
                                    style="width: 180px"
                                    v-model="partForm.lgFeedSection"
                                    :placeholder="t('productLibraryPage.pleaseEnter')"
                                />
                            </el-form-item>
                        </el-col>
                        <el-col :span="8">
                            <el-form-item :label="t('productLibraryPage.unit') + '：'">
                                <el-select style="width: 180px" clearable filterable v-model="partForm.lgUnit">
                                    <el-option
                                        v-for="item in unitList"
                                        :key="item.id"
                                        :label="item.name"
                                        :value="item.id"
                                    />
                                </el-select>
                            </el-form-item>
                        </el-col>
                        <el-col :span="8">
                            <el-form-item :label="t('productLibraryPage.mappableUnit') + '：'">
                                <el-select style="width: 180px" clearable filterable v-model="partForm.lgDrawing">
                                    <el-option
                                        v-for="item in drawingList"
                                        :key="item.id"
                                        :label="item.name"
                                        :value="item.id"
                                    />
                                </el-select>
                            </el-form-item>
                        </el-col>
                        <!-- <el-col :span="8">
                            <el-form-item :label="t('productLibraryPage.ownerGroup') + '：'">
                                <el-select style="width: 180px" clearable filterable v-model="partForm.ownerGroup">
                                    <el-option
                                        v-for="item in ownerGroupList"
                                        :key="item.id"
                                        :label="item.name"
                                        :value="item.id"
                                    />
                                </el-select>
                            </el-form-item>
                        </el-col> -->
                        <el-col :span="8">
                            <el-form-item :label="t('productLibraryPage.productPhase') + '：'">
                                <el-select style="width: 180px" clearable filterable v-model="partForm.productPhase">
                                    <el-option
                                        v-for="item in productPhaseList"
                                        :key="item.id"
                                        :label="item.name"
                                        :value="item.id"
                                    />
                                </el-select>
                            </el-form-item>
                        </el-col>
                        <el-col :span="8">
                            <el-form-item :label="t('productLibraryPage.processRoute') + '：'">
                                <el-input
                                    style="width: 180px"
                                    v-model="partForm.lgProRoute"
                                    :placeholder="t('productLibraryPage.pleaseEnter')"
                                />
                            </el-form-item>
                        </el-col>
                        <el-col :span="8">
                            <el-form-item label="描述：">
                                <el-input
                                    style="width: 180px"
                                    v-model="partForm.description"
                                    :placeholder="t('productLibraryPage.pleaseEnter')"
                                />
                            </el-form-item>
                        </el-col>
                        <el-col :span="8">
                            <el-form-item :label="t('productLibraryPage.anotherName') + '：'">
                                <el-input
                                    style="width: 180px"
                                    v-model="partForm.lgAnotherName"
                                    :placeholder="t('productLibraryPage.pleaseEnter')"
                                />
                            </el-form-item>
                        </el-col>
                        <!-- <el-col :span="8">
                            <el-form-item :label="t('productLibraryPage.organizationsPartType') + '：'">
                                <el-select style="width: 180px" clearable v-model="partForm.organizationsPartType">
                                    <el-option
                                        v-for="item in partTypeList"
                                        :key="item.id"
                                        :label="item.name"
                                        :value="item.id"
                                    />
                                </el-select>
                            </el-form-item>
                        </el-col> -->
                        <el-col :span="8">
                            <el-form-item :label="t('productLibraryPage.ssjxPartType') + '：'">
                                <el-select style="width: 180px" clearable filterable v-model="partForm.type1">
                                    <el-option
                                        v-for="item in partTypeList"
                                        :key="item.id"
                                        :label="item.name"
                                        :value="item.id"
                                    />
                                </el-select>
                            </el-form-item>
                        </el-col>
                        <el-col :span="8">
                            <el-form-item :label="t('productLibraryPage.sswjPartType') + '：'">
                                <el-select style="width: 180px" clearable filterable v-model="partForm.type2">
                                    <el-option
                                        v-for="item in partTypeList"
                                        :key="item.id"
                                        :label="item.name"
                                        :value="item.id"
                                    />
                                </el-select>
                            </el-form-item>
                        </el-col>
                        <el-col :span="8">
                            <el-form-item :label="t('productLibraryPage.fjjxPartType') + '：'">
                                <el-select style="width: 180px" clearable filterable v-model="partForm.type3">
                                    <el-option
                                        v-for="item in partTypeList"
                                        :key="item.id"
                                        :label="item.name"
                                        :value="item.id"
                                    />
                                </el-select>
                            </el-form-item>
                        </el-col>
                        <el-col :span="8">
                            <el-form-item :label="t('productLibraryPage.sslmPartType') + '：'">
                                <el-select style="width: 180px" clearable filterable v-model="partForm.type4">
                                    <el-option
                                        v-for="item in partTypeList"
                                        :key="item.id"
                                        :label="item.name"
                                        :value="item.id"
                                    />
                                </el-select>
                            </el-form-item>
                        </el-col>
                        <el-col :span="8">
                            <el-form-item :label="t('productLibraryPage.ssccPartType') + '：'">
                                <el-select style="width: 180px" clearable filterable v-model="partForm.type5">
                                    <el-option
                                        v-for="item in partTypeList"
                                        :key="item.id"
                                        :label="item.name"
                                        :value="item.id"
                                    />
                                </el-select>
                            </el-form-item>
                        </el-col>
                        <el-col :span="8">
                            <el-form-item :label="t('productLibraryPage.ssbjPartType') + '：'">
                                <el-select style="width: 180px" clearable filterable v-model="partForm.type6">
                                    <el-option
                                        v-for="item in partTypeList"
                                        :key="item.id"
                                        :label="item.name"
                                        :value="item.id"
                                    />
                                </el-select>
                            </el-form-item>
                        </el-col>
                        <el-col :span="8">
                            <el-form-item :label="t('productLibraryPage.jxjxPartType') + '：'">
                                <el-select style="width: 180px" clearable filterable v-model="partForm.type7">
                                    <el-option
                                        v-for="item in partTypeList"
                                        :key="item.id"
                                        :label="item.name"
                                        :value="item.id"
                                    />
                                </el-select>
                            </el-form-item>
                        </el-col>
                        <el-col :span="8">
                            <el-form-item :label="t('productLibraryPage.ssyyPartType') + '：'">
                                <el-select style="width: 180px" clearable filterable v-model="partForm.type8">
                                    <el-option
                                        v-for="item in partTypeList"
                                        :key="item.id"
                                        :label="item.name"
                                        :value="item.id"
                                    />
                                </el-select>
                            </el-form-item>
                        </el-col>
                        <el-col :span="8">
                            <el-form-item :label="t('productLibraryPage.fjyyPartType') + '：'">
                                <el-select style="width: 180px" clearable filterable v-model="partForm.type9">
                                    <el-option
                                        v-for="item in partTypeList"
                                        :key="item.id"
                                        :label="item.name"
                                        :value="item.id"
                                    />
                                </el-select>
                            </el-form-item>
                        </el-col>
                        <el-col :span="8">
                            <el-form-item :label="t('productLibraryPage.fjqxPartType') + '：'">
                                <el-select style="width: 180px" clearable filterable v-model="partForm.type10">
                                    <el-option
                                        v-for="item in partTypeList"
                                        :key="item.id"
                                        :label="item.name"
                                        :value="item.id"
                                    />
                                </el-select>
                            </el-form-item>
                        </el-col>
                        <el-col :span="8">
                            <el-form-item :label="t('productLibraryPage.fjdzPartType') + '：'">
                                <el-select style="width: 180px" clearable filterable v-model="partForm.type11">
                                    <el-option
                                        v-for="item in partTypeList"
                                        :key="item.id"
                                        :label="item.name"
                                        :value="item.id"
                                    />
                                </el-select>
                            </el-form-item>
                        </el-col>
                        <el-col :span="8">
                            <el-form-item :label="t('productLibraryPage.jgyyPartType') + '：'">
                                <el-select style="width: 180px" clearable filterable v-model="partForm.type12">
                                    <el-option
                                        v-for="item in partTypeList"
                                        :key="item.id"
                                        :label="item.name"
                                        :value="item.id"
                                    />
                                </el-select>
                            </el-form-item>
                        </el-col>
                        <el-col :span="8">
                            <el-form-item :label="t('productLibraryPage.fjwjPartType') + '：'">
                                <el-select style="width: 180px" clearable filterable v-model="partForm.type13">
                                    <el-option
                                        v-for="item in partTypeList"
                                        :key="item.id"
                                        :label="item.name"
                                        :value="item.id"
                                    />
                                </el-select>
                            </el-form-item>
                        </el-col>
                        <el-col :span="8">
                            <el-form-item :label="t('productLibraryPage.fjpjPartType') + '：'">
                                <el-select style="width: 180px" clearable filterable v-model="partForm.type14">
                                    <el-option
                                        v-for="item in partTypeList"
                                        :key="item.id"
                                        :label="item.name"
                                        :value="item.id"
                                    />
                                </el-select>
                            </el-form-item>
                        </el-col>
                        <el-col :span="8">
                            <el-form-item :label="t('productLibraryPage.planningMethod') + '：'">
                                <el-select style="width: 180px" clearable filterable v-model="partForm.planningMethod">
                                    <el-option
                                        v-for="item in planningMethodList"
                                        :key="item.id"
                                        :label="item.name"
                                        :value="item.id"
                                    />
                                </el-select>
                            </el-form-item>
                        </el-col>
                        <el-col :span="8">
                            <el-form-item :label="t('productLibraryPage.projectMethod') + '：'">
                                <el-select style="width: 180px" clearable filterable v-model="partForm.projectMethod">
                                    <el-option
                                        v-for="item in projectMethodList"
                                        :key="item.id"
                                        :label="item.name"
                                        :value="item.id"
                                    />
                                </el-select>
                            </el-form-item>
                        </el-col>
                        <el-col :span="8">
                            <el-form-item :label="t('productLibraryPage.zzjissueStock') + '：'">
                                <el-select
                                    style="width: 180px"
                                    clearable
                                    filterable
                                    v-model="partForm.fjzzjissueStock2"
                                >
                                    <el-option
                                        v-for="item in zzjissueStockList"
                                        :key="item.id"
                                        :label="item.name"
                                        :value="item.id"
                                    />
                                </el-select>
                            </el-form-item>
                        </el-col>
                        <el-col :span="8">
                            <el-form-item :label="t('productLibraryPage.fjzzjissueStock') + '：'">
                                <el-select style="width: 180px" clearable filterable v-model="partForm.fjzzjissueStock">
                                    <el-option
                                        v-for="item in fjzzjissueStockList"
                                        :key="item.id"
                                        :label="item.name"
                                        :value="item.id"
                                    />
                                </el-select>
                            </el-form-item>
                        </el-col>
                        <!-- <el-col
                            :span="8"
                            v-if="
                                dialogType === 'edit' &&
                                (partForm.partType === 'wt.part.WTPart' ||
                                    partForm.partType === 'wt.part.WTPart|com.ptc.ElectricalPart' ||
                                    partForm.partType === 'wt.part.WTPart|com.pdinfo.kbomMATERIAL')
                            "
                        >
                            <el-form-item :label="t('productLibraryPage.syncTime') + '：'">
                                <el-date-picker
                                    disabled
                                    style="width: 180px"
                                    v-model="partForm.syncTime"
                                    type="date"
                                    format="YYYY-MM-DD HH:mm:ss"
                                    value-format="YYYY-MM-DD HH:mm:ss"
                                />
                            </el-form-item>
                        </el-col> -->
                    </template>
                    <!-- 模块 -->
                    <template v-else-if="partForm.partType === 'wt.part.WTPart|com.pdinfo.kbomMODULE'">
                        <el-col :span="8">
                            <el-form-item :label="t('productLibraryPage.machineModel') + '：'">
                                <el-input
                                    style="width: 180px"
                                    v-model="partForm.lgModel"
                                    :placeholder="t('productLibraryPage.pleaseEnter')"
                                />
                            </el-form-item>
                        </el-col>
                        <el-col :span="8">
                            <el-form-item :label="t('productLibraryPage.lifeCycleTemplate') + '：'">
                                <el-select
                                    style="width: 180px"
                                    clearable
                                    filterable
                                    v-model="partForm.lifeCycleTemplate"
                                >
                                    <el-option
                                        v-for="item in lifeCycleTemplateList"
                                        :key="item.id"
                                        :label="item.name"
                                        :value="item.id"
                                    />
                                </el-select>
                            </el-form-item>
                        </el-col>
                        <el-col :span="8">
                            <el-form-item :label="t('productLibraryPage.unit') + '：'">
                                <el-select style="width: 180px" clearable filterable v-model="partForm.lgUnit">
                                    <el-option
                                        v-for="item in unitList"
                                        :key="item.id"
                                        :label="item.name"
                                        :value="item.id"
                                    />
                                </el-select>
                            </el-form-item>
                        </el-col>
                        <el-col :span="8">
                            <el-form-item :label="t('productLibraryPage.productPhase') + '：'">
                                <el-select style="width: 180px" clearable filterable v-model="partForm.productPhase">
                                    <el-option
                                        v-for="item in productPhaseList"
                                        :key="item.id"
                                        :label="item.name"
                                        :value="item.id"
                                    />
                                </el-select>
                            </el-form-item>
                        </el-col>
                        <el-col :span="8">
                            <el-form-item label="描述：">
                                <el-input
                                    style="width: 180px"
                                    v-model="partForm.description"
                                    :placeholder="t('productLibraryPage.pleaseEnter')"
                                />
                            </el-form-item>
                        </el-col>
                        <!-- <el-col :span="8">
                            <el-form-item :label="t('productLibraryPage.ownerGroup') + '：'">
                                <el-select style="width: 180px" clearable v-model="partForm.ownerGroup">
                                    <el-option
                                        v-for="item in ownerGroupList"
                                        :key="item.id"
                                        :label="item.name"
                                        :value="item.id"
                                    />
                                </el-select>
                            </el-form-item>
                        </el-col> -->
                    </template>
                    <!-- 整机配置 -->
                    <template v-else-if="partForm.partType === 'wt.part.WTPart|com.pdinfo.kbomCAR'">
                        <el-col :span="8">
                            <el-form-item :label="'产品类型' + '：'" prop="productType">
                                <el-select
                                    v-model="partForm.productType"
                                    clearable
                                    filterable
                                    style="width: 180px"
                                    @change="handleProductTypeChange"
                                >
                                    <el-option
                                        v-for="item in multiLevelDictionaryProductTypeList"
                                        :key="item.oid"
                                        :label="item.name"
                                        :value="item.code"
                                    />
                                </el-select>
                            </el-form-item>
                        </el-col>
                        <el-col :span="8">
                            <el-form-item :label="'产品线' + '：'" prop="productLineChild">
                                <el-select
                                    v-model="partForm.productLineChild"
                                    clearable
                                    filterable
                                    style="width: 180px"
                                    @change="handleProductLineChildChange"
                                >
                                    <el-option
                                        v-for="item in multiLevelDictionaryProductLineList"
                                        :key="item.oid"
                                        :label="item.name"
                                        :value="item.code"
                                    />
                                </el-select>
                            </el-form-item>
                        </el-col>
                        <el-col :span="8">
                            <el-form-item :label="'产品子线' + '：'" prop="productSubLine">
                                <el-select v-model="partForm.productSubLine" clearable filterable style="width: 180px">
                                    <el-option
                                        v-for="item in multiLevelDictionaryProductSubLineList"
                                        :key="item.oid"
                                        :label="item.name"
                                        :value="item.code"
                                    />
                                </el-select>
                            </el-form-item>
                        </el-col>
                        <el-col :span="8">
                            <el-form-item :label="t('productLibraryPage.machineModel') + '：'">
                                <el-input
                                    style="width: 180px"
                                    v-model="partForm.lgModel"
                                    :placeholder="t('productLibraryPage.pleaseEnter')"
                                />
                            </el-form-item>
                        </el-col>
                        <el-col :span="8">
                            <el-form-item :label="t('productLibraryPage.lifeCycleTemplate') + '：'">
                                <el-select
                                    style="width: 180px"
                                    clearable
                                    filterable
                                    v-model="partForm.lifeCycleTemplate"
                                >
                                    <el-option
                                        v-for="item in lifeCycleTemplateList"
                                        :key="item.id"
                                        :label="item.name"
                                        :value="item.id"
                                    />
                                </el-select>
                            </el-form-item>
                        </el-col>
                        <el-col :span="8">
                            <el-form-item :label="t('productLibraryPage.unit') + '：'">
                                <el-select style="width: 180px" clearable filterable v-model="partForm.lgUnit">
                                    <el-option
                                        v-for="item in unitList"
                                        :key="item.id"
                                        :label="item.name"
                                        :value="item.id"
                                    />
                                </el-select>
                            </el-form-item>
                        </el-col>
                        <el-col :span="8">
                            <el-form-item :label="t('productLibraryPage.productPhase') + '：'">
                                <el-select style="width: 180px" clearable filterable v-model="partForm.productPhase">
                                    <el-option
                                        v-for="item in productPhaseList"
                                        :key="item.id"
                                        :label="item.name"
                                        :value="item.id"
                                    />
                                </el-select>
                            </el-form-item>
                        </el-col>
                        <el-col :span="8">
                            <el-form-item :label="t('productLibraryPage.planningMethod') + '：'">
                                <el-select style="width: 180px" clearable filterable v-model="partForm.planningMethod">
                                    <el-option
                                        v-for="item in planningMethodList"
                                        :key="item.id"
                                        :label="item.name"
                                        :value="item.id"
                                    />
                                </el-select>
                            </el-form-item>
                        </el-col>
                        <el-col :span="8">
                            <el-form-item :label="t('productLibraryPage.projectMethod') + '：'">
                                <el-select style="width: 180px" clearable filterable v-model="partForm.projectMethod">
                                    <el-option
                                        v-for="item in projectMethodList"
                                        :key="item.id"
                                        :label="item.name"
                                        :value="item.id"
                                    />
                                </el-select>
                            </el-form-item>
                        </el-col>
                        <el-col :span="8">
                            <el-form-item :label="t('productLibraryPage.zzjissueStock') + '：'">
                                <el-select
                                    style="width: 180px"
                                    clearable
                                    filterable
                                    v-model="partForm.fjzzjissueStock2"
                                >
                                    <el-option
                                        v-for="item in zzjissueStockList"
                                        :key="item.id"
                                        :label="item.name"
                                        :value="item.id"
                                    />
                                </el-select>
                            </el-form-item>
                        </el-col>
                        <el-col :span="8">
                            <el-form-item :label="t('productLibraryPage.fjzzjissueStock') + '：'">
                                <el-select style="width: 180px" clearable filterable v-model="partForm.fjzzjissueStock">
                                    <el-option
                                        v-for="item in fjzzjissueStockList"
                                        :key="item.id"
                                        :label="item.name"
                                        :value="item.id"
                                    />
                                </el-select>
                            </el-form-item>
                        </el-col>
                        <el-col :span="8">
                            <el-form-item label="描述：">
                                <el-input
                                    style="width: 180px"
                                    v-model="partForm.description"
                                    :placeholder="t('productLibraryPage.pleaseEnter')"
                                />
                            </el-form-item>
                        </el-col>
                        <el-col :span="8">
                            <el-form-item :label="t('productLibraryPage.mappableUnit') + '：'">
                                <el-select style="width: 180px" clearable filterable v-model="partForm.lgDrawing">
                                    <el-option
                                        v-for="item in drawingList"
                                        :key="item.id"
                                        :label="item.name"
                                        :value="item.id"
                                    />
                                </el-select>
                            </el-form-item>
                        </el-col>
                        <!-- <el-col :span="8">
                            <el-form-item :label="t('productLibraryPage.ownerGroup') + '：'">
                                <el-select style="width: 180px" clearable v-model="partForm.ownerGroup">
                                    <el-option
                                        v-for="item in ownerGroupList"
                                        :key="item.id"
                                        :label="item.name"
                                        :value="item.id"
                                    />
                                </el-select>
                            </el-form-item>
                        </el-col> -->
                    </template>
                    <!-- 编辑时展示控件 -->
                    <template v-if="dialogType === 'edit'">
                        <el-col :span="8">
                            <el-form-item :label="t('productLibraryPage.version') + '：'">
                                <el-input v-model="partForm.version" disabled style="width: 180px" />
                            </el-form-item>
                        </el-col>
                        <el-col :span="8">
                            <el-form-item :label="t('productLibraryPage.owner') + '：'">
                                <el-select v-model="partForm.owner" disabled style="width: 180px">
                                    <el-option
                                        v-for="item in ownerList"
                                        :key="item.id"
                                        :label="item.name"
                                        :value="item.id"
                                    />
                                </el-select>
                            </el-form-item>
                        </el-col>
                        <el-col :span="8">
                            <el-form-item :label="t('productLibraryPage.checkoutBy') + '：'">
                                <el-select v-model="partForm.checkOuter" disabled style="width: 180px">
                                    <el-option
                                        v-for="item in checkoutByList"
                                        :key="item.id"
                                        :label="item.name"
                                        :value="item.id"
                                    />
                                </el-select>
                            </el-form-item>
                        </el-col>
                        <el-col :span="8">
                            <el-form-item :label="t('productLibraryPage.checkoutTime') + '：'">
                                <el-date-picker
                                    v-model="partForm.checkTime"
                                    disabled
                                    type="date"
                                    format="YYYY-MM-DD HH:mm:ss"
                                    value-format="YYYY-MM-DD HH:mm:ss"
                                    style="width: 180px"
                                />
                            </el-form-item>
                        </el-col>
                        <el-col :span="8">
                            <el-form-item :label="t('productLibraryPage.modifor') + '：'">
                                <el-select v-model="partForm.modifor" disabled style="width: 180px">
                                    <el-option
                                        v-for="item in modiforList"
                                        :key="item.id"
                                        :label="item.name"
                                        :value="item.id"
                                    />
                                </el-select>
                            </el-form-item>
                        </el-col>
                        <el-col :span="8">
                            <el-form-item :label="t('productLibraryPage.modifyTime') + '：'">
                                <el-date-picker
                                    v-model="partForm.modifyTime"
                                    disabled
                                    type="date"
                                    format="YYYY-MM-DD HH:mm:ss"
                                    value-format="YYYY-MM-DD HH:mm:ss"
                                    style="width: 180px"
                                />
                            </el-form-item>
                        </el-col>
                        <el-col :span="8">
                            <el-form-item :label="t('productLibraryPage.releaseTime') + '：'">
                                <el-date-picker
                                    v-model="partForm.papproveTime"
                                    disabled
                                    type="date"
                                    format="YYYY-MM-DD HH:mm:ss"
                                    value-format="YYYY-MM-DD HH:mm:ss"
                                    style="width: 180px"
                                />
                            </el-form-item>
                        </el-col>
                        <el-col :span="8">
                            <el-form-item :label="t('productLibraryPage.creator') + '：'">
                                <el-input v-model="partForm.creator" disabled style="width: 180px" />
                            </el-form-item>
                        </el-col>
                        <el-col :span="8">
                            <el-form-item :label="t('productLibraryPage.createTime') + '：'">
                                <el-date-picker
                                    v-model="partForm.createTime"
                                    disabled
                                    type="date"
                                    format="YYYY-MM-DD HH:mm:ss"
                                    value-format="YYYY-MM-DD HH:mm:ss"
                                    style="width: 180px"
                                />
                            </el-form-item>
                        </el-col>
                    </template>
                    <!-- 零部件 -->
                    <template v-if="partForm.partType === 'wt.part.WTPart|com.pdinfo.kbomPHANTOM'">
                        <el-col :span="8">
                            <el-form-item :label="'预计划分类' + '：'">
                                <el-select
                                    :loading="loading_option"
                                    style="width: 180px"
                                    clearable
                                    filterable
                                    v-model="partForm.preparePlanType"
                                >
                                    <el-option
                                        v-for="item in option_prePlanType"
                                        :key="item.id"
                                        :label="item.name"
                                        :value="item.id"
                                    />
                                </el-select>
                            </el-form-item>
                        </el-col>
                    </template>
                </el-row>
            </pt-collapse>
        </el-form>

        <!-- 编号 - 编辑弹窗 -->
        <ConfigNumberDialog
            v-if="configNumberDialog.visible"
            :dialog="configNumberDialog"
            @handleEditSuccess="handleEditSuccess_number"
        />

        <div class="mt-6 text-center">
            <el-button :loading="loading" size="small" type="primary" @click="handleConfirm(partFormRef)"
                >保存</el-button
            >
            <el-button size="small" type="primary" @click="emits('update:visible')">{{
                t("productLibraryPage.cancel")
            }}</el-button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from "vue"
import type { FormInstance, FormRules } from "element-plus"
import type Node from "element-plus/es/components/tree/src/model/node"
import PtCollapse from "@/components/ptCollapse/index.vue"
// import dynamicFormItem from "@/components/dynamicFormItem/index.vue"
import ConfigNumberDialog from "@/views/bomManage/productLibrary/components/configNumberDialog.vue"
import {
    unitList,
    partTypeList,
    impodegreeList,
    processStatusList,
    drawingList,
    lifeCycleTemplateList,
    ownerGroupList,
    productPhaseList,
    zzjissueStockList,
    fjzzjissueStockList,
    projectMethodList,
    planningMethodList
} from "@/assets/common/select-list"
import { SelectInterface } from "@/interface/common"
import { ProductListDataInterface } from "@/interface/product"
import { createPart, productList } from "@/api/productLibrary"
import { workspaceLazyChildrenNode } from "@/api/productMange/materiel"
import { getDocumentPartDetails } from "@/api/productDetail"
import { bomInsertPart } from "@/api/bomManage/productBom/index"
import { getDictionarySelect } from "@/api/system/dataDictionary"
import { multiLevelDictionaryData } from "@/api/system/multiLevelDictionary"
import { recursionArray } from "@/utils"
import { useI18n } from "vue-i18n"

//#region 参数和方法
defineOptions({
    name: "creatPartDialog"
})

const { t } = useI18n()

const props = defineProps({
    visible: {
        type: Boolean,
        required: true
    },
    currentRowData: {
        type: Object,
        default: () => ({})
    },
    parentNodeData: {
        type: Object,
        default: () => ({})
    },
    // 工作区树节点
    currentTreeNodeData: {
        type: Object,
        default: () => ({})
    },
    // 产品oid
    grandparentProductOid: {
        type: String,
        default: ""
    },
    // 页面默认创建类型
    defaultPartType: {
        type: String,
        default: "物料"
    },
    // 弹窗类型：add, edit, insert
    dialogType: {
        type: String,
        default: "add"
    }
})
console.log("props.currentRowData:", props.currentRowData)

const emits = defineEmits(["update:visible", "confirmSuccess"])
const loading = ref(false)
//#endregion

//#region 表单
// 所有者列表
const ownerList = ref<SelectInterface[]>([])
// 检出者列表
const checkoutByList = ref<SelectInterface[]>([])
// 修改者列表
const modiforList = ref<SelectInterface[]>([])

// 产品列表
const selectProductList = ref<SelectInterface[]>([])
// 文件夹列表
const selectFolderList = ref<ProductListDataInterface[]>([])
// 表单配置

const partFormRef = ref<FormInstance>()
const partForm = reactive({
    oid: "",
    partType: "wt.part.WTPart|com.pdinfo.kbomPHANTOM", // 类型
    selectProductOid: "", // 选择产品
    selectFolderOid: "", // 选择文件夹
    code: "", // 编号
    name: "", // 名称
    lifeCycleTemplate: "编制", // 生命周期
    lgDrawingNo: "", // 代号
    material: "", // 材料
    lgPartType: "自制零件", // 零件类型
    lgModel: "", // 机型号
    lgImpodegree: "N/A", // 关重件特性
    processStatus: "无工艺", // 工艺状态
    weight: undefined, // 单件净重
    lgGrossWeight: undefined, // 单件毛重
    lgRawpartCode: "", // 原材料编码
    lgSpec: "", // 原材料规格
    lgBlankStandard: "", // 毛胚规格
    lgBlankSize: "", // 毛坯外形尺寸
    lgBlankType: "", // 毛胚种类
    lgEachBlankNumber: undefined, // 毛胚件数
    lgFeedSection: "", // 下料工段
    lgUnit: "pcs", // 单位
    lgDrawing: "A4", // 图幅
    ownerGroup: "", // 所属用户组
    productPhase: "设计", // 阶段标识
    lgProRoute: "", // 工艺路线
    description: "", // 描述
    version: "", // 版本
    owner: "", // 所有者
    checkOuter: "", // 检出者
    checkTime: "", // 检出时间
    modifor: "", // 修改者
    modifyTime: "", // 修改时间
    papproveTime: "", // 发布时间
    createTime: "", // 创建时间
    creator: "", // 创建者
    lgBelongCompany: "", // 所属公司
    lgAnotherName: "", // 别名
    planningMethod: "MRP规划", // 规划方法
    projectMethod: "MRP", // 计划方法
    fjzzjissueStock2: "配套库", // 装载机发料仓库
    fjzzjissueStock: "配套仓库", // 福建装载机发料仓库
    syncTime: "", // 同步时间
    type1: "自制零件", // 上海机械零件类型
    type2: "自制零件", // 上海挖机零件类型
    type3: "自制零件", // 福建机械零件类型
    type4: "自制零件", // 上海路面零件类型自制零件
    type5: "自制零件", // 上海叉车零件类型
    type6: "自制零件", // 上海部件零件类型
    type7: "自制零件", // 江西机械零件类型
    type8: "自制零件", // 上海液压零件类型
    type9: "自制零件", // 福建液压零件类型
    type10: "自制零件", // 福建桥箱零件类型
    type11: "自制零件", // 福建铸锻零件类型
    type12: "自制零件", // 精工液压零件类型
    type13: "自制零件", // 福建挖机零件类型
    type14: "自制零件", // 福建配件零件类型
    preparePlanType: "", // 预计划分类
    productType: "", // 产品类型
    productLineChild: "", // 产品线
    productSubLine: "", // 产品子线
    trimMethod: "", // 裁剪方式
    productName: "", // 组织名称
    viewName: "" // 显示规则类型名称
})
const rules = reactive<FormRules>({
    partType: [{ required: true, message: t("productLibraryPage.requiredFields"), trigger: "change" }],
    lgPartType: [{ required: true, message: t("productLibraryPage.requiredFields"), trigger: "change" }],
    selectProductOid: [{ required: true, message: t("productLibraryPage.requiredFields"), trigger: "change" }],
    selectFolderOid: [{ required: true, message: t("productLibraryPage.requiredFields"), trigger: "change" }],
    code: [{ required: true, message: t("productLibraryPage.requiredFields"), trigger: ["blur", "change"] }],
    name: [{ required: true, message: t("productLibraryPage.requiredFields"), trigger: "blur" }],
    productType: [{ required: true, message: "必填项不能为空！", trigger: "change" }],
    productLineChild: [{ required: true, message: "必填项不能为空！", trigger: "change" }],
    productSubLine: [{ required: true, message: "必填项不能为空！", trigger: "change" }]

    // lgDrawingNo: [{ required: true, message: "请输入代号！", trigger: "blur" }]
    // material: [{ required: true, message: "请输入材料！", trigger: "blur" }],
})
// 懒加载节点的缓存数据，结构与数据相同，用于获取未加载数据的标签
const cacheData = ref<any[]>([])
const defaultProps = {
    value: "oid",
    label: "name",
    children: "children",
    isLeaf: "hasChildren"
}
//#region 选择产品库
// 获取产品库列表
const getProductList = async () => {
    try {
        const { data } = (await productList()) as { data: any }
        console.log("data: ", data)
        selectProductList.value =
            data.map((item: { oid: string; name: string }) => {
                return {
                    id: item.oid,
                    name: item.name
                }
            }) || []
    } catch (err: any) {
        console.log(err)
    }
}

getProductList()

// 处理选择产品选择
const handleSelectChange_selectProductOid = (value: string) => {
    Object.assign(partForm, {
        ...partForm,
        selectFolderOid: ""
    })
    selectFolderList.value = []
    getWorkspaceLazyNodeList(value, undefined)
}

// 获取工作区懒加载子节点树
const getWorkspaceLazyNodeList = async (oid: string, details: any) => {
    try {
        loading.value = true
        const params: {
            oid: string
            flag: number
            pdmLinkProductOid: string
        } = {
            oid: "0",
            flag: 1,
            pdmLinkProductOid: oid
        }
        const { data } = (await workspaceLazyChildrenNode(params)) as { data: any }
        const newData = data.map((item: any) => {
            return {
                oid: item.oidStr,
                pid: item.pidStr,
                name: item.name,
                type: item.type,
                sort: item.sort,
                flag: item.flag,
                pdmLinkProductOid: item.pdmLinkProductOid,
                children: item.children ? item.children : [],
                hasChildren: item.hasChildren ? false : true
            }
        })
        selectFolderList.value = newData
        if (details) {
            const { oid, pdmLinkProductOid, ProductOid, FolderOid } = details
            Object.assign(partForm, {
                ...partForm,
                selectProductOid: pdmLinkProductOid || ProductOid,
                selectFolderOid: oid || FolderOid
            })
        }
        loading.value = false
    } catch (err: any) {
        loading.value = false
        console.log(err)
    }
}

const loadFolderData = async (node: Node, resolve: (data: any[]) => void) => {
    console.log("懒加载node: ", node)
    if (node.data.oid) {
        try {
            loading.value = true
            const params: {
                oid: string
                flag: number
                pdmLinkProductOid: string
            } = {
                oid: node.data.oid,
                flag: node.data.flag,
                pdmLinkProductOid: node.data.pdmLinkProductOid
            }
            const { data } = (await workspaceLazyChildrenNode(params)) as { data: any }
            const newData = data.map((item: any) => {
                return {
                    oid: item.oidStr,
                    pid: item.pidStr,
                    name: item.name,
                    type: item.type,
                    sort: item.sort,
                    flag: item.flag,
                    pdmLinkProductOid: item.pdmLinkProductOid,
                    children: item.children ? item.children : [],
                    hasChildren: item.hasChildren ? false : true
                }
            })
            node.data.children = newData
            loading.value = false
            resolve(newData)
        } catch (err: any) {
            console.log(err)
            loading.value = false
        }
    }
}
//#endregion

// 获取物料详情
const getPartDetail = async (rowData: any) => {
    try {
        loading.value = true
        const params: {
            oid: string
            type: string
        } = {
            oid: rowData.oid,
            type: rowData.type
        }
        const { data } = (await getDocumentPartDetails(params)) as { data: any }
        // 回显数据
        // 根据产品类型回显产品线
        if (data.productType) {
            handleProductTypeChange(data.productType)
        }
        // 根据产品线回显产品子线
        if (data.productLineChild) {
            handleProductLineChildChange(data.productLineChild)
        }
        Object.assign(partForm, {
            oid: data.oid,
            partType: data.materialType, // 类型
            lgPartType: data.partCategory, // 零件类型
            selectProductOid: data.productOid, // 选择产品
            selectFolderOid: data.folderOid, // 选择文件夹
            code: data.number, // 编号
            name: data.name, // 名称
            lgDrawingNo: data.materialSymbol, // 代号
            material: data.material, // 材料
            lgModel: data.machineModel, // 机型号
            lgImpodegree: data.importantDegree, // 关重件特性
            lifeCycleTemplate: data.lifeCycle, // 生命周期
            processStatus: data.processState, // 工艺状态
            weight: +data.netWeight, // 单件净重
            lgGrossWeight: +data.grossWeight, // 单件毛重
            lgRawpartCode: data.rawPartCode, // 原材料编码
            lgBlankStandard: data.blankSpecification, // 毛胚规格
            lgBlankSize: data.blankSize, // 毛坯外形尺寸
            lgBlankType: data.blankType, // 毛胚种类
            lgEachBlankNumber: +data.blankNumber, // 毛胚件数
            lgFeedSection: data.feedSection, // 下料工段
            lgUnit: data.unit, // 单位
            lgDrawing: data.drawing, // 图幅
            ownerGroup: data.ownerGroup, // 所属用户组
            productPhase: data.productPhase, // 阶段标识
            lgProRoute: data.processRoute, // 工艺路线
            description: data.desc, // 描述
            lgBelongCompany: data.belongCompany, // 所属公司
            lgAnotherName: data.anotherName, // 别名
            planningMethod: data.layout, // 规划方法
            projectMethod: data.planMethod, // 计划方法
            fjzzjissueStock2: data.loaderIssuingStock, // 装载机发料仓库
            fjzzjissueStock: data.fujianLoaderIssuingStock, // 福建装载机发料仓库
            syncTime: data.synchronizationTime, // 同步时间
            type1: data.shanghaiMechanicalPartType, // 上海机械零件类型
            type2: data.shanghaiExcavatorPartsType, // 上海挖机零件类型
            type3: data.fujianMechanicalPartType, // 福建机械零件类型
            type4: data.shanghaiRoadbedPartType, // 上海路面零件类型自制零件
            type5: data.shanghaiForkliftPartType, // 上海叉车零件类型
            type6: data.shanghaiComponentPartType, // 上海部件零件类型
            type7: data.jiangxiMechanicalPartType, // 江西机械零件类型
            type8: data.shanghaiHydraulicPartType, // 上海液压零件类型
            type9: data.fujianHydraulicPartType, // 福建液压零件类型
            type10: data.fujianBridgeBoxPartType, // 福建桥箱零件类型
            type11: data.fujianCastPartType, // 福建铸锻零件类型
            type12: data.precisionHydraulicPartType, // 精工液压零件类型
            type13: data.fujianExcavatorPartType, // 福建挖机零件类型
            type14: data.fujianSparePartsType, // 福建配件零件类型
            version: data.version, // 版本
            owner: data.owner, // 所有者
            // checkOuter: data.checkOuter, // 检出者
            // checkTime: data.checkTime, // 检出时间
            modifor: data.updater, // 修改者
            modifyTime: data.updateTime, // 修改时间
            // papproveTime: "" // 发布时间
            createTime: data.createTime, // 创建时间
            creator: data.creator, // 创建者
            preparePlanType: data.preparePlanType, // 预计划分类
            productType: data.productType, // 产品类型
            productLineChild: data.productLineChild, // 产品线
            productSubLine: data.productSubLine, // 产品子线
            trimMethod: data.trimMethod, // 裁剪方式
            productName: data.productName, // 组织名称
            viewName: data.view // 显示规则类型名称
        })
    } catch (err: any) {
        console.log(err)
    } finally {
        loading.value = false
    }
}

// 处理保存按钮
const handleConfirm = async (formEl: FormInstance | undefined) => {
    if (!formEl) return
    await formEl.validate(async (valid) => {
        if (valid) {
            try {
                let params: {
                    oid?: string
                    materialType: string // 类型
                    partCategory: string // 零件类型
                    productOid: string // 选择产品
                    pid: string // 选择文件夹
                    number: string // 编号
                    name: string // 名称
                    materialSymbol?: string // 代号
                    material?: string // 材料
                    machineModel?: string // 机型号
                    importantDegree?: string // 关重件特性
                    lifeCycle?: string // 生命周期
                    processState?: string // 工艺状态
                    netWeight?: number // 单件净重
                    grossWeight?: number // 单件毛重
                    rawPartCode?: string // 原材料编码
                    blankSpecification?: string // 毛胚规格
                    blankSize?: string // 毛坯外形尺寸
                    blankType?: string // 毛胚种类
                    blankNumber?: number // 毛胚件数
                    feedSection?: string // 下料工段
                    unit?: string // 单位
                    drawing?: string // 图幅
                    ownerGroup?: string // 所属用户组
                    productPhase?: string // 阶段标识
                    processRoute?: string // 工艺路线
                    desc?: string // 描述
                    // version: "" // 版本
                    owner?: string // 所有者
                    // checkOuter: "" // 检出者
                    // checkTime: "" // 检出时间
                    // modifor: "" // 修改者
                    // modifyTime: "" // 修改时间
                    // papproveTime: "" // 发布时间
                    // createTime: "" // 创建时间
                    // creator: "" // 创建者
                    belongCompany?: string // 所属公司
                    anotherName?: string // 别名
                    layout?: string // 规划方法
                    planMethod?: string // 计划方法
                    loaderIssuingStock?: string // 装载机发料仓库
                    fujianLoaderIssuingStock?: string // 福建装载机发料仓库
                    synchronizationTime?: string // 同步时间
                    shanghaiMechanicalPartType?: string // 上海机械零件类型
                    shanghaiExcavatorPartsType?: string // 上海挖机零件类型
                    fujianMechanicalPartType?: string // 福建机械零件类型
                    shanghaiRoadbedPartType?: string // 上海路面零件类型自制零件
                    shanghaiForkliftPartType?: string // 上海叉车零件类型
                    shanghaiComponentPartType?: string // 上海部件零件类型
                    jiangxiMechanicalPartType?: string // 江西机械零件类型
                    shanghaiHydraulicPartType?: string // 上海液压零件类型
                    fujianHydraulicPartType?: string // 福建液压零件类型
                    fujianBridgeBoxPartType?: string // 福建桥箱零件类型
                    fujianCastPartType?: string // 福建铸锻零件类型
                    precisionHydraulicPartType?: string // 精工液压零件类型
                    fujianExcavatorPartType?: string // 福建挖机零件类型
                    fujianSparePartsType?: string // 福建配件零件类型
                    preparePlanType: string // 预计划分类
                    productType: string // 产品类型
                    productLineChild: string // 产品线
                    productSubLine: string // 产品子线
                    trimMethod: string // 裁剪方式
                    viewName: string // 显示规则类型名称
                } = {
                    materialType: partForm.partType, // 类型
                    partCategory: partForm.lgPartType, // 零件类型
                    productOid: partForm.selectProductOid, // 选择产品
                    pid: partForm.selectFolderOid, // 选择文件夹
                    number: partForm.code, // 编号
                    name: partForm.name, // 名称
                    materialSymbol: partForm.lgDrawingNo, // 代号
                    material: partForm.material, // 材料
                    machineModel: partForm.lgModel, // 机型号
                    importantDegree: partForm.lgImpodegree, // 关重件特性
                    lifeCycle: partForm.lifeCycleTemplate, // 生命周期
                    processState: partForm.processStatus, // 工艺状态
                    netWeight: partForm.weight, // 单件净重
                    grossWeight: partForm.lgGrossWeight, // 单件毛重
                    rawPartCode: partForm.lgRawpartCode, // 原材料编码
                    blankSpecification: partForm.lgBlankStandard, // 毛胚规格
                    blankSize: partForm.lgBlankSize, // 毛坯外形尺寸
                    blankType: partForm.lgBlankType, // 毛胚种类
                    blankNumber: partForm.lgEachBlankNumber, // 毛胚件数
                    feedSection: partForm.lgFeedSection, // 下料工段
                    unit: partForm.lgUnit, // 单位
                    drawing: partForm.lgDrawing, // 图幅
                    ownerGroup: partForm.ownerGroup, // 所属用户组
                    productPhase: partForm.productPhase, // 阶段标识
                    processRoute: partForm.lgProRoute, // 工艺路线
                    desc: partForm.description, // 描述
                    // version: "" // 版本
                    owner: partForm.owner, // 所有者
                    // checkOuter: "" // 检出者
                    // checkTime: "" // 检出时间
                    // modifor: "" // 修改者
                    // modifyTime: "" // 修改时间
                    // papproveTime: "" // 发布时间
                    // createTime: "" // 创建时间
                    // creator: "" // 创建者
                    belongCompany: partForm.lgBelongCompany, // 所属公司
                    anotherName: partForm.lgAnotherName, // 别名
                    layout: partForm.planningMethod, // 规划方法
                    planMethod: partForm.projectMethod, // 计划方法
                    loaderIssuingStock: partForm.fjzzjissueStock2, // 装载机发料仓库
                    fujianLoaderIssuingStock: partForm.fjzzjissueStock, // 福建装载机发料仓库
                    synchronizationTime: partForm.syncTime, // 同步时间
                    shanghaiMechanicalPartType: partForm.type1, // 上海机械零件类型
                    shanghaiExcavatorPartsType: partForm.type2, // 上海挖机零件类型
                    fujianMechanicalPartType: partForm.type3, // 福建机械零件类型
                    shanghaiRoadbedPartType: partForm.type4, // 上海路面零件类型自制零件
                    shanghaiForkliftPartType: partForm.type5, // 上海叉车零件类型
                    shanghaiComponentPartType: partForm.type6, // 上海部件零件类型
                    jiangxiMechanicalPartType: partForm.type7, // 江西机械零件类型
                    shanghaiHydraulicPartType: partForm.type8, // 上海液压零件类型
                    fujianHydraulicPartType: partForm.type9, // 福建液压零件类型
                    fujianBridgeBoxPartType: partForm.type10, // 福建桥箱零件类型
                    fujianCastPartType: partForm.type11, // 福建铸锻零件类型
                    precisionHydraulicPartType: partForm.type12, // 精工液压零件类型
                    fujianExcavatorPartType: partForm.type13, // 福建挖机零件类型
                    fujianSparePartsType: partForm.type14, // 福建配件零件类型
                    preparePlanType: partForm.preparePlanType, // 预计划分类
                    productType: partForm.productType, // 产品类型
                    productLineChild: partForm.productLineChild, // 产品线
                    productSubLine: partForm.productSubLine, // 产品子线
                    trimMethod: partForm.trimMethod, // 裁剪方式
                    viewName: partForm.viewName // 显示规则类型名称
                }
                if (props.dialogType === "edit") {
                    params = {
                        ...params,
                        oid: props.currentRowData.oid
                    }
                }
                // 整机配置类型预计划分类默认为整车
                if (partForm.partType === "wt.part.WTPart|com.pdinfo.kbomCAR") {
                    params.preparePlanType = "1"
                }
                loading.value = true
                const { data } = await createPart(params)
                if (props.dialogType === "insert") {
                    ElMessage.success(t("productLibraryPage.createSuccess"))
                    emits("confirmSuccess", data)
                } else {
                    ElMessage({
                        type: "success",
                        message:
                            props.dialogType === "add"
                                ? t("productLibraryPage.createSuccess")
                                : t("productLibraryPage.editSuccess"),
                        center: true
                    })
                    emits("confirmSuccess", data)
                }
            } catch (err: any) {
                console.log(err)
            } finally {
                loading.value = false
            }
        }
    })
}

// 处理类型下拉选择
const handleSelectChange_partType = () => {
    Object.assign(partForm, {
        ...partForm,
        code: ""
    })
}

// 零件类型下拉选项回调
const handleSelectChange_lgPartType = (val: string) => {
    for (let i = 0; i < 14; i++) {
        ;(partForm as any)[`type${i + 1}`] = val
    }
}

// 插入已有的
const bomInsert = (row: any) => {
    loading.value = true
    const params = {
        PartOid: row.oid,
        ParentPartOid: props.currentRowData.oid,
        findNumber: row.findNumber
    }
    bomInsertPart(params)
        .then(() => {
            ElMessage.success(t("productBomPage.insertSuccessful"))
            emits("confirmSuccess", props.currentRowData.oid)
        })
        .finally(() => (loading.value = false))
}
//#endregion

//#region 编号 - 编辑弹窗
const configNumberDialog = reactive<any>({
    visible: false,
    title: "",
    partType: ""
})
// 编辑编号
const goEdit_number = () => {
    if (props.dialogType === "add" || props.dialogType === "insert") {
        Object.assign(configNumberDialog, {
            visible: true,
            title: "编号配置",
            partType: partForm.partType
        })
    }
}
// 编号编辑成功回调
const handleEditSuccess_number = (number: string) => {
    partForm.code = number
    Object.assign(configNumberDialog, {
        visible: false,
        title: "",
        partType: ""
    })
    // 清空编码检验
    if (number) partFormRef.value!.clearValidate("code")
}
//#endregion

//#region 字典数据
const loading_option = ref(false)
const typeList = ref<SelectInterface[]>([])
const option_prePlanType = ref<any[]>([]) // 预计划分类下拉
// const option_childLine = ref<any[]>([]) // 产品子类
// const option_line = ref<any[]>([]) // 产品分类
const option_trim = ref<any[]>([]) // 裁剪方式
loading_option.value = true
getDictionarySelect({ codes: "KBOM_MATERIAL_TYPE,PRE_PLAN_TYPE,PRODUCT_LINE_CHILD,PRODUCT_LINE,TRIM_METHOD" })
    .then((data) => {
        typeList.value = (data.data.KBOM_MATERIAL_TYPE || []).map((item: any) => {
            return {
                id: item.code,
                name: item.codeListNameC
            }
        })
        option_prePlanType.value = (data.data.PRE_PLAN_TYPE || [])
            .map((item: any) => {
                return {
                    id: item.code,
                    name: item.codeListNameC
                }
            })
            .filter((item: any) => item.id !== "1")
        // option_childLine.value = (data.data.PRODUCT_LINE_CHILD || []).map((item: any) => {
        //     return {
        //         id: item.code,
        //         name: item.codeListNameC
        //     }
        // })
        // option_line.value = (data.data.PRODUCT_LINE || []).map((item: any) => {
        //     return {
        //         id: item.code,
        //         name: item.codeListNameC
        //     }
        // })
        option_trim.value = (data.data.TRIM_METHOD || []).map((item: any) => {
            return {
                id: item.codeListNameC,
                name: item.codeListNameC
            }
        })
    })
    .finally(() => (loading_option.value = false))

const multiLevelDictionaryProductTypeList = ref<any>([]) // 产品类型列表
const multiLevelDictionaryProductLineList = ref<any>([]) // 产品线列表
const multiLevelDictionaryProductSubLineList = ref<any>([]) // 产品子线列表
const getMultiLevelDictionaryType = async () => {
    try {
        loading.value = true
        const params = {
            status: 1
        }
        const { data } = (await multiLevelDictionaryData(params)) as any
        multiLevelDictionaryProductTypeList.value = data
        loading.value = false
    } catch (error: any) {
        loading.value = false
        console.log(error)
    }
}

getMultiLevelDictionaryType()

// 处理产品类型选择获取产品线列表
const handleProductTypeChange = (val: string) => {
    partForm.productLineChild = ""
    partForm.productSubLine = ""
    multiLevelDictionaryProductLineList.value = []
    multiLevelDictionaryProductSubLineList.value = []
    recursionArray(multiLevelDictionaryProductTypeList.value, (item: any) => {
        if (item.code === val) {
            // 拿到当前产品类型下的产品线
            multiLevelDictionaryProductLineList.value = item.children || []
        }
    })
}

// 处理产品线选择获取产品子线列表
const handleProductLineChildChange = (val: string) => {
    partForm.productSubLine = ""
    multiLevelDictionaryProductSubLineList.value = []
    recursionArray(multiLevelDictionaryProductTypeList.value, (item: any) => {
        if (item.code === val) {
            // 拿到当前产品类型下的产品线
            multiLevelDictionaryProductSubLineList.value = item.children || []
        }
    })
}

//#endregion

watch(
    () => props.currentRowData,
    (val) => {
        console.log("currentRowData: ", val)
        if (props.dialogType === "edit") getPartDetail(val)
    },
    { immediate: true }
)

watch(
    () => props.currentTreeNodeData,
    (val) => {
        // console.log("currentTreeNodeData: ", val)
        const { pdmLinkProductOid, ProductOid } = val
        // 工作区回显选择文件夹
        if (pdmLinkProductOid) {
            getWorkspaceLazyNodeList(pdmLinkProductOid, val)
        }
        if (ProductOid) {
            getWorkspaceLazyNodeList(ProductOid, val)
        }
    },
    { immediate: true }
)

watch(
    () => props.defaultPartType,
    (val) => {
        if (val === "整机配置") {
            Object.assign(partForm, {
                ...partForm,
                partType: "wt.part.WTPart|com.pdinfo.kbomCAR"
            })
        }
    },
    { immediate: true }
)

watch(
    () => props.grandparentProductOid,
    (val) => {
        // console.log("grandparentProductOid: ", val)
        if (!val) return
        // 回显选择产品
        Object.assign(partForm, {
            ...partForm,
            selectProductOid: val
        })
    },
    { immediate: true }
)

watch(
    () => props.parentNodeData,
    (val) => {
        // console.log("parentNodeData: ", val)
        if (!val) return
        // 回显选择文件夹
        cacheData.value = [val]
        // console.log("cacheData.value: ", cacheData.value)
        Object.assign(partForm, {
            ...partForm,
            selectFolderOid: val.oid
        })
    },
    { immediate: true }
)
</script>

<style lang="scss" scoped>
.w-full {
    position: relative;
}
.overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
    cursor: pointer;
}
.topFormItem {
    :deep(.el-form-item) {
        .el-form-item__label {
            width: 120px !important;
        }
    }
}
.fromWrapper {
    :deep(.el-input) {
        width: 180px !important;
    }
}
</style>
