// import nodeResolve from 'rollup-plugin-node-resolve';
import {terser} from 'rollup-plugin-terser';
import typescript from 'rollup-plugin-typescript';


export default {
  input: 'src/server/es-dev-server.config.ts',
  output: {file: 'es-dev-server.config.js', format: 'cjs'},
  plugins:
      [
        // nodeResolve(),
        typescript(),
        terser()
      ]
};