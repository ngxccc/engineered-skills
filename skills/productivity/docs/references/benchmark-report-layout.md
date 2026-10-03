# Benchmark & Performance Report Specifications

Location: `docs/benchmarks/<slug>.md` (e.g., `docs/benchmarks/shows-seats-baseline-no-redis.md`).

## Purpose

Document quantitative performance baselines, stress test saturation thresholds, and optimization deltas (Before/After) for critical endpoints, database queries, and background jobs.

---

## Benchmark Report Template (Audit-Ready)

Must contain Level 1 Heading, Metadata block, and exact required sections:

```md
# Baseline Performance Report: <Target Component / Endpoint>

**Status**: Baseline Completed | Regression Failed | Optimization Verified | Draft  
**Target**: <Route or Service Method, e.g. GET /api/v1/shows/:id/seats>  
**Date**: YYYY-MM-DD  
**Author**: <Engineering Team / Author>

---

## 1. Executive Summary

- **Gate Decision**: PASS | FAIL | BLOCKED (against production SLA/SLO).
- **Core Findings**: 2-3 sentences summarizing peak throughput, tail latency (p95/p99), and primary bottleneck.
- **Architectural Imperative**: Concrete recommendation based on quantitative findings.

---

## 2. System Under Test & Environment

- **Runtime & Host**: CPU specs, RAM, OS, Node.js / Bun runtime version.
- **Database Topology**: Instance type, PostgreSQL version, connection pool limits (`max`, `connectionTimeoutMillis`).
- **Cache & Queue**: Redis version, eviction policy, network latency (RTT).

---

## 3. Workload Profile & Scenarios

Describe the workload model and execution phases:

1. **Ramping Stress Test**: Incremental Virtual Users (VUs) to discover the saturation knee point.
2. **Flash Crowd / Spike Test**: Instantaneous burst concurrency (hot-item / flash-sale pattern).
3. **Constant Throughput**: Steady arrival rate (RPS) to measure equilibrium p50, p95, p99.
4. **Endurance / Soak Test** (Optional): Extended execution to identify memory or connection leaks.

---

## 4. Key Performance Indicators

Must include statistical distributions (never arithmetic mean alone):

### Micro-benchmark (In-Process / Service Layer)

| Scenario / Scope     | Iterations | Min (ms) | Mean (ms) | p50 (ms) | p95 (ms) | p99 (ms) | Throughput (ops/sec) |
| :------------------- | :--------- | :------- | :-------- | :------- | :------- | :------- | :------------------- |
| **Standard Dataset** | 50         | 120.00   | 180.00    | 160.00   | 280.00   | 600.00   | 5                    |

### E2E HTTP Load Test (k6 / API Gateway Layer)

| Metric                      | Measured Baseline | Production SLA | Compliance |
| :-------------------------- | :---------------- | :------------- | :--------- |
| **Total Requests**          | 1,000             | -              | -          |
| **Success Rate (2xx)**      | 46.5%             | > 99.9%        | ❌ FAIL    |
| **Server Error Rate (5xx)** | 53.5%             | 0.0%           | ❌ FAIL    |
| **Median Latency (p50)**    | 5,391 ms          | < 100 ms       | ❌ FAIL    |
| **Tail Latency (p95)**      | 6,830 ms          | < 300 ms       | ❌ FAIL    |
| **Tail Latency (p99)**      | 10,705 ms         | < 500 ms       | ❌ FAIL    |
| **Max Response Time**       | 16,751 ms         | < 1,000 ms     | ❌ FAIL    |

---

## 5. Bottleneck & Saturation Analysis

Apply SRE diagnostic frameworks:

- **RED Method**: Rate (incoming RPS), Errors (4xx/5xx breakdown), Duration (latency inflation).
- **USE Method**:
  - **Utilization**: % active connections, CPU/RAM utilization.
  - **Saturation**: Connection pool queue backlog, event loop lag.
  - **Errors**: Dropped connections, timeout terminations.
- **Saturation Knee Point**: The specific VU/RPS threshold where response time shifts from linear to exponential.

---

## 6. Recommendations & Comparison Matrix

Quantify the expected or verified optimization delta (Before vs After):

| KPI                  | Baseline (Current) | Target / Optimized | Delta (Improvement) | Status    |
| :------------------- | :----------------- | :----------------- | :------------------ | :-------- |
| **Peak Throughput**  | 9.8 req/s          | $\ge 500$ req/s    | $> 50\times$        | 🎯 Target |
| **p50 Latency**      | 5,391 ms           | $\le 5$ ms         | $> 1,000\times$     | 🎯 Target |
| **p95 Latency**      | 6,830 ms           | $\le 15$ ms        | $> 450\times$       | 🎯 Target |
| **Error Rate (5xx)** | 53.5%              | 0.0%               | Tripled to Zero     | 🎯 Target |
| **DB Query Load**    | 100%               | $\le 2\%$          | $-98\%$             | 🎯 Target |
```
