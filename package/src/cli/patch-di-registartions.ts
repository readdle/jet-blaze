import { parse } from "@babel/parser";
import traverse from "@babel/traverse";
import generate from "@babel/generator";
import template from "@babel/template";
import * as t from "@babel/types";

export type PatchServiceDIRegistrationsOptions = {
  readonly code: string;
  readonly targetServiceFilePath: string;
  readonly serviceNameCamelCase: string;
  readonly pascalCaseServiceName: string;
};

export type PatchControllerDIRegistrationsOptions = {
  readonly code: string;
  readonly targetComponentFilePath: string;
  readonly targetComponentKeyFilePath: string;
  readonly componentNameCamelCase: string;
  readonly pascalCaseComponentName: string;
};

export async function patchServiceDIRegistration(
  options: PatchServiceDIRegistrationsOptions,
) {
  const { targetServiceFilePath, serviceNameCamelCase, pascalCaseServiceName } =
    options;

  const imports = template(
    `import { create${pascalCaseServiceName}Service, type ${pascalCaseServiceName}Service } from "${targetServiceFilePath}";// ##ENDLINE##
// ##ENDLINE##
const ${serviceNameCamelCase}ServiceKey = key<${pascalCaseServiceName}Service>("${pascalCaseServiceName}Service");// ##ENDLINE##
// ##ENDLINE##
`,
    {
      preserveComments: true,
      plugins: ["typescript", "explicitResourceManagement"],
    },
  )();

  const registerController = template(
    `%%containerObjectName%%.register(${serviceNameCamelCase}ServiceKey, (_c) => create${pascalCaseServiceName}Service());// ##ENDLINE##`,
    {
      preserveComments: true,
      plugins: ["typescript", "explicitResourceManagement"],
    },
  );

  return updateDIModule(
    options.code,
    imports,
    (containerName) =>
      registerController({
        containerObjectName: containerName,
      }),
    true,
  );
}
export async function patchControllerDIRegistration(
  options: PatchControllerDIRegistrationsOptions,
) {
  const {
    targetComponentFilePath,
    targetComponentKeyFilePath,
    componentNameCamelCase,
    pascalCaseComponentName,
  } = options;

  const imports = template(
    `import { ${componentNameCamelCase}ControllerKey } from "${targetComponentKeyFilePath}";// ##ENDLINE##
import { create${pascalCaseComponentName}Controller } from "${targetComponentFilePath}";// ##ENDLINE##
// ##ENDLINE##
  `,
    {
      preserveComments: true,
      plugins: ["typescript", "explicitResourceManagement"],
    },
  )();

  const registerController = template(
    `
        %%containerObjectName%%.register(${componentNameCamelCase}ControllerKey, (_c) => create${pascalCaseComponentName}Controller());// ##ENDLINE##
    `,
    {
      preserveComments: true,
      plugins: ["typescript", "explicitResourceManagement"],
    },
  );

  return updateDIModule(options.code, imports, (containerName) =>
    registerController({
      containerObjectName: containerName,
    }),
  );
}

function updateDIModule(
  codeSrc: string,
  afterImports: t.Statement | t.Statement[],
  registrations: (containerName: string) => t.Statement | t.Statement[],
  shouldAddKeyImport = false,
): string {
  const ast = parse(codeSrc, {
    sourceType: "module",
    plugins: ["typescript", "explicitResourceManagement"],
  });

  traverse(ast, {
    ImportDeclaration({ node }) {
      if (
        shouldAddKeyImport &&
        node.source.value === "jet-blaze/di" &&
        node.specifiers.every((specifier) => specifier.local.name !== "key")
      ) {
        node.specifiers.push(
          t.importSpecifier(t.identifier("key"), t.identifier("key")),
        );
      }
    },
    Program({ node }) {
      const lastIndexOfImport = node.body.reduce((acc, item, index) => {
        if (t.isImportDeclaration(item)) {
          return index;
        }
        return acc;
      }, 0);
      node.body.splice(
        lastIndexOfImport + 1,
        0,
        ...(Array.isArray(afterImports) ? afterImports : [afterImports]),
      );
    },
    ExportNamedDeclaration({ node }) {
      if (
        t.isVariableDeclaration(node.declaration) &&
        node.declaration.declarations[0] !== undefined &&
        t.isVariableDeclarator(node.declaration.declarations[0]) &&
        t.isIdentifier(node.declaration.declarations[0].id) &&
        t.isTSTypeAnnotation(
          node.declaration.declarations[0].id.typeAnnotation,
        ) &&
        t.isTSTypeReference(
          node.declaration.declarations[0].id.typeAnnotation.typeAnnotation,
        ) &&
        t.isIdentifier(
          node.declaration.declarations[0].id.typeAnnotation.typeAnnotation
            .typeName,
        ) &&
        node.declaration.declarations[0].id.typeAnnotation.typeAnnotation
          .typeName.name === "Module"
      ) {
        if (
          t.isArrowFunctionExpression(node.declaration.declarations[0].init) &&
          node.declaration.declarations[0].init.params.length === 1 &&
          t.isIdentifier(node.declaration.declarations[0].init.params[0]) &&
          t.isBlockStatement(node.declaration.declarations[0].init.body)
        ) {
          const containerName =
            node.declaration.declarations[0].init.params[0].name;

          const register = registrations(containerName);

          node.declaration.declarations[0].init.body.body.push(
            ...(Array.isArray(register) ? register : [register]),
          );
        }
      }
    },
  });

  const code = generate(ast, {
    comments: true,
  }).code.trim();

  return code.replace(/\/\/ ##ENDLINE##/g, "");
}
