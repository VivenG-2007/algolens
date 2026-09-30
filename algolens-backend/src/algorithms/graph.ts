import { ExecutionStep } from '../execution/types.js';

export interface GraphEdge {
  from: string;
  to: string;
  weight?: number;
}

export interface GraphData {
  nodes: string[];
  edges: GraphEdge[];
  isDirected?: boolean;
}

// Default standard graph for presentation and dynamic exploration
export const DEFAULT_GRAPH: GraphData = {
  nodes: ['A', 'B', 'C', 'D', 'E', 'F'],
  edges: [
    { from: 'A', to: 'B', weight: 4 },
    { from: 'A', to: 'C', weight: 2 },
    { from: 'B', to: 'C', weight: 1 },
    { from: 'B', to: 'D', weight: 5 },
    { from: 'C', to: 'D', weight: 8 },
    { from: 'C', to: 'E', weight: 10 },
    { from: 'D', to: 'E', weight: 2 },
    { from: 'D', to: 'F', weight: 6 },
    { from: 'E', to: 'F', weight: 3 },
  ],
  isDirected: false,
};

function buildAdjacencyList(graph: GraphData): Map<string, { node: string; weight: number }[]> {
  const adj = new Map<string, { node: string; weight: number }[]>();
  for (const node of graph.nodes) {
    adj.set(node, []);
  }
  for (const edge of graph.edges) {
    const weight = edge.weight ?? 1;
    adj.get(edge.from)?.push({ node: edge.to, weight });
    if (!graph.isDirected) {
      adj.get(edge.to)?.push({ node: edge.from, weight });
    }
  }
  return adj;
}

// ------------------------------------------------------------
// 1. BREADTH-FIRST SEARCH (BFS)
// ------------------------------------------------------------
export function executeBFS(
  graph: GraphData = DEFAULT_GRAPH,
  startNode = 'A',
  targetNode?: string
): ExecutionStep[] {
  const steps: ExecutionStep[] = [];
  let stepId = 1;
  const adj = buildAdjacencyList(graph);

  if (!graph.nodes.includes(startNode)) {
    throw new Error(`Start node '${startNode}' is not in the graph.`);
  }

  const visited: string[] = [];
  const queue: string[] = [startNode];
  const discoveryTreeEdges: { from: string; to: string }[] = [];
  let comparisonsCount = 0;

  steps.push({
    id: stepId++,
    title: `Initialize BFS from Node ${startNode}`,
    description: `Created FIFO Queue with start node [${startNode}]. Visited set initialized.`,
    algorithmLine: 1,
    codeLine: 1,
    dataStructure: 'GRAPH',
    variables: { startNode, queueLength: 1, visitedCount: 0 },
    dataStructureState: {
      type: 'graph-bfs',
      graph,
      visited: [...visited],
      queue: [...queue],
      activeNode: startNode,
      discoveryTreeEdges: [],
    },
    operation: 'INIT_BFS',
    complexity: { time: 'O(V + E)', space: 'O(V)' },
    operationStats: { nodesVisited: 0, comparisons: 0 },
  });

  visited.push(startNode);

  while (queue.length > 0) {
    const current = queue.shift()!;

    steps.push({
      id: stepId++,
      title: `Dequeue Node ${current}`,
      description: `Popped node '${current}' from the front of the queue to inspect neighbors.`,
      algorithmLine: 4,
      codeLine: 5,
      dataStructure: 'GRAPH',
      variables: { current, remainingQueue: queue.join(', ') },
      dataStructureState: {
        type: 'graph-bfs',
        graph,
        visited: [...visited],
        queue: [...queue],
        activeNode: current,
        discoveryTreeEdges: [...discoveryTreeEdges],
      },
      operation: 'DEQUEUE',
      operationStats: { nodesVisited: visited.length, comparisons: comparisonsCount },
      predictionChallenge: queue.length > 0 ? {
        question: `After expanding neighbors of ${current}, which node is next in line at front of Queue?`,
        options: [queue[0] || 'None', current, visited[0], 'End of Search'],
        correctIndex: 0,
        explanation: 'BFS uses FIFO (First In First Out) ordering.',
      } : undefined,
    });

    if (targetNode && current === targetNode) {
      steps.push({
        id: stepId++,
        title: `Target Node ${targetNode} Reached!`,
        description: `BFS located target node '${targetNode}' with minimum edge hops.`,
        algorithmLine: 6,
        codeLine: 7,
        dataStructure: 'GRAPH',
        variables: { current, targetNode, found: true },
        dataStructureState: {
          type: 'graph-bfs',
          graph,
          visited: [...visited],
          queue: [...queue],
          activeNode: current,
          discoveryTreeEdges: [...discoveryTreeEdges],
        },
        operation: 'TARGET_FOUND',
      });
      return steps;
    }

    const neighbors = adj.get(current) || [];
    for (const neighbor of neighbors) {
      comparisonsCount++;
      const isAlreadyVisited = visited.includes(neighbor.node);

      steps.push({
        id: stepId++,
        title: `Explore Edge (${current} → ${neighbor.node})`,
        description: `Inspecting neighbor '${neighbor.node}'. Status: ${
          isAlreadyVisited ? 'ALREADY VISITED (Skip)' : 'UNVISITED (Enqueue)'
        }.`,
        algorithmLine: 8,
        codeLine: 9,
        dataStructure: 'GRAPH',
        variables: { current, neighbor: neighbor.node, isVisited: isAlreadyVisited },
        dataStructureState: {
          type: 'graph-bfs',
          graph,
          visited: [...visited],
          queue: [...queue],
          activeNode: current,
          activeEdge: { from: current, to: neighbor.node },
          discoveryTreeEdges: [...discoveryTreeEdges],
        },
        operation: 'EXPLORE_EDGE',
        operationStats: { nodesVisited: visited.length, comparisons: comparisonsCount },
      });

      if (!isAlreadyVisited) {
        visited.push(neighbor.node);
        queue.push(neighbor.node);
        discoveryTreeEdges.push({ from: current, to: neighbor.node });

        steps.push({
          id: stepId++,
          title: `Enqueue & Mark Visited: Node ${neighbor.node}`,
          description: `Added node '${neighbor.node}' to visited set and pushed into queue.`,
          algorithmLine: 11,
          codeLine: 12,
          dataStructure: 'GRAPH',
          variables: { enqueued: neighbor.node, newQueue: queue.join(', ') },
          dataStructureState: {
            type: 'graph-bfs',
            graph,
            visited: [...visited],
            queue: [...queue],
            activeNode: neighbor.node,
            discoveryTreeEdges: [...discoveryTreeEdges],
          },
          operation: 'ENQUEUE',
          operationStats: { nodesVisited: visited.length, comparisons: comparisonsCount },
        });
      }
    }
  }

  steps.push({
    id: stepId++,
    title: 'BFS Traversal Completed',
    description: `All connected nodes traversed in level-order: [${visited.join(', ')}].`,
    algorithmLine: 14,
    codeLine: 15,
    dataStructure: 'GRAPH',
    variables: { totalVisited: visited.length },
    dataStructureState: {
      type: 'graph-bfs',
      graph,
      visited: [...visited],
      queue: [],
      discoveryTreeEdges: [...discoveryTreeEdges],
    },
    operation: 'COMPLETE',
    complexity: { time: 'O(V + E)', space: 'O(V)' },
    operationStats: { nodesVisited: visited.length, comparisons: comparisonsCount },
  });

  return steps;
}

// ------------------------------------------------------------
// 2. DEPTH-FIRST SEARCH (DFS)
// ------------------------------------------------------------
export function executeDFS(
  graph: GraphData = DEFAULT_GRAPH,
  startNode = 'A',
  targetNode?: string
): ExecutionStep[] {
  const steps: ExecutionStep[] = [];
  let stepId = 1;
  const adj = buildAdjacencyList(graph);

  if (!graph.nodes.includes(startNode)) {
    throw new Error(`Start node '${startNode}' is not in the graph.`);
  }

  const visited: string[] = [];
  const stack: string[] = [startNode];
  const discoveryTreeEdges: { from: string; to: string }[] = [];
  let comparisonsCount = 0;

  steps.push({
    id: stepId++,
    title: `Initialize DFS from Node ${startNode}`,
    description: `Created LIFO Stack with start node [${startNode}]. Exploring deeply along paths.`,
    algorithmLine: 1,
    codeLine: 1,
    dataStructure: 'GRAPH',
    variables: { startNode, stackLength: 1, visitedCount: 0 },
    dataStructureState: {
      type: 'graph-dfs',
      graph,
      visited: [...visited],
      stack: [...stack],
      activeNode: startNode,
      discoveryTreeEdges: [],
    },
    operation: 'INIT_DFS',
    complexity: { time: 'O(V + E)', space: 'O(V)' },
  });

  while (stack.length > 0) {
    const current = stack.pop()!;

    if (!visited.includes(current)) {
      visited.push(current);

      steps.push({
        id: stepId++,
        title: `Pop & Visit Node ${current}`,
        description: `Popped node '${current}' from LIFO Stack and marked as visited.`,
        algorithmLine: 4,
        codeLine: 5,
        dataStructure: 'GRAPH',
        variables: { current, stackState: stack.join(', '), visited: visited.join(', ') },
        dataStructureState: {
          type: 'graph-dfs',
          graph,
          visited: [...visited],
          stack: [...stack],
          activeNode: current,
          discoveryTreeEdges: [...discoveryTreeEdges],
        },
        operation: 'POP_STACK',
        operationStats: { nodesVisited: visited.length, comparisons: comparisonsCount },
      });

      if (targetNode && current === targetNode) {
        steps.push({
          id: stepId++,
          title: `Target Node ${targetNode} Found!`,
          description: `DFS reached target node '${targetNode}'.`,
          algorithmLine: 6,
          codeLine: 7,
          dataStructure: 'GRAPH',
          variables: { current, targetNode, found: true },
          dataStructureState: {
            type: 'graph-dfs',
            graph,
            visited: [...visited],
            stack: [...stack],
            activeNode: current,
            discoveryTreeEdges: [...discoveryTreeEdges],
          },
          operation: 'TARGET_FOUND',
        });
        return steps;
      }

      const neighbors = adj.get(current) || [];
      // Push neighbors in reverse to visit in natural order
      for (let i = neighbors.length - 1; i >= 0; i--) {
        const neighbor = neighbors[i];
        comparisonsCount++;
        const isAlreadyVisited = visited.includes(neighbor.node);

        if (!isAlreadyVisited) {
          stack.push(neighbor.node);
          discoveryTreeEdges.push({ from: current, to: neighbor.node });

          steps.push({
            id: stepId++,
            title: `Push Neighbor ${neighbor.node} onto Stack`,
            description: `Pushed unvisited neighbor '${neighbor.node}' from edge (${current} → ${neighbor.node}).`,
            algorithmLine: 9,
            codeLine: 11,
            dataStructure: 'GRAPH',
            variables: { current, pushed: neighbor.node, stack: stack.join(', ') },
            dataStructureState: {
              type: 'graph-dfs',
              graph,
              visited: [...visited],
              stack: [...stack],
              activeNode: current,
              activeEdge: { from: current, to: neighbor.node },
              discoveryTreeEdges: [...discoveryTreeEdges],
            },
            operation: 'PUSH_STACK',
            operationStats: { nodesVisited: visited.length, comparisons: comparisonsCount },
          });
        }
      }
    }
  }

  steps.push({
    id: stepId++,
    title: 'DFS Traversal Completed',
    description: `Deep traversal concluded. Visited nodes order: [${visited.join(', ')}].`,
    algorithmLine: 14,
    codeLine: 16,
    dataStructure: 'GRAPH',
    variables: { totalVisited: visited.length },
    dataStructureState: {
      type: 'graph-dfs',
      graph,
      visited: [...visited],
      stack: [],
      discoveryTreeEdges: [...discoveryTreeEdges],
    },
    operation: 'COMPLETE',
    complexity: { time: 'O(V + E)', space: 'O(V)' },
    operationStats: { nodesVisited: visited.length, comparisons: comparisonsCount },
  });

  return steps;
}

// ------------------------------------------------------------
// 3. DIJKSTRA'S SHORTEST PATH ALGORITHM
// ------------------------------------------------------------
export function executeDijkstra(
  graph: GraphData = DEFAULT_GRAPH,
  startNode = 'A',
  targetNode = 'F'
): ExecutionStep[] {
  const steps: ExecutionStep[] = [];
  let stepId = 1;
  const adj = buildAdjacencyList(graph);

  const distances: Record<string, number> = {};
  const previous: Record<string, string | null> = {};
  const visited: string[] = [];
  let comparisonsCount = 0;

  for (const node of graph.nodes) {
    distances[node] = Infinity;
    previous[node] = null;
  }
  distances[startNode] = 0;

  // Priority Queue / Unvisited set
  const pq: { node: string; dist: number }[] = [{ node: startNode, dist: 0 }];

  steps.push({
    id: stepId++,
    title: `Initialize Dijkstra from Node ${startNode}`,
    description: `Distance to start node ${startNode} is 0. All other nodes initialized to ∞ (Infinity).`,
    algorithmLine: 1,
    codeLine: 1,
    dataStructure: 'GRAPH',
    variables: { startNode, targetNode, initialDistance: 0 },
    dataStructureState: {
      type: 'graph-dijkstra',
      graph,
      distances: { ...distances },
      previous: { ...previous },
      visited: [...visited],
      pq: [...pq],
      activeNode: startNode,
      shortestPath: [],
    },
    operation: 'INIT_DIJKSTRA',
    complexity: { time: 'O((V + E) log V)', space: 'O(V)' },
  });

  while (pq.length > 0) {
    // Sort to extract minimum distance node
    pq.sort((a, b) => a.dist - b.dist);
    const { node: current, dist: currentDist } = pq.shift()!;

    if (visited.includes(current)) continue;
    visited.push(current);

    steps.push({
      id: stepId++,
      title: `Extract Min: Visit Node ${current} (Dist = ${currentDist})`,
      description: `Node '${current}' has the smallest unvisited tentatitive distance (${currentDist}). Marking as settled.`,
      algorithmLine: 5,
      codeLine: 6,
      dataStructure: 'GRAPH',
      variables: { current, settledDistance: currentDist, visitedCount: visited.length },
      dataStructureState: {
        type: 'graph-dijkstra',
        graph,
        distances: { ...distances },
        previous: { ...previous },
        visited: [...visited],
        pq: [...pq],
        activeNode: current,
        shortestPath: [],
      },
      operation: 'EXTRACT_MIN',
      operationStats: { nodesVisited: visited.length, comparisons: comparisonsCount, pathDistance: currentDist },
      predictionChallenge: {
        question: `Why is the distance of ${currentDist} to node ${current} guaranteed to be minimal?`,
        options: [
          'Because Dijkstra assumes non-negative edge weights and takes greedy minimums',
          'Because it uses LIFO Stack properties',
          'Because all edge weights are equal to 1',
          'Because it backtracks on every node',
        ],
        correctIndex: 0,
        explanation: 'Greedy choice property with non-negative edge weights guarantees settled nodes are optimal.',
      },
    });

    if (current === targetNode) {
      break;
    }

    const neighbors = adj.get(current) || [];
    for (const neighbor of neighbors) {
      if (visited.includes(neighbor.node)) continue;

      comparisonsCount++;
      const edgeWeight = neighbor.weight;
      const newDist = currentDist + edgeWeight;
      const oldDist = distances[neighbor.node];
      const isRelaxed = newDist < oldDist;

      steps.push({
        id: stepId++,
        title: `Examine Edge (${current} → ${neighbor.node}) Weight ${edgeWeight}`,
        description: `Calculated alternate path: dist(${current}) + ${edgeWeight} = ${currentDist} + ${edgeWeight} = ${newDist}. Existing: ${
          oldDist === Infinity ? '∞' : oldDist
        }. Relax edge? ${isRelaxed ? 'YES' : 'NO'}.`,
        algorithmLine: 9,
        codeLine: 11,
        dataStructure: 'GRAPH',
        variables: {
          current,
          neighbor: neighbor.node,
          edgeWeight,
          newDist,
          oldDist: oldDist === Infinity ? '∞' : oldDist,
          relaxed: isRelaxed,
        },
        dataStructureState: {
          type: 'graph-dijkstra',
          graph,
          distances: { ...distances },
          previous: { ...previous },
          visited: [...visited],
          pq: [...pq],
          activeNode: current,
          activeEdge: { from: current, to: neighbor.node, weight: edgeWeight },
          shortestPath: [],
        },
        comparisons: {
          left: newDist,
          right: oldDist === Infinity ? 999999 : oldDist,
          result: `${newDist} < ${oldDist === Infinity ? '∞' : oldDist}`,
        },
        operation: 'RELAX_EDGE',
        operationStats: { nodesVisited: visited.length, comparisons: comparisonsCount },
      });

      if (isRelaxed) {
        distances[neighbor.node] = newDist;
        previous[neighbor.node] = current;
        pq.push({ node: neighbor.node, dist: newDist });

        steps.push({
          id: stepId++,
          title: `Updated Shortest Distance to ${neighbor.node} = ${newDist}`,
          description: `Relaxed edge! Updated distance table and set previous[${neighbor.node}] = ${current}.`,
          algorithmLine: 12,
          codeLine: 14,
          dataStructure: 'GRAPH',
          variables: { updatedNode: neighbor.node, newDistance: newDist, via: current },
          dataStructureState: {
            type: 'graph-dijkstra',
            graph,
            distances: { ...distances },
            previous: { ...previous },
            visited: [...visited],
            pq: [...pq],
            activeNode: neighbor.node,
            shortestPath: [],
          },
          operation: 'UPDATE_DISTANCE',
          operationStats: { nodesVisited: visited.length, comparisons: comparisonsCount },
        });
      }
    }
  }

  // Shortest path reconstruction
  const path: string[] = [];
  let currPathNode: string | null = targetNode;
  while (currPathNode !== null) {
    path.unshift(currPathNode);
    currPathNode = previous[currPathNode];
  }

  const finalCost = distances[targetNode];

  steps.push({
    id: stepId++,
    title: `Shortest Path Reconstructed: ${path.join(' → ')} (Total Cost: ${finalCost})`,
    description: `Backtracked from target ${targetNode} using predecessor map. Minimum cost: ${finalCost}.`,
    algorithmLine: 16,
    codeLine: 19,
    dataStructure: 'GRAPH',
    variables: {
      shortestPath: path.join(' -> '),
      totalCost: finalCost,
      settledCount: visited.length,
    },
    dataStructureState: {
      type: 'graph-dijkstra',
      graph,
      distances: { ...distances },
      previous: { ...previous },
      visited: [...visited],
      pq: [],
      activeNode: targetNode,
      shortestPath: [...path],
    },
    operation: 'RECONSTRUCT_PATH',
    complexity: { time: 'O((V + E) log V)', space: 'O(V)' },
    operationStats: {
      nodesVisited: visited.length,
      comparisons: comparisonsCount,
      pathDistance: finalCost,
    },
  });

  return steps;
}
