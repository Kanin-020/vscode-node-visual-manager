import * as vscode from 'vscode';

import { getNonce } from '../csp/getNonce';
import nvm from '@core/nvm/nvm';
import os from "os";


export class CurrentVersionProvider implements vscode.WebviewViewProvider {
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

                case "send-os": {
                    const system = os.platform();
                    webviewView.webview.postMessage({ type: 'receive-os', data: system });

                    break;
                }

                case "send-current": {

                    getCurrent(webviewView);

                    break;
                }

                case "send-list": {

                    getList(webviewView);

                    break;
                }
                case "send-use": {

                    useVersion(data.data, webviewView);

                    break;
                }
                case "send-uninstall": {

                    uninstallVersion(data.data, webviewView);

                    break;

                }
                case "send-on": {

                    enable(webviewView);

                    break;

                }
                case "send-off": {

                    disable(webviewView);

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
            vscode.Uri.joinPath(this._extensionUri, "dist", "webview", "current.bundle.js")
        );

        const nonce = getNonce();

        const cspPolicy = [
            "default-src 'none'",
            `font-src ${webview.cspSource}`,
            `img-src ${webview.cspSource} https: data:`,
            `style-src ${webview.cspSource} 'unsafe-inline'`,
            `script-src ${webview.cspSource} 'nonce-${nonce}'`,
        ].join('; ');


        return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Current</title>

                <meta http-equiv="Content-Security-Policy" content="${cspPolicy}">
            
            </head>
            <body>
                <div id="current-root"></div>
                <script nonce="${nonce}" src="${scriptUri}"></script>
            </body>
            </html>`;

    }

}

async function getCurrent(webviewView: vscode.WebviewView) {

    try {

        const response = await nvm.getCurrentNodeVersion();

        if ('error' in response) {
            return;
        }

        if (response.currentNodeVersion) {

            webviewView.webview.postMessage({ type: 'receive-current', data: response.currentNodeVersion });

            return response.currentNodeVersion;
        }

    } catch (error) {
        console.error(error);
    }

}

async function getList(webviewView: vscode.WebviewView) {

    try {

        const response = await nvm.getInstalledVersionList();

        if ('error' in response) {
            vscode.window.showErrorMessage('Could not get node version list.');
            return;
        }

        webviewView.webview.postMessage({ type: 'receive-list', data: response.nodeList });


    } catch (error) {
        console.error(error);
    }

}


async function useVersion(version: string, webviewView: vscode.WebviewView) {

    const response = await nvm.useVersion(version);

    if ('error' in response) {
        vscode.window.showErrorMessage('Could not set version to: ' + version);
        return;

    }

    vscode.window.showInformationMessage(response.message);

    webviewView.webview.postMessage({ type: 'receive-use', data: response.id });


}

async function uninstallVersion(version: string, webviewView: vscode.WebviewView) {

    const response = await nvm.uninstall(version);

    if ('error' in response) {
        vscode.window.showErrorMessage('Could not uninstall the selected version.');
        return;
    }

    if (response.message && response.id) {

        vscode.window.showInformationMessage(response.message);

        webviewView.webview.postMessage({ type: 'receive-uninstall', data: response.id });

    }

}

async function enable(webviewView: vscode.WebviewView) {

    const response = await nvm.enable();

    const currentResponse = await nvm.getCurrentNodeVersion();

    if ('error' in response || 'error' in currentResponse) {
        vscode.window.showInformationMessage('NVM could not be enabled.');
        return;
    }

    if (response.message && currentResponse.currentNodeVersion) {

        vscode.window.showInformationMessage(response.message);

        webviewView.webview.postMessage({ type: 'receive-on', data: currentResponse.currentNodeVersion });

    }

}

async function disable(webviewView: vscode.WebviewView) {

    const response = await nvm.disable();

    const currentResponse = await nvm.getCurrentNodeVersion();

    if ('error' in response || 'error' in currentResponse) {
        vscode.window.showInformationMessage('NVM could not be disabled.');
        return;
    }

    if (response.message && currentResponse.currentNodeVersion) {

        vscode.window.showInformationMessage(response.message);

        webviewView.webview.postMessage({ type: 'receive-off', data: currentResponse.currentNodeVersion });

    }

}
