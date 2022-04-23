'use strict';

import * as vscode from 'vscode';
import * as util from './util';

export function activate(context: vscode.ExtensionContext) {
    // 开启本插件的功能
    const enableSwitchDiyWorkspace = vscode.commands.registerCommand("extension.switchDiyWorkspace.enable", () => {
        vscode.workspace.getConfiguration("switchDiyWorkspace").update("enable", true, true);
        vscode.window.showInformationMessage('switchDiyWorkspace功能已开启');
    });

    // 关闭本插件的功能
    const disableSwitchDiyWorkspace = vscode.commands.registerCommand("extension.switchDiyWorkspace.disable", () => {
        vscode.workspace.getConfiguration("switchDiyWorkspace").update("enable", false, true);
        vscode.window.showInformationMessage('switchDiyWorkspace功能已关闭');
    });

    // 清空列表
    const emptySwitchDiyWorkspace = vscode.commands.registerCommand("extension.switchDiyWorkspace.empty", () => {
        vscode.workspace.getConfiguration("switchDiyWorkspace").update("list", [], true);
        vscode.window.showInformationMessage('switchDiyWorkspace列表已清空');
    });

    // 查看列表
    const showSwitchDiyWorkspace = vscode.commands.registerCommand("extension.switchDiyWorkspace.show", () => {
        const list = vscode.workspace.getConfiguration("switchDiyWorkspace").get("list") as string[];

        if (list.length > 0) {
            list.forEach(v => vscode.window.showInformationMessage(v));
        } else {
            vscode.window.showInformationMessage('当前列表为空');
        }
    });

    // 添加本项目地址到list当中
    const addSwitchDiyWorkspace = vscode.commands.registerCommand("extension.switchDiyWorkspace.add", () => {
        const document = vscode.window?.activeTextEditor?.document;

        if (document) {
            const workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri);
            const maybeWorkspaceFolder = workspaceFolder ? util.getCurrentWorkspaceFolder(workspaceFolder.uri.path) : "";
            const list = vscode.workspace.getConfiguration("switchDiyWorkspace").get("list") as string[];

            if (maybeWorkspaceFolder) {
                if (!list.includes(maybeWorkspaceFolder)) {
                    vscode.workspace.getConfiguration("switchDiyWorkspace").update("list", [...list, maybeWorkspaceFolder], true);
                    vscode.window.showInformationMessage('当前项目空间添加成功');
                } else {
                    vscode.window.showErrorMessage('列表中已经包含当前项目');
                }
            } else {
                vscode.window.showErrorMessage('请选择一个保存到磁盘的文件');
            }

        } else {
            vscode.window.showErrorMessage('请选择一个文件');
        }
    });

    // 从list删除本项目地址
    const removeSwitchDiyWorkspace = vscode.commands.registerCommand("extension.switchDiyWorkspace.remove", () => {
        const document = vscode.window?.activeTextEditor?.document;

        if (document) {
            const workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri);
            const maybeWorkspaceFolder = workspaceFolder ? util.getCurrentWorkspaceFolder(workspaceFolder.uri.path) : "";
            let list = vscode.workspace.getConfiguration("switchDiyWorkspace").get("list") as string[];

            if (maybeWorkspaceFolder) {
                if (list.includes(maybeWorkspaceFolder)) {
                    list = list.filter(v => v!== maybeWorkspaceFolder);
                    vscode.workspace.getConfiguration("switchDiyWorkspace").update("list", list, true);
                    vscode.window.showInformationMessage('当前项目空间删除成功');
                } else {
                    vscode.window.showErrorMessage('列表中不包含当前项目');
                }
            } else {
                vscode.window.showErrorMessage('请选择一个保存到磁盘的文件');
            }

        } else {
            vscode.window.showErrorMessage('请选择一个文件');
        }
    });

    // 切换工作空间
    const switchDiyWorkspace = vscode.commands.registerCommand('extension.switchDiyWorkspace', async function () {
        // if (process.platform === "darwin") {
        //     const folderPath = vscode.workspace.rootPath;
        //     folderPath;
        // }
        const enable = vscode.workspace.getConfiguration("switchDiyWorkspace").get("enable");
        const list = vscode.workspace.getConfiguration("switchDiyWorkspace").get("list") as string[];
        const configWorkspace = vscode.workspace.getConfiguration("switchDiyWorkspace");

        if (enable) {
            if (list.length > 0) {
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
                vscode.window.showWarningMessage('开启的情况下请添加一些项目到list中');
                await vscode.commands.executeCommand("workbench.action.switchWindow");
            }
        } else {
            await vscode.commands.executeCommand("workbench.action.switchWindow");
        }
    });

    context.subscriptions.push(enableSwitchDiyWorkspace);
    context.subscriptions.push(disableSwitchDiyWorkspace);
    context.subscriptions.push(emptySwitchDiyWorkspace);
    context.subscriptions.push(showSwitchDiyWorkspace);
    context.subscriptions.push(addSwitchDiyWorkspace);
    context.subscriptions.push(removeSwitchDiyWorkspace);
    context.subscriptions.push(switchDiyWorkspace);
}
