const SYSTEM_NAME = "kbom-front"

/** 缓存数据时用到的 Key */
class CacheKey {
    static readonly PDM_ONLY_TOKEN = `${SYSTEM_NAME}-pdm-token`
    static readonly TOKEN = `${SYSTEM_NAME}-token`
    static readonly UserInfo = `${SYSTEM_NAME}-userInfo`
    static readonly SIDEBAR_STATUS = `${SYSTEM_NAME}-sidebar-status-key`
    static readonly ACTIVE_THEME_NAME = `${SYSTEM_NAME}-active-theme-name-key`
    static readonly CURRENT_GROUP_ID = `${SYSTEM_NAME}-current-group-id-key`
    static readonly CURRENT_ROLE_ID = `${SYSTEM_NAME}-current-role-id-key`
    static readonly TIME_ID = `${SYSTEM_NAME}-current-time-id`
    static readonly BASELINE_Id = `${SYSTEM_NAME}-current-time-baselineId`
    static readonly DYNAMICS_MENU_LIST = `${SYSTEM_NAME}-dynamics-menu-list`
    static readonly PERMISSIONS_BTN_LIST = `${SYSTEM_NAME}-permissions-btn-list`
    static readonly LANGUAGE = `${SYSTEM_NAME}-language`
    static readonly INTERNATIONAL_FIELDS = `${SYSTEM_NAME}-internationalFields`
}

export default CacheKey
