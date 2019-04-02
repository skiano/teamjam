const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;

module.exports = code => {
  const ast = parser.parse(code);

  // default signature
  let signature = `()`;

  traverse(ast, {
    MemberExpression: path => {
      // look for `<any>.solution = ...`
      if (path.node.property.name !== "solution") {
        return;
      }

      if (
        // exports.solution = ...
        path.node.object.name !== "exports" &&
        // module.exports.solution = ...
        path.node.object.property.name !== "exports"
      ) {
        return;
      }

      const async = path.parent.right.async;
      const params = path.parent.right.params
        .map(param => {
          // ({ obj, props })
          if (param.type === "ObjectPattern") {
            return (
              "{ " +
              param.properties.map(property => property.key.name).join(", ") +
              " }"
            );
          }
          // (arg, arg2)
          if (param.type === "Identifier") {
            return param.name;
          }
        })
        .join(", ");

      // return the signature
      signature = `${async ? "async " : ""}(${params})`;
    }
  });

  return signature;
};
