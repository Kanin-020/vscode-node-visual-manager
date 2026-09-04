import { Uri, Webview, WebviewView, WebviewViewProvider } from 'vscode';

import { getNonce } from '../csp/getNonce';

/**
 * Abstract base class for WebviewView providers.
 *
 * Extracts shared lifecycle (resolve, revive, HTML generation, message posting)
 * so concrete providers only define their specific message handling.
 */
export abstract class BaseWebviewProvider implements WebviewViewProvider {
    protected view?: WebviewView;

    constructor(protected readonly extensionUri: Uri) {}

    /**
     * Called by VSCode when the webview panel becomes visible.
     * Sets up the webview and registers message handlers.
     */
    public resolveWebviewView(webviewView: WebviewView) {
        this.view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [Uri.joinPath(this.extensionUri, 'dist', 'webview')],
        };

        webviewView.webview.html = this.getHtmlForWebview(webviewView.webview);
        this.registerMessageHandler(webviewView);
    }

    /** Revives the webview panel after it was disposed and recreated. */
    public revive(panel: WebviewView) {
        this.view = panel;
        this.registerMessageHandler(panel);
    }

    /** Handles incoming messages from the webview. */
    protected abstract handleMessage(
        type: string,
        data: unknown,
        webviewView: WebviewView,
    ): Promise<void>;

    /** The bundle filename for this provider's webview script. */
    protected abstract readonly scriptBundle: string;

    /** The HTML title for this provider's webview. */
    protected abstract readonly title: string;

    /** The root element ID for this provider's webview. */
    protected abstract readonly rootId: string;

    /** Registers the message handler on the given webview instance. */
    protected registerMessageHandler(webviewView: WebviewView) {
        webviewView.webview.onDidReceiveMessage(async (data) => {
            await this.handleMessage(data.type, data.data, webviewView);
        });
    }

    /** Posts a message to the webview. */
    protected postMessage(webviewView: WebviewView, type: string, data?: unknown) {
        webviewView.webview.postMessage({ type, data });
    }

    /** Generates the HTML for the webview with CSP policy. */
    protected getHtmlForWebview(webview: Webview): string {
        const scriptUri = webview.asWebviewUri(
            Uri.joinPath(this.extensionUri, 'dist', 'webview', this.scriptBundle),
        );

        const fontUri = webview.asWebviewUri(
            Uri.joinPath(this.extensionUri, 'dist', 'webview', 'assets', 'icons', 'codicon.ttf'),
        );

        const nonce = getNonce();

        const cspPolicy = [
            "default-src 'none'",
            `font-src ${webview.cspSource}`,
            `img-src ${webview.cspSource} https: data:`,
            `style-src ${webview.cspSource} 'unsafe-inline'`,
            `script-src ${webview.cspSource} 'nonce-${nonce}'`,
        ].join('; ');

        return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${this.title}</title>
                <meta http-equiv="Content-Security-Policy" content="${cspPolicy}">
                <style>
                    body { opacity: 0; }
                    @font-face {
                        font-family: "codicon";
                        font-display: block;
                        src: url("${fontUri}") format("truetype");
                    }
                </style>
            </head>
            <body>
                <div id="${this.rootId}"></div>
                <script nonce="${nonce}" src="${scriptUri}"></script>
            </body>
            </html>`;
    }
}
