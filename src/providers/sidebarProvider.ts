import * as vscode from 'vscode';

import fs from 'fs';
import { getNonce } from './getNonce';
import nvm from '../model/sidebar';

export class SidebarProvider implements vscode.WebviewViewProvider {
    _view?: vscode.WebviewView;
    _doc?: vscode.TextDocument;

    constructor(private readonly _extensionUri: vscode.Uri) { }

    public resolveWebviewView(webviewView: vscode.WebviewView) {
        this._view = webviewView;

        webviewView.webview.options = {
            // Allow scripts in the webview
            enableScripts: true,

            localResourceRoots: [this._extensionUri],
        };

        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

        webviewView.webview.onDidReceiveMessage(async (data) => {
            switch (data.type) {
                case "send-nvm": {

                    isInstalled(data);

                    break;
                }
                case "send-list": {

                    const nodeList = await getList();

                    webviewView.webview.postMessage({ type: 'receive-list', data: nodeList });

                    break;
                }
                case "send-list-remote": {

                    const nodeRemoteList = await getRemoteList();

                    webviewView.webview.postMessage({ type: 'receive-list-remote', data: nodeRemoteList });

                    break;

                }
                case "send-current": {

                    const currentNodeVersion = await getCurrent();

                    webviewView.webview.postMessage({ type: 'receive-current', data: currentNodeVersion });

                    break;
                }
                case "send-use": {

                    const useResponse = await useVersion(data.data);

                    if (useResponse) {

                        vscode.window.showInformationMessage(useResponse.message);

                        webviewView.webview.postMessage({ type: 'receive-use', data: useResponse.id });

                    }

                    break;
                }
                case "send-uninstall": {

                    const deleteResponse = await uninstallVersion(data.data);

                    vscode.window.showInformationMessage(deleteResponse.message);

                    webviewView.webview.postMessage({ type: 'receive-uninstall', data: deleteResponse.id });

                    break;

                }
                case "onInfo": {
                    if (!data.value) {
                        return;
                    }
                    vscode.window.showInformationMessage(data.value);

                    break;
                }
                case "onError": {
                    if (!data.value) {
                        return;
                    }
                    vscode.window.showErrorMessage(data.value);
                    break;
                }
            }
        });

    }

    public revive(panel: vscode.WebviewView) {
        this._view = panel;
    }

    private _getHtmlForWebview(webview: vscode.Webview): string {

        const styleGlobalUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, "src/styles", "global.css")
        );
        const styleVSCodeUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, "src/styles", "vscode.css")
        );
        const styleIconsUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, 'node_modules', '@vscode/codicons', 'dist', 'codicon.css')
        );
        const styleSidebar = webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, "src/styles", "sidebar.css")
        );
        const scriptUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, "src/controllers", "sidebar.js")
        );

        const htmlFilePath = vscode.Uri.joinPath(this._extensionUri, "src/pages", "sidebar.html").fsPath;
        const htmlString = fs.readFileSync(htmlFilePath, 'utf-8');

        const nonce = getNonce();

        return `<!DOCTYPE html>
            <html lang="en"
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Cat Coding</title>

                <meta http-equiv="Content-Security-Policy" content="img-src https: data:; style-src 'unsafe-inline' ${webview.cspSource}; script-src 'nonce-${nonce}';">

                <link href="${styleSidebar}" rel="stylesheet">
                <link href="${styleVSCodeUri}" rel="stylesheet">
                <link href="${styleIconsUri}" rel="stylesheet">
                <link href="${styleGlobalUri}" rel="stylesheet">

                <script nonce="${nonce}">
                    const clientVsCode = acquireVsCodeApi();
                </script>

            </head>
            <body>
                ${htmlString}
                <script nonce="${nonce}" src="${scriptUri}" ></script>
            </body>
            </html>`;


    }

}

async function isInstalled(data: any) {

    const response = await nvm.verifyNvmIsInstalled();

    data.value = response;

    if (response === false) {
        vscode.window.showErrorMessage('nvm is not installed');
    }

}

async function getList() {

    const response = await nvm.getNodeVersionList();

    return response;

}

async function getRemoteList() {

    const response = await nvm.getNodeVersionRemoteList();

    return response;
}

async function getCurrent() {

    const response = await nvm.getCurrentNodeVersion();

    return response;

}

async function useVersion(version: string) {

    const response = await nvm.useNodeVersion(version);

    return response;

}

async function installVersion(version: string) {

    const response = await nvm.installNodeVersion(version);

    return response;

}

async function uninstallVersion(version: string) {

    const response = await nvm.uninstallNodeVersion(version);

    return response;

}
