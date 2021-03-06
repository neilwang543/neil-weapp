import Taro, { Component, Config } from '@tarojs/taro'
import Index from './pages/index'
import { UseRequest } from './service'
import { formatDate, goToLoginPage } from './utils'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
dayjs.locale('zh-cn')

import './app.scss'
import 'taro-ui/dist/style/index.scss' // 全局引入一次即可
import './custom-variables.scss'

class App extends Component {
  /**
   * 指定config的类型声明为: Taro.Config
   *
   * 由于 typescript 对于 object 类型推导只能推出 Key 的基本类型
   * 对于像 navigationBarTextStyle: 'black' 这样的推导出的类型是 string
   * 提示和声明 navigationBarTextStyle: 'black' | 'white' 类型冲突, 需要显示声明类型
   */
  config: Config = {
    pages: ['pages/index/index'],
    window: {
      backgroundTextStyle: 'light',
      navigationBarBackgroundColor: '#fff',
      navigationBarTitleText: 'wst666',
      navigationBarTextStyle: 'black',
    },
    cloud: true,
  }

  componentDidMount() {
    if (process.env.TARO_ENV === 'weapp') {
      let envType = process.env.NODE_ENV === 'development' ? 'test-t52ju' : 'prod-64sbo'
      console.log(envType)
      Taro.cloud.init({
        env: envType,
        traceUser: true,
      })
    }
  }

  componentDidShow() {
    UseRequest('login', {
      type: 'get',
    }).then(result => {
      console.log(result, ' login')
      if (!result) {
        goToLoginPage()
      } else {
        if (dayjs().isAfter(formatDate(result.updateTime), 'month')) {
          Taro.setStorageSync('userInfo', {})
          goToLoginPage()
        } else {
          Taro.setStorageSync('userInfo', result)
        }
      }
    })

    const updateManager = Taro.getUpdateManager()
    if (typeof updateManager === 'undefined') {
      return
    }
    updateManager.onCheckForUpdate(res => {
      // 请求完新版本信息的回调
      console.log(res.hasUpdate, '请求完新版本信息的回调')
    })
    updateManager.onUpdateReady(() => {
      Taro.showModal({
        title: '更新提示',
        content: '新版本已经准备好，是否重启应用？',
        success(res) {
          if (res.confirm) {
            // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
            updateManager.applyUpdate()
          }
        },
      })
    })
    updateManager.onUpdateFailed(() => {
      // 新版本下载失败
      Taro.showToast({
        title: `新版本下载失败`,
        icon: 'none',
        duration: 3000,
      })
    })
  }

  componentDidHide() {}

  componentDidCatchError() {}

  // 在 App 类中的 render() 函数没有实际作用
  // 请勿修改此函数
  render() {
    return <Index />
  }
}

Taro.render(<App />, document.getElementById('app'))
