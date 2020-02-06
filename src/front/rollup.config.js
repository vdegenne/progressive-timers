import nodeResolve from 'rollup-plugin-node-resolve';
import {terser} from 'rollup-plugin-terser';
import typescript from 'rollup-plugin-typescript';

// use '--environment minify' with rollup
// to minify the input
const minify = process.env.minify;  // false;

// use "--environment bundle" with rollup
// if you want to make a bundle.
const bundle = process.env.bundle;  // false;

export default {
  input: 'src/front/app.ts',
  output: {file: 'public/app.js', format: 'iife'},
  plugins:
      [
        nodeResolve({
          dedupe: ['@material/mwc-textfield', '@material/mwc-notched-outline']
        }),
        typescript(),
        minify ? terser() : {},
      ]
};