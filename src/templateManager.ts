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
        const templateName = path.basename(templatePath, ".gitignore");
        const category = templatePath.includes("/")
          ? path.dirname(templatePath).split("/").pop() || "General"
          : "General";

        templates.push({
          label: templateName,
          description: `Category: ${category}`,
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

  /**
   * Check if there are stack files associated with the given template
   * @param template The template to check for stack files
   * @returns Array of stack file paths
   */
  private getStackFilesForTemplate(template: IgnoreTemplate): string[] {
    const stackFiles: string[] = [];
    const templateName = path.basename(template.path, ".gitignore");
    const templateDir = path.join(this.context.extensionPath, "src", path.dirname(template.path));

    try {
      // Check if directory exists
      if (!fs.existsSync(templateDir)) {
        return stackFiles;
      }

      // Read all files in the template directory
      const files = fs.readdirSync(templateDir);
      
      // Find stack files that match the template name
      for (const file of files) {
        if (file.includes(".stack") && file.startsWith(templateName + ".")) {
          stackFiles.push(path.join(path.dirname(template.path), file));
        }
      }
    } catch (error) {
      console.error(`Error checking stack files for ${templateName}:`, error);
    }

    return stackFiles;
  }

  /**
   * Read content of a stack file and get referenced templates
   * @param stackFilePath Path to the stack file
   * @returns Array of referenced template names
   */
  private async getReferencedTemplatesFromStack(stackFilePath: string): Promise<string[]> {
    const fullPath = path.join(this.context.extensionPath, "src", stackFilePath);

    try {
      const content = fs.readFileSync(fullPath, "utf8");
      // Stack files contain references to other templates, one per line
      const referencedTemplates = content
        .split("\n")
        .map(line => line.trim())
        .filter(line => line !== "" && !line.startsWith("#"))
        .map(line => line.replace(".gitignore", "")); // Remove .gitignore extension if present

      return referencedTemplates;
    } catch (error) {
      console.error(`Error reading stack file ${stackFilePath}:`, error);
      return [];
    }
  }

  /**
   * Get template content for a referenced template name
   * @param templateName Name of the template
   * @returns Template content
   */
  private async getTemplateContentByName(templateName: string): Promise<string> {
    // Try to find the template in the toptal/templates directory
    const templatePath = path.join(this.context.extensionPath, "src", "toptal", "templates", `${templateName}.gitignore`);

    try {
      return fs.readFileSync(templatePath, "utf8");
    } catch (error) {
      console.error(`Error reading template ${templateName}:`, error);
      return `# Referenced template ${templateName} not found\n`;
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
        content += "\n";

        // Check for associated stack files
        const stackFiles = this.getStackFilesForTemplate(template);
        
        if (stackFiles.length > 0) {
          for (const stackFile of stackFiles) {
            const stackFileName = path.basename(stackFile, ".stack");
            const referencedTemplates = await this.getReferencedTemplatesFromStack(stackFile);
            
            if (referencedTemplates.length > 0) {
              content += COMMENT_TEMPLATES.TEMPLATE_SECTION(`${template.label} - ${stackFileName} Stack`) + "\n";
              
              for (const referencedTemplate of referencedTemplates) {
                const referencedContent = await this.getTemplateContentByName(referencedTemplate);
                content += `# Referenced template: ${referencedTemplate}\n`;
                content += referencedContent;
                content += "\n";
              }
            }
          }
        }

        content += "\n";
      }

      resolve(content);
    });
  }
}