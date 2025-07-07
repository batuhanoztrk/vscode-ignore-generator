export interface IgnoreTemplate {
  label: string;
  description: string;
  path: string;
}

export interface QuickPickTemplate {
  label: string;
  description: string;
  template: IgnoreTemplate;
}

export interface IgnoreType {
  label: string;
  description: string;
}

export enum FileAction {
  Overwrite = "Overwrite",
  Append = "Append",
  Cancel = "Cancel"
}