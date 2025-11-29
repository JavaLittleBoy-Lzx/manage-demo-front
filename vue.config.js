module.exports = {
  publicPath: './',
  productionSourceMap: true,
  configureWebpack: {
    devtool: 'source-map',
  },
  configureWebpack:{
    module: {
        rules: [
            {
                test: /.mjs$/,
                include: /node_modules/,
                type: "javascript/auto"
            },
        ]
    }
  },  
  devServer:{
    // proxy: {
    //   '/api' : {
    //     target: 'http://www.xuerparking.cn:8080',
    //     changeOrigin: true,
    //     pathRewrite: {
    //       '^/api':''
    //     }
    //   }
    // }
    // allowedHosts: ['.vicp.fun'],
    port: 9999 //修改启动端口
  }
}