import * as vscode from "vscode";
import * as fs from "fs";
import * as os from "os";

/**
 * Makes a best effort to get an API key for the project. It will first look for a `.span`-folder in the workspace, then the home directory of the user. If no token could be found, an empty string is returned.
 */
export const getAPIKey = async (): Promise<string> => {
  let potentialTokenLocations: { path: string; token: string }[] = [];

  // Check workspace folders
  if (vscode.workspace.workspaceFolders) {
    vscode.workspace.workspaceFolders.forEach((folder) => {
      const token = getSpanTokenFromFilePath(folder.uri.fsPath);
      if (token !== "") {
        potentialTokenLocations.push({ path: folder.uri.fsPath, token: token });
      }
    });
  }

  const homeDirToken = getSpanTokenFromFilePath(os.homedir());
  if (homeDirToken !== "") {
    potentialTokenLocations.push({ path: os.homedir(), token: homeDirToken });
  }

  let chosenTokenLocation: string | undefined = "";
  if (potentialTokenLocations.length > 0) {
    chosenTokenLocation = potentialTokenLocations[0].path;
    // TODO: For later, choosable tokens?
    // chosenTokenLocation = await vscode.window.showQuickPick(
    //   potentialTokenLocations.map((tokens) => {
    //     return tokens.path;
    //   }),
    //   {
    //     canPickMany: false,
    //   }
    // );
  }

  if (!chosenTokenLocation) {
    return "";
  }

  return (
    potentialTokenLocations.find((path) => path.path === chosenTokenLocation)
      ?.token ?? ""
  );
};

/**
 * Fetches token (if present) in a `.span`-file (if present) for given given path
 * @param spanConfigPath Path which contains a potential `.span`-file
 */
function getSpanTokenFromFilePath(spanConfigPath: string): string {
  if (fs.existsSync(`${spanConfigPath}/.span`)) {
    // First and best
    const spanConfig = fs.readFileSync(`${spanConfigPath}/.span`);
    for (const line of spanConfig.toString().split("/n")) {
      const [key, value] = line.split(":");
      if (key.toLocaleLowerCase() === "token") {
        return value.trim();
      }
    }
  }
  return "";
}

/**
 * Initiate the creation of a token file (`.span`) in the current workspace.
 */
export const initiateNewTokenFile = async () => {
  const GLOBAL_SCOPE = "Global (home dir)";
  const WORKSPACE_SCOPE = "Workspace";

  const chosenTokenScope = await vscode.window.showQuickPick(
    [GLOBAL_SCOPE, WORKSPACE_SCOPE],
    {
      canPickMany: false,
      placeHolder: "Choose the API token scope",
    }
  );

  if (!chosenTokenScope) {
    return;
  }

  if (chosenTokenScope === GLOBAL_SCOPE) {
    const spanTokenFileUri = vscode.Uri.file(os.homedir() + "/.span");
    initiateSpanFile(spanTokenFileUri);
    return;
  }

  if (vscode.workspace.workspaceFolders) {
    // First workspace, best workspace
    const workspace = vscode.workspace.workspaceFolders[0].uri.fsPath;
    const spanTokenFileUri = vscode.Uri.file(workspace + "/.span");

    initiateSpanFile(spanTokenFileUri);

    // Check if git is active in the workspace
    if (fs.existsSync(`${workspace}/.git`)) {
      if (fs.existsSync(`${workspace}/.gitignore`)) {
        const hasSpanEntry: boolean = fs
          .readFileSync(`${workspace}/.gitignore`)
          .toString()
          .split("/")
          .some((line) => {
            return line === ".span";
          });

        if (!hasSpanEntry) {
          // Send warning to user as you should never commit API keys
          vscode.window.showWarningMessage(
            "IMPORTANT. As you have git enabled for the project, be aware that `.span` should be added to .gitignore. You should NEVER commit API keys to your git repo."
          );
        }
      } else {
        vscode.window.showInformationMessage(
          "We could not find any git information from the workspace.Be aware should you initiate a git repo that you should put `.span` in your "
        );
      }
    }
  }
};

function initiateSpanFile(spanFilePath: vscode.Uri) {
  if (!fs.existsSync(spanFilePath.fsPath)) {
    const edit = new vscode.WorkspaceEdit();

    edit.createFile(spanFilePath, { ignoreIfExists: true });
    vscode.workspace.applyEdit(edit).then(() => {
      vscode.workspace.openTextDocument(spanFilePath).then((textDoc) => {
        vscode.window.showTextDocument(textDoc, 1, false).then((textEditor) => {
          textEditor.insertSnippet(new vscode.SnippetString("TOKEN:$1\n"));
        });
      });
    });
  } else {
    // If a token file already exist, open it
    vscode.workspace.openTextDocument(spanFilePath).then(() => {
      vscode.window.showTextDocument(spanFilePath);
    });
  }
}
