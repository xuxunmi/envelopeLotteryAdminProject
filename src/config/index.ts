/** 布局配置 */
interface ProjectSettings {
  /** 项目名称 */
  projectName: string
  projectName2: string
  /** 用户账号密码 */
  auth: {
    username: string
    password: string
  }
  /** hpm用户账号密码 */
  hpm: {
    userName: string
    password: string
  }
}

const projectSettings: ProjectSettings = {
  projectName: '短剧管理平台 ',
  projectName2: '',
  hpm: {
    // 测试环境
    userName: 'rdlptopod',
    password: 'rdlppod!2'
    //正式环境
    // userName: 'rdlptopop',
    // password: 'jaYa3)ypzkzg4+'
  },
  auth: {
    // username: "wcadmin",
    // password: "wcadmin"
    // password: "ptc"
    username: "pdadmin",
    password: "pdadmin"
  }
}

export default projectSettings
