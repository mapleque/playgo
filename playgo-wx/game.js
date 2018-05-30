import './js/libs/weapp-adapter'
import './js/libs/symbol'

import Main from './js/main'

wx.login({
  success: function (ret) {
    console.log(ret.code)
    // TODO request openid and save
    wx.getUserInfo({
      success: res => {
        console.log('success', res.userInfo)
      }
    })
  }
})
new Main()
