import { window, Uri, WebviewView } from 'vscode';

import nvm from '@core/nvm/nvm';
import { TerminalService } from '../terminal/terminalService';
import { BaseWebviewProvider } from './baseWebviewProvider';

/**
 * WebviewView provider for displaying and managing installed Node.js versions.
 *
 * Fetches fresh data from nvm on every request and posts it directly to the webview.
 * The webview uses vscode.getState/setState to persist data across iframe recreations.
 */
export class CurrentVersionProvider extends BaseWebviewProvider {
    protected readonly scriptBundle = 'current.bundle.js';
    protected readonly title = 'Current';
    protected readonly rootId = 'current-root';

    constructor(extensionUri: Uri) {
        super(extensionUri);
    }

    protected async handleMessage(
        type: string,
        data: unknown,
        webviewView: WebviewView,
    ): Promise<void> {
        switch (type) {
            case 'send-ui-state':
                this.postMessage(webviewView, 'receive-ui-state', {
                    canToggleNvm: nvm.isToggleable(),
                    showCurrentLabel: nvm.isToggleable(),
                });
                await this.fetchNvmStatus(webviewView);
                break;
            case 'send-current':
                await this.fetchCurrentVersion(webviewView);
                break;
            case 'send-list':
                await this.fetchInstalledVersions(webviewView);
                break;
            case 'send-use':
                await this.handleUseVersion(data as string, webviewView);
                break;
            case 'send-uninstall':
                await this.handleUninstall(data as string, webviewView);
                break;
            case 'send-on':
                await this.handleToggle(true, webviewView);
                break;
            case 'send-off':
                await this.handleToggle(false, webviewView);
                break;
        }
    }

    private async handleUseVersion(version: string, webviewView: WebviewView) {
        const response = await nvm.useVersion(version);

        if (!response || 'error' in response) {
            window.showErrorMessage('Could not set version to: ' + version);
            return;
        }

        if (response.command) {
            TerminalService.run(`Node ${version}`, response.command);
        }

        await this.fetchCurrentVersion(webviewView);

        window.showInformationMessage(response.message);
        this.postMessage(webviewView, 'receive-use', response.id);
    }

    private async handleUninstall(version: string, webviewView: WebviewView) {
        const response = await nvm.uninstall(version);

        if (!response || 'error' in response) {
            window.showErrorMessage('Could not uninstall the selected version.');
            return;
        }

        await this.fetchInstalledVersions(webviewView);
        await this.fetchCurrentVersion(webviewView);

        if (response.message && response.id) {
            window.showInformationMessage(response.message);
            this.postMessage(webviewView, 'receive-uninstall', response.id);
        }
    }

    private async handleToggle(enable: boolean, webviewView: WebviewView) {
        const response = enable ? await nvm.enable?.() : await nvm.disable?.();

        await this.fetchCurrentVersion(webviewView);

        if (!response || 'error' in response) {
            window.showInformationMessage(`NVM could not be ${enable ? 'enabled' : 'disabled'}.`);
            return;
        }

        if ('message' in response) {
            window.showInformationMessage(response.message);
            const messageType = enable ? 'receive-on' : 'receive-off';
            this.postMessage(webviewView, messageType, '');
        }
    }

    private async fetchNvmStatus(webviewView: WebviewView) {
        try {
            const response = await nvm.isEnabled();
            if ('error' in response) {
                return;
            }
            this.postMessage(webviewView, 'receive-status', response.enabled);
        } catch {
            // handled
        }
    }

    private async fetchCurrentVersion(webviewView: WebviewView) {
        try {
            const response = await nvm.getCurrentNodeVersion();
            if ('error' in response || !response.currentNodeVersion) {
                return;
            }
            this.postMessage(webviewView, 'receive-current', response.currentNodeVersion);
        } catch {
            // handled
        }
    }

    private async fetchInstalledVersions(webviewView: WebviewView) {
        try {
            const response = await nvm.getInstalledVersionList();
            if ('error' in response) {
                window.showErrorMessage('Could not get node version list.');
                return;
            }
            this.postMessage(webviewView, 'receive-list', response.nodeList);
        } catch {
            // handled
        }
    }

    /** Refreshes the installed versions list in the webview. */
    public async refresh() {
        if (this.view) {
            await this.fetchInstalledVersions(this.view);
            await this.fetchCurrentVersion(this.view);
        }
    }
}
