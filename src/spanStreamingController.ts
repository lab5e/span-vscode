import * as vscode from "vscode";
import * as WebSocket from "ws";
import { DeviceTreeItem } from "./SpanTreeItem";

export class SpanStreamingController {
  private streamChannel: vscode.OutputChannel | null = null;
  private websocket: WebSocket | null = null;

  public spanToken: string = "";

  constructor() {
    vscode.commands.registerCommand(
      "span-vscode.tailDeviceData",
      (node: DeviceTreeItem) => {
        if (this.websocket) {
          this.streamChannel?.appendLine(
            "Closing connection to SPAN live data"
          );
          this.websocket.close();
          this.websocket = null;
        }

        if (this.streamChannel) {
          this.streamChannel.hide();
          this.streamChannel.dispose();
          this.streamChannel = null;
        }

        this.streamChannel = vscode.window.createOutputChannel(
          `${node.tooltip} - Stream`
        );
        this.streamChannel.show();
        this.streamChannel.appendLine("Connecting to SPAN live data");
        this.websocket = new WebSocket(
          `wss://api.lab5e.com/span/collections/${node.device.collectionId}/devices/${node.device.deviceId}/from`,
          {
            headers: {
              // eslint-disable-next-line @typescript-eslint/naming-convention
              "X-API-Token": this.spanToken,
            },
          }
        );

        this.websocket.on("open", () => {
          this.streamChannel?.appendLine("Connected successfully");
        });
        this.websocket.on("message", (data) => {
          const deviceMessage = JSON.parse(data.toString());
          if (deviceMessage.type === "keepalive") {
          } else {
            this.streamChannel?.appendLine(
              JSON.stringify(deviceMessage, null, 2)
            );
          }
        });
      }
    );

    vscode.commands.registerCommand("span-vscode.closeDeviceStream", () => {
      if (this.websocket) {
        this.streamChannel?.appendLine("Closing connection to SPAN live data");
        this.websocket.close();
        this.websocket = null;
      }

      if (this.streamChannel) {
        this.streamChannel.hide();
        this.streamChannel.dispose();
        this.streamChannel = null;
      }
    });
  }
}
