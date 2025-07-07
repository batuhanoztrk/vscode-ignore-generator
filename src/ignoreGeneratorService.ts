import * as vscode from "vscode";
import { TemplateManager } from "./templateManager";
import { FileManager } from "./fileManager";
import { UIManager } from "./uiManager";
import { FileAction, IgnoreTemplate } from "./types";

export class IgnoreGeneratorService {
  private templateManager: TemplateManager;
  private fileManager: FileManager;
  private uiManager: UIManager;

  constructor(context: vscode.ExtensionContext) {
    this.templateManager = new TemplateManager(context);
    this.fileManager = new FileManager(context, this.templateManager);
    this.uiManager = new UIManager(context);
  }

  async createIgnoreFile(): Promise<void> {
    try {
      // Step 1: Select ignore file type
      const ignoreType = await this.uiManager.selectIgnoreFileType();
      if (!ignoreType) {
        return;
      }

      // Step 2: Get available templates
      const templates = await this.templateManager.getAvailableTemplates();
      if (templates.length === 0) {
        this.uiManager.showNoTemplatesError();
        return;
      }

      // Step 3: Select templates
      const selectedTemplates = await this.uiManager.selectTemplates(templates);
      if (!selectedTemplates || selectedTemplates.length === 0) {
        return;
      }

      // Step 4: Handle file creation or appending
      await this.handleFileCreation(ignoreType, selectedTemplates);
    } catch (error) {
      this.uiManager.showErrorMessage(error);
    }
  }

  private async handleFileCreation(
    ignoreType: string,
    selectedTemplates: IgnoreTemplate[]
  ): Promise<void> {
    const fileExists = this.fileManager.fileExists(ignoreType);

    if (fileExists) {
      const action = await this.uiManager.showFileExistsDialog(ignoreType);

      switch (action) {
        case FileAction.Cancel:
          return;
        case FileAction.Append:
          await this.fileManager.appendToIgnoreFile(ignoreType, selectedTemplates);
          return;
        case FileAction.Overwrite:
          // Fall through to create new file
          break;
      }
    }

    // Create new file or overwrite existing
    await this.fileManager.createIgnoreFile(ignoreType, selectedTemplates);
  }
}