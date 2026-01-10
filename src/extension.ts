import * as vscode from 'vscode';

import { AvailableVersionProvider } from './vscode/providers/availableVersionProvider';
import { CurrentVersionProvider } from './vscode/providers/currentVersionProvider';
import nvm from '@core/nvm/nvm';

export function activate(context: vscode.ExtensionContext) {

	const sidebarVersionProvider = new CurrentVersionProvider(context.extensionUri);
	const availableVersionProvider = new AvailableVersionProvider(context.extensionUri);

	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(
			"node-visual-manager-sidebar-current",
			sidebarVersionProvider
		)
	);

	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(
			"node-visual-manager-sidebar-available",
			availableVersionProvider
		)
	);

	const activateNvmForWorkspace = async (projectPath: string) => {
		try {
			const result = await nvm.useVersionFromProject(projectPath);

			if ('error' in result && result.error) {
				vscode.window.showErrorMessage(String(result.error));
			} else if ('message' in result && result.message) {
				vscode.window.showInformationMessage(result.message);
			}
		} catch (err: any) {
			vscode.window.showErrorMessage(`Error reading .nvmrc: ${err?.message || String(err)}`);
		}
	};

	vscode.workspace.workspaceFolders?.forEach(folder => {
		activateNvmForWorkspace(folder.uri.fsPath);
	});

	context.subscriptions.push(
		vscode.workspace.onDidChangeWorkspaceFolders(event => {
			event.added.forEach(folder => activateNvmForWorkspace(folder.uri.fsPath));
		})
	);
}



// This method is called when your extension is deactivated
export function deactivate() { }
