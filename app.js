//app.js
/**
 * 广西职业技术学院
 * E停车共享车位
 * 比赛项目
 */
const util =  require("utils/util.js")

 App({
  config: {
    host: 'teenyda.applinzi.com' // 域名
  },
  onLaunch: function () {
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
    
    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        this.js_code = res.code
      }
    })
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              //登录
            }
          })
        }
      }
    })
  },

  //微信小程序进入后台 选择了车位 没有停车
  onHide: function (){
    console.log("小程序隐藏")
    //已选择了车位
    if (this.globalData.currentParkinglot != -1) {
      //没有使用 改为可用状态
      if (this.globalData.inUse == false) {
        console.log("取消车位：" + this.globalData.currentParkinglot)
        const url = 'https://luhut.cn/weixin/canelParkingSpace'
        const data = {
          temID: this.globalData.currentParkinglot
        }
        util.ajax(url,data)
          .then(data => {
            console.log(data.errorMsg)
          })
      }
    }
  },

  globalData: {
    userInfo: null,
    flag: false,
    jurisdiction: false, //是否授权,
    js_code: "",
    sessionKey: "",
    nickName: "",
    userportrait:"",
    currentParkinglot: -1,//当前车位
    inUse: false //是否使用
  },
})
