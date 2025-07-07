# Ignore Generator

A powerful VS Code extension that helps you quickly generate various ignore files (.gitignore, .dockerignore, etc.) from a comprehensive collection of pre-defined templates.

## 🚀 Features

- **Multiple Ignore File Types**: Supports 36 different types of ignore files including:
  - `.gitignore` (Git)
  - `.dockerignore` (Docker)
  - `.npmignore` (NPM)
  - `.eslintignore` (ESLint)
  - `.prettierignore` (Prettier)
  - And many more!

- **Extensive Template Library**: Choose from 588+ pre-defined templates covering:
  - **Programming Languages**: Java, Python, JavaScript, TypeScript, C++, Go, Rust, and more
  - **Frameworks**: React, Angular, Vue.js, Django, Laravel, Spring Boot, and more  
  - **IDEs & Editors**: Visual Studio, IntelliJ, Xcode, Eclipse, and more
  - **Tools & Services**: Docker, Kubernetes, AWS, Firebase, and more
  - **Operating Systems**: Windows, macOS, Linux

- **🚀 Smart Stack File Integration**: 
  - **Automatic Detection**: When you select a main template (e.g., ReactNative), related stack files are automatically included
  - **React Native**: Automatically adds Android, iOS, Node.js, Linux, macOS, Buck, Gradle, and Xcode configurations
  - **Python Frameworks**: Django and Flask automatically include their Python-specific stack files
  - **LAMP Stack**: Automatically includes Linux and PHP configurations
  - **No Manual Selection**: Stack files are intelligently added - you don't need to select them manually

- **Smart File Management**: 
  - Create new ignore files
  - Append to existing files
  - Automatic timestamp and template labeling
  - Multiple template selection support
  - Clear feedback about auto-added stack files

- **Seamless Integration**:
  - Right-click context menu in Explorer
  - Command Palette access
  - Automatic file opening after creation

## 📦 Installation

1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X)
3. Search for "Ignore Generator"
4. Click Install

## 🎯 Usage

### Method 1: Context Menu (Recommended)
1. Right-click on a folder in the Explorer panel
2. Select "Create Ignore File" from the context menu
3. Choose the type of ignore file you want to create
4. Select one or more templates from the list
5. **✨ Stack files are automatically included** - if you select ReactNative, all related stack files (Android, iOS, Node.js, etc.) will be automatically added
6. The file will be created and opened automatically with clear comments showing which templates and stack files were included

### Method 2: Command Palette
1. Open Command Palette (Ctrl+Shift+P / Cmd+Shift+P)
2. Type "Create Ignore File"
3. Follow the same steps as above

### 🎉 Smart Features in Action

When you select **ReactNative**, the extension automatically includes:
- `ReactNative.Android.stack` - Android-specific ignore patterns
- `ReactNative.Buck.stack` - Buck build system patterns  
- `ReactNative.Gradle.stack` - Gradle build patterns
- `ReactNative.Linux.stack` - Linux-specific patterns
- `ReactNative.macOS.stack` - macOS-specific patterns
- `ReactNative.Node.stack` - Node.js patterns
- `ReactNative.Xcode.stack` - Xcode project patterns

The success message will show: *"ReactNative template created with 7 additional stack files automatically included!"*

## 📸 Screenshots

### Context Menu Integration
![Context Menu](images/context-menu.png)

### Template Selection
![Template Selection](images/template-selection.png)

### Generated File
![Generated File](images/generated-file.png)

## 🛠️ Supported Ignore File Types

| File Type | Description |
|-----------|-------------|
| `.gitignore` | Git version control |
| `.dockerignore` | Docker containerization |
| `.npmignore` | NPM package publishing |
| `.eslintignore` | ESLint linting |
| `.prettierignore` | Prettier code formatting |
| `.stylelintignore` | StyleLint CSS linting |
| `.terraformignore` | Terraform infrastructure |
| `.vercelignore` | Vercel deployment |
| `.gcloudignore` | Google Cloud deployment |
| And 27 more... | [See full list](src/ignore-types.list) |

## 📚 Template Categories

### Programming Languages
Java, Python, JavaScript, TypeScript, C#, C++, Go, Rust, PHP, Ruby, Swift, Kotlin, Scala, Haskell, and many more.

### Web Frameworks
React, Angular, Vue.js, Next.js, Nuxt.js, Svelte, Django, Laravel, Rails, Express.js, Flask, and more.

### Development Tools
Docker, Kubernetes, Terraform, Gradle, Maven, CMake, Webpack, Babel, Jest, and more.

### IDEs & Editors
Visual Studio Code, IntelliJ IDEA, Eclipse, Xcode, Sublime Text, Atom, Vim, and more.

## ⚙️ Extension Settings

This extension contributes the following command:

* `ignore-generator.createIgnoreFile`: Create a new ignore file from templates

## 🔧 Requirements

- VS Code 1.60.0 or higher
- An open workspace/folder

## 🐛 Known Issues

- Large template files may take a moment to load
- Some templates may need customization for specific project needs

## 📝 Release Notes

### 0.0.1

Initial release of Ignore Generator extension featuring:
- Support for 36 different ignore file types
- 570+ pre-defined templates
- Context menu and command palette integration
- Smart file management (create/append)
- Automatic file opening after creation

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues and enhancement requests.

## 📄 License

This extension is licensed under the MIT License.

## 🙏 Acknowledgments

Templates are sourced from the comprehensive [toptal/gitignore](https://github.com/toptal/gitignore) repository.

---

**Enjoy generating ignore files effortlessly!** 🎉
