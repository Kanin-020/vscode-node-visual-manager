// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below

import * as vscode from 'vscode';

import { AvailableProvider } from './providers/availableProvider';
import { SidebarProvider } from './providers/sidebarProvider';

export function activate(context: vscode.ExtensionContext) {

	const sidebarProvider = new SidebarProvider(context.extensionUri);

	const availableProvider = new AvailableProvider(context.extensionUri);

	context.subscriptions.push(vscode.window.registerWebviewViewProvider("node-visual-manager-sidebar", sidebarProvider));

	context.subscriptions.push(vscode.window.registerWebviewViewProvider("node-visual-manager-sidebar-available", availableProvider));

}

// This method is called when your extension is deactivated
export function deactivate() { }
