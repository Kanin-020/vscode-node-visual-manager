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
exports.SidebarProvider = void 0;
const vscode = __importStar(require("vscode"));
const getNonce_1 = require("./getNonce");
const nvm_1 = __importDefault(require("../model/nvm"));
const nvmLinux_1 = __importDefault(require("../model/nvmLinux"));
const nvmWindows_1 = __importDefault(require("../model/nvmWindows"));
class SidebarProvider {
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
                case "send-nvm": {
                    isInstalled(data);
                    break;
                }
                case "send-os": {
                    getCurrentOS(webviewView);
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
    revive(panel) {
        this._view = panel;
    }
    _getHtmlForWebview(webview) {
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "dist", "webview", "sidebar.bundle.js"));
        const nonce = (0, getNonce_1.getNonce)();
        return `<!DOCTYPE html>
            <html lang="en"
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>SideBar</title>

                <meta http-equiv="Content-Security-Policy" content="font-src ${webview.cspSource}; img-src https: data:; style-src 'unsafe-inline' ${webview.cspSource}; script-src 'nonce-${nonce}';">

            </head>
            <body>
                <div id="sidebar-root"></div>
                <script nonce="${nonce}" src="${scriptUri}"></script>
            </body>
            </html>`;
    }
}
exports.SidebarProvider = SidebarProvider;
async function isInstalled(data) {
    try {
        const systemResponse = await nvm_1.default.verifyUserSystem();
        const response = await nvm_1.default.verifyNvmIsInstalled();
        data.value = response;
        if (response === false) {
            await vscode.window.showInformationMessage('Wait for installation ...');
            switch (systemResponse.operativeSystem) {
                case 'win32':
                    await nvm_1.default.installNvmForWindows();
                    break;
                case 'linux':
                    await await nvm_1.default.installNvmForLinux();
                    break;
                case 'darwin':
                    await nvm_1.default.installNvmForLinux();
                    break;
                default:
                    vscode.window.showErrorMessage('Operative system not supported yet.');
                    throw Error;
            }
            await vscode.commands.executeCommand('workbench.action.webview.reloadWebviewAction');
            await vscode.window.showInformationMessage('NVM installed');
        }
    }
    catch (error) {
        console.error(error);
    }
}
async function getCurrentOS(webviewView) {
    const systemResponse = await nvm_1.default.verifyUserSystem();
    webviewView.webview.postMessage({ type: 'receive-os', data: systemResponse.operativeSystem });
}
async function getList(webviewView) {
    try {
        const systemResponse = await nvm_1.default.verifyUserSystem();
        let response;
        switch (systemResponse.operativeSystem) {
            case 'win32':
                response = await nvmWindows_1.default.getNodeVersionList();
                break;
            case 'linux':
                response = await nvmLinux_1.default.getNodeVersionList();
                break;
            case 'darwin':
                response = await nvmLinux_1.default.getNodeVersionList();
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
    }
    catch (error) {
        console.error(error);
    }
}
async function getCurrent(webviewView) {
    try {
        const systemResponse = await nvm_1.default.verifyUserSystem();
        let response;
        switch (systemResponse.operativeSystem) {
            case 'win32':
                response = await nvmWindows_1.default.getCurrentNodeVersion();
                break;
            case 'linux':
                response = await nvmLinux_1.default.getCurrentNodeVersion();
                break;
            case 'darwin':
                response = await nvmLinux_1.default.getCurrentNodeVersion();
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
    }
    catch (error) {
        console.error(error);
    }
}
async function useVersion(version, webviewView) {
    const systemResponse = await nvm_1.default.verifyUserSystem();
    let response;
    switch (systemResponse.operativeSystem) {
        case 'win32':
            response = await nvmWindows_1.default.useNodeVersion(version);
            break;
        case 'linux':
            response = await nvmLinux_1.default.useNodeVersion(version);
            break;
        case 'darwin':
            response = await nvmLinux_1.default.useNodeVersion(version);
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
async function uninstallVersion(version, webviewView) {
    const systemResponse = await nvm_1.default.verifyUserSystem();
    let response;
    switch (systemResponse.operativeSystem) {
        case 'win32':
            response = await nvmWindows_1.default.uninstallNodeVersion(version);
            break;
        case 'linux':
            response = await nvmLinux_1.default.uninstallNodeVersion(version);
            break;
        case 'darwin':
            response = await nvmLinux_1.default.uninstallNodeVersion(version);
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
async function enable(webviewView) {
    const response = await nvmWindows_1.default.enableNVM();
    const currentResponse = await nvmWindows_1.default.getCurrentNodeVersion();
    if (response.error) {
        vscode.window.showInformationMessage('NVM could not be enabled.');
    }
    if (response.message && currentResponse.currentNodeVersion) {
        vscode.window.showInformationMessage(response.message);
        webviewView.webview.postMessage({ type: 'receive-on', data: currentResponse.currentNodeVersion });
    }
}
async function disable(webviewView) {
    const response = await nvmWindows_1.default.disableNVM();
    const currentResponse = await nvmWindows_1.default.getCurrentNodeVersion();
    if (response.error) {
        vscode.window.showInformationMessage('NVM could not be disabled.');
    }
    if (response.message && currentResponse.currentNodeVersion) {
        vscode.window.showInformationMessage(response.message);
        webviewView.webview.postMessage({ type: 'receive-off', data: currentResponse.currentNodeVersion });
    }
}
//# sourceMappingURL=sidebarProvider.js.map