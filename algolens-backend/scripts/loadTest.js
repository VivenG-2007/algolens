import autocannon from 'autocannon';

/**
 * AlgoLens Concurrency Load Testing Suite (100 Concurrent Connections)
 * Measures: req/sec, p50, p95, p99 latencies, and error rates.
 */
async function runLoadTests() {
  const targetHost = process.env.TARGET_URL || 'http://localhost:5000';

  console.log(`\n============================================================`);
  console.log(`     ALGOLENS 100 CONCURRENT USERS STRESS BENCHMARK        `);
  console.log(`============================================================`);
  console.log(`Target: ${targetHost}`);
  console.log(`Connections: 100 concurrent workers`);
  console.log(`Duration: 10 seconds per endpoint\n`);

  const tests = [
    {
      title: 'Health Check (GET /api/health)',
      url: `${targetHost}/api/health`,
      method: 'GET',
      headers: { 'x-load-test': 'algolens-benchmark' },
    },
    {
      title: 'Merge Sort Dynamic Execution (POST /api/algorithms/merge-sort/execute)',
      url: `${targetHost}/api/algorithms/merge-sort/execute`,
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-load-test': 'algolens-benchmark' },
      body: JSON.stringify({ input: [64, 25, 12, 22, 11, 90, 4, 38, 77, 19] }),
    },
    {
      title: 'Binary Search Dynamic Execution (POST /api/algorithms/binary-search/execute)',
      url: `${targetHost}/api/algorithms/binary-search/execute`,
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-load-test': 'algolens-benchmark' },
      body: JSON.stringify({ input: [10, 20, 30, 40, 50, 60, 70, 80], target: 60 }),
    },
    {
      title: 'KMP String Matching Dynamic Execution (POST /api/algorithms/kmp/execute)',
      url: `${targetHost}/api/algorithms/kmp/execute`,
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-load-test': 'algolens-benchmark' },
      body: JSON.stringify({ text: 'ABABDABACDABABCABAB', pattern: 'ABABCABAB' }),
    },
  ];

  for (const test of tests) {
    console.log(`--> Running Benchmark: ${test.title}...`);
    try {
      const result = await autocannon({
        url: test.url,
        method: test.method,
        headers: test.headers,
        body: test.body,
        connections: 100, // 100 concurrent users
        duration: 10,
        pipelining: 1,
      });

      console.log(`   Requests/sec: ${result.requests.average}`);
      console.log(`   Throughput: ${(result.throughput.average / 1024 / 1024).toFixed(2)} MB/s`);
      console.log(`   Latency:`);
      console.log(`     p50: ${result.latency.p50} ms`);
      console.log(`     p95: ${result.latency.p95} ms`);
      console.log(`     p99: ${result.latency.p99} ms`);
      console.log(`   Total 2xx Responses: ${result['2xx']}`);
      console.log(`   Non-2xx / Errors: ${result.non2xx + result.errors}\n`);
    } catch (err) {
      console.error(`Benchmark failed for ${test.title}:`, err.message);
    }
  }

  console.log(`Load testing completed.\n`);
}

runLoadTests();
