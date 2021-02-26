import * as vscode from "vscode";

import { bootstrap } from "./bootstrap";
import { SpanEntityProvider } from "./spanEntityProvider";
import { SpanStreamingController } from "./spanStreamingController";
import { getSpanToken } from "./util/span";
import { initiateWhatsNew } from "./whatsnew";

export function activate(context: vscode.ExtensionContext) {
  // Initiate independent commands
  bootstrap();

  // Initiate what's new, if there's something new
  initiateWhatsNew(context);

  const spanEntityProvider = new SpanEntityProvider();
  vscode.window.registerTreeDataProvider("span-vscode", spanEntityProvider);

  const spanStreamingController = new SpanStreamingController();

  getSpanToken().then((spanToken) => {
    if (spanToken === "") {
      return;
    } else {
      spanEntityProvider.spanToken = spanToken;
      spanStreamingController.spanToken = spanToken;
    }
  });

  // Refresh initiated entities with potential new token
  vscode.commands.registerCommand("span-vscode.refresh", () => {
    getSpanToken().then((spanToken) => {
      spanEntityProvider.spanToken = spanToken;
      spanStreamingController.spanToken = spanToken;
      spanEntityProvider.refresh();
    });
  });
}

// this method is called when your extension is deactivated
export function deactivate() {}
