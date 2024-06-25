"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AvailableProvider = void 0;
const vscode = __importStar(require("vscode"));
const getNonce_1 = require("./getNonce");
const nvm_1 = __importDefault(require("../model/nvm"));
const nvmLinux_1 = __importDefault(require("../model/nvmLinux"));
const nvmWindows_1 = __importDefault(require("../model/nvmWindows"));
class AvailableProvider {
    _extensionUri;
    _view;
    _doc;
    constructor(_extensionUri) {
        this._extensionUri = _extensionUri;
    }
    resolveWebviewView(webviewView) {
        this._view = webviewView;
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [vscode.Uri.joinPath(this._extensionUri, 'dist')],
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
            }
        });
    }
    revive(panel) {
        this._view = panel;
    }
    _getHtmlForWebview(webview) {
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "dist", "webview", "available.bundle.js"));
        const nonce = (0, getNonce_1.getNonce)();
        return `<!DOCTYPE html>
        <html lang="en"
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Available</title>

            <!--<meta http-equiv="Content-Security-Policy" content="font-src ${webview.cspSource}; img-src https: data:; style-src 'unsafe-inline' ${webview.cspSource}; script-src 'nonce-${nonce}';"> -->

        </head>
        <body>
            <div id="available-root"></div>
            <script nonce="${nonce}" src="${scriptUri}"></script>
        </body>
        </html>`;
    }
}
exports.AvailableProvider = AvailableProvider;
async function getRemoteList(webviewView) {
    try {
        const systemResponse = await nvm_1.default.verifyUserSystem();
        let response;
        switch (systemResponse.operativeSystem) {
            case 'win32':
                response = await nvmWindows_1.default.getNodeVersionAvailableList();
                break;
            case 'linux':
            case 'darwin':
                response = await nvmLinux_1.default.getNodeVersionAvailableList();
                break;
            default:
                vscode.window.showErrorMessage('Operative system not supported yet.');
                throw new Error('Operative system not supported yet.');
        }
        if (response.error) {
            vscode.window.showErrorMessage('Could not get available node version list. Verify your internet connection.');
        }
        if (response.nodeRemoteList) {
            webviewView.webview.postMessage({ type: 'receive-list-available', data: response.nodeRemoteList });
        }
    }
    catch (error) {
        console.error(error);
    }
}
async function installVersion(version, webviewView) {
    try {
        vscode.window.showInformationMessage('Installing node version: ' + version);
        const systemResponse = await nvm_1.default.verifyUserSystem();
        let response;
        switch (systemResponse.operativeSystem) {
            case 'win32':
                response = await nvmWindows_1.default.installNodeVersion(version);
                break;
            case 'linux':
            case 'darwin':
                response = await nvmLinux_1.default.installNodeVersion(version);
                break;
            default:
                vscode.window.showErrorMessage('Operative system not supported yet.');
                throw new Error('Operative system not supported yet.');
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
    }
    catch (error) {
        console.error(error);
    }
}
//# sourceMappingURL=availableProvider.js.map