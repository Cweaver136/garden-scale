import { rollupPluginHTML as html } from '@web/rollup-plugin-html';
import nodeResolve from '@rollup/plugin-node-resolve';

const CONFIG = {
  // our input files, relative reference from rootDir specified below
  input: ['index.html'],
  // plugins to make the thing go zoom zoom
  plugins: [
    // plugin for generating HTML files from rollup
    html({
      // keep our file structure intact
      flattenOutput: false,
      // the root directory to start at
      rootDir: 'source',
      // keep non-module assets
      extractAssets: true,
    }),
    // module resolution
    nodeResolve({ browser: true }),
    // copy dependencies that we cannot or do not want to bundle
  ],
  preserveEntrySignatures: false,
  output: {
    // the output directory for the code
    dir: 'compiled',
    // module output format
    format: 'esm',
    // name scheme for entry chunks ([hash] is an option, but we're opting for name only to avoid cache problems)
    entryFileNames: '[name].js',
    // name scheme for shared chunks
    chunkFileNames: '[name].js',
    // include sourcemaps
    sourcemap: true
  }
};

export default  [ CONFIG ];
