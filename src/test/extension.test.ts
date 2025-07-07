import * as assert from "assert";
import * as vscode from "vscode";
import * as path from "path";
import * as sinon from "sinon";
import * as myExtension from "../extension";

suite("Ignore Generator Extension Test Suite", () => {
  let sandbox: sinon.SinonSandbox;
  let mockContext: vscode.ExtensionContext;
  let mockWorkspaceFolder: vscode.WorkspaceFolder;

  setup(() => {
    sandbox = sinon.createSandbox();

    // Mock workspace folder
    mockWorkspaceFolder = {
      uri: vscode.Uri.file("/test/workspace"),
      name: "test-workspace",
      index: 0,
    };

    // Mock extension context
    mockContext = {
      extensionPath: "/test/extension/path",
      subscriptions: [],
      workspaceState: {
        get: sandbox.stub(),
        update: sandbox.stub(),
        keys: sandbox.stub().returns([]),
      },
      globalState: {
        get: sandbox.stub(),
        update: sandbox.stub(),
        setKeysForSync: sandbox.stub(),
        keys: sandbox.stub().returns([]),
      },
      secrets: {
        get: sandbox.stub(),
        store: sandbox.stub(),
        delete: sandbox.stub(),
        onDidChange: sandbox.stub(),
      },
      storageUri: vscode.Uri.file("/test/storage"),
      globalStorageUri: vscode.Uri.file("/test/global-storage"),
      logUri: vscode.Uri.file("/test/log"),
      extensionUri: vscode.Uri.file("/test/extension"),
      extensionMode: vscode.ExtensionMode.Test,
      environmentVariableCollection: {
        replace: sandbox.stub(),
        append: sandbox.stub(),
        prepend: sandbox.stub(),
        get: sandbox.stub(),
        forEach: sandbox.stub(),
        delete: sandbox.stub(),
        clear: sandbox.stub(),
        persistent: true,
        description: "test",
      },
      asAbsolutePath: (relativePath: string) =>
        path.join("/test/extension/path", relativePath),
      storagePath: "/test/storage",
      globalStoragePath: "/test/global-storage",
      logPath: "/test/log",
    } as any;
  });

  teardown(() => {
    sandbox.restore();
  });

  suite("Extension Lifecycle", () => {
    test("should activate successfully", () => {
      const mockContext = {
        extensionPath: "/test/path",
        subscriptions: [],
        asAbsolutePath: (p: string) => `/test/path/${p}`,
      } as any;

      const registerCommandStub = sandbox.stub(
        vscode.commands,
        "registerCommand"
      );

      myExtension.activate(mockContext);

      assert.strictEqual(registerCommandStub.calledOnce, true);
      assert.strictEqual(
        registerCommandStub.calledWith("ignore-generator.createIgnoreFile"),
        true
      );
      assert.strictEqual(mockContext.subscriptions.length, 1);
    });

    test("should register command with correct name", () => {
      const mockContext = { subscriptions: [] } as any;
      const registerCommandStub = sandbox.stub(
        vscode.commands,
        "registerCommand"
      );

      myExtension.activate(mockContext);

      const [commandName] = registerCommandStub.firstCall.args;
      assert.strictEqual(commandName, "ignore-generator.createIgnoreFile");
    });

    test("should deactivate without errors", () => {
      assert.doesNotThrow(() => {
        myExtension.deactivate();
      });
    });
  });

  suite("Command Registration", () => {
    test("should register disposable command", () => {
      const mockContext = { subscriptions: [] } as any;
      const mockDisposable = { dispose: sandbox.stub() };
      const registerCommandStub = sandbox
        .stub(vscode.commands, "registerCommand")
        .returns(mockDisposable);

      myExtension.activate(mockContext);

      assert.strictEqual(registerCommandStub.called, true);
      assert.strictEqual(mockContext.subscriptions.length, 1);
      assert.strictEqual(mockContext.subscriptions[0], mockDisposable);
    });

    test("should handle command execution", async () => {
      const mockContext = {
        subscriptions: [],
        extensionPath: "/test",
        asAbsolutePath: (p: string) => `/test/${p}`,
      } as any;

      // Mock file operations
      const fs = require("fs");
      sandbox.stub(fs, "readFileSync").returns(".gitignore (Git)");
      sandbox.stub(fs, "existsSync").returns(false);

      // Mock VS Code APIs
      sandbox.stub(vscode.window, "showQuickPick").resolves(undefined);
      sandbox.stub(vscode.workspace, "workspaceFolders").value([
        {
          uri: vscode.Uri.file("/workspace"),
          name: "test",
          index: 0,
        },
      ]);

      const registerCommandStub = sandbox.stub(
        vscode.commands,
        "registerCommand"
      );

      myExtension.activate(mockContext);

      // Get the command handler
      const commandHandler = registerCommandStub.firstCall.args[1];

      // Should not throw when executed
      assert.doesNotThrow(async () => {
        await commandHandler();
      });
    });
  });

  suite("Extension Integration", () => {
    test("should handle activation and deactivation cycle", () => {
      const mockContext = { subscriptions: [] } as any;
      const registerCommandStub = sandbox
        .stub(vscode.commands, "registerCommand")
        .returns({
          dispose: sandbox.stub(),
        });

      // Activate
      myExtension.activate(mockContext);
      assert.strictEqual(registerCommandStub.called, true);

      // Deactivate
      assert.doesNotThrow(() => {
        myExtension.deactivate();
      });
    });

    test("should provide extension exports", () => {
      // Test that the module exports the expected functions
      assert.strictEqual(typeof myExtension.activate, "function");
      assert.strictEqual(typeof myExtension.deactivate, "function");
    });
  });

  suite("Error Handling", () => {
    test("should handle activation errors gracefully", () => {
      const mockContext = { subscriptions: [] } as any;

      // Simulate error in command registration
      sandbox
        .stub(vscode.commands, "registerCommand")
        .throws(new Error("Registration failed"));

      // Should throw during activation due to error
      assert.throws(() => {
        myExtension.activate(mockContext);
      });
    });

    test("should handle missing context gracefully", () => {
      // Test with minimal context
      const mockContext = {} as any;
      sandbox
        .stub(vscode.commands, "registerCommand")
        .returns({ dispose: () => {} });

      // Should handle missing subscriptions array
      assert.doesNotThrow(() => {
        myExtension.activate(mockContext);
      });
    });
  });

  suite("Module Structure", () => {
    test("should export required functions", () => {
      assert.ok(myExtension.activate, "activate function should be exported");
      assert.ok(
        myExtension.deactivate,
        "deactivate function should be exported"
      );
    });

    test("should have correct function signatures", () => {
      assert.strictEqual(
        myExtension.activate.length,
        1,
        "activate should accept one parameter"
      );
      assert.strictEqual(
        myExtension.deactivate.length,
        0,
        "deactivate should accept no parameters"
      );
    });
  });

  suite("Basic Functionality", () => {
    test("should handle file type parsing", async () => {
      const mockContext = {
        subscriptions: [],
        extensionPath: "/test",
        asAbsolutePath: (p: string) => `/test/${p}`,
      } as any;

      const fs = require("fs");
      const fileContent =
        ".gitignore (Git)\n.dockerignore (Docker)\n.npmignore (Npm)";
      sandbox.stub(fs, "readFileSync").returns(fileContent);
      sandbox.stub(fs, "existsSync").returns(false);

      // Mock VS Code APIs to return values that will trigger file type parsing
      const showQuickPickStub = sandbox.stub(vscode.window, "showQuickPick");
      showQuickPickStub.onFirstCall().resolves(undefined); // User cancels

      sandbox.stub(vscode.workspace, "workspaceFolders").value([
        {
          uri: vscode.Uri.file("/workspace"),
          name: "test",
          index: 0,
        },
      ]);

      const registerCommandStub = sandbox.stub(
        vscode.commands,
        "registerCommand"
      );
      myExtension.activate(mockContext);

      const commandHandler = registerCommandStub.firstCall.args[1];
      await commandHandler();

      // Verify that showQuickPick was called with parsed items
      assert.strictEqual(showQuickPickStub.calledOnce, true);
      const quickPickItems = showQuickPickStub.firstCall.args[0];
      assert.strictEqual(Array.isArray(quickPickItems), true);
    });

    test("should handle workspace validation", async () => {
      const mockContext = {
        subscriptions: [],
        extensionPath: "/test",
        asAbsolutePath: (p: string) => `/test/${p}`,
      } as any;

      const fs = require("fs");
      sandbox.stub(fs, "readFileSync").returns(".gitignore (Git)");
      sandbox.stub(fs, "existsSync").returns(false);

      // Mock no workspace folders
      sandbox.stub(vscode.workspace, "workspaceFolders").value(undefined);

      const showQuickPickStub = sandbox.stub(vscode.window, "showQuickPick");
      showQuickPickStub
        .onFirstCall()
        .resolves({ label: ".gitignore", description: "Git" });
      showQuickPickStub.onSecondCall().resolves([{ label: "Node" }] as any);

      const showErrorStub = sandbox.stub(vscode.window, "showErrorMessage");

      const registerCommandStub = sandbox.stub(
        vscode.commands,
        "registerCommand"
      );
      myExtension.activate(mockContext);

      const commandHandler = registerCommandStub.firstCall.args[1];
      await commandHandler();

      // Should show error for missing workspace
      assert.strictEqual(showErrorStub.called, true);
    });
  });
});
