import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { IgnoreTemplate } from "./types";
import { MESSAGES } from "./constants";
import { TemplateManager } from "./templateManager";

export class FileManager {
  constructor(
    private context: vscode.ExtensionContext,
    private templateManager: TemplateManager
  ) {}

  private getWorkspaceRoot(): string {
    if (!vscode.workspace.workspaceFolders) {
      throw new Error(MESSAGES.OPEN_WORKSPACE_FIRST);
    }
    return vscode.workspace.workspaceFolders[0].uri.fsPath;
  }

  private getIgnoreFilePath(ignoreType: string): string {
    const workspaceRoot = this.getWorkspaceRoot();
    return path.join(workspaceRoot, ignoreType);
  }

  fileExists(ignoreType: string): boolean {
    const ignoreFilePath = this.getIgnoreFilePath(ignoreType);
    return fs.existsSync(ignoreFilePath);
  }

  async createIgnoreFile(
    ignoreType: string,
    selectedTemplates: IgnoreTemplate[]
  ): Promise<void> {
    const ignoreFilePath = this.getIgnoreFilePath(ignoreType);
    const { content, autoAddedStacks } = await this.templateManager.generateContent(
      ignoreType,
      selectedTemplates,
      false
    );

    try {
      fs.writeFileSync(ignoreFilePath, content, "utf8");
      await this.openFileInEditor(ignoreFilePath);

      const totalTemplates = selectedTemplates.length + autoAddedStacks.length;
      let message = MESSAGES.FILE_CREATED_SUCCESS(ignoreType, totalTemplates);
      
      if (autoAddedStacks.length > 0) {
        const stackNames = autoAddedStacks.map(s => s.label).join(', ');
        message += ` (Auto-added stack files: ${stackNames})`;
      }

      vscode.window.showInformationMessage(message);
    } catch (error) {
      throw new Error(`Failed to create ${ignoreType}: ${error}`);
    }
  }

  async appendToIgnoreFile(
    ignoreType: string,
    selectedTemplates: IgnoreTemplate[]
  ): Promise<void> {
    const ignoreFilePath = this.getIgnoreFilePath(ignoreType);
    const { content: appendContent, autoAddedStacks } = await this.templateManager.generateContent(
      ignoreType,
      selectedTemplates,
      true
    );

    try {
      fs.appendFileSync(ignoreFilePath, appendContent, "utf8");
      await this.openFileInEditor(ignoreFilePath);

      const totalTemplates = selectedTemplates.length + autoAddedStacks.length;
      let message = MESSAGES.TEMPLATES_APPENDED(totalTemplates);
      
      if (autoAddedStacks.length > 0) {
        const stackNames = autoAddedStacks.map(s => s.label).join(', ');
        message += ` (Auto-added stack files: ${stackNames})`;
      }

      vscode.window.showInformationMessage(message);
    } catch (error) {
      throw new Error(`Failed to append to ignore file: ${error}`);
    }
  }

  private async openFileInEditor(filePath: string): Promise<void> {
    const document = await vscode.workspace.openTextDocument(filePath);
    await vscode.window.showTextDocument(document);
  }
}
