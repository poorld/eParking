//https://luhut.cn

const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

module.exports = {
  formatTime: formatTime,
  checkSession: checkSession,
  login: login,
  ajax: ajax,
  test: test
}


function checkSession(){
  console.log("checkSession()")
  return new Promise((resolve,reject) => {
    const skey = wx.getStorageSync("skey")
    //如果缓存有3rdsession
    if (skey) {
      wx.checkSession({
        success: function(){
          //检测客户端与服务端
          const url = "https://luhut.cn/weixin/checkSession"
          const data = {
            "sessionkey": skey
          }
          ajax(url,data)
            .then(data => {
              console.log(data.errorMsg)
              if (data.errorCode == 1){
                resolve(true)
              }
            })
            .catch(error => {
              console.log(error)
              login()
            })
        },
        fail: function(){
          login()
          reject(false)
        }
      })
    } else {
      login()
    }
  })
}

function login(){
  console.log("登录")
  return new Promise((resolve,reject) => {
    wx.login({
      success: function(res) {
        //注册时用到js_code
        getApp().globalData.js_code = res.code
        wx.request({
          url: "https://luhut.cn/weixin/onLogin",
          data: {
            "js_code": res.code
          },
          method: "POST",
          success: function(ret) {
            console.log(ret)
            if (ret.data.errorCode == 1){
              wx.setStorageSync("skey",ret.data.data)
            } else {
              reject("登录失败")
              console.log(ret.data.errorMsg)
            }
          },
          fail: function(){
            reject("请求超时")
          }
        })
      }
    })
  })
}
function ajax(url,data){
  console.log("ajax()")
  console.log("url="+url)
  console.log("data="+data)
  return new Promise((resolve,reject) => {
    wx.request({
      url,
      data,
      method: "POST",
      header: {
        "content-type": "application/json"
      },
      success: function(ret) {
        console.log(ret.data)
        if (ret.data.errorCode == 1 || ret.data.errorCode == 0){
          resolve(ret.data)
        } else {
          reject(ret.data.errorMsg)
        }
      },
      fail: function(){
        reject("请求失败")
      }
    })
  })
}

function test(){
  return new Promise( (resolve,reject) => {
    console.log("promise test")
    resolve("This is the value returned by promise")
  })
}

