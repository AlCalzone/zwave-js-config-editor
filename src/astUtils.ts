import * as vscode from "vscode";
import {
	ASTNode,
	Location,
	ObjectASTNode,
	PropertyASTNode,
	StringASTNode,
} from "vscode-json-languageservice";

export type PropertyNameASTNode = StringASTNode & { parent: PropertyASTNode };
export type PropertyValueASTNode = ASTNode & { parent: PropertyASTNode };
export type ObjectPropertyASTNode = PropertyASTNode & { parent: ObjectASTNode };

export function nodeIsPropertyName(
	node: ASTNode | undefined,
): node is PropertyNameASTNode {
	return node?.parent?.type === "property" && node === node.parent.keyNode;
}

export function nodeIsPropertyValue(
	node: ASTNode | undefined,
): node is PropertyValueASTNode {
	return node?.parent?.type === "property" && node === node.parent.valueNode;
}

export function nodeIsPropertyNameOrValue(
	node: ASTNode | undefined,
): node is PropertyValueASTNode | PropertyNameASTNode {
	return node?.parent?.type === "property";
}

export function getPropertyNameFromNode(
	node: PropertyValueASTNode | PropertyNameASTNode,
): string {
	return node.parent.keyNode.value;
}

export function getPropertyValueFromNode(
	node: PropertyValueASTNode | PropertyNameASTNode,
): string | number | boolean | null | undefined {
	return node.parent.valueNode?.value;
}

export function rangeFromNodeLocation(location: Location): vscode.Range {
	return new vscode.Range(
		location.range.start.line,
		location.range.start.character,
		location.range.end.line,
		location.range.end.character,
	);
}

export function rangeFromNode(
	document: vscode.TextDocument,
	node: ASTNode,
): vscode.Range {
	const start = document.positionAt(node.offset);
	const end = document.positionAt(node.offset + node.length);
	return new vscode.Range(start, end);
}

export function tryExpandPropertyRange(
	document: vscode.TextDocument,
	node: ObjectPropertyASTNode,
): vscode.Range {
	const siblings = node.parent.properties;
	if (siblings.length === 1) return rangeFromNode(document, node);
	const index = siblings.indexOf(node);
	if (index > 0) {
		// Select everything from the end of the previous property to the end of this one
		const start = document.positionAt(
			siblings[index - 1].offset + siblings[index - 1].length,
		);
		const end = document.positionAt(node.offset + node.length);
		return new vscode.Range(start, end);
	} else {
		// Select everything from the start of this property to the start of the next one
		const start = document.positionAt(node.offset);
		const end = document.positionAt(siblings[index + 1].offset);
		return new vscode.Range(start, end);
	}
}

export function findSurroundingParamDefinition(
	node: ASTNode,
): ObjectASTNode | undefined {
	while (node.parent) {
		if (
			node.type === "object" &&
			node.parent.type === "array" &&
			nodeIsPropertyValue(node.parent) &&
			getPropertyNameFromNode(node.parent) === "paramInformation"
		) {
			return node;
		}
		node = node.parent;
	}
}
