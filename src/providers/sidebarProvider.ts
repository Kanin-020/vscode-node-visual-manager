import * as vscode from 'vscode';

import fnm from '../model/sidebar';
import fs from 'fs';
import { getNonce } from './getNonce';

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
                case "send-installed": {
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
                case "send-default": {

                    const defaultResponse = await setDefault(data.data);

                    defaultResponse.message = `The node version has been set to ${defaultResponse.id}`;

                    vscode.window.showInformationMessage(defaultResponse.message);

                    webviewView.webview.postMessage({ type: 'receive-default', data: defaultResponse.id });

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

    const response = await fnm.verifyIsInstalled();

    data.value = response;

    if (response === true) {
        console.log('FNM is installed');
    }
    else {
        vscode.window.showErrorMessage('FNM is not installed');
    }

}

async function getList() {

    const response = await fnm.getNodeVersionList();

    return response;

}

async function getRemoteList() {

    const response = await fnm.getNodeVersionRemoteList();

    return response;
}

async function setDefault(version: string) {

    const response = await fnm.setDefaultNodeVersion(version);

    return response;

}

async function uninstallVersion(version: string) {

    const response = await fnm.uninstallNodeVersion(version);

    return response;

}
