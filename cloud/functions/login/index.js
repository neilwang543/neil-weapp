// 云函数模板
// 部署：在 cloud-functions/login 文件夹右击选择 “上传并部署”
const cloud = require("wx-server-sdk")

// 初始化 cloud
cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 调用获取和云函数当前所在环境相同的数据库的引用
const db = cloud.database()

/**
 * 这个示例将经自动鉴权过的小程序用户 openId 返回给小程序端
 *
 * event 参数包含小程序端调用传入的 data
 *
 */

// 云函数入口函数
exports.main = async (event, context) => {
  console.info(event, 'event')
  switch (event.type) {
    case 'get': {
      return getUserInfo()
    }
    case 'create': {
      return createUser(event, context)
    }
    default: {
      return null
    }
  }
}


async function getUserInfo() {
  const {
    OPENID
  } = cloud.getWXContext()
  const configInfo = await db
    .collection('login_users')
    .where({
      userOpenId: OPENID,
    })
    .get()
  return configInfo.data[0]
}

async function createUser(event, context) {
  // console.info 的内容可以在云开发云函数调用日志查看
  console.info(event, 'event event')
  console.info(context, 'context context')

  // 获取 WX Context (微信调用上下文)，包括 OPENID、APPID、及 UNIONID（需满足 UNIONID 获取条件）等信息
  const {
    OPENID,
    APPID,
    UNIONID,
    ENV
  } = cloud.getWXContext()

  // 获取login_users下是否已经存在openId
  let loginUsers = await db
    .collection("login_users")
    .where({
      userOpenId: OPENID
    })
    .get()
    
  if (loginUsers && loginUsers.data && loginUsers.data.length === 0) {
    try {
      await db.collection("login_users").add({
        data: {
          createTime: db.serverDate(),
          updateTime: db.serverDate(), // 更新时间
          userOpenId: OPENID, // openID
          nickName: event.nickName, // 昵称
          avatarUrl: event.avatarUrl, // 头像
          hasAuth: false, // 默认无权限
          hasUpdateAuth:false,// 修改权限
        }
      })
      return true
    } catch (error) {
      console.info(error)
      return error
    }
  }else{
    try {
      await db
        .collection('login_users')
        .where({
          userOpenId: OPENID,
        })
        .update({
          data: {
            updateTime: db.serverDate(),
            nickName: event.nickName,
            avatarUrl: event.avatarUrl,
          },
        })
      return true
    } catch (error) {
      console.info(error)
      return error
    }
  }
}