/**
 * Build script for Electron renderer process
 * Bundles React app into a single JavaScript file using esbuild
 */

const esbuild = require('esbuild');
const path = require('path');

// Bundle renderer process
esbuild.build({
    entryPoints: [path.join(__dirname, 'src/renderer/index.tsx')],
    bundle: true,
    outfile: path.join(__dirname, 'dist/renderer/renderer.js'),
    platform: 'browser',
    target: 'chrome120',
    loader: {
        '.tsx': 'tsx',
        '.ts': 'ts'
    },
    external: [],
    minify: false,
    sourcemap: true
}).then(() => {
    console.log('Renderer bundled successfully');
}).catch(() => process.exit(1));
