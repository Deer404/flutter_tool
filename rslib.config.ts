import { defineConfig } from '@rslib/core';

export default defineConfig({
  source: {
    entry: {
      index: './src/index.ts',
      'bin/cli': './src/bin/cli.ts',
    },
  },
  lib: [
    {
      format: 'esm',
      dts: true,
    },
  ],
  output: {
    target: 'node',
  },
}); 