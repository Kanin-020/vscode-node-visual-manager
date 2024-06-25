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
const path_1 = __importStar(require("path"));
const child_process_1 = require("child_process");
const fs_1 = __importDefault(require("fs"));
const node_os_1 = __importDefault(require("node:os"));
const util_1 = require("util");
const os_1 = require("os");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
const access = (0, util_1.promisify)(fs_1.default.access);
const nvm = {
    verifyUserSystem,
    verifyNvmIsInstalled,
    installNvmForWindows,
    installNvmForLinux,
};
async function verifyUserSystem() {
    try {
        const operativeSystem = node_os_1.default.platform();
        return { operativeSystem: operativeSystem };
    }
    catch {
        return { operativeSystem: 'win32' };
    }
}
async function verifyNvmIsInstalled() {
    try {
        const systemResponse = await verifyUserSystem();
        switch (systemResponse.operativeSystem) {
            case 'win32':
                const { stdout, stderr } = await execAsync('nvm --version');
                if (stderr) {
                    return false;
                }
                if (stdout) {
                    return true;
                }
                break;
            case 'darwin':
            case 'linux':
                if (process.env.HOME) {
                    const nvmDir = process.env.NVM_DIR || path_1.default.join(process.env.HOME, '.nvm');
                    try {
                        await access(nvmDir);
                        return true;
                    }
                    catch (err) {
                        return false;
                    }
                }
                break;
            default:
                return false;
        }
    }
    catch (error) {
        console.error(error);
    }
}
async function installNvmForWindows() {
    import('node-fetch').then(({ default: fetch }) => {
        const url = 'https://github.com/coreybutler/nvm-windows/releases/download/1.1.11/nvm-setup.exe';
        const tempFilePath = (0, path_1.join)((0, os_1.tmpdir)(), 'nvm-setup.exe');
        fetch(url)
            .then(response => {
            if (!response.ok) {
                throw new Error(response.statusText);
            }
            return response.buffer();
        })
            .then(buffer => {
            require('fs').writeFileSync(tempFilePath, buffer);
            (0, child_process_1.exec)(tempFilePath, (error, stdout, stderr) => {
                if (error) {
                    console.error(error.message);
                    return;
                }
            });
        })
            .catch(error => {
            console.error(error.message);
        });
    });
}
async function installNvmForLinux() {
    const installScript = 'https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh';
    const commandCurl = `curl -o- ${installScript} | bash`;
    const commandWget = `wget -qO- ${installScript} | bash`;
    try {
        await execAsync('which curl');
        await execAsync(commandCurl);
    }
    catch (error) {
        try {
            await execAsync(commandWget);
        }
        catch (err) {
            console.error(err);
        }
    }
}
exports.default = nvm;
//# sourceMappingURL=nvm.js.map