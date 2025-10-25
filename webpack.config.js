const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

module.exports = (env, argv) => {
    const isDevelopment = argv.mode === 'development';

    return {
        entry: './src/js/swp.js',
        output: {
            path: path.resolve(__dirname, 'dist'),
            filename: isDevelopment ? 'swp.js' : 'swp.min.js',
            clean: true,
            library: {
                name: 'SWP',
                type: 'umd',
                export: 'default'
            },
            globalObject: 'this'
        },
        module: {
            rules: [
                {
                    test: /\.css$/i,
                    use: [
                        isDevelopment ? 'style-loader' : MiniCssExtractPlugin.loader,
                        'css-loader'
                    ]
                },
                {
                    test: /\.(png|svg|jpg|jpeg|gif)$/i,
                    type: 'asset/resource',
                    generator: {
                        filename: 'images/[name][ext]'
                    }
                }
            ]
        },
        plugins: [
            new MiniCssExtractPlugin({
                filename: isDevelopment ? 'swp.css' : 'swp.min.css'
            })
        ],
        optimization: {
            minimizer: [
                `...`,
                new CssMinimizerPlugin()
            ]
        },
        devServer: {
            static: {
                directory: path.join(__dirname, 'dist')
            },
            compress: true,
            port: 3000,
            hot: true,
            open: true
        },
        devtool: isDevelopment ? 'source-map' : false
    };
};
