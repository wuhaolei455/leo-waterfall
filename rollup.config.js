import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import dts from 'rollup-plugin-dts';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const production = !process.env.ROLLUP_WATCH;
const packageJson = JSON.parse(readFileSync(join(__dirname, 'package.json'), 'utf8'));
const version = packageJson.version;
const versionPlugin = {
    name: 'version-plugin',
    transform(code) {
        return code.replace(/process\.env\.SDK_VERSION/g, `"${version}"`);
    }
};

export default [
    // ES modules build
    {
        input: 'src/index.ts',
        external: ['react', 'react-dom', 'react/jsx-runtime'],
        output: {
            file: 'dist/index.esm.js',
            format: 'es',
            sourcemap: true
        },
        plugins: [
            resolve(),
            typescript({
                tsconfig: './tsconfig.json',
                declaration: false
            }),
            versionPlugin,
            production && terser()
        ].filter(Boolean)
    },

    // CommonJS build
    {
        input: 'src/index.ts',
        external: ['react', 'react-dom', 'react/jsx-runtime'],
        output: {
            file: 'dist/index.js',
            format: 'cjs',
            sourcemap: true,
            exports: 'named'
        },
        plugins: [
            resolve(),
            typescript({
                tsconfig: './tsconfig.json',
                declaration: false
            }),
            versionPlugin,
            production && terser()
        ].filter(Boolean)
    },

    // UMD build for browsers
    {
        input: 'src/index.ts',
        external: ['react', 'react-dom', 'react/jsx-runtime'],
        output: {
            file: 'dist/index.umd.js',
            format: 'umd',
            name: 'SolarWaterfall',
            sourcemap: true,
            globals: {
                'react': 'React',
                'react-dom': 'ReactDOM',
                'react/jsx-runtime': 'ReactJSXRuntime'
            }
        },
        plugins: [
            resolve(),
            typescript({
                tsconfig: './tsconfig.json',
                declaration: false
            }),
            versionPlugin,
            production && terser()
        ].filter(Boolean)
    },

    // Type definitions
    {
        input: 'src/index.ts',
        output: {
            file: 'dist/index.d.ts', // 导出的类型
            format: 'es'
        },
        plugins: [
            dts()
        ]
    }
]