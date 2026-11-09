import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { parseTemplate, TmplAstText, TmplAstBoundText, TmplAstElement } from '@angular/compiler';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const languages = ['pt-br', 'en', 'es'];
const ignoredKeys = new Set(['src', 'image', 'imageAlt', 'alt', 'imageThumb', 'imagem', 'thumbnail', 'path', 'route', 'iconClass', 'linkDownload', 'paginas', 'Link']);

/** Lê somente valores estáticos dos arquivos TypeScript, sem executar os componentes. */
function literal(node) {
  if (!node) return undefined;
  if (ts.isAsExpression(node)) return literal(node.expression);
  if (ts.isStringLiteralLike(node)) return node.text;
  if (ts.isNumericLiteral(node)) return Number(node.text);
  if (ts.isArrayLiteralExpression(node)) return node.elements.map(literal);
  if (ts.isObjectLiteralExpression(node)) {
    return Object.fromEntries(node.properties.filter(ts.isPropertyAssignment).map(property => [property.name.getText().replace(/^['"]|['"]$/g, ''), literal(property.initializer)]));
  }
  return undefined;
}

/** Localiza um campo do objeto de configuração lido pelo compilador. */
function property(node, name) {
  return node?.properties?.find(item => ts.isPropertyAssignment(item) && item.name.getText().replace(/^['"]|['"]$/g, '') === name)?.initializer;
}

/** Reúne textos do conteúdo sem incluir caminhos de imagens e outros metadados. */
function strings(value) {
  if (typeof value === 'string') return /^(?:data:image\/|[^\s]+\.(?:png|jpe?g|gif|svg|webp|avif|ico|bmp)(?:[?#].*)?$)/iu.test(value) ? [] : [value];
  if (Array.isArray(value)) return value.flatMap(strings);
  if (value && typeof value === 'object') return Object.entries(value).filter(([key]) => !ignoredKeys.has(key)).flatMap(([, item]) => strings(item));
  return [];
}

/** Junta as quebras de linha e os espaços repetidos em um texto pesquisável. */
function cleanText(text) {
  return text.replace(/\s+/gu, ' ').trim();
}

/** Consulta uma chave de tradução separada por pontos. */
function translate(dictionary, key) {
  return key.split('.').reduce((value, part) => value?.[part], dictionary);
}

/** Resolve as traduções usadas nas interpolações do template. */
function translatedExpression(source, dictionary) {
  return [...source.matchAll(/\bt\(\s*['"]([^'"]+)['"]\s*\)(?:\[(\d+)\])?/gu)].flatMap(match => {
    const value = translate(dictionary, match[1]);
    return strings(match[2] === undefined ? value : value?.[Number(match[2])]);
  }).join(' ');
}

/** Extrai texto visível e traduções dos templates, ignorando código, ícones e imagens. */
export function extractTemplateText(template, dictionary = {}, filename = 'template.html') {
  const parsed = parseTemplate(template, filename);
  if (parsed.errors?.length) throw new Error(`Template inválido no índice: ${filename}`);
  const fragments = [];
  const visit = node => {
    if (node instanceof TmplAstText) fragments.push(node.value);
    if (node instanceof TmplAstBoundText) fragments.push(translatedExpression(node.value.source, dictionary));
    if (node instanceof TmplAstElement) {
      if (['script', 'style', 'mat-icon', 'svg', 'canvas', 'img', 'picture', 'source'].includes(node.name)) return;
      for (const attribute of node.attributes) {
        if (['title', 'placeholder'].includes(attribute.name)) fragments.push(attribute.value);
      }
    }
    for (const key of ['children', 'branches', 'cases']) node[key]?.forEach(visit);
    for (const key of ['empty', 'placeholder', 'loading', 'error']) if (node[key]) visit(node[key]);
  };
  parsed.nodes.forEach(visit);
  return cleanText(fragments.join(' '));
}

/** Descobre páginas públicas nas rotas reais e exclui caminhos protegidos ou dinâmicos. */
export async function collectPublicRoutes() {
  const filename = path.join(root, 'src/app/app.routes.ts');
  const source = ts.createSourceFile(filename, await readFile(filename, 'utf8'), ts.ScriptTarget.Latest, true);
  const variables = new Map();
  for (const statement of source.statements) {
    if (ts.isVariableStatement(statement)) for (const declaration of statement.declarationList.declarations) variables.set(declaration.name.getText(), declaration.initializer);
  }
  const result = [];
  const visit = (node, prefix = '', inheritedTitle) => {
    if (ts.isIdentifier(node)) node = variables.get(node.text);
    if (!node || !ts.isArrayLiteralExpression(node)) return;
    for (const route of node.elements) {
      if (!ts.isObjectLiteralExpression(route) || property(route, 'canActivate') || property(route, 'redirectTo')) continue;
      const segment = literal(property(route, 'path')) ?? '';
      if (segment === '**' || (segment.includes(':') && segment !== ':lang')) continue;
      const routePath = [prefix, segment === ':lang' ? '' : segment].filter(Boolean).join('/');
      if (['login', 'search'].includes(routePath)) continue;
      // Rotas filhas com caminho vazio usam o título definido na página pai.
      const titleKey = literal(property(property(route, 'data'), 'breadCrumb')) ?? literal(property(route, 'title')) ?? inheritedTitle;
      const loader = property(route, 'loadComponent');
      let component;
      const findImport = child => {
        if (ts.isCallExpression(child) && child.expression.kind === ts.SyntaxKind.ImportKeyword) component = literal(child.arguments[0]);
        ts.forEachChild(child, findImport);
      };
      if (loader) findImport(loader);
      if (component) result.push({ path: routePath, titleKey, componentFile: path.resolve(path.dirname(filename), `${component}.ts`) });
      const children = property(route, 'children');
      if (children) visit(children, routePath, titleKey);
    }
  };
  visit(variables.get('routes'));
  return result;
}

/** Lê listas públicas já utilizadas pelas páginas, evitando duplicar seus conteúdos. */
async function readData(filename, name) {
  const source = ts.createSourceFile(filename, await readFile(path.join(root, filename), 'utf8'), ts.ScriptTarget.Latest, true);
  let result;
  const visit = node => {
    if ((ts.isVariableDeclaration(node) || ts.isPropertyDeclaration(node)) && node.name?.getText() === name) result = literal(node.initializer);
    ts.forEachChild(node, visit);
  };
  visit(source);
  return result;
}

/** Inclui as listas estáticas e os textos traduzidos carregados pelo componente. */
function componentText(sourceText, dictionary) {
  const source = ts.createSourceFile('component.ts', sourceText, ts.ScriptTarget.Latest, true);
  const fragments = [];
  const visit = node => {
    if (ts.isPropertyDeclaration(node) && node.initializer && ts.isArrayLiteralExpression(node.initializer)) fragments.push(...strings(literal(node.initializer)).filter(text => !/^(public\/|https?:\/\/|\.\/)/u.test(text)));
    if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression) && ['translateObject', 'translate'].includes(node.expression.name.text)) fragments.push(...strings(translate(dictionary, literal(node.arguments[0]) ?? '')));
    ts.forEachChild(node, visit);
  };
  visit(source);
  return fragments.join(' ');
}

/** Gera os documentos a partir dos textos reais de cada idioma e dos arquivos públicos. */
export async function buildSearchCatalog(language) {
  if (!languages.includes(language)) throw new Error(`Idioma inválido: ${language}`);
  const dictionary = JSON.parse(await readFile(path.join(root, `src/public/i18n/${language}.json`), 'utf8'));
  for (const scope of ['home', 'institutional']) dictionary[scope] = JSON.parse(await readFile(path.join(root, `src/public/i18n/${scope}/${language}.json`), 'utf8'));
  // A mesma lista define as opções da interface e quais seções entram no índice.
  const modules = await readData('src/app/shared/models/search-result.model.ts', 'SEARCH_MODULE_LABELS');
  const routes = (await collectPublicRoutes()).filter(route => Object.hasOwn(modules, route.path.split('/')[0] || 'home'));
  const games = await readData('src/app/pages/games/games.component.ts', 'games');
  const documents = [];
  for (const route of routes) {
    const source = await readFile(route.componentFile, 'utf8');
    const templateName = source.match(/templateUrl:\s*['"]([^'"]+)['"]/u)?.[1];
    if (!templateName) continue;
    const templatePath = path.resolve(path.dirname(route.componentFile), templateName);
    const template = await readFile(templatePath, 'utf8');
    const game = route.path.startsWith('games/') ? games.find(item => item.route === `./${route.path.split('/')[1]}`) : undefined;
    const extra = route.path === 'games/museudle' ? strings(JSON.parse(await readFile(path.join(root, 'src/assets/games/museudle/itens.json'), 'utf8'))).join(' ')
      : route.path === 'games/computing-dungeons' ? strings(await readData('src/assets/games/computing-dungeons/questions.js', 'questions')).join(' ') : '';
    const content = cleanText([extractTemplateText(template, dictionary, templatePath), componentText(source, dictionary), game?.description ?? '', extra].join(' '));
    const title = translate(dictionary, `breadcrumb.${route.titleKey ?? (game ? `games.${route.path.split('/')[1]}` : 'home')}`) ?? game?.title ?? route.path;
    documents.push({
      id: route.path || 'home', title, description: game?.description ?? content.slice(0, 220), content,
      // A página de listagem e seus detalhes pertencem ao mesmo módulo do portal.
      module: route.path.split('/')[0] || 'home', path: route.path,
    });
  }

  // Cada edição é encontrada pelo título, sem extrair ou pesquisar o texto do PDF.
  for (const magazine of await readData('src/app/pages/magazine/magazine.mock.ts', 'magazines')) {
    documents.push({
      id: magazine.linkDownload, title: magazine.titulo, description: '',
      module: 'magazine', path: 'magazine', assetUrl: magazine.linkDownload,
      publishedAt: Date.UTC(magazine.ano, 0, 1), datePrecision: 'year',
    });
  }
  return { language, documents };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const directory = path.join(root, 'src/public/search');
  await mkdir(directory, { recursive: true });
  for (const language of languages) {
    const catalog = await buildSearchCatalog(language);
    const target = path.join(directory, `${language}.json`);
    const output = `${JSON.stringify(catalog)}\n`;
    let previous;
    try { previous = await readFile(target, 'utf8'); } catch (error) { if (error.code !== 'ENOENT') throw error; }
    if (previous !== output) await writeFile(target, output);
    console.log(`${language}: ${catalog.documents.length} conteúdos públicos indexados.`);
  }
}
