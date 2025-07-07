import * as assert from 'assert';
import * as path from 'path';
import * as fs from 'fs';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import { TemplateManager } from '../templateManager';
import { IgnoreTemplate } from '../types';

suite('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	test('Sample test', () => {
		assert.strictEqual(-1, [1, 2, 3].indexOf(5));
		assert.strictEqual(-1, [1, 2, 3].indexOf(0));
	});

	test('Stack file functionality test', async () => {
		// Create a mock extension context
		const mockContext = {
			extensionPath: path.join(__dirname, '../..')
		} as vscode.ExtensionContext;

		const templateManager = new TemplateManager(mockContext);

		// Test with TwinCAT3 template that has stack files
		const twinCATTemplate: IgnoreTemplate = {
			label: 'TwinCAT3',
			description: 'Category: Automation',
			path: 'toptal/templates/TwinCAT3.gitignore'
		};

		// Generate content for TwinCAT3 which should include stack files
		const content = await templateManager.generateContent('.gitignore', [twinCATTemplate], false);

		// Check if the content includes TwinCAT3 template
		assert.ok(content.includes('===== TwinCAT3 ====='));
		
		// Check if stack files are included
		assert.ok(content.includes('VisualStudio Stack') || content.includes('OpenFrameworks Stack'));
		
		// Check if referenced templates are included
		assert.ok(content.includes('Referenced template:'));

		console.log('Stack file test passed!');
	});

	test('Template without stack files', async () => {
		// Create a mock extension context
		const mockContext = {
			extensionPath: path.join(__dirname, '../..')
		} as vscode.ExtensionContext;

		const templateManager = new TemplateManager(mockContext);

		// Test with a template that doesn't have stack files
		const nodeTemplate: IgnoreTemplate = {
			label: 'Node',
			description: 'Category: Language',
			path: 'toptal/templates/Node.gitignore'
		};

		// Generate content for Node template
		const content = await templateManager.generateContent('.gitignore', [nodeTemplate], false);

		// Check if the content includes Node template
		assert.ok(content.includes('===== Node ====='));
		
		// Check that no stack references are included
		assert.ok(!content.includes('Referenced template:'));

		console.log('Non-stack template test passed!');
	});
});
