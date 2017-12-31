module.exports = {
    entry: "./built/app.js",
    output: {
        filename: "./public/bundle.js"
    },
    resolve: {
        alias: {
            vue$: "vue/dist/vue.esm.js" // 'vue/dist/vue.common.js' for webpack 1
        }
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader"]
            }
        ]
    }
};
