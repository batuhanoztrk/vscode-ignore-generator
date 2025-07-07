// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

interface IgnoreTemplate {
  label: string;
  description: string;
  path: string;
}

interface TemplatePatch {
  templateName: string;
  patchPath: string;
  patchName: string;
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log(
    'Congratulations, your extension "Ignore Generator" is now active!'
  );

  const disposable = vscode.commands.registerCommand(
    "ignore-generator.createIgnoreFile",
    async () => {
      try {
        // Step 1: Kullanıcıdan ignore dosyası türünü seç
        const ignoreType = await selectIgnoreFileType(context);
        if (!ignoreType) {
          return;
        }

        // Step 2: Kullanılabilir template'leri al
        const templates = await getAvailableTemplates(context);
        if (templates.length === 0) {
          vscode.window.showErrorMessage("No templates found!");
          return;
        }

        // Step 3: Kullanıcıdan template'leri seç
        const selectedTemplates = await selectTemplates(templates);
        if (!selectedTemplates || selectedTemplates.length === 0) {
          return;
        }

        // Step 4: Ignore dosyasını oluştur
        await createIgnoreFile(context, ignoreType, selectedTemplates);
      } catch (error) {
        vscode.window.showErrorMessage(`Error: ${error}`);
      }
    }
  );

  context.subscriptions.push(disposable);
}

async function selectIgnoreFileType(
  context: vscode.ExtensionContext
): Promise<string | undefined> {
  const ignoreTypesPath = path.join(
    context.extensionPath,
    "src",
    "ignore-types.list"
  );

  const ignoreTypes = fs.readFileSync(ignoreTypesPath, "utf8").split("\n");

  const quickPickItems = ignoreTypes
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
    .filter((item) => item !== null);

  const selected = await vscode.window.showQuickPick(quickPickItems, {
    placeHolder: "Select the type of ignore file to create",
    canPickMany: false,
  });

  return selected?.label;
}

async function getAvailableTemplates(
  context: vscode.ExtensionContext
): Promise<IgnoreTemplate[]> {
  const templatesListPath = path.join(
    context.extensionPath,
    "src",
    "templates.list"
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
        ? path.dirname(templatePath).split("/").pop()
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

async function selectTemplates(
  templates: IgnoreTemplate[]
): Promise<IgnoreTemplate[] | undefined> {
  const quickPickItems = templates.map((template) => ({
    label: template.label,
    description: template.description,
    template: template,
  }));

  const selected = await vscode.window.showQuickPick(quickPickItems, {
    placeHolder: "Select templates to include (you can select multiple)",
    canPickMany: true,
    matchOnDescription: true,
  });

  return selected?.map((item: any) => item.template);
}

async function createIgnoreFile(
  context: vscode.ExtensionContext,
  ignoreType: string,
  selectedTemplates: IgnoreTemplate[]
): Promise<void> {
  if (!vscode.workspace.workspaceFolders) {
    vscode.window.showErrorMessage("Please open a workspace first!");
    return;
  }

  const workspaceRoot = vscode.workspace.workspaceFolders[0].uri.fsPath;
  const ignoreFilePath = path.join(workspaceRoot, ignoreType);

  // Check if file already exists
  const fileExists = fs.existsSync(ignoreFilePath);
  if (fileExists) {
    const action = await vscode.window.showWarningMessage(
      `${ignoreType} already exists. What would you like to do?`,
      "Overwrite",
      "Append",
      "Cancel"
    );

    if (action === "Cancel" || !action) {
      return;
    }

    if (action === "Append") {
      await appendToIgnoreFile(context, ignoreFilePath, selectedTemplates);
      return;
    }
  }

  // Find patches for selected templates
  const patches = await findPatchesForTemplates(context, selectedTemplates);

  // Create new file or overwrite
  let content = `# ${ignoreType} file generated by VS Code Ignore Generator Extension\n`;
  content += `# Generated on: ${new Date().toISOString()}\n\n`;

  for (const template of selectedTemplates) {
    const templateContent = await readTemplateContent(context, template);
    content += `# ===== ${template.label} =====\n`;
    content += templateContent;
    content += "\n";

    // Add patches for this template
    const templatePatches = patches.filter(
      (p) => p.templateName === template.label
    );
    for (const patch of templatePatches) {
      const patchContent = await readPatchContent(context, patch);
      if (patchContent.trim()) {
        content += `# ===== ${template.label} (${patch.patchName}) =====\n`;
        content += patchContent;
        content += "\n";
      }
    }
    content += "\n";
  }

  try {
    fs.writeFileSync(ignoreFilePath, content, "utf8");

    // Open the file in editor
    const document = await vscode.workspace.openTextDocument(ignoreFilePath);
    await vscode.window.showTextDocument(document);

    const patchText =
      patches.length > 0 ? ` and ${patches.length} patch(es)` : "";
    vscode.window.showInformationMessage(
      `${ignoreType} created successfully with ${selectedTemplates.length} template(s)${patchText}!`
    );
  } catch (error) {
    throw new Error(`Failed to create ${ignoreType}: ${error}`);
  }
}

async function appendToIgnoreFile(
  context: vscode.ExtensionContext,
  ignoreFilePath: string,
  selectedTemplates: IgnoreTemplate[]
): Promise<void> {
  // Find patches for selected templates
  const patches = await findPatchesForTemplates(context, selectedTemplates);

  let appendContent = `\n# ===== Added on ${new Date().toISOString()} =====\n`;

  for (const template of selectedTemplates) {
    const templateContent = await readTemplateContent(context, template);
    appendContent += `# ===== ${template.label} =====\n`;
    appendContent += templateContent;
    appendContent += "\n";

    // Add patches for this template
    const templatePatches = patches.filter(
      (p) => p.templateName === template.label
    );
    for (const patch of templatePatches) {
      const patchContent = await readPatchContent(context, patch);
      if (patchContent.trim()) {
        appendContent += `# ===== ${template.label} (${patch.patchName}) =====\n`;
        appendContent += patchContent;
        appendContent += "\n";
      }
    }
    appendContent += "\n";
  }

  try {
    fs.appendFileSync(ignoreFilePath, appendContent, "utf8");

    // Open the file in editor
    const document = await vscode.workspace.openTextDocument(ignoreFilePath);
    await vscode.window.showTextDocument(document);

    const patchText =
      patches.length > 0 ? ` and ${patches.length} patch(es)` : "";
    vscode.window.showInformationMessage(
      `Added ${selectedTemplates.length} template(s)${patchText} to existing ignore file!`
    );
  } catch (error) {
    throw new Error(`Failed to append to ignore file: ${error}`);
  }
}

async function findPatchesForTemplates(
  context: vscode.ExtensionContext,
  selectedTemplates: IgnoreTemplate[]
): Promise<TemplatePatch[]> {
  const patches: TemplatePatch[] = [];
  const templatesDir = path.join(
    context.extensionPath,
    "src",
    "toptal",
    "templates"
  );

  try {
    const files = fs.readdirSync(templatesDir);

    for (const template of selectedTemplates) {
      const templateName = template.label;

      // Find all patch files for this template
      const patchFiles = files.filter((file: string) => {
        // Match [Template].patch pattern
        if (file === `${templateName}.patch`) {
          return true;
        }

        // Match [Template]+xxx.patch pattern
        if (file.startsWith(`${templateName}+`) && file.endsWith(".patch")) {
          return true;
        }

        return false;
      });

      for (const patchFile of patchFiles) {
        const patchPath = path.join("toptal", "templates", patchFile);
        let patchName = patchFile.replace(".patch", "");

        // Remove template name from patch name for display
        if (patchName === templateName) {
          patchName = "main";
        } else if (patchName.startsWith(`${templateName}+`)) {
          patchName = patchName.substring(templateName.length + 1);
        }

        patches.push({
          templateName: templateName,
          patchPath: patchPath,
          patchName: patchName,
        });
      }
    }

    return patches;
  } catch (error) {
    console.error(`Error finding patches: ${error}`);
    return patches;
  }
}

async function readPatchContent(
  context: vscode.ExtensionContext,
  patch: TemplatePatch
): Promise<string> {
  const patchPath = path.join(context.extensionPath, "src", patch.patchPath);

  try {
    return fs.readFileSync(patchPath, "utf8");
  } catch (error) {
    console.error(`Failed to read patch ${patch.patchPath}: ${error}`);
    return `# Patch ${patch.patchName} not found\n`;
  }
}

async function readTemplateContent(
  context: vscode.ExtensionContext,
  template: IgnoreTemplate
): Promise<string> {
  const templatePath = path.join(context.extensionPath, "src", template.path);

  try {
    return fs.readFileSync(templatePath, "utf8");
  } catch (error) {
    // If template doesn't exist, return a comment
    return `# Template ${template.label} not found\n`;
  }
}

// This method is called when your extension is deactivated
export function deactivate() {}
