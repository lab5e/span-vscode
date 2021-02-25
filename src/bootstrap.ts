import * as vscode from "vscode";
import { DeviceTreeItem } from "./SpanTreeItem";
import { initiateNewTokenFile } from "./util/span";

export const bootstrap = async () => {
  /**
   * Initiation of Span API token
   */
  vscode.commands.registerCommand("span-vscode.initAPIToken", () => {
    initiateNewTokenFile();
  });

  /**
   * Copy IMEI from a device
   */
  vscode.commands.registerCommand(
    "span-vscode.copyIMEI",
    (node: DeviceTreeItem) => {
      vscode.env.clipboard.writeText(node.device.imei).then(() => {
        vscode.window.showInformationMessage(`Copied IMEI ${node.device.imei}`);
      });
    }
  );

  /**
   * Copy IMSI from a device
   */
  vscode.commands.registerCommand(
    "span-vscode.copyIMSI",
    (node: DeviceTreeItem) => {
      vscode.env.clipboard.writeText(node.device.imsi).then(() => {
        vscode.window.showInformationMessage(`Copied IMSI ${node.device.imei}`);
      });
    }
  );

  /**
   * If inside a workspace, add listener for `.span`-file and automatically call refresh if added/changed/removed
   */
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
};
