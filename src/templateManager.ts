import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { IgnoreTemplate, TemplatePatch, TemplateStack } from "./types";
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

        templates.push({
          label: templateName,
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
    const templatePath = path.join(
      this.context.extensionPath,
      "src",
      template.path
    );

    try {
      return fs.readFileSync(templatePath, "utf8");
    } catch (error) {
      // If template doesn't exist, return a comment
      return COMMENT_TEMPLATES.TEMPLATE_NOT_FOUND(template.label) + "\n";
    }
  }

  private async findStacksForTemplates(
    selectedTemplates: IgnoreTemplate[]
  ): Promise<TemplateStack[]> {
    const stacks: TemplateStack[] = [];
    const templatesDir = path.join(
      this.context.extensionPath,
      EXTENSION_PATHS.TEMPLATES_FOLDER
    );

    try {
      const files = fs.readdirSync(templatesDir);

      for (const template of selectedTemplates) {
        const templateName = template.label;

        const stackFiles = files.filter((file: string) => {
          if (file === `${templateName}.stack`) {
            return true;
          }

          if (file.startsWith(`${templateName}.`) && file.endsWith(".stack")) {
            return true;
          }

          return false;
        });

        for (const stackFile of stackFiles) {
          const stackPath = path.join("toptal", "templates", stackFile);

          stacks.push({
            templateName: templateName,
            path: stackPath,
            name: stackFile.replace(".stack", ""),
          });
        }
      }

      return stacks;
    } catch (error) {
      console.error(`Error finding stacks: ${error}`);
      return stacks;
    }
  }

  private readStackContent(
    context: vscode.ExtensionContext,
    stack: TemplateStack
  ) {
    const stackPath = path.join(context.extensionPath, "src", stack.path);

    try {
      return fs.readFileSync(stackPath, "utf8");
    } catch (error) {
      console.error(`Failed to read stack ${stack.path}: ${error}`);
      return `# Stack ${stack.name} not found\n`;
    }
  }

  private readPatchContent(
    context: vscode.ExtensionContext,
    patch: TemplatePatch
  ) {
    const patchPath = path.join(context.extensionPath, "src", patch.path);

    try {
      return fs.readFileSync(patchPath, "utf8");
    } catch (error) {
      console.error(`Failed to read patch ${patch.path}: ${error}`);
      return `# Patch ${patch.path} not found\n`;
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

      const stacks = await this.findStacksForTemplates(selectedTemplates);

      for (const template of selectedTemplates) {
        const templateContent = await this.readTemplateContent(template);
        content += COMMENT_TEMPLATES.TEMPLATE_SECTION(template.label) + "\n";
        content += templateContent;
        content += "\n";

        const patchFile = path.join(
          this.context.extensionPath,
          EXTENSION_PATHS.TEMPLATES_FOLDER,
          `${template.label}.patch`
        );

        if (fs.existsSync(patchFile)) {
          const patchContent = fs.readFileSync(patchFile, "utf8");
          content += COMMENT_TEMPLATES.PATCH_SECTION(template.label) + "\n";
          content += patchContent;
          content += "\n";
        }

        const templateStacks = stacks.filter(
          (stack) => stack.templateName === template.label
        );
        for (const stack of templateStacks) {
          const stackContent = this.readStackContent(this.context, stack);
          content += COMMENT_TEMPLATES.STACK_SECTION(stack.name) + "\n";
          content += stackContent;
          content += "\n";
        }

        content += "\n";
      }

      content = content.trim() + "\n";

      resolve(content);
    });
  }
}
