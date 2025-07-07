import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import {
  IgnoreTemplate,
  IgnoreType,
  QuickPickTemplate,
  FileAction,
} from "./types";
import { EXTENSION_PATHS, MESSAGES, UI_PLACEHOLDERS } from "./constants";

export class UIManager {
  constructor(private context: vscode.ExtensionContext) {}

  async selectIgnoreFileType(): Promise<string | undefined> {
    const ignoreTypesPath = path.join(
      this.context.extensionPath,
      EXTENSION_PATHS.IGNORE_TYPES
    );

    try {
      const ignoreTypes = fs.readFileSync(ignoreTypesPath, "utf8").split("\n");

      const quickPickItems: IgnoreType[] = ignoreTypes
        .map((type) => {
          const match = type.match(/^(.+?)\s*\((.+)\)$/);

          if (!match) {
            return null;
          }

          const [, label, description] = match;

          return {
            label: label.trim(),
            description: description.trim(),
          };
        })
        .filter((item): item is IgnoreType => item !== null);

      const selected = await vscode.window.showQuickPick(quickPickItems, {
        placeHolder: UI_PLACEHOLDERS.SELECT_IGNORE_TYPE,
        canPickMany: false,
      });

      return selected?.label;
    } catch (error) {
      throw new Error(`Failed to read ignore types: ${error}`);
    }
  }

  async selectTemplates(
    templates: IgnoreTemplate[]
  ): Promise<IgnoreTemplate[] | undefined> {
    const quickPickItems: QuickPickTemplate[] = templates.map((template) => ({
      label: template.label,
      template: template,
    }));

    const selected = await vscode.window.showQuickPick(quickPickItems, {
      placeHolder: UI_PLACEHOLDERS.SELECT_TEMPLATES,
      canPickMany: true,
      matchOnDescription: true,
    });

    return selected?.map((item) => item.template);
  }

  async showFileExistsDialog(ignoreType: string): Promise<FileAction> {
    const action = await vscode.window.showWarningMessage(
      MESSAGES.FILE_EXISTS_WARNING(ignoreType),
      FileAction.Overwrite,
      FileAction.Append,
      FileAction.Cancel
    );

    return (action as FileAction) || FileAction.Cancel;
  }

  showErrorMessage(error: unknown): void {
    const message = error instanceof Error ? error.message : String(error);
    vscode.window.showErrorMessage(MESSAGES.ERROR_PREFIX + message);
  }

  showNoTemplatesError(): void {
    vscode.window.showErrorMessage(MESSAGES.NO_TEMPLATES);
  }
}
