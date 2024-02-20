// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

import { SidebarProvider } from './providers/sidebarProvider';

export function activate(context: vscode.ExtensionContext) {

	const sidebarProvider = new SidebarProvider(context.extensionUri);

	context.subscriptions.push(vscode.window.registerWebviewViewProvider("fun-node-manager-sidebar", sidebarProvider));

	context.subscriptions.push(vscode.window.registerWebviewViewProvider("fun-node-manager-sidebar-remotes", sidebarProvider));

	let disposable = vscode.commands.registerCommand('fun-node-manager.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from Fun Node Manager!');
	});



	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() { }
