import { defineConfig } from 'tsup'

// Bundle the CLI into a single ESM file. esbuild inlines the shared engine we
// import from ../src/lib (parser, serializer, gitSync), so the published
// package is self-contained.
export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  target: 'node18',
  bundle: true,
  clean: true,
  minify: true,
  banner: { js: '#!/usr/bin/env node' },
})
