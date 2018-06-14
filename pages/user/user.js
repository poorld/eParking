// pages/index/index.js
/**
 * 广西职业技术学院
 * E停车共享车位
 * 比赛项目
 */
const app = getApp()
const util =  require("../../utils/util.js")

Page({
  /**
   * 页面的初始数据
   */
  data: {
    overage: 0,
    ticket: 0,
    userInfo: {},
    chongzhi: "点击授权微信小程序",
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    phonenumber: "15278389583",
    cartnumber: "桂A9527",
    nickName: "",
    avatarUrl: "",

    js_code: "",
    encryptedData: "",
    // iv: "",
    //用户登录标记
    flag: false,
    isRegister: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    util.test()
      .then(value => {
        console.log(value)
      })
    util.checkSession()

    wx.getSetting({
      success: res => {
        // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
        if (res.authSetting['scope.userInfo']) {
          wx.getUserInfo({
            success: res => {
              console.log(res.userInfo)
              app.globalData.userportrait = res.userInfo.avatarUrl
              app.globalData.nickName = res.userInfo.nickName
              app.globalData.jurisdiction = true;
              this.setData({
                userInfo: res.userInfo,
                nickName: res.userInfo.nickName,
                avatarUrl: res.userInfo.avatarUrl,
                chongzhi: "充值"
              })
            }
          })
        }
      }
    })
  },
  chongzhi: function () {
    var that = this;
    wx.getSetting({
      success: res => {
        //以授权 - 充值
        if (res.authSetting['scope.userInfo']) {
          console.log("充值")
        } else {//未授权 - 授权
          
          wx.getUserInfo({
            success: res => {
              console.log("授权成功")
              console.log(res.userInfo)
              console.log(res.encryptedData)
              app.globalData.jurisdiction = true;
              app.globalData.nickName = res.userInfo.nickName
              app.globalData.userportrait = res.userInfo.avatarUrl
              this.setData({
                nickName: res.userInfo.nickName,
                avatarUrl: res.userInfo.avatarUrl,
                chongzhi: "充值",
                encryptedData: res.encryptedData,
              })
                wx.showLoading({
                  title: '正在登录!',
                });
                // 注册
                that.register(res.encryptedData, res.iv);
            },
            fail: function () {
              wx.showModal({
                title: '警告',
                content: '您点击了拒绝授权,将无法正常显示个人信息,点击确定重新获取授权。',
                success: function (res) {
                  //确定 confirm
                  if (res.confirm) {
                    wx.openSetting({
                      success: res => {
                        //确定授权
                        if (res.authSetting['scope.userInfo']) {
                          wx.getUserInfo({
                            success: function (res) {
                              var userInfo = res.userInfo;
                              getApp().globalData.jurisdiction = true;
                              app.globalData.nickName = res.userInfo.nickName
                              app.globalData.userportrait = res.userInfo.avatarUrl
                              that.setData({
                                nickName: userInfo.nickName,
                                avatarUrl: userInfo.avatarUrl,
                                chongzhi: "充值",
                                encryptedData: res.encryptedData,
                                iv: res.iv
                              })
                                wx.showLoading({
                                  title: '正在登录!',
                                });
                                that.register(res.encryptedData, res.iv);
                            }
                          })
                        }
                      }
                    })
                  }
                }
              })
            }
          })
        }
      }
    })
  },
  register: function (encryptedData, iv) {
    let sessionKey = wx.getStorageSync("skey")
    let jsCode = app.globalData.js_code
    console.log("注册-----------------------")
    console.log("sessionKey=>"+wx.getStorageSync("skey"))
    console.log("js_code=>" + jsCode)
    console.log("encryptedData=>" + encryptedData)
    console.log("iv=>" + iv)
    console.log("注册-----------------------")
    // 第一次启动，注册]
    const url = "https://luhut.cn/weixin/register"
    const data = {
      js_code: jsCode,
        encryptedData: encryptedData,
        iv: iv,
        sessionKey: sessionKey
    }
    util.ajax(url,data)
      .then( data => {
        wx.hideLoading();
        //注册成功
        if (data.errorCode == 1){
          console.log(data.errorMsg)
        } else if(data.errorCode == -1){
          wx.showToast({
            title: '注册失败',
            icon: 'loading',
            duration: 2000
          })
        } else {
          console.log(data.errorMsg)
        }
      })
      .catch( error => {
        wx.hideLoading();
        console.log("Error",error)
      })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },



})