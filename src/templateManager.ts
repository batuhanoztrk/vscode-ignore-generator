import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { IgnoreTemplate } from "./types";
import { EXTENSION_PATHS, COMMENT_TEMPLATES } from "./constants";

export class TemplateManager {
  constructor(private context: vscode.ExtensionContext) {}

  async getAvailableTemplates(): Promise<IgnoreTemplate[]> {
    const templatesListPath = path.join(
      this.context.extensionPath,
      EXTENSION_PATHS.TEMPLATES_LIST
    );

    try {
      const content = fs.readFileSync(templatesListPath, "utf8");
      const templatePaths = content
        .split("\n")
        .filter((line: string) => line.trim() !== "");

      const templates: IgnoreTemplate[] = [];

      for (const templatePath of templatePaths) {
        // Handle both .gitignore and .stack file extensions
        let templateName = path.basename(templatePath);
        if (templateName.endsWith('.gitignore')) {
          templateName = templateName.replace('.gitignore', '');
        } else if (templateName.endsWith('.stack')) {
          templateName = templateName.replace('.stack', '');
        }
        
        const category = templatePath.includes("/")
          ? path.dirname(templatePath).split("/").pop() || "General"
          : "General";

        // Add file type indicator for stack files
        const fileType = templatePath.endsWith('.stack') ? ' (Stack)' : '';
        
        templates.push({
          label: templateName,
          description: `Category: ${category}${fileType}`,
          path: templatePath,
        });
      }

      // Sort alphabetically
      templates.sort((a, b) => a.label.localeCompare(b.label));

      return templates;
    } catch (error) {
      throw new Error(`Failed to read templates list: ${error}`);
    }
  }

  async readTemplateContent(template: IgnoreTemplate): Promise<string> {
    const templatePath = path.join(this.context.extensionPath, "src", template.path);

    try {
      return fs.readFileSync(templatePath, "utf8");
    } catch (error) {
      // If template doesn't exist, return a comment
      return COMMENT_TEMPLATES.TEMPLATE_NOT_FOUND(template.label) + "\n";
    }
  }

  generateContent(
    ignoreType: string,
    selectedTemplates: IgnoreTemplate[],
    isAppending: boolean = false
  ): Promise<string> {
    return new Promise(async (resolve) => {
      let content = "";

      if (!isAppending) {
        content += COMMENT_TEMPLATES.HEADER(ignoreType) + "\n";
        content += COMMENT_TEMPLATES.TIMESTAMP() + "\n\n";
      } else {
        content += "\n" + COMMENT_TEMPLATES.APPEND_TIMESTAMP() + "\n";
      }

      for (const template of selectedTemplates) {
        const templateContent = await this.readTemplateContent(template);
        content += COMMENT_TEMPLATES.TEMPLATE_SECTION(template.label) + "\n";
        content += templateContent;
        content += "\n\n";
      }

      resolve(content);
    });
  }
}