export interface IgnoreTemplate {
  label: string;
  path: string;
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
