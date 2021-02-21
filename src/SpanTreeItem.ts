import * as vscode from "vscode";

import { ICollection, IDevice } from "./models";

export class CollectionTreeItem extends vscode.TreeItem {
  constructor(
    public collection: ICollection,
    public entityType: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly command?: vscode.Command
  ) {
    super(collection.tags?.name ?? collection.collectionId, collapsibleState);

    this.tooltip = `${this.label}${
      collection.tags?.name ? ` - ${collection.collectionId}` : ""
    }`;
    this.description = collection.tags?.description ?? "";
    this.contextValue = entityType;
  }
}

export class DeviceTreeItem extends vscode.TreeItem {
  constructor(
    public device: IDevice,
    public entityType: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly command?: vscode.Command
  ) {
    super(device.tags?.name ?? device.deviceId, collapsibleState);

    this.tooltip = `${this.label}${
      device.tags?.name ? ` - ${device.deviceId}` : ""
    }`;
    this.description = device.tags?.description ?? "";
    this.contextValue = entityType;
  }
}
