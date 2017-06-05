/*!--------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
define("vs/workbench/node/extensionHostProcess.nls.zh-cn",{"vs/base/common/json":["符号无效","数字格式无效","需要属性名","需要值","需要冒号","需要逗号","需要右大括号","需要右括号","预期的文件结尾"],"vs/base/common/severity":["错误","警告","信息"],"vs/platform/configuration/common/configurationRegistry":["默认配置替代","针对 {0} 语言，配置替代编辑器设置。","针对某种语言，配置替代编辑器设置。","用于配置字符串。","设置摘要。此标签将在设置文件中用作分隔注释。","配置属性的描述。",'无法注册“{0}”。这符合属性模式 "\\[.*\\]$"，可用于描述特定语言编辑器设置。请使用 "configurationDefaults"。',"无法注册“{0}”。此属性已注册。","configuration.properties 必须是对象",'如果进行设置，"configuration.type" 必须设置为对象',"configuration.title 必须是字符串","按语言提供默认编辑器配置设置。"],"vs/platform/extensions/common/abstractExtensionService":["无法激活扩展”{1}“。原因: 未知依赖关系“{0}”。","无法激活扩展”{1}“。原因: 无法激活依赖关系”{0}“。","无法激活扩展”{0}“。原因: 依赖关系多于 10 级(最可能是依赖关系循环)。","激活扩展“{0}”失败: {1}。"],"vs/platform/extensions/common/extensionsRegistry":["对于 VS Code 扩展程序，指定该扩展程序与之兼容的 VS Code 版本。不能为 *. 例如: ^0.10.5 表示最低兼容 VS Code 版本 0.10.5。","VS Code 扩展的发布服务器。","VS Code 库中使用的扩展的显示名称。","VS Code 库用于对扩展进行分类的类别。","VS Code 商城使用的横幅。","VS Code 商城页标题上的横幅颜色。","横幅中使用的字体颜色主题。","由此包表示的 VS Code 扩展的所有贡献。","在 Marketplace 中设置扩展，将其标记为“预览”。","VS Code 扩展的激活事件。","在 Marketplace 的扩展页边栏中显示的徽章数组。","徽章图像 URL。","徽章链接。","徽章说明。","其他扩展的依赖关系。扩展的标识符始终是 ${publisher}.${name}。例如: vscode.csharp。","包作为 VS Code 扩展发布前执行的脚本。","128 x 128 像素图标的路径。"],"vs/platform/markers/common/problemMatcher":["循环属性仅在最一个行匹配程序上受支持。","问题模式缺少正则表达式。","问题模式无效。它必须至少包含一个文件、消息和行或位置匹配组。","错误: 字符串 {0} 不是有效的正则表达式。\n","用于在输出中查找错误、警告或信息的正则表达式。","文件名的匹配组索引。如果省略，则使用 1。","问题位置的匹配组索引。有效的位置模式为(line)、(line,column)和(startLine,startColumn,endLine,endColumn)。如果省略了，将假定(line,column)。","问题行的匹配组索引。默认值为 2","问题行字符的匹配组索引。默认值为 3","问题结束行的匹配组索引。默认为未定义","问题结束行字符的匹配组索引。默认为未定义","问题严重性的匹配组索引。默认为未定义","问题代码的匹配组索引。默认为未定义","消息的匹配组索引。如果省略，则在指定了位置时默认值为 4，在其他情况下默认值为 5。","在多行中，匹配程序循环指示是否只要匹配就在循环中执行此模式。只能在多行模式的最后一个模式上指定。","问题模式的名称。","问题多行问题模式的名称。","实际模式。","提供问题模式","无效问题模式。此模式将被忽略。","无效问题模式。此模式将被忽略。","错误: 描述无法转换为问题匹配程序:\n{0}\n","错误: 描述未定义有效的问题模式:\n{0}\n","错误: 描述未定义所有者:\n{0}\n","错误: 描述未定义文件位置:\n{0}\n","信息: 未知的严重性 {0}。有效值为错误、警告和信息。\n","错误: 含标识符 {0} 的模式不存在。","错误: 模式属性引用空标识符。","错误: 模式属性 {0} 是无效的模式变量名。","问题匹配程序必须定义监视的开始模式和结束模式。","错误: 字符串 {0} 不是有效的正则表达式。\n","用于检测监视任务的开始和结束的正则表达式。","文件名的匹配组索引。可以省略。","所提供或预定义模式的名称","问题模式或者所提供或预定义问题模式的名称。如果已指定基准，则可以省略。","要使用的基问题匹配程序的名称。","代码内问题的所有者。如果指定了基准，则可省略。如果省略，并且未指定基准，则默认值为“外部”。","捕获问题的默认严重性。如果模式未定义严重性的匹配组，则使用。","控制文本文档上报告的问题是否仅应用于打开、关闭或所有文档。","定义应如何解释问题模式中报告的文件名。","如果设置为 true，则当任务开始时观察程序处于活动模式。这相当于发出与 beginPattern 匹配的行。","如果在输出内匹配，则在监视任务开始时会发出信号。","如果在输出内匹配，则在监视任务结束时会发出信号。","用于跟踪观看模式开始和结束的模式。","此属性已弃用。请改用观看属性。","一个正则表达式，发出受监视任务开始执行(通过文件监视触发)的信号。","此属性已弃用。请改用观看属性。","一个正则表达式，发出受监视任务结束执行的信号。","问题匹配程序的名称。","提供问题匹配程序"],"vs/workbench/api/node/extHostDiagnostics":["未显示 {0} 个进一步的错误和警告。"],"vs/workbench/api/node/extHostTreeExplorers":["没有注册 ID 为“{0}”的 TreeExplorerNodeProvider。","TreeExplorerNodeProvider“{0}”无法提供根节点。","没有注册 ID 为“{0}”的 TreeExplorerNodeProvider。","TreeExplorerNodeProvider“{0}”无法解析 Children。"],"vs/workbench/node/extensionHostMain":["路径 {0} 未指向有效的扩展测试运行程序。"]});
//# sourceMappingURL=https://ticino.blob.core.windows.net/sourcemaps/6eaebe3b9c70406d67c97779468c324a7a95db0e/core/vs/workbench/node/extensionHostProcess.nls.zh-cn.js.map
