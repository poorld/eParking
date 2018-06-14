// pages/record/record.js
/**
 * 广西职业技术学院
 * E停车共享车位
 * 比赛项目
 */
const util = require("../../utils/util.js")

Page({

  /**
   * 页面的初始数据
   */
  data: {
    recordlist: []
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getRecords();
  },
  onReady: function () {
    
  },
  
  getRecords:function(){
    const sessionKey = wx.getStorageSync("skey")
    console.log("sessionKey=" + sessionKey)
    if (sessionKey == "") {
      wx.showModal({
        title: '提示',
        content: '正在登录中，请稍等...',
        success: function(res) {
          if (res.cancel || res.confirm) {
            wx.switchTab({
              url: '../user/user',
            })
          }
        }
      })
    }else {
      var that = this
      const url = "https://luhut.cn/weixin/record"
      const data = {
        "sessionKey": sessionKey
      }
      util.ajax(url,data)
        .then(res => {
          console.log(res.data)
          that.setData({
              recordlist: res.data
          })
        })
    }
    
  },
  charge:function(){
    this.getRecords();
  }

})