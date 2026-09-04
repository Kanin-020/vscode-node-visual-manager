import { commands, window, workspace, ExtensionContext } from 'vscode';

import { AvailableVersionProvider } from './vscode/providers/availableVersionProvider';
import { CurrentVersionProvider } from './vscode/providers/currentVersionProvider';
import nvm from '@core/nvm/nvm';

/**
 * Called when the extension is activated.
 *
 * Activation events (from `package.json`):
 * - `onStartupFinished` — Activates after VSCode finishes startup.
 * - `workspaceContains:.nvmrc` — Activates when a workspace contains `.nvmrc`.
 *
 * Responsibilities:
 * 1. Registers the two webview sidebar panels (Installed Versions, Available Versions).
 * 2. Auto-activates the NVM version specified in `.nvmrc` for each workspace folder.
 * 3. Watches for new workspace folders and activates their `.nvmrc` automatically.
 *
 * @param context - The extension context provided by VSCode for managing subscriptions.
 *
 * @example
 * ```typescript
 * // This is called automatically by VSCode — do not call manually.
 * activate(context);
 * ```
 */
export function activate(context: ExtensionContext) {
    const sidebarVersionProvider = new CurrentVersionProvider(context.extensionUri);
    const availableVersionProvider = new AvailableVersionProvider(context.extensionUri);

    context.subscriptions.push(
        window.registerWebviewViewProvider(
            'node-visual-manager-sidebar-current',
            sidebarVersionProvider,
        ),
    );

    context.subscriptions.push(
        window.registerWebviewViewProvider(
            'node-visual-manager-sidebar-available',
            availableVersionProvider,
        ),
    );

    context.subscriptions.push(
        commands.registerCommand('node-visual-manager.refreshInstalled', () => {
            sidebarVersionProvider.refresh();
        }),
    );

    /**
     * Reads `.nvmrc` from a project directory and activates the specified version.
     *
     * @param projectPath - Absolute path to the workspace folder.
     */
    const activateNvmForWorkspace = async (projectPath: string) => {
        try {
            const result = await nvm.useVersionFromProject(projectPath);

            if (result && 'error' in result && result.error) {
                window.showErrorMessage(String(result.error));
            } else if (result && 'message' in result && result.message) {
                window.showInformationMessage(result.message);
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            window.showErrorMessage(`Error reading .nvmrc: ${message}`);
        }
    };

    /** Activate NVM for all currently open workspace folders. */
    workspace.workspaceFolders?.forEach((folder) => {
        activateNvmForWorkspace(folder.uri.fsPath);
    });

    /** Watch for newly added workspace folders and activate their .nvmrc. */
    context.subscriptions.push(
        workspace.onDidChangeWorkspaceFolders((event) => {
            event.added.forEach((folder) => activateNvmForWorkspace(folder.uri.fsPath));
        }),
    );
}

/**
 * Called when the extension is deactivated (e.g., when VSCode closes).
 * Currently performs no cleanup — all subscriptions are auto-disposed by VSCode.
 */
export function deactivate() {}
