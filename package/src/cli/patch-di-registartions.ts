import { parse } from "@babel/parser";
import traverse from "@babel/traverse";
import generate from "@babel/generator";
import template from "@babel/template";
import * as t from "@babel/types";

export type PatchDIRegistrationsOptions = {
  readonly code: string;
  readonly targetComponentFilePath: string;
  readonly targetComponentKeyFilePath: string;
  readonly componentNameCamelCase: string;
  readonly pascalCaseComponentName: string;
};

export async function patchDIRegistration(
  options: PatchDIRegistrationsOptions,
) {
  const codeSrc = options.code;

  const {
    targetComponentFilePath,
    targetComponentKeyFilePath,
    componentNameCamelCase,
    pascalCaseComponentName,
  } = options;

  const imports = template(
    `
    import { ${componentNameCamelCase}ControllerKey } from "${targetComponentKeyFilePath}";// ##ENDLINE##
    import { create${pascalCaseComponentName}Controller } from "${targetComponentFilePath}";// ##ENDLINE##
    // ##ENDLINE##
  `,
    {
      preserveComments: true,
      plugins: ["typescript", "explicitResourceManagement"],
    },
  )();

  const ast = parse(codeSrc, {
    sourceType: "module",
    plugins: ["typescript", "explicitResourceManagement"],
  });

  const registerController = template(
    `
        %%containerObjectName%%.register(${componentNameCamelCase}ControllerKey, (_c) => create${pascalCaseComponentName}Controller());// ##ENDLINE##
    `,
    {
      preserveComments: true,
      plugins: ["typescript", "explicitResourceManagement"],
    },
  );

  traverse(ast, {
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
        ...(Array.isArray(imports) ? imports : [imports]),
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

          const register = registerController({
            containerObjectName: containerName,
          });

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
