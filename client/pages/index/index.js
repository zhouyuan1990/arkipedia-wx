//index.js
var ap = require('../../public/index')
var util = require('../../utils/util.js')

Page({
    data: {
        userInfo: {},
        logged: false
    },

    // 用户登录示例
    bindGetUserInfo: function () {
        if (this.data.logged) return

        util.showBusy('正在登录')

        ap.login({
            success: res => {
                this.setData({ userInfo: res, logged: true})
            },
            fail: err => {
                console.error(err)
                util.showModel('登录错误', err.message)
            }
        })

        // const session = qcloud.Session.get()

        // if (session) {
        //     // 第二次登录
        //     // 或者本地已经有登录态
        //     // 可使用本函数更新登录态
        //     qcloud.loginWithCode({
        //         success: res => {
        //             console.log(res)
        //             this.setData({ userInfo: res, logged: true })
        //             util.showSuccess('登录成功')
        //         },
        //         fail: err => {
        //             console.error(err)
        //             util.showModel('登录错误', err.message)
        //         }
        //     })
        // } else {
        //     // 首次登录
        //     qcloud.login({
        //         success: res => {
        //             this.setData({ userInfo: res, logged: true })
        //             util.showSuccess('登录成功')
        //         },
        //         fail: err => {
        //             console.error(err)
        //             util.showModel('登录错误', err.message)
        //         }
        //     })
        // }
    }
})
