import request from "@/utils/https/pdm_servers"
const env = import.meta.env

// pdm验证token
export function getPdmToken() {
    return request({
        url: env.VITE_APP_PDM + "/servlet/rest/security/csrf",
        method: "get"
    })
}
