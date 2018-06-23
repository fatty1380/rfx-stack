/* eslint-disable import/no-extraneous-dependencies */
import postcssExtend from 'postcss-extend';
import postcssFocus from 'postcss-focus';
import autoprefixer from 'autoprefixer';

export default {
  ident: 'postcss',
  plugins: [postcssExtend(), postcssFocus(), autoprefixer()],
};

// 'postcss-import': { addDependencyTo: webpack },
// 'postcss-url': {},
// 'postcss-extend': {},
// 'postcss-focus': {},
// autoprefixer: {},
// precss: {},
// cssnano: env === 'production' ? { safe: true } : false,
