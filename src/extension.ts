// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { getLanguageService as getJsonLanguageService } from "vscode-json-languageservice";

import { register as registerCompletions } from "./importCompletionProvider";
import { register as registerGoToDefinition } from "./importGoToDefinitionProvider";
import { register as registerHover } from "./importHoverProvider";
import { register as registerImportOverwriteDecorator } from "./importOverwriteDecoratorProvider";
import { register as registerInlineImportCodeAction } from "./inlineImportCodeActionProvider";
import { register as registerReferences } from "./templateReferencesProvider";

import { enableConfigDocumentCache } from "./configDocument";
import { registerDiagnosticsProvider } from "./diagnostics/provider";
import { My } from "./my";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext): void {
	const workspace = vscode.workspace.workspaceFolders?.[0];
	if (!workspace) {
		return;
	}

	const ls = getJsonLanguageService({});
	ls.configure({
		allowComments: true,
		validate: true,
	});

	const my = new My(workspace, context, ls);
	enableConfigDocumentCache(my);

	// // Use the console to output diagnostic information (console.log) and errors (console.error)
	// // This line of code will only be executed once when your extension is activated
	// console.log(
	//   'Congratulations, your extension "zwave-js-config-editor" is now active!'
	// );

	// // The command has been defined in the package.json file
	// // Now provide the implementation of the command with registerCommand
	// // The commandId parameter must match the command field in package.json
	// let disposable = vscode.commands.registerCommand('zwave-js-config-editor.helloWorld', () => {
	// 	// The code you place here will be executed every time your command is executed
	// 	// Display a message box to the user
	// 	vscode.window.showInformationMessage('Hello World from Z-Wave JS Config Editor!');
	// });

	context.subscriptions.push(
		registerCompletions(my),
		registerHover(my),
		registerGoToDefinition(my),
		registerInlineImportCodeAction(my),
		registerReferences(my),
		registerDiagnosticsProvider(my),
		registerImportOverwriteDecorator(my),
	);
}

// This method is called when your extension is deactivated
// eslint-disable-next-line @typescript-eslint/no-empty-function
export function deactivate(): void {}
