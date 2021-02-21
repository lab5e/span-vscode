import * as vscode from "vscode";
import * as WebSocket from "ws";

import { SpanEntityProvider } from "./spanEntityProvider";
import { DeviceTreeItem } from "./SpanTreeItem";
import { getAPIKey, initiateNewTokenFile } from "./util/span";

let myChannel: vscode.OutputChannel | null = null;
let deviceWebSocket: WebSocket | null = null;
let SPAN_API_KEY: string = "";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  vscode.commands.registerCommand("span-vscode.initAPIKey", () => {
    initiateNewTokenFile();
  });

  vscode.commands.registerCommand(
    "span-vscode.copyIMEI",
    (node: DeviceTreeItem) => {
      vscode.env.clipboard.writeText(node.device.imei).then(() => {
        vscode.window.showInformationMessage(`Copied IMEI ${node.device.imei}`);
      });
    }
  );
  vscode.commands.registerCommand(
    "span-vscode.copyIMSI",
    (node: DeviceTreeItem) => {
      vscode.env.clipboard.writeText(node.device.imsi).then(() => {
        vscode.window.showInformationMessage(`Copied IMSI ${node.device.imei}`);
      });
    }
  );
  vscode.commands.registerCommand(
    "span-vscode.tailDeviceData",
    (node: DeviceTreeItem) => {
      if (deviceWebSocket) {
        myChannel?.appendLine("Closing connection to SPAN live data");
        deviceWebSocket.close();
        deviceWebSocket = null;
      }

      if (myChannel) {
        myChannel.hide();
        myChannel.dispose();
        myChannel = null;
      }

      myChannel = vscode.window.createOutputChannel(`${node.tooltip} - Stream`);
      myChannel.show();
      myChannel.appendLine("Connecting to SPAN live data");
      deviceWebSocket = new WebSocket(
        `wss://api.lab5e.com/span/collections/${node.device.collectionId}/devices/${node.device.deviceId}/from`,
        {
          headers: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            "X-API-Token": SPAN_API_KEY,
          },
        }
      );

      deviceWebSocket.on("open", () => {
        myChannel?.appendLine("Connected successfully");
      });
      deviceWebSocket.on("message", (data) => {
        const deviceMessage = JSON.parse(data.toString());
        if (deviceMessage.type === "keepalive") {
        } else {
          myChannel?.appendLine(JSON.stringify(deviceMessage, null, 2));
        }
      });
    }
  );

  vscode.commands.registerCommand("span-vscode.closeDeviceStream", () => {
    if (deviceWebSocket) {
      myChannel?.appendLine("Closing connection to SPAN live data");
      deviceWebSocket.close();
      deviceWebSocket = null;
    }

    if (myChannel) {
      myChannel.hide();
      myChannel.dispose();
      myChannel = null;
    }
  });

  const spanEntityProvider = new SpanEntityProvider();
  vscode.window.registerTreeDataProvider("span-vscode", spanEntityProvider);

  getAPIKey().then((spanToken) => {
    SPAN_API_KEY = spanToken;

    if (spanToken === "") {
      return;
    } else {
      spanEntityProvider.spanToken = spanToken;
    }
  });

  vscode.commands.registerCommand("span-vscode.refresh", () => {
    getAPIKey().then((apiKey) => {
      SPAN_API_KEY = apiKey;

      spanEntityProvider.spanToken = apiKey;
      spanEntityProvider.refresh();
    });
  });

  if (vscode.workspace.workspaceFolders) {
    let watcher = vscode.workspace.createFileSystemWatcher(
      new vscode.RelativePattern(vscode.workspace.workspaceFolders[0], ".span")
    );
    watcher.onDidChange(() => {
      vscode.commands.executeCommand("span-vscode.refresh");
    });
    watcher.onDidDelete(() => {
      vscode.commands.executeCommand("span-vscode.refresh");
    });
  }
}

// this method is called when your extension is deactivated
export function deactivate() {}
