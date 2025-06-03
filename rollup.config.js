// rollup.config.js
import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import dts from 'rollup-plugin-dts';

export default [
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/galchemy.esm.js',
        format: 'esm',
        sourcemap: true,
      },
      {
        file: 'dist/galchemy.cjs.js',
        format: 'cjs',
        sourcemap: true,
      },
      {
        file: 'dist/galchemy.umd.js',
        format: 'umd',
        name: 'GalchemyCore',   // это будет window.GalchemyCore
        sourcemap: true,
      },
    ],
    plugins: [
      nodeResolve(),
      commonjs(),
      typescript({ tsconfig: './tsconfig.json' }),
    ],
  },
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.d.ts',
      format: 'es',
    },
    plugins: [dts()],
  },
];
