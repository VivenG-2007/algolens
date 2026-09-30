import { AlgorithmMetadata, AlgorithmId } from '@/types';

export const STATIC_ALGORITHMS: Record<AlgorithmId, AlgorithmMetadata> = {
  'merge-sort': {
    id: 'merge-sort',
    name: 'Merge Sort',
    category: 'sorting',
    description: 'A classic divide-and-conquer sorting algorithm that divides the array into halves, recursively sorts them, and merges the sorted halves.',
    timeComplexity: {
      best: 'O(n log n)',
      average: 'O(n log n)',
      worst: 'O(n log n)',
    },
    spaceComplexity: 'O(n)',
    pseudocode: [
      'function mergeSort(arr, low, high):',
      '    if low >= high: return',
      '    mid = floor((low + high) / 2)',
      '    mergeSort(arr, low, mid)',
      '    mergeSort(arr, mid + 1, high)',
      '    merge(arr, low, mid, high)',
      'function merge(arr, low, mid, high):',
      '    create left and right subarrays',
      '    i = 0, j = 0, k = low',
      '    while i < left.len and j < right.len:',
      '        if left[i] <= right[j]: arr[k++] = left[i++]',
      '        else: arr[k++] = right[j++]',
      '    copy remaining elements from left and right',
    ],
    sourceCode: {
      c: `void merge(int arr[], int low, int mid, int high) {
    int n1 = mid - low + 1, n2 = high - mid;
    int left[n1], right[n2];
    for (int i = 0; i < n1; i++) left[i] = arr[low + i];
    for (int j = 0; j < n2; j++) right[j] = arr[mid + 1 + j];
    int i = 0, j = 0, k = low;
    while (i < n1 && j < n2) {
        if (left[i] <= right[j]) arr[k++] = left[i++];
        else arr[k++] = right[j++];
    }
    while (i < n1) arr[k++] = left[i++];
    while (j < n2) arr[k++] = right[j++];
}

void mergeSort(int arr[], int low, int high) {
    if (low >= high) return;
    int mid = low + (high - low) / 2;
    mergeSort(arr, low, mid);
    mergeSort(arr, mid + 1, high);
    merge(arr, low, mid, high);
}`,
      typescript: `function mergeSort(arr: number[], low = 0, high = arr.length - 1): void {
  if (low >= high) return;
  const mid = Math.floor(low + (high - low) / 2);
  mergeSort(arr, low, mid);
  mergeSort(arr, mid + 1, high);
  merge(arr, low, mid, high);
}

function merge(arr: number[], low: number, mid: number, high: number): void {
  const left = arr.slice(low, mid + 1);
  const right = arr.slice(mid + 1, high + 1);
  let i = 0, j = 0, k = low;
  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) {
      arr[k++] = left[i++];
    } else {
      arr[k++] = right[j++];
    }
  }
  while (i < left.length) arr[k++] = left[i++];
  while (j < right.length) arr[k++] = right[j++];
}`,
      python: `def merge_sort(arr, low=0, high=None):
    if high is None: high = len(arr) - 1
    if low >= high: return
    mid = (low + high) // 2
    merge_sort(arr, low, mid)
    merge_sort(arr, mid + 1, high)
    merge(arr, low, mid, high)

def merge(arr, low, mid, high):
    left = arr[low:mid + 1]
    right = arr[mid + 1:high + 1]
    i = j = 0
    k = low
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            arr[k] = left[i]; i += 1
        else:
            arr[k] = right[j]; j += 1
        k += 1
    while i < len(left):
        arr[k] = left[i]; i += 1; k += 1
    while j < len(right):
        arr[k] = right[j]; j += 1; k += 1`,
      cpp: `void merge(vector<int>& arr, int low, int mid, int high) {
    vector<int> left(arr.begin() + low, arr.begin() + mid + 1);
    vector<int> right(arr.begin() + mid + 1, arr.begin() + high + 1);
    int i = 0, j = 0, k = low;
    while (i < left.size() && j < right.size()) {
        if (left[i] <= right[j]) arr[k++] = left[i++];
        else arr[k++] = right[j++];
    }
    while (i < left.size()) arr[k++] = left[i++];
    while (j < right.size()) arr[k++] = right[j++];
}

void mergeSort(vector<int>& arr, int low, int high) {
    if (low >= high) return;
    int mid = low + (high - low) / 2;
    mergeSort(arr, low, mid);
    mergeSort(arr, mid + 1, high);
    merge(arr, low, mid, high);
}`
    },
  },

  'counting-sort': {
    id: 'counting-sort',
    name: 'Counting Sort',
    category: 'sorting',
    description: 'A non-comparison based sorting algorithm that counts the occurrences of each element to compute their final positions in linear time.',
    timeComplexity: {
      best: 'O(n + k)',
      average: 'O(n + k)',
      worst: 'O(n + k)',
    },
    spaceComplexity: 'O(k)',
    pseudocode: [
      'function countingSort(arr):',
      '    min = min(arr), max = max(arr), range = max - min + 1',
      '    count = array of zeros of size range',
      '    output = array of size len(arr)',
      '    for each num in arr: count[num - min]++',
      '    for i from 1 to range - 1: count[i] += count[i - 1]',
      '    for i from len(arr) - 1 down to 0:',
      '        output[count[arr[i] - min] - 1] = arr[i]',
      '        count[arr[i] - min]--',
      '    return output',
    ],
    sourceCode: {
      typescript: `function countingSort(arr: number[]): number[] {
  if (arr.length <= 1) return arr;
  const min = Math.min(...arr);
  const max = Math.max(...arr);
  const range = max - min + 1;
  const count = new Array(range).fill(0);
  const output = new Array(arr.length);

  for (const num of arr) count[num - min]++;
  for (let i = 1; i < range; i++) count[i] += count[i - 1];

  for (let i = arr.length - 1; i >= 0; i--) {
    output[count[arr[i] - min] - 1] = arr[i];
    count[arr[i] - min]--;
  }
  return output;
}`,
      python: `def counting_sort(arr):
    if len(arr) <= 1: return arr
    min_val, max_val = min(arr), max(arr)
    range_val = max_val - min_val + 1
    count = [0] * range_val
    output = [0] * len(arr)

    for num in arr:
        count[num - min_val] += 1
    for i in range(1, range_val):
        count[i] += count[i - 1]

    for i in range(len(arr) - 1, -1, -1):
        idx = count[arr[i] - min_val] - 1
        output[idx] = arr[i]
        count[arr[i] - min_val] -= 1
    return output`,
      cpp: `vector<int> countingSort(const vector<int>& arr) {
    if (arr.size() <= 1) return arr;
    int minVal = *min_element(arr.begin(), arr.end());
    int maxVal = *max_element(arr.begin(), arr.end());
    int range = maxVal - minVal + 1;
    vector<int> count(range, 0), output(arr.size());

    for (int x : arr) count[x - minVal]++;
    for (int i = 1; i < range; ++i) count[i] += count[i - 1];

    for (int i = arr.size() - 1; i >= 0; --i) {
        output[--count[arr[i] - minVal]] = arr[i];
    }
    return output;
}`
    },
  },

  'linear-search': {
    id: 'linear-search',
    name: 'Linear Search',
    category: 'searching',
    description: 'Sequentially checks each element in the collection from left to right until the target element is found or the end of the array is reached.',
    timeComplexity: {
      best: 'O(1)',
      average: 'O(n)',
      worst: 'O(n)',
    },
    spaceComplexity: 'O(1)',
    pseudocode: [
      'function linearSearch(arr, target):',
      '    for i from 0 to len(arr) - 1:',
      '        if arr[i] == target: return i',
      '    return -1',
    ],
    sourceCode: {
      typescript: `function linearSearch(arr: number[], target: number): number {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === target) return i;
  }
  return -1;
}`,
      python: `def linear_search(arr, target):
    for i, val in enumerate(arr):
        if val == target: return i
    return -1`,
      cpp: `int linearSearch(const vector<int>& arr, int target) {
    for (int i = 0; i < arr.size(); ++i) {
        if (arr[i] == target) return i;
    }
    return -1;
}`
    },
  },

  'binary-search': {
    id: 'binary-search',
    name: 'Binary Search',
    category: 'searching',
    description: 'Efficiently searches a sorted array by repeatedly dividing the search interval in half based on comparison with the midpoint element.',
    timeComplexity: {
      best: 'O(1)',
      average: 'O(log n)',
      worst: 'O(log n)',
    },
    spaceComplexity: 'O(1)',
    pseudocode: [
      'function binarySearch(arr, target):',
      '    low = 0, high = len(arr) - 1',
      '    while low <= high:',
      '        mid = floor(low + (high - low) / 2)',
      '        if arr[mid] == target: return mid',
      '        else if arr[mid] < target: low = mid + 1',
      '        else: high = mid - 1',
      '    return -1',
    ],
    sourceCode: {
      typescript: `function binarySearch(arr: number[], target: number): number {
  let low = 0;
  let high = arr.length - 1;
  while (low <= high) {
    const mid = Math.floor(low + (high - low) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) low = mid + 1;
    else high = mid - 1;
  }
  return -1;
}`,
      python: `def binary_search(arr, target):
    low, high = 0, len(arr) - 1
    while low <= high:
        mid = (low + high) // 2
        if arr[mid] == target: return mid
        elif arr[mid] < target: low = mid + 1
        else: high = mid - 1
    return -1`,
      cpp: `int binarySearch(const vector<int>& arr, int target) {
    int low = 0, high = arr.size() - 1;
    while (low <= high) {
        int mid = low + (high - low) / 2;
        if (arr[mid] == target) return mid;
        if (arr[mid] < target) low = mid + 1;
        else high = mid - 1;
    }
    return -1;
}`
    },
  },

  'fibonacci-search': {
    id: 'fibonacci-search',
    name: 'Fibonacci Search',
    category: 'searching',
    description: 'A comparison-based search algorithm for sorted arrays using Fibonacci numbers to divide array intervals into uneven, efficient segments without division operations.',
    timeComplexity: {
      best: 'O(1)',
      average: 'O(log n)',
      worst: 'O(log n)',
    },
    spaceComplexity: 'O(1)',
    pseudocode: [
      'function fibonacciSearch(arr, target):',
      '    find smallest fibM >= len(arr)',
      '    offset = -1',
      '    while fibM > 1:',
      '        i = min(offset + fibM2, len(arr) - 1)',
      '        if arr[i] < target: down 1 fib step, offset = i',
      '        else if arr[i] > target: down 2 fib steps',
      '        else: return i',
      '    if fibM1 == 1 and arr[offset + 1] == target: return offset + 1',
      '    return -1',
    ],
    sourceCode: {
      typescript: `function fibonacciSearch(arr: number[], target: number): number {
  const n = arr.length;
  let fibM2 = 0, fibM1 = 1, fibM = fibM2 + fibM1;
  while (fibM < n) {
    fibM2 = fibM1; fibM1 = fibM; fibM = fibM2 + fibM1;
  }
  let offset = -1;
  while (fibM > 1) {
    const i = Math.min(offset + fibM2, n - 1);
    if (arr[i] < target) {
      fibM = fibM1; fibM1 = fibM2; fibM2 = fibM - fibM1;
      offset = i;
    } else if (arr[i] > target) {
      fibM = fibM2; fibM1 = fibM1 - fibM2; fibM2 = fibM - fibM1;
    } else return i;
  }
  if (fibM1 === 1 && offset + 1 < n && arr[offset + 1] === target) return offset + 1;
  return -1;
}`,
      python: `def fibonacci_search(arr, target):
    n = len(arr)
    fibM2, fibM1 = 0, 1
    fibM = fibM2 + fibM1
    while fibM < n:
        fibM2 = fibM1; fibM1 = fibM; fibM = fibM2 + fibM1
    offset = -1
    while fibM > 1:
        i = min(offset + fibM2, n - 1)
        if arr[i] < target:
            fibM, fibM1, fibM2 = fibM1, fibM2, fibM - fibM1
            offset = i
        elif arr[i] > target:
            fibM, fibM1, fibM2 = fibM2, fibM1 - fibM2, fibM - fibM1
        else: return i
    if fibM1 == 1 and offset + 1 < n and arr[offset + 1] == target:
        return offset + 1
    return -1`,
      cpp: `int fibonacciSearch(const vector<int>& arr, int target) {
    int n = arr.size();
    int fibM2 = 0, fibM1 = 1, fibM = 1;
    while (fibM < n) { fibM2 = fibM1; fibM1 = fibM; fibM = fibM2 + fibM1; }
    int offset = -1;
    while (fibM > 1) {
        int i = min(offset + fibM2, n - 1);
        if (arr[i] < target) {
            fibM = fibM1; fibM1 = fibM2; fibM2 = fibM - fibM1;
            offset = i;
        } else if (arr[i] > target) {
            fibM = fibM2; fibM1 = fibM1 - fibM2; fibM2 = fibM - fibM1;
        } else return i;
    }
    if (fibM1 == 1 && offset + 1 < n && arr[offset + 1] == target) return offset + 1;
    return -1;
}`
    },
  },

  'kmp': {
    id: 'kmp',
    name: 'Knuth-Morris-Pratt (KMP)',
    category: 'string',
    description: 'Searches for occurrences of a pattern within a main text by preprocessing the pattern into a Longest Proper Prefix which is Suffix (LPS) array to avoid re-evaluating matched characters.',
    timeComplexity: {
      best: 'O(n + m)',
      average: 'O(n + m)',
      worst: 'O(n + m)',
    },
    spaceComplexity: 'O(m)',
    pseudocode: [
      'function computeLPS(pattern):',
      '    lps[0] = 0, len = 0, i = 1',
      '    while i < len(pattern):',
      '        if pattern[i] == pattern[len]: lps[i++] = ++len',
      '        else if len != 0: len = lps[len - 1]',
      '        else: lps[i++] = 0',
      'function kmpSearch(text, pattern):',
      '    lps = computeLPS(pattern)',
      '    i = 0, j = 0',
      '    while i < len(text):',
      '        if text[i] == pattern[j]: i++, j++',
      '        if j == len(pattern): record match, j = lps[j - 1]',
      '        else if mismatch: if j != 0: j = lps[j - 1]; else: i++',
    ],
    sourceCode: {
      typescript: `function kmpSearch(text: string, pattern: string): number[] {
  const lps = computeLPS(pattern);
  let i = 0, j = 0;
  const matches: number[] = [];
  while (i < text.length) {
    if (text[i] === pattern[j]) {
      i++; j++;
    }
    if (j === pattern.length) {
      matches.push(i - j);
      j = lps[j - 1];
    } else if (i < text.length && text[i] !== pattern[j]) {
      if (j !== 0) j = lps[j - 1];
      else i++;
    }
  }
  return matches;
}`,
      python: `def kmp_search(text, pattern):
    lps = compute_lps(pattern)
    i = j = 0
    matches = []
    while i < len(text):
        if text[i] == pattern[j]:
            i += 1; j += 1
        if j == len(pattern):
            matches.append(i - j)
            j = lps[j - 1]
        elif i < len(text) and text[i] != pattern[j]:
            if j != 0: j = lps[j - 1]
            else: i += 1
    return matches`,
      cpp: `vector<int> kmpSearch(const string& text, const string& pattern) {
    vector<int> lps = computeLPS(pattern);
    int i = 0, j = 0;
    vector<int> matches;
    while (i < text.length()) {
        if (text[i] == pattern[j]) { i++; j++; }
        if (j == pattern.length()) {
            matches.push_back(i - j);
            j = lps[j - 1];
        } else if (i < text.length() && text[i] != pattern[j]) {
            if (j != 0) j = lps[j - 1];
            else i++;
        }
    }
    return matches;
}`
    },
  },

  'avl': {
    id: 'avl',
    name: 'AVL Tree (Self-Balancing BST)',
    category: 'tree',
    description: 'A self-balancing Binary Search Tree where the difference between heights of left and right subtrees for any node cannot be more than one, utilizing 4 rotations: LL, RR, LR, RL.',
    timeComplexity: {
      best: 'O(log n)',
      average: 'O(log n)',
      worst: 'O(log n)',
    },
    spaceComplexity: 'O(n)',
    pseudocode: [
      'function insert(node, key):',
      '    standard BST insert',
      '    update height = 1 + max(height(left), height(right))',
      '    balance = height(left) - height(right)',
      '    if balance > 1 and key < left.key: return rightRotate(node) // LL',
      '    if balance < -1 and key > right.key: return leftRotate(node) // RR',
      '    if balance > 1 and key > left.key: // LR',
      '        node.left = leftRotate(node.left); return rightRotate(node)',
      '    if balance < -1 and key < right.key: // RL',
      '        node.right = rightRotate(node.right); return leftRotate(node)',
      '    return node',
    ],
    sourceCode: {
      typescript: `class AVLNode {
  constructor(public val: number, public height = 1,
              public left: AVLNode | null = null,
              public right: AVLNode | null = null) {}
}

function insertAVL(node: AVLNode | null, val: number): AVLNode {
  if (!node) return new AVLNode(val);
  if (val < node.val) node.left = insertAVL(node.left, val);
  else if (val > node.val) node.right = insertAVL(node.right, val);
  else return node;

  node.height = 1 + Math.max(getHeight(node.left), getHeight(node.right));
  const bf = getBalance(node);

  if (bf > 1 && val < node.left!.val) return rightRotate(node);
  if (bf < -1 && val > node.right!.val) return leftRotate(node);
  if (bf > 1 && val > node.left!.val) {
    node.left = leftRotate(node.left!);
    return rightRotate(node);
  }
  if (bf < -1 && val < node.right!.val) {
    node.right = rightRotate(node.right!);
    return leftRotate(node);
  }
  return node;
}`,
      python: `def insert_avl(root, key):
    if not root: return AVLNode(key)
    if key < root.val: root.left = insert_avl(root.left, key)
    elif key > root.val: root.right = insert_avl(root.right, key)
    else: return root

    root.height = 1 + max(get_height(root.left), get_height(root.right))
    balance = get_balance(root)

    if balance > 1 and key < root.left.val: return right_rotate(root)
    if balance < -1 and key > root.right.val: return left_rotate(root)
    if balance > 1 and key > root.left.val:
        root.left = left_rotate(root.left)
        return right_rotate(root)
    if balance < -1 and key < root.right.val:
        root.right = right_rotate(root.right)
        return left_rotate(root)
    return root`,
      cpp: `AVLNode* insertAVL(AVLNode* node, int key) {
    if (!node) return new AVLNode(key);
    if (key < node->key) node->left = insertAVL(node->left, key);
    else if (key > node->key) node->right = insertAVL(node->right, key);
    else return node;

    node->height = 1 + max(getHeight(node->left), getHeight(node->right));
    int balance = getBalance(node);

    if (balance > 1 && key < node->left->key) return rightRotate(node);
    if (balance < -1 && key > node->right->key) return leftRotate(node);
    if (balance > 1 && key > node->left->key) {
        node->left = leftRotate(node->left);
        return rightRotate(node);
    }
    if (balance < -1 && key < node->right->key) {
        node->right = rightRotate(node->right);
        return leftRotate(node);
    }
    return node;
}`
    },
  },

  'bfs': {
    id: 'bfs',
    name: 'Breadth-First Search (BFS)',
    category: 'graph',
    description: 'Explores graph nodes level-by-level using a FIFO queue, guaranteeing the shortest path in unweighted graphs.',
    timeComplexity: { best: 'O(V + E)', average: 'O(V + E)', worst: 'O(V + E)' },
    spaceComplexity: 'O(V)',
    pseudocode: [
      'function BFS(graph, startNode):',
      '    queue = [startNode], visited = {startNode}',
      '    while queue is not empty:',
      '        current = queue.popFront()',
      '        for neighbor in graph[current]:',
      '            if neighbor not in visited:',
      '                visited.add(neighbor)',
      '                queue.pushBack(neighbor)',
    ],
    sourceCode: {
      typescript: `function bfs(graph: Record<string, string[]>, start: string): string[] {
  const visited = new Set<string>([start]);
  const queue = [start];
  const order: string[] = [];
  while (queue.length > 0) {
    const node = queue.shift()!;
    order.push(node);
    for (const neighbor of graph[node] || []) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }
  return order;
}`,
      python: `def bfs(graph, start):
    visited = {start}
    queue = deque([start])
    order = []
    while queue:
        node = queue.popleft()
        order.append(node)
        for neighbor in graph.get(node, []):
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)
    return order`,
      cpp: `vector<string> bfs(map<string, vector<string>>& graph, string start) {
    unordered_set<string> visited;
    queue<string> q;
    vector<string> order;
    visited.insert(start); q.push(start);
    while (!q.empty()) {
        string node = q.front(); q.pop();
        order.push_back(node);
        for (const auto& neighbor : graph[node]) {
            if (!visited.count(neighbor)) {
                visited.insert(neighbor);
                q.push(neighbor);
            }
        }
    }
    return order;
}`
    },
  },

  'dfs': {
    id: 'dfs',
    name: 'Depth-First Search (DFS)',
    category: 'graph',
    description: 'Traverses deeply along each branch using recursion or a LIFO stack before backtracking.',
    timeComplexity: { best: 'O(V + E)', average: 'O(V + E)', worst: 'O(V + E)' },
    spaceComplexity: 'O(V)',
    pseudocode: [
      'function DFS(graph, startNode):',
      '    stack = [startNode], visited = {}',
      '    while stack is not empty:',
      '        current = stack.pop()',
      '        if current not in visited:',
      '            visited.add(current)',
      '            for neighbor in graph[current]:',
      '                if neighbor not in visited: stack.push(neighbor)',
    ],
    sourceCode: {
      typescript: `function dfs(graph: Record<string, string[]>, start: string): string[] {
  const visited = new Set<string>();
  const stack = [start];
  const order: string[] = [];
  while (stack.length > 0) {
    const node = stack.pop()!;
    if (!visited.has(node)) {
      visited.add(node);
      order.push(node);
      for (const neighbor of graph[node] || []) {
        if (!visited.has(neighbor)) stack.push(neighbor);
      }
    }
  }
  return order;
}`,
      python: `def dfs(graph, start):
    visited = set()
    stack = [start]
    order = []
    while stack:
        node = stack.pop()
        if node not in visited:
            visited.add(node)
            order.append(node)
            for neighbor in graph.get(node, []):
                if neighbor not in visited: stack.append(neighbor)
    return order`,
      cpp: `vector<string> dfs(map<string, vector<string>>& graph, string start) {
    unordered_set<string> visited;
    stack<string> s;
    vector<string> order;
    s.push(start);
    while (!s.empty()) {
        string node = s.top(); s.pop();
        if (!visited.count(node)) {
            visited.insert(node);
            order.push_back(node);
            for (const auto& neighbor : graph[node]) {
                if (!visited.count(neighbor)) s.push(neighbor);
            }
        }
    }
    return order;
}`
    },
  },

  'dijkstra': {
    id: 'dijkstra',
    name: "Dijkstra's Shortest Path",
    category: 'graph',
    description: 'Finds single-source shortest path in weighted graphs with non-negative edge weights using greedy priority queue relaxation.',
    timeComplexity: { best: 'O((V + E) log V)', average: 'O((V + E) log V)', worst: 'O((V + E) log V)' },
    spaceComplexity: 'O(V)',
    pseudocode: [
      'function Dijkstra(graph, start):',
      '    dist = {v: infinity for v in graph}, dist[start] = 0',
      '    pq = PriorityQueue([(0, start)])',
      '    while pq is not empty:',
      '        d, u = pq.extractMin()',
      '        for (v, weight) in graph[u]:',
      '            if dist[u] + weight < dist[v]:',
      '                dist[v] = dist[u] + weight',
      '                pq.insert((dist[v], v))',
    ],
    sourceCode: {
      typescript: `function dijkstra(graph: Record<string, { node: string; weight: number }[]>, start: string) {
  const dist: Record<string, number> = {};
  const prev: Record<string, string | null> = {};
  for (const node in graph) dist[node] = Infinity;
  dist[start] = 0;
  const pq = [{ node: start, dist: 0 }];
  while (pq.length > 0) {
    pq.sort((a, b) => a.dist - b.dist);
    const { node: u, dist: d } = pq.shift()!;
    for (const { node: v, weight } of graph[u] || []) {
      if (d + weight < dist[v]) {
        dist[v] = d + weight;
        prev[v] = u;
        pq.push({ node: v, dist: dist[v] });
      }
    }
  }
  return { dist, prev };
}`,
      python: `def dijkstra(graph, start):
    dist = {node: float('inf') for node in graph}
    dist[start] = 0
    pq = [(0, start)]
    while pq:
        d, u = heapq.heappop(pq)
        if d > dist[u]: continue
        for v, weight in graph[u]:
            if d + weight < dist[v]:
                dist[v] = d + weight
                heapq.heappush(pq, (dist[v], v))
    return dist`,
      cpp: `map<string, int> dijkstra(map<string, vector<pair<string, int>>>& graph, string start) {
    map<string, int> dist;
    for (const auto& [k, _] : graph) dist[k] = 1e9;
    dist[start] = 0;
    priority_queue<pair<int, string>, vector<pair<int, string>>, greater<>> pq;
    pq.push({0, start});
    while (!pq.empty()) {
        auto [d, u] = pq.top(); pq.pop();
        if (d > dist[u]) continue;
        for (const auto& [v, weight] : graph[u]) {
            if (d + weight < dist[v]) {
                dist[v] = d + weight;
                pq.push({dist[v], v});
            }
        }
    }
    return dist;
}`
    },
  },

  'min-heap': {
    id: 'min-heap',
    name: 'Min Heap (Priority Queue)',
    category: 'heap',
    description: 'Complete binary tree where root key is minimum among all keys, supporting O(log n) insertion and extraction.',
    timeComplexity: { best: 'O(1) peek', average: 'O(log n) insert/extract', worst: 'O(log n)' },
    spaceComplexity: 'O(n)',
    pseudocode: [
      'function insert(val): heap.push(val); siftUp(heap.len - 1)',
      'function extractMin(): minVal = heap[0]; heap[0] = heap.pop(); siftDown(0)',
      'function siftUp(i): while i > 0 and heap[i] < heap[parent(i)]: swap and i = parent(i)',
      'function siftDown(i): while hasChild(i): swap with min child until heap property holds',
    ],
    sourceCode: {
      typescript: `class MinHeap {
  private heap: number[] = [];
  insert(val: number) { this.heap.push(val); this.siftUp(this.heap.length - 1); }
  extractMin(): number | undefined {
    if (this.heap.length === 0) return undefined;
    const min = this.heap[0];
    const end = this.heap.pop()!;
    if (this.heap.length > 0) { this.heap[0] = end; this.siftDown(0); }
    return min;
  }
  private siftUp(i: number) {
    while (i > 0 && this.heap[i] < this.heap[Math.floor((i - 1) / 2)]) {
      const p = Math.floor((i - 1) / 2);
      [this.heap[i], this.heap[p]] = [this.heap[p], this.heap[i]]; i = p;
    }
  }
  private siftDown(i: number) {
    while (2 * i + 1 < this.heap.length) {
      let t = 2 * i + 1; const r = 2 * i + 2;
      if (r < this.heap.length && this.heap[r] < this.heap[t]) t = r;
      if (this.heap[t] < this.heap[i]) { [this.heap[i], this.heap[t]] = [this.heap[t], this.heap[i]]; i = t; }
      else break;
    }
  }
}`,
      python: `class MinHeap:
    def __init__(self): self.heap = []
    def insert(self, val):
        self.heap.append(val)
        self._sift_up(len(self.heap) - 1)
    def extract_min(self):
        if not self.heap: return None
        min_val = self.heap[0]
        end = self.heap.pop()
        if self.heap:
            self.heap[0] = end
            self._sift_down(0)
        return min_val`,
      cpp: `class MinHeap {
    vector<int> heap;
public:
    void insert(int val) {
        heap.push_back(val);
        int i = heap.size() - 1;
        while (i > 0 && heap[i] < heap[(i - 1) / 2]) {
            swap(heap[i], heap[(i - 1) / 2]);
            i = (i - 1) / 2;
        }
    }
};`
    },
  },

  'max-heap': {
    id: 'max-heap',
    name: 'Max Heap',
    category: 'heap',
    description: 'Complete binary tree where root key is maximum among all keys, used in priority queues and Heap Sort.',
    timeComplexity: { best: 'O(1) peek', average: 'O(log n) insert/extract', worst: 'O(log n)' },
    spaceComplexity: 'O(n)',
    pseudocode: [
      'function insert(val): heap.push(val); siftUp(heap.len - 1)',
      'function extractMax(): maxVal = heap[0]; heap[0] = heap.pop(); siftDown(0)',
      'function siftUp(i): while i > 0 and heap[i] > heap[parent(i)]: swap and i = parent(i)',
      'function siftDown(i): while hasChild(i): swap with max child until heap property holds',
    ],
    sourceCode: {
      typescript: `class MaxHeap {
  private heap: number[] = [];
  insert(val: number) {
    this.heap.push(val);
    let i = this.heap.length - 1;
    while (i > 0 && this.heap[i] > this.heap[Math.floor((i - 1) / 2)]) {
      const p = Math.floor((i - 1) / 2);
      [this.heap[i], this.heap[p]] = [this.heap[p], this.heap[i]]; i = p;
    }
  }
}`,
      python: `class MaxHeap:
    def __init__(self): self.heap = []
    def insert(self, val):
        self.heap.append(val)
        i = len(self.heap) - 1
        while i > 0 and self.heap[i] > self.heap[(i - 1) // 2]:
            p = (i - 1) // 2
            self.heap[i], self.heap[p] = self.heap[p], self.heap[i]
            i = p`,
      cpp: `class MaxHeap {
    vector<int> heap;
public:
    void insert(int val) {
        heap.push_back(val);
        int i = heap.size() - 1;
        while (i > 0 && heap[i] > heap[(i - 1) / 2]) {
            swap(heap[i], heap[(i - 1) / 2]);
            i = (i - 1) / 2;
        }
    }
};`
    },
  },

  'trie': {
    id: 'trie',
    name: 'Trie (Prefix Tree)',
    category: 'trie',
    description: 'An efficient retrieval tree structure used for fast string prefix searching, autocomplete, and dictionary lookups.',
    timeComplexity: { best: 'O(L)', average: 'O(L)', worst: 'O(L)' },
    spaceComplexity: 'O(ALPHABET * L * N)',
    pseudocode: [
      'function insert(word): curr = root; for ch in word: curr = curr.children[ch]; curr.isEndOfWord = true',
      'function search(word): curr = root; for ch in word: if ch not in curr: return false; return curr.isEndOfWord',
      'function delete(word): unmark isEndOfWord and prune unshared leaf branches',
    ],
    sourceCode: {
      typescript: `class TrieNode {
  children = new Map<string, TrieNode>();
  isEndOfWord = false;
}

class Trie {
  root = new TrieNode();
  insert(word: string) {
    let curr = this.root;
    for (const ch of word) {
      if (!curr.children.has(ch)) curr.children.set(ch, new TrieNode());
      curr = curr.children.get(ch)!;
    }
    curr.isEndOfWord = true;
  }
  search(word: string): boolean {
    let curr = this.root;
    for (const ch of word) {
      if (!curr.children.has(ch)) return false;
      curr = curr.children.get(ch)!;
    }
    return curr.isEndOfWord;
  }
}`,
      python: `class TrieNode:
    def __init__(self):
        self.children = {}
        self.is_end = False

class Trie:
    def __init__(self): self.root = TrieNode()
    def insert(self, word):
        curr = self.root
        for ch in word:
            if ch not in curr.children: curr.children[ch] = TrieNode()
            curr = curr.children[ch]
        curr.is_end = True
    def search(self, word):
        curr = self.root
        for ch in word:
            if ch not in curr.children: return False
            curr = curr.children[ch]
        return curr.is_end`,
      cpp: `class TrieNode {
public:
    map<char, TrieNode*> children;
    bool isEndOfWord = false;
};

class Trie {
    TrieNode* root = new TrieNode();
public:
    void insert(string word) {
        TrieNode* curr = root;
        for (char ch : word) {
            if (!curr->children.count(ch)) curr->children[ch] = new TrieNode();
            curr = curr->children[ch];
        }
        curr->isEndOfWord = true;
    }
};`
    },
  },
};
