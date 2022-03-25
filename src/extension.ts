'use strict';

import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    // 切换工作空间
    const disposable = vscode.commands.registerCommand('extension.switchDiyWorkspace', async function () {
        // if (process.platform === "darwin") {
        //     const folderPath = vscode.workspace.rootPath;
        //     folderPath;
        // }
        const configWorkspace = vscode.workspace.getConfiguration("switchWorkspace");

        if (configWorkspace.enable) {
            const workspaceList: { displayName: string, realPath: string }[] = configWorkspace.list.map((v: string) => {
                const re = /\/(?<projectName>[a-zA-Z-0-9]+)$/u;
                const result = re.exec(v);
                let displayName = v;
    
                if (result?.groups?.projectName) {
                    displayName = result?.groups?.projectName;
                }
                return { displayName, realPath: v };
            });

            const options = workspaceList.map((v, i) => `[${i+1}] ${v.displayName}`);

            // 组件类别
            const selectedItem = await vscode.window.showQuickPick(
                options,
                {
                    canPickMany: false,
                    ignoreFocusOut: true,
                    matchOnDescription: true,
                    matchOnDetail: true,
                    placeHolder: '请选择一个空间',
                });

            if (selectedItem) {
                const displayName = selectedItem.split(/\s+/)[1];
    
                if (workspaceList?.length > 0) {
                    const { realPath = '' } = workspaceList.find(v => v.displayName === displayName) ?? {};
                    const folderUri = vscode.Uri.file(realPath);
                    vscode.commands.executeCommand('vscode.openFolder', folderUri);
                }
            }
        } else {
            await vscode.commands.executeCommand("workbench.action.switchWindow");
        }
    });

    context.subscriptions.push(disposable);
}
