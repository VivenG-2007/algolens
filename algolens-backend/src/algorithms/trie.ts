import { ExecutionStep } from '../execution/types.js';

export interface TrieSerializedNode {
  id: string;
  char: string;
  isEndOfWord: boolean;
  children: TrieSerializedNode[];
}

class TrieNode {
  char: string;
  isEndOfWord: boolean;
  children: Map<string, TrieNode>;

  constructor(char = '') {
    this.char = char;
    this.isEndOfWord = false;
    this.children = new Map();
  }
}

function serializeTrie(node: TrieNode, id = 'root'): TrieSerializedNode {
  const childrenArr: TrieSerializedNode[] = [];
  // Sort keys alphabetically
  const sortedKeys = Array.from(node.children.keys()).sort();
  for (const k of sortedKeys) {
    const child = node.children.get(k)!;
    childrenArr.push(serializeTrie(child, `${id}_${k}`));
  }

  return {
    id,
    char: node.char || 'ROOT',
    isEndOfWord: node.isEndOfWord,
    children: childrenArr,
  };
}

export function executeTrieOperations(
  wordsToInsert: string[] = ['cat', 'car', 'cart', 'dog'],
  queries: { type: 'search' | 'startsWith' | 'delete'; word: string }[] = [
    { type: 'search', word: 'car' },
    { type: 'delete', word: 'cat' },
  ]
): ExecutionStep[] {
  const steps: ExecutionStep[] = [];
  let stepId = 1;
  const root = new TrieNode();
  let comparisonsCount = 0;

  steps.push({
    id: stepId++,
    title: 'Initialize Trie (Prefix Tree)',
    description: 'Created empty root node. Tries organize strings as character paths sharing common prefixes.',
    algorithmLine: 1,
    codeLine: 1,
    dataStructure: 'TRIE',
    variables: { totalWords: wordsToInsert.length },
    dataStructureState: {
      type: 'trie',
      root: serializeTrie(root),
      activeNodeId: 'root',
    },
    operation: 'INIT_TRIE',
    complexity: { time: 'O(L) per word', space: 'O(ALPHABET * L * N)' },
    operationStats: { comparisons: 0, treeHeight: 1 },
  });

  // 1. Insert Operation
  function insertWord(word: string) {
    let curr = root;
    let currId = 'root';

    steps.push({
      id: stepId++,
      title: `Begin Insert Word: "${word}"`,
      description: `Inserting '${word}' character by character from root.`,
      algorithmLine: 3,
      codeLine: 4,
      dataStructure: 'TRIE',
      variables: { word, length: word.length },
      dataStructureState: {
        type: 'trie',
        root: serializeTrie(root),
        activeNodeId: 'root',
      },
      operation: 'TRIE_INSERT_START',
    });

    for (let i = 0; i < word.length; i++) {
      const ch = word[i];
      comparisonsCount++;
      currId = `${currId}_${ch}`;
      const exists = curr.children.has(ch);

      if (!exists) {
        curr.children.set(ch, new TrieNode(ch));
      }

      curr = curr.children.get(ch)!;

      steps.push({
        id: stepId++,
        title: `Character '${ch}' (${i + 1}/${word.length}): ${exists ? 'Traverse Existing Edge' : 'Create New Node'}`,
        description: `Path so far: "${word.slice(0, i + 1)}". Node '${ch}' is ${exists ? 'shared with prefix' : 'newly added'}.`,
        algorithmLine: 6,
        codeLine: 8,
        dataStructure: 'TRIE',
        variables: { char: ch, charIndex: i, isNew: !exists, currentPrefix: word.slice(0, i + 1) },
        dataStructureState: {
          type: 'trie',
          root: serializeTrie(root),
          activeNodeId: currId,
          activeChar: ch,
        },
        operation: exists ? 'TRIE_TRAVERSE' : 'TRIE_CREATE_NODE',
        operationStats: { comparisons: comparisonsCount },
      });
    }

    curr.isEndOfWord = true;

    steps.push({
      id: stepId++,
      title: `Word "${word}" Marked as Complete (isEndOfWord = true)`,
      description: `Terminal node '${word[word.length - 1]}' flagged as valid word completion.`,
      algorithmLine: 9,
      codeLine: 12,
      dataStructure: 'TRIE',
      variables: { completedWord: word, isEndOfWord: true },
      dataStructureState: {
        type: 'trie',
        root: serializeTrie(root),
        activeNodeId: currId,
      },
      operation: 'TRIE_MARK_END',
      operationStats: { comparisons: comparisonsCount },
    });
  }

  // 2. Search / Prefix Search Operation
  function searchWord(word: string, isPrefixOnly = false) {
    let curr = root;
    let currId = 'root';
    const opLabel = isPrefixOnly ? 'Prefix Search (startsWith)' : 'Exact Word Search';

    steps.push({
      id: stepId++,
      title: `Begin ${opLabel}: "${word}"`,
      description: `Navigating Trie branches matching query "${word}".`,
      algorithmLine: 12,
      codeLine: 16,
      dataStructure: 'TRIE',
      variables: { query: word, isPrefixOnly },
      dataStructureState: {
        type: 'trie',
        root: serializeTrie(root),
        activeNodeId: 'root',
      },
      operation: 'TRIE_SEARCH_START',
    });

    for (let i = 0; i < word.length; i++) {
      const ch = word[i];
      comparisonsCount++;

      if (!curr.children.has(ch)) {
        steps.push({
          id: stepId++,
          title: `Character '${ch}' Not Found in Trie`,
          description: `No outgoing edge for '${ch}' from current prefix. Search fails in O(${i + 1}) steps.`,
          algorithmLine: 15,
          codeLine: 20,
          dataStructure: 'TRIE',
          variables: { missingChar: ch, failedIndex: i, result: 'NOT_FOUND' },
          dataStructureState: {
            type: 'trie',
            root: serializeTrie(root),
            activeNodeId: currId,
          },
          operation: 'TRIE_SEARCH_MISS',
          operationStats: { comparisons: comparisonsCount },
        });
        return false;
      }

      currId = `${currId}_${ch}`;
      curr = curr.children.get(ch)!;

      steps.push({
        id: stepId++,
        title: `Matched Character '${ch}'`,
        description: `Followed branch '${ch}'. Matched prefix: "${word.slice(0, i + 1)}".`,
        algorithmLine: 18,
        codeLine: 23,
        dataStructure: 'TRIE',
        variables: { char: ch, matchedPrefix: word.slice(0, i + 1) },
        dataStructureState: {
          type: 'trie',
          root: serializeTrie(root),
          activeNodeId: currId,
        },
        operation: 'TRIE_SEARCH_MATCH_CHAR',
        operationStats: { comparisons: comparisonsCount },
      });
    }

    const found = isPrefixOnly ? true : curr.isEndOfWord;

    steps.push({
      id: stepId++,
      title: `${opLabel} Result for "${word}": ${found ? 'FOUND ✓' : 'NOT FOUND (Prefix only, not complete word)'}`,
      description: isPrefixOnly
        ? `Trie contains prefix "${word}".`
        : `Terminal node has isEndOfWord = ${curr.isEndOfWord}.`,
      algorithmLine: 21,
      codeLine: 27,
      dataStructure: 'TRIE',
      variables: { query: word, found, isEndOfWord: curr.isEndOfWord },
      dataStructureState: {
        type: 'trie',
        root: serializeTrie(root),
        activeNodeId: currId,
      },
      operation: found ? 'TRIE_FOUND' : 'TRIE_NOT_FOUND',
      operationStats: { comparisons: comparisonsCount },
    });

    return found;
  }

  // 3. Delete Operation
  function deleteWord(word: string) {
    steps.push({
      id: stepId++,
      title: `Delete Word: "${word}"`,
      description: `Locating word "${word}" to unmark end-of-word and prune redundant nodes.`,
      algorithmLine: 25,
      codeLine: 31,
      dataStructure: 'TRIE',
      variables: { wordToDelete: word },
      dataStructureState: {
        type: 'trie',
        root: serializeTrie(root),
        activeNodeId: 'root',
      },
      operation: 'TRIE_DELETE_START',
    });

    function deleteHelper(node: TrieNode, depth: number, currId: string): boolean {
      if (depth === word.length) {
        if (!node.isEndOfWord) return false;
        node.isEndOfWord = false;

        steps.push({
          id: stepId++,
          title: `Unmarked isEndOfWord for "${word}"`,
          description: `Removed word termination status from node '${node.char}'.`,
          algorithmLine: 28,
          codeLine: 35,
          dataStructure: 'TRIE',
          variables: { unmarkWord: word, hasRemainingChildren: node.children.size > 0 },
          dataStructureState: {
            type: 'trie',
            root: serializeTrie(root),
            activeNodeId: currId,
          },
          operation: 'TRIE_UNMARK',
        });

        // If no children, can delete this node
        return node.children.size === 0;
      }

      const ch = word[depth];
      const child = node.children.get(ch);
      if (!child) return false;

      const shouldDeleteChild = deleteHelper(child, depth + 1, `${currId}_${ch}`);

      if (shouldDeleteChild) {
        node.children.delete(ch);
        steps.push({
          id: stepId++,
          title: `Pruned Unused Node '${ch}'`,
          description: `Node '${ch}' has no remaining branches and is not the end of any other word. Cleaned from memory.`,
          algorithmLine: 31,
          codeLine: 40,
          dataStructure: 'TRIE',
          variables: { prunedChar: ch, parentId: currId },
          dataStructureState: {
            type: 'trie',
            root: serializeTrie(root),
            activeNodeId: currId,
          },
          operation: 'TRIE_PRUNE_NODE',
        });
        return node.children.size === 0 && !node.isEndOfWord;
      }

      return false;
    }

    deleteHelper(root, 0, 'root');
  }

  // Execute sequence
  for (const w of wordsToInsert) {
    insertWord(w);
  }

  for (const q of queries) {
    if (q.type === 'search') {
      searchWord(q.word, false);
    } else if (q.type === 'startsWith') {
      searchWord(q.word, true);
    } else if (q.type === 'delete') {
      deleteWord(q.word);
    }
  }

  steps.push({
    id: stepId++,
    title: 'Trie Operations Complete',
    description: 'All string operations (insert, search, delete) finalized in linear prefix time.',
    algorithmLine: 34,
    codeLine: 45,
    dataStructure: 'TRIE',
    variables: { finalTrie: 'valid' },
    dataStructureState: {
      type: 'trie',
      root: serializeTrie(root),
      activeNodeId: 'root',
    },
    operation: 'COMPLETE',
    complexity: { time: 'O(L)', space: 'O(ALPHABET * L)' },
    operationStats: { comparisons: comparisonsCount },
  });

  return steps;
}
