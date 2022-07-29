module.exports = {
  chainWebpack: config => {
    config.module
      .rule('graphql')
      .test(/\.(graphql|ql)$/)
      .use('graphql-tag/loader')
      .loader('graphql-tag/loader')
      .end()
  }
}
