import * as vscode from 'vscode';

import fs from 'fs';
import { getNonce } from './getNonce';
import nvm from '../model/nvm';
import nvmLinux from '../model/nvmLinux';
import nvmWindows from '../model/nvmWindows';

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

                    getList(webviewView);

                    break;
                }
                case "send-current": {

                    getCurrent(webviewView);

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
            vscode.Uri.joinPath(this._extensionUri, "dist", "controllers/sidebar.js")
        );

        const htmlFilePath = vscode.Uri.joinPath(this._extensionUri, "dist", "pages/sidebar.html").fsPath;
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

async function isInstalled(data: any) {

    try {

        const response = await nvm.verifyNvmIsInstalled();

        data.value = response;

        if (response === false) {
            vscode.window.showErrorMessage('NVM is not installed');
        }

    } catch (error) {
        console.error(error);
    }

}

async function getList(webviewView: vscode.WebviewView) {

    try {

        const systemResponse = await nvm.verifyUserSystem();

        let response;

        switch (systemResponse.operativeSystem) {
            case 'win32':
                response = await nvmWindows.getNodeVersionList();
                break;

            case 'linux':
                response = await nvmLinux.getNodeVersionList();
                break;

            case 'darwin':
                response = await nvmLinux.getNodeVersionList();
                break;

            default:
                vscode.window.showErrorMessage('Operative system not supported yet.');
                throw Error;
        }


        if (response && response.error) {
            vscode.window.showErrorMessage('Could not get node version list.');
        }

        if (response && response.nodeList) {
            webviewView.webview.postMessage({ type: 'receive-list', data: response.nodeList });
        }


    } catch (error) {
        console.error(error);
    }

}

async function getCurrent(webviewView: vscode.WebviewView) {

    try {

        const systemResponse = await nvm.verifyUserSystem();

        let response;

        switch (systemResponse.operativeSystem) {
            case 'win32':
                response = await nvmWindows.getCurrentNodeVersion();
                break;

            case 'linux':
                response = await nvmLinux.getCurrentNodeVersion();
                break;

            case 'darwin':
                response = await nvmLinux.getCurrentNodeVersion();
                break;

            default:
                vscode.window.showErrorMessage('Operative system not supported yet.');
                throw Error;
        }

        if (response.error) {
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

async function useVersion(version: string, webviewView: vscode.WebviewView) {


    const systemResponse = await nvm.verifyUserSystem();

    let response;

    switch (systemResponse.operativeSystem) {
        case 'win32':
            response = await nvmWindows.useNodeVersion(version);
            break;

        case 'linux':
            response = await nvmLinux.useNodeVersion(version);
            break;

        case 'darwin':
            response = await nvmLinux.useNodeVersion(version);
            break;

        default:
            vscode.window.showErrorMessage('Operative system not supported yet.');
            throw Error;
    }


    if (response.error) {
        vscode.window.showErrorMessage('Could not set version to: ' + version);
    }

    if (response.message && response.id) {

        vscode.window.showInformationMessage(response.message);

        webviewView.webview.postMessage({ type: 'receive-use', data: response.id });
    }

}

async function uninstallVersion(version: string, webviewView: vscode.WebviewView) {

    const systemResponse = await nvm.verifyUserSystem();

    let response;

    switch (systemResponse.operativeSystem) {
        case 'win32':
            response = await nvmWindows.uninstallNodeVersion(version);
            break;

        case 'linux':
            response = await nvmLinux.uninstallNodeVersion(version);
            break;

        case 'darwin':
            response = await nvmLinux.uninstallNodeVersion(version);
            break;

        default:
            vscode.window.showErrorMessage('Operative system not supported yet.');
            throw Error;
    }

    if (response.error) {
        vscode.window.showErrorMessage('Could not uninstall the selected version.');
    }

    if (response.message && response.id) {

        vscode.window.showInformationMessage(response.message);

        webviewView.webview.postMessage({ type: 'receive-uninstall', data: response.id });

    }

}

async function enable(webviewView: vscode.WebviewView) {

    const response = await nvmWindows.enableNVM();

    const currentResponse = await nvmWindows.getCurrentNodeVersion();

    if (response.error) {
        vscode.window.showInformationMessage('NVM could not be enabled.');
    }

    if (response.message && currentResponse.currentNodeVersion) {

        vscode.window.showInformationMessage(response.message);

        webviewView.webview.postMessage({ type: 'receive-on', data: currentResponse.currentNodeVersion });

    }

}

async function disable(webviewView: vscode.WebviewView) {

    const response = await nvmWindows.disableNVM();

    const currentResponse = await nvmWindows.getCurrentNodeVersion();

    if (response.error) {
        vscode.window.showInformationMessage('NVM could not be disabled.');
    }

    if (response.message && currentResponse.currentNodeVersion) {

        vscode.window.showInformationMessage(response.message);

        webviewView.webview.postMessage({ type: 'receive-off', data: currentResponse.currentNodeVersion });

    }

}
