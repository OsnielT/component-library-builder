import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';

export default {
  input: 'src/webview/index.tsx',
  output: {
    file: 'dist/webview.js',
    format: 'iife',
    sourcemap: true,
  },
  plugins: [
    resolve({
      browser: true,
    }),
    commonjs(),
    typescript({
      tsconfig: './tsconfig.webview.json',
    }),
  ],
  external: [],
};
