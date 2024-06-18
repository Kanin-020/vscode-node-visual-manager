import * as vscode from 'vscode';

import fs from 'fs';
import { getNonce } from './getNonce';
import nvm from '../model/nvm';
import nvmLinux from '../model/nvmLinux';
import nvmWindows from '../model/nvmWindows';

export class AvailableProvider implements vscode.WebviewViewProvider {
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
                case "send-list-available": {

                    getRemoteList(webviewView);

                    break;
                }
                case "send-install": {

                    installVersion(data.data, webviewView);

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
            vscode.Uri.joinPath(this._extensionUri, "dist", "styles/global.css")
        );

        const styleVSCodeUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, "dist", "styles/vscode.css")
        );

        const styleSidebar = webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, "dist", "styles/sidebar.css")
        );

        const styleIconsUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, "dist", "styles/codicon.css")
        );

        const scriptUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, "dist", "controllers/available.js")
        );

        const htmlFilePath = vscode.Uri.joinPath(this._extensionUri, "dist", "pages/available.html").fsPath;
        const htmlString = fs.readFileSync(htmlFilePath, 'utf-8');

        const nonce = getNonce();

        return `<!DOCTYPE html>
            <html lang="en"
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Cat Coding</title>


                <meta http-equiv="Content-Security-Policy" content="font-src ${webview.cspSource}; img-src https: data:; style-src 'unsafe-inline' ${webview.cspSource}; script-src 'nonce-${nonce}';">

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

async function getRemoteList(webviewView: vscode.WebviewView) {

    try {

        const systemResponse = await nvm.verifyUserSystem();

        let response;

        switch (systemResponse.operativeSystem) {
            case 'win32':
                response = await nvmWindows.getNodeVersionAvailableList();
                break;

            case 'linux':
                response = await nvmLinux.getNodeVersionAvailableList();
                break;

            case 'darwin':
                response = await nvmLinux.getNodeVersionAvailableList();
                break;


            default:
                vscode.window.showErrorMessage('Operative system not supported yet.');
                throw Error;
        }

        if (response.error) {
            vscode.window.showErrorMessage('Could not get available node version list. Verify your internet connection.');
        }

        if (response.nodeRemoteList) {
            webviewView.webview.postMessage({ type: 'receive-list-available', data: response.nodeRemoteList });
        }


    } catch (error) {

        console.error(error);

    }

}

async function installVersion(version: string, webviewView: vscode.WebviewView) {

    try {

        vscode.window.showInformationMessage('Installing node version: ' + version);

        const systemResponse = await nvm.verifyUserSystem();

        let response;

        switch (systemResponse.operativeSystem) {
            case 'win32':
                response = await nvmWindows.installNodeVersion(version);
                break;

            case 'linux':
                response = await nvmLinux.installNodeVersion(version);
                break;

            case 'darwin':
                response = await nvmLinux.installNodeVersion(version);
                break;


            default:
                vscode.window.showErrorMessage('Operative system not supported yet.');
                throw Error;
        }

        if (response.error) {
            vscode.window.showErrorMessage('Could not install the requested version.');
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

