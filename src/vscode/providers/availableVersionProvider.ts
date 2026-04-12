import * as vscode from 'vscode';

import { getNonce } from '../csp/getNonce';
import nvm from '@core/nvm/nvm';

export class AvailableVersionProvider implements vscode.WebviewViewProvider {
    _view?: vscode.WebviewView;
    _doc?: vscode.TextDocument;

    constructor(private readonly _extensionUri: vscode.Uri) { }

    public resolveWebviewView(webviewView: vscode.WebviewView) {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [vscode.Uri.joinPath(this._extensionUri, 'dist', 'webview')],

        };

        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

        webviewView.webview.onDidReceiveMessage(async (data) => {

            switch (data.type) {
                case 'send-list-available': {
                    getRemoteList(webviewView);
                    break;
                }
                case 'send-install': {
                    installVersion(data.data, webviewView);
                    break;
                }
                case 'send-install-source': {
                    installFromSource(data.data, webviewView);
                    break;
                }

            }
        });
    }

    public revive(panel: vscode.WebviewView) {
        this._view = panel;
    }

    private _getHtmlForWebview(webview: vscode.Webview): string {

        const scriptUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, "dist", "webview", "available.bundle.js")
        );

        const nonce = getNonce();

        const cspPolicy = `
            default-src 'none';
            font-src ${webview.cspSource};
            img-src ${webview.cspSource} https: data:;
            style-src ${webview.cspSource} 'unsafe-inline';
            script-src ${webview.cspSource} 'nonce-${nonce}';
        `;

        return `<!DOCTYPE html>
        <html lang="en"
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Available</title>

            <meta http-equiv="Content-Security-Policy" content="${cspPolicy}">
        
        </head>
        <body>
            <div id="available-root"></div>
            <script nonce="${nonce}" src="${scriptUri}"></script>
        </body>
        </html>`;

    }
}

async function getRemoteList(webviewView: vscode.WebviewView) {
    try {

        const response = await nvm.getAvailableVersionList();

        if ('error' in response) {
            vscode.window.showErrorMessage('Could not get available node version list. Verify your internet connection.');
            return;
        }

        if (response.nodeList) {
            webviewView.webview.postMessage({ type: 'receive-list-available', data: response.nodeList });
        }

    } catch (error) {
        console.error(error);
    }
}

async function installVersion(version: string, webviewView: vscode.WebviewView) {
    try {

        vscode.window.showInformationMessage('Installing node version: ' + version);

        const response = await nvm.install(version);

        if (!response || 'error' in response) {
            vscode.window.showErrorMessage('Could not install the requested version.');
            return;
        }

        if (response.message) {
            vscode.window.showInformationMessage(response.message);
            webviewView.webview.postMessage({ type: 'receive-install', data: response.id });

            await vscode.commands.executeCommand('workbench.action.webview.reloadWebviewAction');
        }
    } catch (error) {
        console.error(error);
    }
}

async function installFromSource(version: string, webviewView: vscode.WebviewView) {
    try {

        vscode.window.showInformationMessage('Installing node version from source: ' + version);

        const response = await nvm.installFromSource?.(version);

        if (!response || 'error' in response) {
            vscode.window.showErrorMessage('Could not install the requested version.');
            return;
        }

        if (response.message) {
            vscode.window.showInformationMessage(response.message);
            vscode.window.showInformationMessage(`Complete node v${version} installed successfully.`);
            webviewView.webview.postMessage({ type: 'receive-install', data: response.id });

            await vscode.commands.executeCommand('workbench.action.webview.reloadWebviewAction');
        }
    } catch (error) {
        console.error(error);
    }

}