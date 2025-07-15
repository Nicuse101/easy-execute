import * as vscode from 'vscode';
import WebSocket, { WebSocketServer } from 'ws';
import * as http from 'http';

let wss: WebSocketServer | null = null;
let clients: Set<WebSocket> = new Set();

export function activate(context: vscode.ExtensionContext): void {
  const config = vscode.workspace.getConfiguration('extension');

  const port = config.get<number>('port', 8080);
  const autoConnect = config.get<boolean>('autoConnect', true);

  const startServerCommand = vscode.commands.registerCommand('extension.startWebSocketServer', (): void => {
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
    wss = new WebSocketServer({ server });

    wss.on('connection', (socket: WebSocket) => {
      clients.add(socket);
      vscode.window.showInformationMessage('Client connected to WebSocket server.');

      socket.on('message', (message: WebSocket.RawData) => {
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

      socket.on('error', (err: Error) => {
        vscode.window.showErrorMessage(`Socket error: ${err.message}`);
      });
    });

    server.listen(port, () => {
      vscode.window.showInformationMessage(`WebSocket server started on port ${port}`);
    });
  });

  const stopServerCommand = vscode.commands.registerCommand('extension.stopWebSocketServer', (): void => {
    if (wss) {
      wss.clients.forEach(client => client.close());
      wss.close();
      wss = null;
      clients.clear();
      vscode.window.showInformationMessage('WebSocket server stopped.');
    } else {
      vscode.window.showInformationMessage('No WebSocket server is running.');
    }
  });

  const executeCurrentFileCommand = vscode.commands.registerCommand('extension.executeCurrentFile', (): void => {
    const editor = vscode.window.activeTextEditor;
  
    if (!editor) {
      vscode.window.showWarningMessage('No active file to execute.');
      return;
    }
  
    const document = editor.document;
    const content = document.getText();
  
    let sent = false;
  
    clients.forEach(socket => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(`execute:${content}`);
        sent = true;
      }
    });
  
    if (sent) {
      vscode.window.showInformationMessage('Successfully executed on clients.');
    } else {
      vscode.window.showErrorMessage('No WebSocket clients are connected.');
    }
  });

  context.subscriptions.push(startServerCommand, stopServerCommand, executeCurrentFileCommand);
  if (autoConnect) {
    vscode.commands.executeCommand('extension.startWebSocketServer');
  }
}

export function deactivate(): void {
  if (wss) {
    wss.clients.forEach(client => client.close());
    wss.close();
    wss = null;
    clients.clear();
  }
}