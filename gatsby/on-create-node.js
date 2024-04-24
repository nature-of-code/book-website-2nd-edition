module.exports = async ({
  node,
  actions,
  loadNodeContent,
  createContentDigest,
  createNodeId,
}) => {
  const { createNodeField, createNode, createParentChildLink } = actions;

  if (node.internal.mediaType !== `text/html`) {
    return;
  }

  const { parseContent } = await import('./lib/parse-content.mjs');

  // load the html source to every HTML file node
  const content = await loadNodeContent(node);
  const { ast, toc, examples, description } = parseContent(content);

  createNodeField({
    node,
    name: 'htmlAst',
    value: JSON.stringify(ast),
  });

  createNodeField({
    node,
    name: 'toc',
    value: JSON.stringify(toc),
  });

  createNodeField({
    node,
    name: 'description',
    value: description,
  });

  for (let example of examples) {
    const exampleNode = {
      id: createNodeId(example.relativeDirectory),
      parent: node.id,
      internal: {
        type: 'Example',
        contentDigest: createContentDigest(example),
      },
      ...example,
    };

    createNode(exampleNode);
    createParentChildLink({ parent: node, child: exampleNode });
  }
};
