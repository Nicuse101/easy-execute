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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const ws_1 = __importStar(require("ws"));
const http = __importStar(require("http"));
let wss = null;
let clients = new Set();
function activate(context) {
    const config = vscode.workspace.getConfiguration('extension');
    const port = config.get('port', 8080);
    const autoConnect = config.get('autoConnect', true);
    const startServerCommand = vscode.commands.registerCommand('extension.startWebSocketServer', () => {
        if (wss) {
            vscode.window.showInformationMessage('WebSocket server already running.');
            return;
        }
        const executeButton = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 1000);
        executeButton.text = 'Execute Current File';
        executeButton.tooltip = 'Executes the current file in Roblox (if connected)';
        executeButton.command = 'extension.executeCurrentFile';
        executeButton.show();
        context.subscriptions.push(executeButton);
        const server = http.createServer();
        wss = new ws_1.WebSocketServer({ server });
        wss.on('connection', (socket) => {
            clients.add(socket);
            vscode.window.showInformationMessage('Client connected to WebSocket server.');
            socket.on('message', (message) => {
                const msg = message.toString();
                if (msg.startsWith('execute')) {
                    const editor = vscode.window.activeTextEditor;
                    if (!editor) {
                        vscode.window.showWarningMessage('No active file to execute.');
                        return;
                    }
                    const document = editor.document;
                    const content = document.getText();
                    socket.send(`execute:${content}`);
                }
            });
            socket.on('close', () => {
                clients.delete(socket);
                vscode.window.showWarningMessage('Client disconnected.');
            });
            socket.on('error', (err) => {
                vscode.window.showErrorMessage(`Socket error: ${err.message}`);
            });
        });
        server.listen(port, () => {
            vscode.window.showInformationMessage(`WebSocket server started on port ${port}`);
        });
    });
    const stopServerCommand = vscode.commands.registerCommand('extension.stopWebSocketServer', () => {
        if (wss) {
            wss.clients.forEach(client => client.close());
            wss.close();
            wss = null;
            clients.clear();
            vscode.window.showInformationMessage('WebSocket server stopped.');
        }
        else {
            vscode.window.showInformationMessage('No WebSocket server is running.');
        }
    });
    const executeCurrentFileCommand = vscode.commands.registerCommand('extension.executeCurrentFile', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showWarningMessage('No active file to execute.');
            return;
        }
        const document = editor.document;
        const content = document.getText();
        let sent = false;
        clients.forEach(socket => {
            if (socket.readyState === ws_1.default.OPEN) {
                socket.send(`execute:${content}`);
                sent = true;
            }
        });
        if (sent) {
            vscode.window.showInformationMessage('Successfully executed on clients.');
        }
        else {
            vscode.window.showErrorMessage('No WebSocket clients are connected.');
        }
    });
    context.subscriptions.push(startServerCommand, stopServerCommand, executeCurrentFileCommand);
    if (autoConnect) {
        vscode.commands.executeCommand('extension.startWebSocketServer');
    }
}
function deactivate() {
    if (wss) {
        wss.clients.forEach(client => client.close());
        wss.close();
        wss = null;
        clients.clear();
    }
}
//# sourceMappingURL=extension.js.map