# Change Log

All notable changes to the "Ignore Generator" extension will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/) and this project adheres to [Semantic Versioning](https://semver.org/).

## [0.0.1] - 2025-07-07

### Added

- ✨ **Initial release of Ignore Generator extension**
- 🎯 **Multi-format ignore file support**: 36 different ignore file types

  - `.gitignore` (Git)
  - `.dockerignore` (Docker)
  - `.npmignore` (NPM)
  - `.eslintignore` (ESLint)
  - `.prettierignore` (Prettier)
  - `.stylelintignore` (StyleLint)
  - `.terraformignore` (Terraform)
  - `.vercelignore` (Vercel)
  - `.gcloudignore` (Google Cloud)
  - And 27 more ignore file types

- 📚 **Comprehensive template library**: 570+ pre-defined templates covering:

  - **Programming Languages**: Java, Python, JavaScript, TypeScript, C++, Go, Rust, PHP, Ruby, Swift, Kotlin, Scala, Haskell, and more
  - **Web Frameworks**: React, Angular, Vue.js, Next.js, Nuxt.js, Svelte, Django, Laravel, Rails, Flask, and more
  - **Development Tools**: Docker, Kubernetes, Terraform, Gradle, Maven, CMake, Webpack, Babel, Jest, and more
  - **IDEs & Editors**: Visual Studio Code, IntelliJ IDEA, Eclipse, Xcode, Sublime Text, and more
  - **Operating Systems**: Windows, macOS, Linux
  - **Cloud Services**: AWS, Firebase, Google Cloud, Azure, and more

- 🔧 **Smart file management features**:

  - Create new ignore files from scratch
  - Append templates to existing ignore files
  - Choose to overwrite existing files
  - Automatic timestamp and template labeling
  - Multiple template selection support

- 🎨 **Seamless VS Code integration**:

  - Right-click context menu in Explorer panel
  - Command Palette integration (`Create Ignore File`)
  - Automatic file opening after creation
  - Proper error handling and user feedback

- 📝 **Template organization**:
  - Alphabetically sorted template list
  - Clear template categorization
  - Template descriptions for easy identification

### Technical Details

- Built with TypeScript for type safety
- Efficient file system operations
- Comprehensive error handling
- Clean code architecture with separation of concerns
- Template sourced from toptal/gitignore repository

### Commands Added

- `ignore-generator.createIgnoreFile`: Main command to create ignore files

### Menu Contributions

- Explorer context menu: "Create Ignore File" option for folders
- Command Palette: "Create Ignore File" command

---

## [Unreleased]

### Planned Features

- 📁 Custom template support
- 📊 Usage analytics and popular templates
- 🌐 Online template updates
- 💾 Template favorites and recent selections
- 🔄 Batch ignore file generation

---

**Note**: Version numbers follow semantic versioning (SemVer). Each release includes backward compatibility unless otherwise noted.
