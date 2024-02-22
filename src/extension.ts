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

	let disposable = vscode.commands.registerCommand('node-visual-manager.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from Node Visual Manager!');
	});



	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() { }
