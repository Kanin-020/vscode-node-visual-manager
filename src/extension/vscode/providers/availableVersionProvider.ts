import { commands, window, WebviewView } from 'vscode';

import nvm from '@core/nvm/nvm';
import { BaseWebviewProvider } from './baseWebviewProvider';

/**
 * WebviewView provider for browsing and installing available Node.js versions.
 *
 * Fetches fresh data from nvm on every request and posts it directly to the webview.
 * The webview uses vscode.getState/setState to persist data across iframe recreations.
 */
export class AvailableVersionProvider extends BaseWebviewProvider {
    protected readonly scriptBundle = 'available.bundle.js';
    protected readonly title = 'Available';
    protected readonly rootId = 'available-root';

    protected async handleMessage(
        type: string,
        data: unknown,
        webviewView: WebviewView,
    ): Promise<void> {
        switch (type) {
            case 'send-ui-state':
                this.postMessage(webviewView, 'receive-ui-state', {
                    canInstallFromSource: nvm.canInstallFromSource(),
                });
                break;
            case 'send-list-available':
                await this.fetchAvailableVersions(webviewView);
                break;
            case 'send-install':
                await this.handleInstall(data as string, webviewView);
                break;
            case 'send-install-source':
                await this.handleInstallFromSource(data as string, webviewView);
                break;
        }
    }

    private async handleInstall(version: string, webviewView: WebviewView) {
        try {
            window.showInformationMessage('Installing node version: ' + version);

            const response = await nvm.install(version);

            if (!response || 'error' in response) {
                window.showErrorMessage('Could not install the requested version.');
                return;
            }

            if (response.message) {
                window.showInformationMessage(response.message);
                this.postMessage(webviewView, 'receive-install', response.id);
                await this.fetchAvailableVersions(webviewView);
                await commands.executeCommand('node-visual-manager.refreshInstalled');
            }
        } catch {
            // handled
        }
    }

    private async handleInstallFromSource(version: string, webviewView: WebviewView) {
        try {
            window.showInformationMessage('Installing node version from source: ' + version);

            const response = await nvm.installFromSource?.(version);

            if (!response || 'error' in response) {
                window.showErrorMessage('Could not install the requested version.');
                return;
            }

            if (response.message) {
                window.showInformationMessage(response.message);
                window.showInformationMessage(`Complete node v${version} installed successfully.`);
                this.postMessage(webviewView, 'receive-install', response.id);
                await this.fetchAvailableVersions(webviewView);
                await commands.executeCommand('node-visual-manager.refreshInstalled');
            }
        } catch {
            // handled
        }
    }

    private async fetchAvailableVersions(webviewView: WebviewView) {
        try {
            const response = await nvm.getAvailableVersionList();

            if ('error' in response) {
                window.showErrorMessage(
                    'Could not get available node version list. Verify your internet connection.',
                );
                return;
            }

            if (response.nodeList) {
                this.postMessage(webviewView, 'receive-list-available', response.nodeList);
            }
        } catch {
            // handled
        }
    }
}
