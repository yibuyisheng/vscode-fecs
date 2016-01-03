"use strict";

var path = require('path');
var vscode = require('vscode');
var fecs = require('fecs');

fecs.leadName = 'fecs';

exports.activate = function activate(context) {
    var diagnosticCollection = vscode.languages.createDiagnosticCollection('fecs');
    context.subscriptions.push(diagnosticCollection);

    vscode.workspace.onDidSaveTextDocument(function (event) {
        diagnosticCollection.clear();
        fecs.check(
            {
                type: 'js',
                name: 'FECS JS',
                _: [event.uri.path],
                stream: false
            },
            function (hasNoError, errors) {
                diagnosticCollection.set(convertErrors(errors));
            }
        );
    });
};

function convertErrors(fecsErrors) {
    return fecsErrors.map(function (error) {
        return [
            vscode.Uri.file(error.path),
            error.errors.map(function (fileError) {
                // fecs的行号和列号与vscode有差异。。。。
                var line = fileError.line - 1;
                var column = fileError.column - 1;

                return new vscode.Diagnostic(
                    new vscode.Range(line, column, line, column + 1),
                    `[FECS]: ${fileError.message}  (${fileError.rule})`,
                    {
                        1: vscode.DiagnosticSeverity.Warning,
                        2: vscode.DiagnosticSeverity.Error
                    }[fileError.severity]
                );
            })
        ];
    });
}
