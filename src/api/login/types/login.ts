export interface LoginRequestData {
    /** admin 或 editor */
    username: string
    /** 密码 */
    password: string
    /** 验证码 */
    // code: string
}
export interface LogoutRequestData {
    /** token */
    token: string
}

export type LoginResponseData = ApiResponseData<{
    token: string
    userInfo: { realName: string; defaultGroupId: string; defaultRoleId: string }
}>

export type UserInfoResponseData = ApiResponseData<{ username: string; roles: string[] }>
