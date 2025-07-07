export interface IgnoreTemplate {
  label: string;
  path: string;
}

export interface TemplatePatch {
  templateName: string;
  path: string;
}

export interface TemplateStack {
  templateName: string;
  path: string;
  name: string;
}

export interface QuickPickTemplate {
  label: string;
  template: IgnoreTemplate;
}

export interface IgnoreType {
  label: string;
  description: string;
}

export enum FileAction {
  Overwrite = "Overwrite",
  Append = "Append",
  Cancel = "Cancel",
}
