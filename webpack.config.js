// webpack.config.js
const webpack = require('webpack');
const path = require('path');

module.exports = {
    entry: "./src/petal.ts",
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'petal.js',  // Output bundle file
        library: 'petal',   // Name of the global variable if your package is used in the browser
        libraryTarget: 'umd',   // Universal module definition, for browser and Node.js
        globalObject: 'this',   // Ensures compatibility in different environments
    },
    module: {
        rules: [
            {
                test: /\.css$/, // Apply this rule to all `.css` files
                use: [
                    'style-loader', // Injects CSS into the DOM
                    'css-loader',   // Turns CSS into CommonJS
                ],
            },
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            }
        ],
    },
    externals: {
        // Any dependencies you don't want to include in your bundle
        'some-other-external': 'commonjs2 some-other-external',
    },
    mode: 'development',  // Can be 'development' for debugging
    resolve: {
        extensions: ['.js', '.ts', '.json'], // Add file extensions you use
    },
    plugins: [
        new webpack.DefinePlugin({
            APP_VERSION: JSON.stringify(require('./package.json').version),
        }),
    ],
};