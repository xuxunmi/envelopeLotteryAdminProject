import axios from "axios"

/**
 * @description:导出下载模板
 * @param {String} 下载url
 * @param {String} 下载文件名
 */
export function downloadBlobFileTemplate(url: string, filename: string) {
    return axios({
        url: url,
        method: "GET",
        responseType: "blob"
    }).then((response) => {
        console.log("response: ", response)
        const blob = new Blob([response.data])
        const link = document.createElement("a")
        link.href = URL.createObjectURL(blob)
        link.download = filename
        const body = document.getElementsByTagName("body")[0]
        body.appendChild(link)
        link.click()
        window.setTimeout(function () {
            URL.revokeObjectURL(link.href)
            body.removeChild(link)
        }, 0)
    })
}

/**
 * 下载文件
 * @param {String} data blob数据
 * @param {String} filename 文件名称含文件后缀
 * @param {String} time 时间
 */
export function downloadFile(data: any, filename: string, type?: string) {
    if (!data) return
    // 当Blob的type为: application/octet-stream 时，指定为.xlsx类型
    let blob
    switch (type) {
        case "xlsx":
            blob = new Blob([data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
            break

        default:
            blob = data
            break
    }
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob as Blob)
    link.download = filename
    document.body.appendChild(link)
    link.click()
    window.setTimeout(function () {
        document.body.removeChild(link)
        URL.revokeObjectURL(link.href)
    }, 0)
}
