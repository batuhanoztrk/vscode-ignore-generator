import { defineConfig } from '@vscode/test-cli';

export default defineConfig([
	{
		label: 'unitTests',
		files: 'out/test/**/*.test.js',
		version: '1.60.0',
		launchArgs: ['--disable-extensions'],
		mocha: {
			ui: 'tdd',
			timeout: 20000,
			reporter: 'spec'
		}
	}
]);
