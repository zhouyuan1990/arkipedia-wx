const CONF = {
    port: '5757',
    rootPathname: '',

    // 微信小程序 App ID
    appId: 'wxaf0832b955457b8d',

    // 微信小程序 App Secret
    appSecret: '35a8927ed8c0266e304af504a883f81a',

    // 是否使用腾讯云代理登录小程序
    useQcloudLogin: true,
    qcloudAppId: '1258369017',
    qcloudSecretId: 'AKIDNbIsHMWG1j7NL9IPn051pSw1xmQuDnBP',
    qcloudSecretKey: 'On280jHm8e0BB4JQuJbkiWDnJgsW1MX7',

    /**
     * MySQL 配置，用来存储 session 和用户信息
     * 若使用了腾讯云微信小程序解决方案
     * 开发环境下，MySQL 的初始密码为您的微信小程序 appid
     */
    mysql: {
        host: 'localhost',
        port: 3306,
        user: 'root',
        db: 'cAuth',
        pass: 'wxaf0832b955457b8d',
        char: 'utf8mb4'
    },

    cos: {
        /**
         * 地区简称
         * @查看 https://cloud.tencent.com/document/product/436/6224
         */
        region: 'ap-guangzhou',
        // Bucket 名称
        fileBucket: 'qcloudtest',
        // 文件夹
        uploadFolder: ''
    },

    // 微信登录态有效期
    wxLoginExpires: 7200,
    wxMessageToken: 'abcdefgh'
}

module.exports = CONF
