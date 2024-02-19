import * as vscode from 'vscode';

import fs from 'fs';
import { verifyInstalled } from '../model/sidebar';

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
                case "fnmList": {
                   const response = verifyInstalled();
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

        const scriptUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, "src/controllers", "sidebar.js")
        );


        const htmlFilePath = vscode.Uri.joinPath(this._extensionUri, "src/pages", "sidebar.html").fsPath;
        const htmlString = fs.readFileSync(htmlFilePath, 'utf-8');

        return `<!DOCTYPE html>
            <html lang="en"
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Cat Coding</title>


                <meta
          http-equiv="Content-Security-Policy"
          content="default-src 'none'; img-src ${webview.cspSource} https:; script-src ${webview.cspSource}; style-src ${webview.cspSource};"
        />

                <link href="${styleVSCodeUri}" rel="stylesheet">
                <link href="${styleGlobalUri}" rel="stylesheet">
            </head>
            <body>
                ${htmlString}
                <script src="${scriptUri}"></script>
            </body>
            </html>`;


    }

}

