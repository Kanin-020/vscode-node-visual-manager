// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below

import * as vscode from 'vscode';

import { AvailableVersionProvider } from './vscode/providers/availableVersionProvider';
import { CurrentVersionProvider } from './vscode/providers/currentVersionProvider';

export function activate(context: vscode.ExtensionContext) {

	const sidebarVersionProvider = new CurrentVersionProvider(context.extensionUri);

	const availableVersionProvider = new AvailableVersionProvider(context.extensionUri);

	context.subscriptions.push(vscode.window.registerWebviewViewProvider("node-visual-manager-sidebar-current", sidebarVersionProvider));

	context.subscriptions.push(vscode.window.registerWebviewViewProvider("node-visual-manager-sidebar-available", availableVersionProvider));

}

// This method is called when your extension is deactivated
export function deactivate() { }
