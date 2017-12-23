const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const context = path.join(__dirname, 'src');

module.exports = {
    devtool: 'source-map',
    context,
    resolve: {
        extensions: [ '.js', '.jsx', '.scss', '.css']
    },
    entry: {
        bundle: context+'/index.jsx'
    },
    output: {
        path: '/dist',
        filename: 'bundle.js',
        publicPath: '/'
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: 'babel-loader',
            },
            {
                test: /\.(png|jpg|jpeg|gif|svg|eot|ttf|woff|woff2|otf)$/,
                include: path.join(context, './images'),
                use: 'file-loader?name=assets/[name].[hash:8].[ext]',
                //If the file is greater than the limit (10000 in bytes) the file-loader is used and all query parameters are passed to it.
            },
            {
                test: [/\.scss$/, /\.css$/],
                use: [
                    {loader: 'style-loader'},
                    {loader: 'css-loader'},
                    {loader: 'sass-loader'}
                ],
            },
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: 'index.html',
            filename: 'index.html'
        }),
    ],
    devServer: {
        // host must be set to enable accessing server from localhost:${PORT} when devServer running in docker
        port: 8000,
        host: '0.0.0.0',
        contentBase: context,
        historyApiFallback: true,
        watchOptions: {
            aggregateTimeout: 100,
            poll: 200,
        },
    },
};
