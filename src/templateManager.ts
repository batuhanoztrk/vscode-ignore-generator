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

  /**
   * Gets templates available for user selection (excludes stack files since they're auto-added)
   */
  async getSelectableTemplates(): Promise<IgnoreTemplate[]> {
    const allTemplates = await this.getAvailableTemplates();
    // Filter out stack files from user selection since they'll be auto-added
    return allTemplates.filter(template => template.path.endsWith('.gitignore'));
  }

  /**
   * Automatically finds and includes related stack files for the selected templates
   */
  async expandTemplatesWithStacks(selectedTemplates: IgnoreTemplate[]): Promise<{
    expandedTemplates: IgnoreTemplate[];
    autoAddedStacks: IgnoreTemplate[];
  }> {
    const allTemplates = await this.getAvailableTemplates();
    const expandedTemplates = [...selectedTemplates];
    const autoAddedStacks: IgnoreTemplate[] = [];
    const addedStackNames = new Set<string>();

    for (const template of selectedTemplates) {
      // Only process .gitignore templates (not stack files themselves)
      if (template.path.endsWith('.gitignore')) {
        const baseTemplateName = template.label;
        
        // Find all related stack files for this template
        const relatedStacks = allTemplates.filter(t => 
          t.path.endsWith('.stack') && 
          t.label.startsWith(baseTemplateName + '.') &&
          !addedStackNames.has(t.label)
        );

        // Add related stack files to the expanded list
        for (const stackTemplate of relatedStacks) {
          expandedTemplates.push(stackTemplate);
          autoAddedStacks.push(stackTemplate);
          addedStackNames.add(stackTemplate.label);
        }
      }
    }

    return { expandedTemplates, autoAddedStacks };
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
  ): Promise<{ content: string; autoAddedStacks: IgnoreTemplate[] }> {
    return new Promise(async (resolve) => {
      let content = "";

      if (!isAppending) {
        content += COMMENT_TEMPLATES.HEADER(ignoreType) + "\n";
        content += COMMENT_TEMPLATES.TIMESTAMP() + "\n\n";
      } else {
        content += "\n" + COMMENT_TEMPLATES.APPEND_TIMESTAMP() + "\n";
      }

      // Automatically expand templates to include related stack files
      const { expandedTemplates, autoAddedStacks } = await this.expandTemplatesWithStacks(selectedTemplates);

      // Add info comment about auto-added stacks if any
      if (autoAddedStacks.length > 0) {
        content += `# Auto-added related stack files: ${autoAddedStacks.map(s => s.label).join(', ')}\n\n`;
      }

      for (const template of expandedTemplates) {
        const templateContent = await this.readTemplateContent(template);
        content += COMMENT_TEMPLATES.TEMPLATE_SECTION(template.label) + "\n";
        content += templateContent;
        content += "\n\n";
      }

      resolve({ content, autoAddedStacks });
    });
  }
}