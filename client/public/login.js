function login (cb) {
  wx.login({
    success (loginResult) {
        wx.getUserInfo({
            success (userResult) {
                cb.success({
                    code: loginResult.code,
                    encryptedData: userResult.encryptedData,
                    iv: userResult.iv,
                    userInfo: userResult.userInfo
                })
            },
            fail (userError) {
                cb.fail(new Error('获取微信用户信息失败，请检查网络状态'), null)
            }
        });
    },
    fail (loginError) {
        cb.fail(new Error('微信登录失败，请检查网络状态'), null)
    }
  })
}

module.exports = { login }