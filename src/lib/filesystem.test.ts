import { test } from "node:test";
import assert from "node:assert";
import { normalizePath, getNode, type FileSystemNode } from "./filesystem.ts";

test("normalizePath", async (t) => {
  await t.test("should handle standard absolute paths", () => {
    assert.strictEqual(normalizePath("/home/visitor"), "/home/visitor");
  });

  await t.test("should handle dot segments", () => {
    assert.strictEqual(normalizePath("/home/./visitor"), "/home/visitor");
  });

  await t.test("should handle double dot segments", () => {
    assert.strictEqual(normalizePath("/home/visitor/../other"), "/home/other");
  });

  await t.test("should handle multiple slashes", () => {
    assert.strictEqual(normalizePath("//home///visitor//"), "/home/visitor");
  });

  await t.test("should handle relative paths by prepending slash", () => {
    assert.strictEqual(normalizePath("home/visitor"), "/home/visitor");
  });

  await t.test("should handle root path", () => {
    assert.strictEqual(normalizePath("/"), "/");
    assert.strictEqual(normalizePath(""), "/");
  });
});

const mockRoot: FileSystemNode = {
  type: "dir",
  children: {
    home: {
      type: "dir",
      children: {
        visitor: {
          type: "dir",
          children: {
            "README.txt": {
              type: "file",
              content: "Hello",
            },
          },
        },
      },
    },
    projects: {
      type: "dir",
      children: {
        "p1.txt": {
          type: "file",
          content: "Project 1",
        },
      },
    },
  },
};

test("getNode", async (t) => {
  await t.test("should return root node for /", () => {
    const node = getNode(mockRoot, "/");
    assert.strictEqual(node, mockRoot);
  });

  await t.test("should return a nested directory", () => {
    const node = getNode(mockRoot, "/home/visitor");
    assert.ok(node);
    assert.strictEqual(node?.type, "dir");
    assert.ok(node?.children?.["README.txt"]);
  });

  await t.test("should return a nested file", () => {
    const node = getNode(mockRoot, "/home/visitor/README.txt");
    assert.ok(node);
    assert.strictEqual(node?.type, "file");
    assert.strictEqual(node?.content, "Hello");
  });

  await t.test("should handle paths with .. normalization", () => {
    const node = getNode(mockRoot, "/home/visitor/../visitor");
    assert.ok(node);
    assert.strictEqual(node?.type, "dir");
    assert.ok(node?.children?.["README.txt"]);
  });

  await t.test("should return null for non-existent paths", () => {
    const node = getNode(mockRoot, "/non/existent");
    assert.strictEqual(node, null);
  });

  await t.test("should return null when traversing into a file", () => {
    const node = getNode(mockRoot, "/home/visitor/README.txt/not-possible");
    assert.strictEqual(node, null);
  });
});
