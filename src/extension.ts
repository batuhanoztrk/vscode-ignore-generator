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

  // Create new file or overwrite
  let content = `# ${ignoreType} file generated by VS Code Ignore Extension\n`;
  content += `# Generated on: ${new Date().toISOString()}\n\n`;

  let totalPatchFiles = 0;
  for (const template of selectedTemplates) {
    const templateContent = await readTemplateContent(context, template);
    content += `# ===== ${template.label} =====\n`;
    content += templateContent;
    content += "\n\n";
    
    // Count patch files for this template
    totalPatchFiles += await countPatchFiles(context, template);
  }

  try {
    fs.writeFileSync(ignoreFilePath, content, "utf8");

    // Open the file in editor
    const document = await vscode.workspace.openTextDocument(ignoreFilePath);
    await vscode.window.showTextDocument(document);

    let message = `${ignoreType} created successfully with ${selectedTemplates.length} template(s)!`;
    if (totalPatchFiles > 0) {
      message += ` Applied ${totalPatchFiles} patch file(s).`;
    }
    vscode.window.showInformationMessage(message);
  } catch (error) {
    throw new Error(`Failed to create ${ignoreType}: ${error}`);
  }
}

async function appendToIgnoreFile(
  context: vscode.ExtensionContext,
  ignoreFilePath: string,
  selectedTemplates: IgnoreTemplate[]
): Promise<void> {
  let appendContent = `\n# ===== Added on ${new Date().toISOString()} =====\n`;

  let totalPatchFiles = 0;
  for (const template of selectedTemplates) {
    const templateContent = await readTemplateContent(context, template);
    appendContent += `# ===== ${template.label} =====\n`;
    appendContent += templateContent;
    appendContent += "\n\n";
    
    // Count patch files for this template
    totalPatchFiles += await countPatchFiles(context, template);
  }

  try {
    fs.appendFileSync(ignoreFilePath, appendContent, "utf8");

    // Open the file in editor
    const document = await vscode.workspace.openTextDocument(ignoreFilePath);
    await vscode.window.showTextDocument(document);

    let message = `Added ${selectedTemplates.length} template(s) to existing ignore file!`;
    if (totalPatchFiles > 0) {
      message += ` Applied ${totalPatchFiles} patch file(s).`;
    }
    vscode.window.showInformationMessage(message);
  } catch (error) {
    throw new Error(`Failed to append to ignore file: ${error}`);
  }
}

async function readTemplateContent(
  context: vscode.ExtensionContext,
  template: IgnoreTemplate
): Promise<string> {
  const templatePath = path.join(context.extensionPath, "src", template.path);

  try {
    let content = fs.readFileSync(templatePath, "utf8");
    
    // Check if patch file exists and apply it
    const patchContent = await readPatchContent(context, template);
    if (patchContent) {
      content += `\n# ===== ${template.label} Patch =====\n`;
      content += patchContent;
    }
    
    return content;
  } catch (error) {
    // If template doesn't exist, return a comment
    return `# Template ${template.label} not found\n`;
  }
}

async function readPatchContent(
  context: vscode.ExtensionContext,
  template: IgnoreTemplate
): Promise<string | null> {
  const templateName = path.basename(template.path, '.gitignore');
  const templateDir = path.dirname(template.path);
  const patchDir = path.join(context.extensionPath, "src", templateDir);

  try {
    let allPatchContent = "";
    
    // Read all files in the template directory
    const files = fs.readdirSync(patchDir);
    
    // Find all patch files for this template
    const patchFiles = files.filter((file: string) => {
      // Match pattern: templateName.patch or templateName+anything.patch
      return file === `${templateName}.patch` || file.startsWith(`${templateName}+`) && file.endsWith('.patch');
    });

    if (patchFiles.length === 0) {
      return null;
    }

    // Sort patch files to have consistent order (base patch first, then + variants)
    patchFiles.sort((a: string, b: string) => {
      if (a === `${templateName}.patch`) return -1;
      if (b === `${templateName}.patch`) return 1;
      return a.localeCompare(b);
    });

    // Read and combine all patch files
    for (const patchFile of patchFiles) {
      const patchPath = path.join(patchDir, patchFile);
      const patchContent = fs.readFileSync(patchPath, "utf8");
      
      if (allPatchContent) {
        allPatchContent += "\n";
      }
      
      // Add variant name if it's a + variant
      if (patchFile !== `${templateName}.patch`) {
        const variant = patchFile.replace(`${templateName}+`, '').replace('.patch', '');
        allPatchContent += `# ----- ${variant} variant -----\n`;
      }
      
      allPatchContent += patchContent;
    }

    return allPatchContent || null;
  } catch (error) {
    // If patch files cannot be read, return null
    return null;
  }
}

async function hasPatch(
  context: vscode.ExtensionContext,
  template: IgnoreTemplate
): Promise<boolean> {
  const templateName = path.basename(template.path, '.gitignore');
  const templateDir = path.dirname(template.path);
  const patchDir = path.join(context.extensionPath, "src", templateDir);
  
  try {
    if (!fs.existsSync(patchDir)) {
      return false;
    }
    
    // Read all files in the template directory
    const files = fs.readdirSync(patchDir);
    
    // Check if any patch files exist for this template
    const patchFiles = files.filter((file: string) => {
      // Match pattern: templateName.patch or templateName+anything.patch
      return file === `${templateName}.patch` || file.startsWith(`${templateName}+`) && file.endsWith('.patch');
    });

    return patchFiles.length > 0;
  } catch (error) {
    return false;
  }
}

async function countPatchFiles(
  context: vscode.ExtensionContext,
  template: IgnoreTemplate
): Promise<number> {
  const templateName = path.basename(template.path, '.gitignore');
  const templateDir = path.dirname(template.path);
  const patchDir = path.join(context.extensionPath, "src", templateDir);
  
  try {
    if (!fs.existsSync(patchDir)) {
      return 0;
    }
    
    // Read all files in the template directory
    const files = fs.readdirSync(patchDir);
    
    // Count all patch files for this template
    const patchFiles = files.filter((file: string) => {
      // Match pattern: templateName.patch or templateName+anything.patch
      return file === `${templateName}.patch` || file.startsWith(`${templateName}+`) && file.endsWith('.patch');
    });

    return patchFiles.length;
  } catch (error) {
    return 0;
  }
}

// This method is called when your extension is deactivated
export function deactivate() {}
