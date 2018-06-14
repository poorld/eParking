/**
 * 广西职业技术学院
 * E停车共享车位
 * 比赛项目
 */
 const app = getApp()
 const util = require("../../utils/util.js")

 var temID = -1;
 var _markers;
 var js_code;
 Page({

  /**
   * 页面的初始数据
   */
   data: {
    text1: "",
    text2: "",
    sumhours: "",
    summinuters: "",
    sumseconds: "",
    hours: 0,
    minuters: 0,
    seconds: 0,
    billing: "",
    charge: "",
    money: "",
    showView: false,
    endbutton: "/images/endRide.png",
    userportrait: "",
    nickName: "露小哒",
    latitude: 0,
    longitude: 0,
    scale: 18,
    sumtime: 0,
    markers: [],
    controls: [],
    flag: false,
    useringParking: false,
  },
  onLoad: function (e) {
    var that = this
    const url = "https://luhut.cn/weixin/markers"
    util.ajax(url)
    .then(data => {
      console.log(data.data)
      that.setData({
        markers: data.data
      })
    })
    /**
     * 当用户停车后，会缓存车锁编号与停车时间，当突发情况（手机关机，退出微信小程序等），
     * 用户再次进入的时候，会判断是否有缓存，有缓存则继续接着计费,计费完之后会清除缓存
     */
    //获取缓存停车id
    let parking_temID = wx.getStorageSync("parking_temID")
    // 获取缓存时间
    let parking_time = wx.getStorageSync("parking_time")
    let order = wx.getStorageSync("orderId")
    console.log("parking_temID=" + parking_temID)
    //以停有车位
    if (parking_temID && parking_time && order) {
      console.log("恢复会话-----------------")
      util.checkSession()
      that.setData({
        useringParking: true,
        userportrait: app.globalData.userportrait,
        nickName: app.globalData.nickName
      })
      temID = parking_temID
      // 时间戳转为时间
      let nowTimestamp = Date.parse(new Date()) / 1000
      let oldTimestap = Date.parse(parking_time) / 1000
      let timestap = nowTimestamp - oldTimestap
      console.log("timestap" + timestap)
      let h = (timestap / 3600).toFixed(0)
      let m = (timestap / 60).toFixed(0)
      if (m > 60) {
        m = m % 60
      }
      let s = (timestap % 60).toFixed(0)
      console.log("继续计时:")
      console.log(h + ":" + m + ":" + s)
      that.startRide(h, m, s)
      console.log("order=" + order)
      that.onChangeShowState();
    }

    showView: (e.showView == "true" ? true : false);
    var that = this;
    wx.getLocation({
      type: "gcj02",
      success: (res) => {
        this.setData({
          longitude: res.longitude,
          latitude: res.latitude
        })
      },
    });
    wx.getSystemInfo({
      success: (res) => {
        this.setData({
          controls: [
          {
            id: 1,
            iconPath: '/images/location.png',
              position: { // 控件位置
                left: 20, // 单位px
                top: res.windowHeight - (res.windowHeight * 0.15), // 根据设备高度设置top值，可以做到在不同设备上效果一致
                width: 50, // 控件宽度/px
                height: 50 // 控件高度/px
              },
              clickable: true
            },
            {
              id: 2,
              iconPath: '/images/use.png',
              position: { // 控件位置
                left: res.windowWidth / 2 - 45, // 单位px
                top: res.windowHeight - (res.windowHeight * 0.2), // 根据设备高度设置top值，可以做到在不同设备上效果一致
                width: 90, // 控件宽度/px
                height: 90 // 控件高度/px
              },
              clickable: true
            },
            {
              id: 3,
              iconPath: '/images/warn.png',
              position: {
                left: res.windowWidth - 70,
                top: res.windowHeight - (res.windowHeight * 0.15),
                width: 50,
                height: 50
              },
              clickable: true
            },
            {
              id: 4,
              iconPath: '/images/marker.png',
              position: {
                left: res.windowWidth / 2 - 11,
                top: res.windowHeight / 2 - 45,
                width: 22,
                height: 45
              },
              clickable: false
            },
            {
              id: 5,
              iconPath: '/images/avatar.png',
              position: {
                left: res.windowWidth - 68,
                top: res.windowHeight - (res.windowHeight * 0.25),
                width: 45,
                height: 45
              },
              clickable: true
            }]
          })
      },
    });
  },

  bindcontroltap: function (e) {
    var that = this
    switch (e.controlId) {
      case 1: this.movetoPosition();
      break;
      case 2:
        //立刻停车
        if (this.data.seconds == 0 && temID != -1) {
          wx.showLoading({
            title: '请稍等!',
          })
          util.checkSession()
          .then(data => {

          })
          app.globalData.inUse = true
          let iconPath = "controls[" + 1 + "].id"
          console.log("立刻停车")
          console.log("iconPath=" + iconPath)
          this.setData({
            text1: "",
            text2: "",
            sumhours: "",
            summinuters: "",
            sumseconds: "",
          })

          //获取时间
          let date = new Date();
          let ymd = date.toLocaleDateString()//年月日
          let h = date.getHours()//时
          let m = date.getMinutes()
          let s = date.getSeconds()
          let time = ymd + " " + h + ":" + m + ":" + s
          console.log("停车时间:" + time)
          wx.setStorageSync("parking_temID", temID)
          wx.setStorageSync("parking_time", time)

          if (that.data.useringParking == false) {
            console.log("停车---------")
            const sessionKey = wx.getStorageSync("skey")
            const data = {
              "lookid": temID,
              "sessionKey": sessionKey
            }
            const url = "https://luhut.cn/weixin/parking"
            util.ajax(url, data)
            .then(data => {
              console.log("订单id="+data.data.orderid)
              that.onChangeShowState();
              that.startRide(0, 0, 0);//开始计时
              wx.hideLoading();
              console.log(data)
              wx.setStorageSync("orderId", data.data.orderid)
              this.setData({
                useringParking: true
              })
            })
            .catch(error => {
              wx.hideLoading();
              console.log("开锁失败")
              wx.showToast({
                title: '开锁失败',
                icon: 'loading',
                duration: 2000
              })
            })
          }
        }
        else if (this.data.seconds == 0 && temID == -1) {
          console.log("temID=" + temID)
          wx.showToast({
            title: '请先选择一个空闲中的车位!',
            icon: "none",
            duration: 3000
          })
        }
        else if (this.data.seconds != 0 && temID != -1) {
          that.onChangeShowState();
        }
        break;
        case 3:
        break;
        case 5: wx.switchTab({
          url: '../user/user',
        })
        break;
      }
    },
    onChangeShowState: function () {
      var that = this;
      that.setData({
        showView: (!that.data.showView)

      })
    },
    bindmarkertap: function (e) {
      var that = this
      let _marker = _markers;
      let markerId = e.markerId;
      let currMarker = _marker[markerId];
      this.setData({
        polyline: [{
        points: [{ // 连线起点
          longitude: this.data.longitude,
          latitude: this.data.latitude
        }, { // 连线终点(当前点击的标记)
          longitude: currMarker.longitude,
          latitude: currMarker.latitude
        }],
        color: "#28ff28",
        width: 2,
        dottedLine: false,
      }],
      scale: 18
    });

      var test = getApp().globalData.jurisdiction
      console.log("是否授权：")
      console.log(test)
      if (!test) {
        wx.showModal({
          title: '提示',
          content: '请授权微信小程序',
          success: function (res) {
            if (res.confirm) {
              wx.switchTab({
                url: '../user/user'
              })
            }
          }
        })
      }
      if (test) {
        if (currMarker.iconPath == "/images/not.png") {
          wx.showToast({
            title: '该车位正在被人使用',
            icon: "none",
            duration: 2000
          })
        }
        else if (currMarker.iconPath == "/images/idle.png" && temID != -1 && this.data.useringParking == false) {
          console.log("新坐标id:" + markerId)
          console.log("旧坐标id:" + temID)
          wx.showModal({
            title: '你已经拥有了一个车位了！',
            content: '确定更换车位吗？',
            success: function (res) {
              util.checkSession()
              let sessionKey = wx.getStorageSync("skey")
              if (res.confirm) {
                console.log("更换车位,sessionKey" + sessionKey)
              //修改全局的 当前车位
              app.globalData.currentParkinglot = markerId
              let up1 = "markers[" + markerId + "].iconPath";//新车位
              let up3 = "markers[" + temID + "].iconPath";//旧车位
              that.setData({
                [up1]: "/images/not.png",
                [up3]: "/images/idle.png"
              });
              const url = 'https://luhut.cn/weixin/chooseParking'
              const data = {
                sessionKey: sessionKey,
                markerId: markerId,
                temID: temID
              }
              util.ajax(url, data)
              .then(data => {
                console.log(data.errorMsg)
              })
              temID = markerId;
            } else if (res.cancel) {

            }
          }
        });
        }
        else if (currMarker.iconPath == "/images/idle.png" && temID == -1) {

          wx.showModal({
            title: '共享车位',
            content: '确定选择该车位？',
            success: function (res) {
              if (res.confirm) {
                util.checkSession()
                let sessionKey = wx.getStorageSync("skey")
                console.log("选择车位markerId=" + markerId)
                console.log("sessionKey" + sessionKey)
                let up1 = "markers[" + markerId + "].iconPath";
                temID = markerId;
                that.setData({
                  [up1]: "/images/not.png",
                  userportrait: app.globalData.userportrait,
                  nickName: app.globalData.nickName
                });
                console.log("确定选择该车位？temID=" + temID)

              //全局变量 当前的车位
              app.globalData.currentParkinglot = temID
              app.globalData.inUse = false
              const url = 'https://luhut.cn/weixin/chooseParking'
              const data = {
                markerId: temID,
                sessionKey: sessionKey
              }
              util.ajax(url, data)
              .then(data => {
                console.log(data.errorMsg)
              })

            } else if (res.cancel) {

            }
          }
        });
        } else if (this.data.useringParking == true) {
          wx.showModal({
            title: '提示',
            content: '你已经停有车位啦!!!',
            success: function (res) {
              if (res.confirm) {
                this.onChangeShowState();
              }
            }
          })
        }
      }
    },
    bindregionchange: function (e) {
      var that = this
      if (e.type == "begin") {
        const url = 'https://luhut.cn/weixin/markers'

        util.ajax(url)
        .then(data => {
          console.log(data.data)
          _markers = data.data
        })
    } else if (e.type == "end") {
      console.log(_markers);
      that.setData({
        markers: _markers
      })
    }
  },
  onShow: function () {
    this.mapCtx = wx.createMapContext("map");
    this.movetoPosition();
  },
  movetoPosition: function () {
    this.mapCtx.moveToLocation();
  },

  //开始计时
  startRide: function (h1, m1, s1) {
    // console.log("计时：")
    // console.log(h1 + ":" + m1 + ":" + s1)
    let h = parseInt(h1)
    let m = parseInt(m1)
    let s = parseInt(s1)

    this.setData({
      billing: "正在计费",
      charge: "",
      money: "",
      hours: h,
      minuters: m,
      seconds: s
    });

    this.timer = setInterval(() => {
      this.setData({
        seconds: s++
      })
      if (s == 60) {
        s = 0;
        m++;
        setTimeout(() => {
          this.setData({
            minuters: m
          });
        }, 1000)
        if (m == 60) {
          m = 0;
          h++;
          setTimeout(() => {
            this.setData({
              hours: h
            });
          }, 1000)
        }
      };
    }, 1000)
  },
  // 结束骑行，清除定时器
  endRide: function () {
    var that = this;
    if (this.data.seconds != 0 || this.data.minuters != 0 || this.data.hours != 0) {
      
      wx.showModal({
        title: '结束停车提示',
        content: '确定结束停车吗？',
        success: function (res) {
          wx.showLoading({
            title: '请稍等',
          })
          if (res.confirm) {
            util.checkSession()

            app.globalData.currentParkinglot = -1
            app.globalData.inUse = false
            clearInterval(that.timer);
            let sumtime = (that.data.hours + (that.data.minuters / 60) + (that.data.seconds / 3600));
            let number = sumtime * 2;//花费金额
            console.log("花费金额" + number.toFixed(2));
            that.timer = "";
            let up1 = "markers[" + temID + "].iconPath";
            let orderId = wx.getStorageSync("orderId")

            const sessionKey = wx.getStorageSync("skey")
            const url = 'https://luhut.cn/weixin/endParking'

            console.log("orderId" + orderId)
            console.log("sessionkey" + sessionKey)
            console.log("花费时间" + sumtime)

            const data = {
              orderId: orderId,
              sessionkey: sessionKey,
              spend: number.toFixed(2),
              lookid: temID
            }
            util.ajax(url, data)
            .then(data => {
              wx.hideLoading();
              console.log(data.data);
              /*that.endRide();*/
              that.setData({
                billing: "计费结束",
                charge: "本次收费",
                money: "" + number.toFixed(2),
                [up1]: "/images/idle.png",
                text1: "停车时长:",
                text2: "本次收费:￥",
                sumhours: that.data.hours + ":",
                summinuters: that.data.minuters + ":",
                sumseconds: that.data.seconds + "",
                hours: 0,
                minuters: 0,
                seconds: 0,
                sumtime: sumtime,
                useringParking: false
              })
              wx.removeStorageSync("parking_temID")
              wx.removeStorageSync("parking_time")
              wx.removeStorageSync("orderId")
              temID = -1;
              console.log(temID);
            })
            .catch(error => {
              wx.hideLoading();
              console.log("Error",error)
            })
          }else if (res.cancel) {

          }
        }
      })
    }
  },


})