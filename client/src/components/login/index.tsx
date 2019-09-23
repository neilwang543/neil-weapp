import Taro, { Component } from '@tarojs/taro'
import { View } from '@tarojs/components'
import { AtButton, AtAvatar } from 'taro-ui'
import './index.scss'
import dayjs from 'dayjs'

export default class Login extends Component<any, any> {
  constructor() {
    super(...arguments)
    this.state = {
      userInfo: Taro.getStorageSync('userInfo'),
      isAdmin: Taro.getStorageSync('openId') === 'oWL9M5TfBXk_-RiunU3S7OpyK5fQ',
    }
  }

  componentWillMount() {}

  componentDidMount() {}

  componentWillUnmount() {}

  componentDidShow() {}

  componentDidHide() {}

  getUserInfo = () => {
    Taro.getUserInfo({
      success: res => {
        const { userInfo } = res
        console.log(res, 'success')
        this.setState({ userInfo: userInfo })
        Taro.setStorageSync('userInfo', userInfo)
        // Taro.cloud
        //   .callFunction({
        //     name: 'login',
        //     data: { baseUserInfo: userInfo },
        //   })
        //   .then(res => {
        //     console.log(res)
        //     this.setState({ context: res.result })
        //   })
      },
      fail: () => {
        Taro.showToast({
          title: '获取哈批信息失败',
          icon: 'none',
        })
      },
    })
  }

  // 上传图片
  doUpload = () => {
    // 选择图片
    Taro.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album'],
      success: res => {
        Taro.showLoading({
          title: '上传中',
        })
        const filePath = res.tempFilePaths[0]
        // 上传图片

        const cloudPath = dayjs().valueOf() + '.jpg'
        Taro.cloud.uploadFile({
          cloudPath,
          filePath,
          success: res => {
            console.log('[上传文件] 成功：', res)
            Taro.showToast({
              icon: 'success',
              title: '上传成功',
            })
            const db = Taro.cloud.database()
            db.collection('config_imgs').add({
              data: {
                imgId: res.fileID,
              },
              success: res => {
                // 在返回结果中会包含新创建的记录的 _id
                Taro.showToast({
                  title: '新增记录成功',
                })
                console.log('[数据库] [新增记录] 成功，记录 _id: ', res._id)
              },
              fail: err => {
                Taro.showToast({
                  icon: 'none',
                  title: '新增记录失败',
                })
                console.error('[数据库] [新增记录] 失败：', err)
              },
            })
          },
          fail: e => {
            console.error('[上传文件] 失败：', e)
            Taro.showToast({
              icon: 'none',
              title: '上传失败',
            })
          },
          complete: () => {
            setTimeout(() => {
              Taro.hideLoading()
            }, 1500)
          },
        })
      },
      fail: e => {
        console.error(e)
      },
    })
  }

  render() {
    const { userInfo, isAdmin } = this.state
    const { nickName, avatarUrl } = userInfo
    return (
      <View className="wrapper">
        <View className="user-box">
          <AtAvatar circle text="喔" image={avatarUrl}></AtAvatar>
          <View className="user-name">你是哈批{nickName}</View>
        </View>
        {!nickName && (
          <AtButton type="primary" open-type="getUserInfo" onClick={this.getUserInfo}>
            点击授权登录
          </AtButton>
        )}
        {isAdmin && (
          <AtButton type="secondary" onClick={this.doUpload} customStyle={{ marginTop: '20px' }}>
            上传图片
          </AtButton>
        )}
      </View>
    )
  }
}
