import * as vscode from "vscode";
import { CollectionTreeItem, DeviceTreeItem } from "./SpanTreeItem";
import Axios from "axios";
import { ICollectionResponse, IDeviceResponse } from "./models";

export class SpanEntityProvider
  implements
    vscode.TreeDataProvider<CollectionTreeItem | DeviceTreeItem | void> {
  private _onDidChangeTreeData: vscode.EventEmitter<
    CollectionTreeItem | DeviceTreeItem | void
  > = new vscode.EventEmitter<CollectionTreeItem | DeviceTreeItem | void>();
  readonly onDidChangeTreeData: vscode.Event<
    CollectionTreeItem | DeviceTreeItem | void
  > = this._onDidChangeTreeData.event;

  public spanToken: string = "";

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: CollectionTreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(
    element?: CollectionTreeItem
  ): Thenable<CollectionTreeItem[] | DeviceTreeItem[]> {
    if (this.spanToken === "") {
      return Promise.resolve([]);
    }

    if (!element) {
      return this.getSpanCollections();
    } else if (element.contextValue === "collection") {
      return this.getSpanDevices(element);
    } else {
      return Promise.resolve([]);
    }
  }

  private async getSpanDevices(
    collectionTreeItem: CollectionTreeItem
  ): Promise<DeviceTreeItem[]> {
    return Axios.get<IDeviceResponse>(
      `https://api.lab5e.com/span/collections/${collectionTreeItem.collection.collectionId}/devices`,
      {
        headers: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          "X-API-Token": this.spanToken,
        },
      }
    )
      .then((response) => {
        return response.data.devices;
      })
      .then((devices) => {
        return devices.map((device) => {
          return new DeviceTreeItem(
            device,
            "device",
            vscode.TreeItemCollapsibleState.None
          );
        });
      });
  }

  private async getSpanCollections(): Promise<CollectionTreeItem[]> {
    return Axios.get<ICollectionResponse>(
      "https://api.lab5e.com/span/collections",
      {
        headers: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          "X-API-Token": this.spanToken,
        },
      }
    )
      .then((response) => {
        return response.data.collections;
      })
      .then((collections) => {
        return collections.map(
          (collection) =>
            new CollectionTreeItem(
              collection,
              "collection",
              vscode.TreeItemCollapsibleState.Collapsed
            )
        );
      });
  }
}
