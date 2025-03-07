import { App, Provide } from '@midwayjs/decorator';
import { BaseService } from '@cool-midway/core';
import * as ts from 'typescript';
import { IMidwayApplication } from '@midwayjs/core';
import * as path from 'path';
import * as fs from 'fs';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { PluginInfoEntity } from '../entity/info';
import * as prettier from 'prettier';

/**
 * 插件类型服务
 */
@Provide()
export class PluginTypesService extends BaseService {
  @App()
  app: IMidwayApplication;

  @InjectEntityModel(PluginInfoEntity)
  pluginInfoEntity: Repository<PluginInfoEntity>;

  /**
   * 生成d.ts文件
   * @param tsContent
   * @returns
   */
  async dtsContent(tsContent: string) {
    let output = '';

    const compilerHost: ts.CompilerHost = {
      fileExists: ts.sys.fileExists,
      getCanonicalFileName: ts.sys.useCaseSensitiveFileNames
        ? s => s
        : s => s.toLowerCase(),
      getCurrentDirectory: ts.sys.getCurrentDirectory,
      getDefaultLibFileName: options => ts.getDefaultLibFilePath(options),
      getDirectories: ts.sys.getDirectories,
      getNewLine: () => ts.sys.newLine,
      getSourceFile: (fileName, languageVersion) => {
        if (fileName === 'file.ts') {
          return ts.createSourceFile(
            fileName,
            tsContent,
            languageVersion,
            true
          );
        }
        const filePath = ts.sys.resolvePath(fileName);
        return ts.sys.readFile(filePath)
          ? ts.createSourceFile(
              filePath,
              ts.sys.readFile(filePath)!,
              languageVersion,
              true
            )
          : undefined;
      },
      readFile: ts.sys.readFile,
      useCaseSensitiveFileNames: () => ts.sys.useCaseSensitiveFileNames,
      writeFile: (fileName, content) => {
        if (fileName.includes('file.d.ts')) {
          output = content || output;
        }
      },
    };

    const options: ts.CompilerOptions = {
      declaration: true,
      emitDeclarationOnly: true,
      outDir: './',
      skipLibCheck: true,
      skipDefaultLibCheck: true,
      noEmitOnError: false,
      target: ts.ScriptTarget.ES2018,
      strict: false,
      module: ts.ModuleKind.Node16,
      moduleResolution: ts.ModuleResolutionKind.Node16,
      types: ['node'],
    };

    const program = ts.createProgram(['file.ts'], options, compilerHost);
    program.emit();

    if (!output) {
      // Provide a default value if the output is still empty
      output = '/* No declaration content generated */';
    }
    return output;
  }

  /**
   * 生成d.ts文件
   * @param key
   * @param tsContent
   * @returns
   */
  async generateDtsFile(key: string, tsContent: string) {
    const env = this.app.getEnv();
    // 不是本地开发环境不生成d.ts文件
    if (env != 'local' || !tsContent) {
      return;
    }
    // 基础路径
    const basePath = path.join(this.app.getBaseDir(), '..', 'typings');
    // pluginDts文件路径
    const pluginDtsPath = path.join(basePath, 'plugin.d.ts');
    // plugin文件夹路径
    const pluginPath = path.join(basePath, `${key}.d.ts`);
    // 生成d.ts文件
    const dtsContent = await this.dtsContent(tsContent);

    // 读取plugin.d.ts文件内容
    let pluginDtsContent = fs.readFileSync(pluginDtsPath, 'utf-8');

    // 根据key判断是否在PluginMap中存在
    const keyWithHyphen = key.includes('-');
    const importStatement = keyWithHyphen
      ? `import * as ${key.replace(/-/g, '_')} from './${key}';`
      : `import * as ${key} from './${key}';`;
    const pluginMapEntry = keyWithHyphen
      ? `'${key}': ${key.replace(/-/g, '_')}.CoolPlugin;`
      : `${key}: ${key}.CoolPlugin;`;

    // 检查import语句是否已经存在，若不存在则添加
    if (!pluginDtsContent.includes(importStatement)) {
      pluginDtsContent = `${importStatement}\n${pluginDtsContent}`;
    }

    // 检查PluginMap中的键是否存在，若不存在则添加
    if (pluginDtsContent.includes(pluginMapEntry)) {
      // 键存在则覆盖
      const regex = new RegExp(
        `(\\s*${keyWithHyphen ? `'${key}'` : key}:\\s*[^;]+;)`
      );
      pluginDtsContent = pluginDtsContent.replace(regex, pluginMapEntry);
    } else {
      // 键不存在则追加
      const pluginMapRegex = /interface\s+PluginMap\s*{([^}]*)}/;
      pluginDtsContent = pluginDtsContent.replace(
        pluginMapRegex,
        (match, p1) => {
          return match.replace(p1, `${p1.trim()}\n  ${pluginMapEntry}`);
        }
      );
    }

    // 格式化内容
    pluginDtsContent = await this.formatContent(pluginDtsContent);

    // 延迟2秒写入文件
    setTimeout(async () => {
      // 写入d.ts文件，如果存在则覆盖
      fs.writeFile(pluginPath, await this.formatContent(dtsContent), () => {});

      // 写入plugin.d.ts文件
      fs.writeFile(pluginDtsPath, pluginDtsContent, () => {});
    }, 2000);
  }

  /**
   * 删除d.ts文件中的指定key
   * @param key
   */
  async deleteDtsFile(key: string) {
    const env = this.app.getEnv();
    // 不是本地开发环境不删除d.ts文件
    if (env != 'local') {
      return;
    }
    // 基础路径
    const basePath = path.join(this.app.getBaseDir(), '..', 'typings');
    // pluginDts文件路径
    const pluginDtsPath = path.join(basePath, 'plugin.d.ts');
    // plugin文件夹路径
    const pluginPath = path.join(basePath, `${key}.d.ts`);

    // 读取plugin.d.ts文件内容
    let pluginDtsContent = fs.readFileSync(pluginDtsPath, 'utf-8');

    // 根据key判断是否在PluginMap中存在
    const keyWithHyphen = key.includes('-');
    const importStatement = keyWithHyphen
      ? `import \\* as ${key.replace(/-/g, '_')} from '\\./${key}';`
      : `import \\* as ${key} from '\\./${key}';`;
    const pluginMapEntry = keyWithHyphen
      ? `'${key}': ${key.replace(/-/g, '_')}.CoolPlugin;`
      : `${key}: ${key}.CoolPlugin;`;

    // 删除import语句
    const importRegex = new RegExp(`${importStatement}\\n`, 'g');
    pluginDtsContent = pluginDtsContent.replace(importRegex, '');

    // 删除PluginMap中的键
    const pluginMapRegex = new RegExp(`\\s*${pluginMapEntry}`, 'g');
    pluginDtsContent = pluginDtsContent.replace(pluginMapRegex, '');

    // 格式化内容
    pluginDtsContent = await this.formatContent(pluginDtsContent);

    // 延迟2秒写入文件
    setTimeout(async () => {
      // 删除插件d.ts文件
      if (fs.existsSync(pluginPath)) {
        fs.unlink(pluginPath, () => {});
      }
      // 写入plugin.d.ts文件
      fs.writeFile(pluginDtsPath, pluginDtsContent, () => {});
    }, 2000);
  }

  /**
   * 格式化内容
   * @param content
   */
  async formatContent(content: string) {
    // 使用prettier格式化内容
    return prettier.format(content, {
      parser: 'typescript',
      singleQuote: true,
      trailingComma: 'all',
      bracketSpacing: true,
      arrowParens: 'avoid',
      printWidth: 80,
    });
  }

  /**
   * 重新生成d.ts文件
   */
  async reGenerate() {
    const pluginInfos = await this.pluginInfoEntity
      .createQueryBuilder('a')
      .where('a.status = :status', { status: 1 })
      .select(['a.id', 'a.status', 'a.tsContent', 'a.keyName'])
      .getMany();
    for (const pluginInfo of pluginInfos) {
      const tsContent = pluginInfo.tsContent?.data;
      if (tsContent) {
        await this.generateDtsFile(pluginInfo.keyName, tsContent);
      }
    }
  }
}
