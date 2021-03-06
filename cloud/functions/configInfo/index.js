// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()


// 云函数入口函数
exports.main = async (event, context) => {
  switch (event.type) {
    case 'get': {
      return getConfig(event)
    }
    case 'update': {
      return updateConfig(event, context)
    }
    default: {
      return getConfig(event)
    }
  }
}

async function getConfig(event) {
  const configInfo = await db.collection('latest_config').get()
  return configInfo.data[0]
}


async function updateConfig(event, context) {
  console.log(event.config)
  const {
    OPENID
  } = cloud.getWXContext()
  try {
    await db.collection('latest_config').where({
      openId: OPENID
    }).update({
      data: {
        updateTime: db.serverDate(),
        config: event.config,
      },
    })
    return event

  } catch (error) {
    console.log(error)
    return null
  }
}