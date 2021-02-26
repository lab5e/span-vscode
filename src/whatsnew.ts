import * as semver from "semver";
import * as vscode from "vscode";
import * as fs from "fs";

import { ConfigKeys } from "./state";
import { extensionId } from "./types";

export const initiateWhatsNew = (context: vscode.ExtensionContext) => {
  // Keep track of version to avoid bothering existing users with what's new/welcome
  const spanExtension = vscode.extensions.getExtension(extensionId);
  const currentVersion = semver.parse(spanExtension?.packageJSON.version);
  const previousVersion = semver.parse(
    context.globalState.get<string>(ConfigKeys.version) ?? "0.1.0"
  );
  if (currentVersion !== null && previousVersion !== null) {
    context.globalState.update(ConfigKeys.version, currentVersion.toString());

    // As we're pre 1.0, minors can be breaking, but also amazing in terms of content
    if (previousVersion.minor < currentVersion.minor) {
      const whatsNewPanel = vscode.window.createWebviewPanel(
        "whatsNew",
        "Span extension: What's new",
        vscode.ViewColumn.Beside,
        {
          enableScripts: true,
        }
      );
      const fileName = context.asAbsolutePath("WHATS_NEW.md");

      const markdown = fs.readFileSync(fileName, { encoding: "utf8" });
      whatsNewPanel.webview.html = renderHtmlFromMarkdown(markdown);
    }
  }
};

/**
 * Renders HTML from markdown, using the github repo as a base for all images.
 * @param markdown The markdown to be rendered to HTML
 */
function renderHtmlFromMarkdown(markdown: string): string {
  return `<!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src https://github.com https://raw.githubusercontent.com; script-src 'unsafe-inline' https://cdn.jsdelivr.net/npm/marked@2.0.0/lib/marked.min.js;">
      <script src="https://cdn.jsdelivr.net/npm/marked@2.0.0/lib/marked.min.js" integrity="sha256-08Gq0RSv3ZPRQz2RBfozkkSIUJnUsS6ywyzJZ3QOOOU=" crossorigin="anonymous"></script>
  </head>
  <body>
  <div id="markdown"></div>
  <script>document.getElementById("markdown").innerHTML = marked(\`${markdown}\`, {
    baseUrl: 'https://github.com/lab5e/span-vscode/raw/master/'
  })</script>
  </body>
  </html>`;
}
