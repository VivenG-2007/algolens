import neo4j, { Driver, Session } from 'neo4j-driver';
import { supabaseService } from '../supabase/supabase.service.js';

export interface GraphNode {
  id: string;
  label: string;
  type: 'algorithm' | 'data-structure' | 'concept' | 'complexity' | 'technique';
  description: string;
  algorithmId?: string;
  metadata?: Record<string, any>;
  userStatus?: 'mastered' | 'in_progress' | 'needs_review' | 'unvisited';
  masteryScore?: number;
  badge?: string;
  userHighlight?: boolean;
}

export interface GraphLink {
  source: string;
  target: string;
  relation:
    | 'requires'
    | 'uses'
    | 'has_complexity'
    | 'related_to'
    | 'prerequisite_of'
    | 'implements';
  label: string;
}

export interface KnowledgeGraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

// ─────────────────────────────────────────────────────────
// STATIC FALLBACK GRAPH (used when Neo4j is unavailable)
// ─────────────────────────────────────────────────────────
const STATIC_GRAPH_DATA: KnowledgeGraphData = {
  nodes: [
    // Algorithms
    { id: 'merge-sort', label: 'Merge Sort', type: 'algorithm', description: 'O(n log n) stable divide-and-conquer sort', algorithmId: 'merge-sort' },
    { id: 'counting-sort', label: 'Counting Sort', type: 'algorithm', description: 'Non-comparison integer sorting algorithm', algorithmId: 'counting-sort' },
    { id: 'linear-search', label: 'Linear Search', type: 'algorithm', description: 'Sequential search in O(n) time', algorithmId: 'linear-search' },
    { id: 'binary-search', label: 'Binary Search', type: 'algorithm', description: 'O(log n) logarithmic search in sorted array', algorithmId: 'binary-search' },
    { id: 'fibonacci-search', label: 'Fibonacci Search', type: 'algorithm', description: 'Interval search using Fibonacci sequence', algorithmId: 'fibonacci-search' },
    { id: 'kmp', label: 'Knuth-Morris-Pratt', type: 'algorithm', description: 'Linear time string matching with LPS', algorithmId: 'kmp' },
    { id: 'avl', label: 'AVL Tree', type: 'data-structure', description: 'Self-balancing binary search tree with BF ∈ {-1,0,1}', algorithmId: 'avl' },
    { id: 'bfs', label: 'Breadth-First Search', type: 'algorithm', description: 'Level-order graph traversal via queue', algorithmId: 'bfs' },
    { id: 'dfs', label: 'Depth-First Search', type: 'algorithm', description: 'Deep graph traversal via stack/recursion', algorithmId: 'dfs' },
    { id: 'dijkstra', label: "Dijkstra's SSSP", type: 'algorithm', description: 'Greedy shortest path with non-negative weights', algorithmId: 'dijkstra' },
    { id: 'min-heap', label: 'Min-Heap', type: 'data-structure', description: 'Complete binary tree with parent ≤ children invariant', algorithmId: 'min-heap' },
    { id: 'max-heap', label: 'Max-Heap', type: 'data-structure', description: 'Complete binary tree with parent ≥ children invariant', algorithmId: 'max-heap' },
    { id: 'trie', label: 'Trie (Prefix Tree)', type: 'data-structure', description: 'Digital search tree keyed by character sequences', algorithmId: 'trie' },
    // Data Structures
    { id: 'array', label: 'Array', type: 'data-structure', description: 'Contiguous memory sequence of elements' },
    { id: 'sorted-array', label: 'Sorted Array', type: 'data-structure', description: 'Monotonically ordered array elements' },
    { id: 'bst', label: 'Binary Search Tree', type: 'data-structure', description: 'Tree with left < parent < right invariant' },
    { id: 'frequency-array', label: 'Frequency Array', type: 'data-structure', description: 'Buckets mapping element values to counts' },
    { id: 'lps-array', label: 'LPS Array', type: 'data-structure', description: 'Longest Proper Prefix which is also Suffix' },
    { id: 'priority-queue', label: 'Priority Queue', type: 'data-structure', description: 'Abstract type returning min/max element in O(1)' },
    { id: 'adjacency-list', label: 'Adjacency List', type: 'data-structure', description: 'Space-efficient graph representation for sparse graphs' },
    // Concepts & Techniques
    { id: 'divide-conquer', label: 'Divide and Conquer', type: 'technique', description: 'Break problem into subproblems, solve and combine' },
    { id: 'recursion', label: 'Recursion', type: 'concept', description: 'Function calling itself with base case termination' },
    { id: 'balance-factor', label: 'Balance Factor', type: 'concept', description: 'Height difference between left and right subtrees' },
    { id: 'rotations', label: 'Tree Rotations (LL,RR,LR,RL)', type: 'technique', description: 'Subtree re-balancing transformations' },
    { id: 'prefix-sum', label: 'Prefix Sums', type: 'technique', description: 'Cumulative summation over interval' },
    { id: 'pointers', label: 'Two Pointers', type: 'technique', description: 'Index pointers traversing towards bounds' },
    { id: 'greedy', label: 'Greedy Approach', type: 'technique', description: 'Locally optimal choice at each step' },
    { id: 'graph-traversal', label: 'Graph Traversal', type: 'concept', description: 'Systematic visiting of all reachable vertices' },
    { id: 'heap-invariant', label: 'Heap Property', type: 'concept', description: 'Parent-child ordering constraint maintained on all operations' },
    { id: 'prefix-matching', label: 'Prefix Matching', type: 'concept', description: 'String traversal sharing common root paths in Trie' },
    // Complexities
    { id: 'comp-n-log-n', label: 'O(n log n)', type: 'complexity', description: 'Linearithmic time complexity' },
    { id: 'comp-log-n', label: 'O(log n)', type: 'complexity', description: 'Logarithmic time complexity' },
    { id: 'comp-n', label: 'O(n)', type: 'complexity', description: 'Linear time complexity' },
    { id: 'comp-n-plus-k', label: 'O(n + k)', type: 'complexity', description: 'Linear with range parameter k' },
    { id: 'comp-n-plus-m', label: 'O(n + m)', type: 'complexity', description: 'Linear in text and pattern length' },
    { id: 'comp-e-log-v', label: 'O((V+E) log V)', type: 'complexity', description: 'Dijkstra with binary heap time complexity' },
    { id: 'comp-v-plus-e', label: 'O(V + E)', type: 'complexity', description: 'Linear in vertices and edges' },
    { id: 'comp-l', label: 'O(L)', type: 'complexity', description: 'Proportional to string length in Trie' },
  ],
  links: [
    // Merge Sort
    { source: 'merge-sort', target: 'divide-conquer', relation: 'uses', label: 'Uses technique' },
    { source: 'merge-sort', target: 'recursion', relation: 'uses', label: 'Implemented via' },
    { source: 'merge-sort', target: 'array', relation: 'uses', label: 'Operates on' },
    { source: 'merge-sort', target: 'comp-n-log-n', relation: 'has_complexity', label: 'Time complexity' },
    // Binary Search
    { source: 'binary-search', target: 'sorted-array', relation: 'requires', label: 'Requires sorted array' },
    { source: 'binary-search', target: 'divide-conquer', relation: 'uses', label: 'Uses paradigm' },
    { source: 'binary-search', target: 'comp-log-n', relation: 'has_complexity', label: 'Time complexity' },
    { source: 'binary-search', target: 'fibonacci-search', relation: 'related_to', label: 'Related algorithm' },
    { source: 'linear-search', target: 'binary-search', relation: 'prerequisite_of', label: 'Foundational for' },
    // Linear & Fibonacci Search
    { source: 'linear-search', target: 'array', relation: 'uses', label: 'Traverses' },
    { source: 'linear-search', target: 'comp-n', relation: 'has_complexity', label: 'Time complexity' },
    { source: 'fibonacci-search', target: 'sorted-array', relation: 'requires', label: 'Requires' },
    { source: 'fibonacci-search', target: 'comp-log-n', relation: 'has_complexity', label: 'Time complexity' },
    // Counting Sort
    { source: 'counting-sort', target: 'frequency-array', relation: 'uses', label: 'Constructs' },
    { source: 'counting-sort', target: 'prefix-sum', relation: 'uses', label: 'Calculates' },
    { source: 'counting-sort', target: 'comp-n-plus-k', relation: 'has_complexity', label: 'Time complexity' },
    // KMP
    { source: 'kmp', target: 'lps-array', relation: 'uses', label: 'Builds & queries' },
    { source: 'kmp', target: 'comp-n-plus-m', relation: 'has_complexity', label: 'Time complexity' },
    { source: 'kmp', target: 'pointers', relation: 'uses', label: 'Utilizes pointers' },
    // AVL Tree
    { source: 'avl', target: 'bst', relation: 'implements', label: 'Extends BST' },
    { source: 'avl', target: 'balance-factor', relation: 'uses', label: 'Monitors' },
    { source: 'avl', target: 'rotations', relation: 'uses', label: 'Restores balance via' },
    { source: 'avl', target: 'comp-log-n', relation: 'has_complexity', label: 'Guaranteed height' },
    // BFS / DFS
    { source: 'bfs', target: 'adjacency-list', relation: 'uses', label: 'Traverses via' },
    { source: 'bfs', target: 'graph-traversal', relation: 'implements', label: 'Level-order traversal' },
    { source: 'bfs', target: 'comp-v-plus-e', relation: 'has_complexity', label: 'Time complexity' },
    { source: 'dfs', target: 'adjacency-list', relation: 'uses', label: 'Traverses via' },
    { source: 'dfs', target: 'recursion', relation: 'uses', label: 'Recursive depth traversal' },
    { source: 'dfs', target: 'comp-v-plus-e', relation: 'has_complexity', label: 'Time complexity' },
    { source: 'bfs', target: 'dfs', relation: 'related_to', label: 'Complementary traversal' },
    // Dijkstra
    { source: 'dijkstra', target: 'greedy', relation: 'uses', label: 'Uses greedy strategy' },
    { source: 'dijkstra', target: 'priority-queue', relation: 'requires', label: 'Requires priority queue' },
    { source: 'dijkstra', target: 'min-heap', relation: 'uses', label: 'Implemented with' },
    { source: 'dijkstra', target: 'adjacency-list', relation: 'uses', label: 'Graph structure' },
    { source: 'dijkstra', target: 'comp-e-log-v', relation: 'has_complexity', label: 'Time complexity' },
    // Heap
    { source: 'min-heap', target: 'heap-invariant', relation: 'implements', label: 'Maintains min property' },
    { source: 'max-heap', target: 'heap-invariant', relation: 'implements', label: 'Maintains max property' },
    { source: 'min-heap', target: 'priority-queue', relation: 'implements', label: 'Concrete implementation' },
    { source: 'min-heap', target: 'comp-log-n', relation: 'has_complexity', label: 'Insert/extract time' },
    { source: 'max-heap', target: 'comp-log-n', relation: 'has_complexity', label: 'Insert/extract time' },
    { source: 'min-heap', target: 'max-heap', relation: 'related_to', label: 'Symmetric structure' },
    // Trie
    { source: 'trie', target: 'prefix-matching', relation: 'implements', label: 'Enables prefix search' },
    { source: 'trie', target: 'comp-l', relation: 'has_complexity', label: 'Lookup time O(L)' },
    { source: 'trie', target: 'recursion', relation: 'uses', label: 'Delete via recursion' },
    { source: 'trie', target: 'bst', relation: 'related_to', label: 'Tree-based structure' },
  ],
};

// ─────────────────────────────────────────────────────────
// NEO4J CYPHER SEEDING QUERIES
// ─────────────────────────────────────────────────────────
const SEED_CONSTRAINTS = `
  CREATE CONSTRAINT algo_id IF NOT EXISTS FOR (n:AlgoNode) REQUIRE n.id IS UNIQUE;
`;

function buildSeedCypher(): string {
  const nodeStatements = STATIC_GRAPH_DATA.nodes
    .map(
      (n) =>
        `MERGE (n:AlgoNode {id: '${n.id}'}) ` +
        `SET n.label = '${n.label.replace(/'/g, "\\'")}', ` +
        `n.type = '${n.type}', ` +
        `n.description = '${n.description.replace(/'/g, "\\'")}', ` +
        `n.algorithmId = ${n.algorithmId ? `'${n.algorithmId}'` : 'null'}`
    )
    .join(';\n');

  const linkStatements = STATIC_GRAPH_DATA.links
    .map(
      (l) =>
        `MATCH (a:AlgoNode {id: '${l.source}'}), (b:AlgoNode {id: '${l.target}'}) ` +
        `MERGE (a)-[:${l.relation.toUpperCase()} {label: '${l.label.replace(/'/g, "\\'")}'}]->(b)`
    )
    .join(';\n');

  return `${nodeStatements};\n${linkStatements}`;
}

// ─────────────────────────────────────────────────────────
// NEO4J SERVICE CLASS
// ─────────────────────────────────────────────────────────
class KnowledgeGraphService {
  private driver: Driver | null = null;
  private usingNeo4j = false;

  constructor() {
    this.initNeo4j();
  }

  private async initNeo4j(): Promise<void> {
    const uri = process.env.NEO4J_URI;
    const user = process.env.NEO4J_USERNAME;
    const password = process.env.NEO4J_PASSWORD;

    if (!uri || !user || !password || uri.includes('localhost')) {
      console.log('[Neo4j] Credentials not configured or local bolt unavailable. Using static fallback graph.');
      return;
    }

    try {
      this.driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
      await this.driver.verifyConnectivity();
      console.log('[Neo4j] ✓ Connected to Aura cloud instance. Seeding knowledge graph...');
      await this.seedDatabase();
      this.usingNeo4j = true;
      console.log('[Neo4j] ✓ Knowledge graph seeded with', STATIC_GRAPH_DATA.nodes.length, 'nodes and', STATIC_GRAPH_DATA.links.length, 'relationships.');
    } catch (err: any) {
      console.warn('[Neo4j] Connection failed, using static fallback:', err.message);
      this.driver = null;
    }
  }

  private async seedDatabase(): Promise<void> {
    if (!this.driver) return;
    const session: Session = this.driver.session();
    try {
      // Create uniqueness constraint
      await session.run(SEED_CONSTRAINTS).catch(() => {}); // ignore if already exists

      // Seed all nodes
      for (const n of STATIC_GRAPH_DATA.nodes) {
        await session.run(
          `MERGE (node:AlgoNode {id: $id})
           SET node.label = $label,
               node.type = $type,
               node.description = $description,
               node.algorithmId = $algorithmId`,
          {
            id: n.id,
            label: n.label,
            type: n.type,
            description: n.description,
            algorithmId: n.algorithmId || null,
          }
        );
      }

      // Seed all relationships
      for (const l of STATIC_GRAPH_DATA.links) {
        const relType = l.relation.toUpperCase().replace(/-/g, '_');
        await session.run(
          `MATCH (a:AlgoNode {id: $source}), (b:AlgoNode {id: $target})
           MERGE (a)-[r:${relType}]->(b)
           SET r.label = $label`,
          { source: l.source, target: l.target, label: l.label }
        );
      }
    } finally {
      await session.close();
    }
  }

  public async getFullGraph(): Promise<KnowledgeGraphData> {
    if (!this.usingNeo4j || !this.driver) {
      return STATIC_GRAPH_DATA;
    }

    const session: Session = this.driver.session();
    try {
      // Fetch all nodes
      const nodesResult = await session.run(
        `MATCH (n:AlgoNode) RETURN n.id as id, n.label as label, n.type as type,
         n.description as description, n.algorithmId as algorithmId`
      );
      const nodes: GraphNode[] = nodesResult.records.map((r) => ({
        id: r.get('id'),
        label: r.get('label'),
        type: r.get('type') as GraphNode['type'],
        description: r.get('description'),
        algorithmId: r.get('algorithmId') || undefined,
      }));

      // Fetch all relationships
      const relsResult = await session.run(
        `MATCH (a:AlgoNode)-[r]->(b:AlgoNode)
         RETURN a.id as source, b.id as target, type(r) as relType, r.label as label`
      );
      const links: GraphLink[] = relsResult.records.map((r) => ({
        source: r.get('source'),
        target: r.get('target'),
        relation: r.get('relType').toLowerCase().replace(/_/g, '-') as GraphLink['relation'],
        label: r.get('label'),
      }));

      return { nodes, links };
    } catch (err: any) {
      console.warn('[Neo4j] getFullGraph fallback:', err.message);
      return STATIC_GRAPH_DATA;
    } finally {
      await session.close();
    }
  }

  public async getRelatedForAlgorithm(algorithmId: string): Promise<{
    algorithm: GraphNode | undefined;
    connections: { node: GraphNode; relation: string; label: string }[];
  }> {
    if (!this.usingNeo4j || !this.driver) {
      // Static fallback
      const algorithmNode = STATIC_GRAPH_DATA.nodes.find(
        (n) => n.algorithmId === algorithmId || n.id === algorithmId
      );
      if (!algorithmNode) return { algorithm: undefined, connections: [] };
      const relevantLinks = STATIC_GRAPH_DATA.links.filter(
        (l) => l.source === algorithmNode.id || l.target === algorithmNode.id
      );
      const connections = relevantLinks.map((link) => {
        const otherId = link.source === algorithmNode.id ? link.target : link.source;
        const otherNode = STATIC_GRAPH_DATA.nodes.find((n) => n.id === otherId)!;
        return { node: otherNode, relation: link.relation, label: link.label };
      });
      return { algorithm: algorithmNode, connections };
    }

    const session: Session = this.driver.session();
    try {
      const nodeResult = await session.run(
        `MATCH (n:AlgoNode) WHERE n.id = $id OR n.algorithmId = $id
         RETURN n.id as id, n.label as label, n.type as type, n.description as description, n.algorithmId as algorithmId
         LIMIT 1`,
        { id: algorithmId }
      );
      if (nodeResult.records.length === 0) return { algorithm: undefined, connections: [] };
      const algorithmNode: GraphNode = {
        id: nodeResult.records[0].get('id'),
        label: nodeResult.records[0].get('label'),
        type: nodeResult.records[0].get('type'),
        description: nodeResult.records[0].get('description'),
        algorithmId: nodeResult.records[0].get('algorithmId') || undefined,
      };

      const relsResult = await session.run(
        `MATCH (a:AlgoNode {id: $id})-[r]-(b:AlgoNode)
         RETURN b.id as id, b.label as label, b.type as type, b.description as description,
                b.algorithmId as algorithmId, type(r) as relType, r.label as label`,
        { id: algorithmNode.id }
      );
      const connections = relsResult.records.map((r) => ({
        node: {
          id: r.get('id'),
          label: r.get('label'),
          type: r.get('type') as GraphNode['type'],
          description: r.get('description'),
          algorithmId: r.get('algorithmId') || undefined,
        },
        relation: r.get('relType').toLowerCase(),
        label: r.get('label'),
      }));

      return { algorithm: algorithmNode, connections };
    } catch (err: any) {
      console.warn('[Neo4j] getRelatedForAlgorithm fallback:', err.message);
      return { algorithm: undefined, connections: [] };
    } finally {
      await session.close();
    }
  }

  public async getUserPersonalizedGraph(userId: string): Promise<{
    nodes: GraphNode[];
    links: GraphLink[];
    userSummary: {
      userId: string;
      masteryPercentage: number;
      completedCount: number;
      inProgressCount: number;
      weakCount: number;
    };
    recommendations: {
      nextToLearn: string[];
      topicsToReview: string[];
    };
  }> {
    const baseGraph = await this.getFullGraph();
    const summary = await supabaseService.getUserLearningSummary(userId);

    // Map user progress onto nodes
    const personalizedNodes: GraphNode[] = baseGraph.nodes.map((node) => {
      let userStatus: GraphNode['userStatus'] = 'unvisited';
      let masteryScore = 0;
      let badge = 'Unvisited';

      const algoId = node.algorithmId || node.id;

      if (summary.completedAlgorithms.includes(algoId)) {
        userStatus = 'mastered';
        masteryScore = 100;
        badge = 'Mastered';
      } else if (summary.weakAlgorithms.includes(algoId)) {
        userStatus = 'needs_review';
        masteryScore = 35;
        badge = 'Needs Practice';
      } else if (summary.inProgressAlgorithms.includes(algoId)) {
        userStatus = 'in_progress';
        masteryScore = 60;
        badge = 'In Progress';
      }

      // Propagate concept mastery if connected algorithms are mastered
      if (node.type === 'concept' || node.type === 'technique' || node.type === 'data-structure') {
        const connectedAlgos = baseGraph.links
          .filter((l) => l.target === node.id || l.source === node.id)
          .map((l) => (l.target === node.id ? l.source : l.target));

        const masteredConnected = connectedAlgos.filter((id) =>
          summary.completedAlgorithms.includes(id)
        );

        if (masteredConnected.length > 0) {
          const ratio = masteredConnected.length / Math.max(1, connectedAlgos.length);
          masteryScore = Math.round(ratio * 100);
          if (masteryScore >= 70) {
            userStatus = 'mastered';
            badge = 'Concept Mastered';
          } else {
            userStatus = 'in_progress';
            badge = 'Partially Explored';
          }
        }
      }

      return {
        ...node,
        userStatus,
        masteryScore,
        badge,
        userHighlight: userStatus === 'mastered' || userStatus === 'needs_review',
      };
    });

    // Derive next recommended algorithms (unvisited algorithms whose prereqs are mastered)
    const nextToLearn: string[] = [];
    const allAlgos = [
      'merge-sort',
      'binary-search',
      'counting-sort',
      'kmp',
      'avl',
      'min-heap',
      'max-heap',
      'bfs',
      'dfs',
      'dijkstra',
      'trie',
    ];

    allAlgos.forEach((id) => {
      if (
        !summary.completedAlgorithms.includes(id) &&
        !summary.inProgressAlgorithms.includes(id)
      ) {
        nextToLearn.push(id);
      }
    });

    // Sync personalized user mastery subgraph to Neo4j if connected
    if (this.usingNeo4j && this.driver) {
      const session = this.driver.session();
      try {
        await session.run(
          `MERGE (u:User {id: $userId})
           SET u.masteryPercentage = $mastery, u.updatedAt = datetime()`,
          { userId, mastery: summary.masteryPercentage }
        );

        const activeUpdates = personalizedNodes
          .filter((n) => n.userStatus && n.userStatus !== 'unvisited')
          .map((n) => ({
            nodeId: n.id,
            status: n.userStatus,
            score: n.masteryScore,
          }));

        if (activeUpdates.length > 0) {
          await session.run(
            `MATCH (u:User {id: $userId})
             UNWIND $updates as up
             MATCH (a:AlgoNode {id: up.nodeId})
             MERGE (u)-[r:USER_MASTERY]->(a)
             SET r.status = up.status, r.score = up.score, r.updatedAt = datetime()`,
            { userId, updates: activeUpdates }
          );
        }
      } catch (err: any) {
        console.warn('[Neo4j] Sync user mastery graph warning:', err.message);
      } finally {
        await session.close();
      }
    }

    return {
      nodes: personalizedNodes,
      links: baseGraph.links,
      userSummary: {
        userId,
        masteryPercentage: summary.masteryPercentage,
        completedCount: summary.completedAlgorithms.length,
        inProgressCount: summary.inProgressAlgorithms.length,
        weakCount: summary.weakAlgorithms.length,
      },
      recommendations: {
        nextToLearn: nextToLearn.slice(0, 3),
        topicsToReview: summary.weakAlgorithms,
      },
    };
  }

  public async close(): Promise<void> {
    if (this.driver) {
      await this.driver.close();
    }
  }
}

export const knowledgeGraphService = new KnowledgeGraphService();
