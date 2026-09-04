import { window } from 'vscode';

/**
 * Manages VS Code terminals for NVM version switching.
 *
 * Reuses existing terminals when available, creates new ones otherwise.
 * Handles the bash sourcing and cleanup sequence for `nvm use` commands.
 */
export class TerminalService {
    /**
     * Runs a command in a named terminal.
     *
     * Finds an existing terminal with the given name, or creates a new one.
     * The command is wrapped with `clear && exec bash` to ensure a clean shell
     * after the NVM environment is loaded.
     *
     * @param name - Terminal name (used to find/reuse existing terminals).
     * @param command - Shell command to execute.
     */
    static run(name: string, command: string) {
        let terminal = window.terminals.find((t) => t.name === name);

        if (!terminal) {
            terminal = window.createTerminal({
                name,
                shellPath: 'bash',
                shellArgs: ['-c', `${command} && clear && exec bash`],
            });
        } else {
            terminal.sendText(command);
            terminal.sendText('clear');
        }

        terminal.show(false);
    }
}
