// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { IgnoreGeneratorService } from "./ignoreGeneratorService";
import { MESSAGES } from "./constants";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log(MESSAGES.EXTENSION_ACTIVATED);

  // Create the service instance
  const ignoreGeneratorService = new IgnoreGeneratorService(context);

  // Register the command
  const disposable = vscode.commands.registerCommand(
    "ignore-generator.createIgnoreFile",
    async () => {
      await ignoreGeneratorService.createIgnoreFile();
    }
  );

  if (Array.isArray(context.subscriptions)) {
    context.subscriptions.push(disposable);
  } else {
    console.error("Context subscriptions is not an array");
  }
}

// This method is called when your extension is deactivated
export function deactivate() {}
