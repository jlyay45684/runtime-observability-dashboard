const mockData = {
  metrics: {
    totalWorkflows: 142,
    successRate: '97.2%',
    avgDuration: '1m 28s',
    activeAgents: 6,
  },
  workflowExecutions: [
    { workflow_id: 'wf_10a2', status: 'success', duration: '1m 14s', created_at: '2026-05-09T09:12:10Z' },
    { workflow_id: 'wf_10a3', status: 'running', duration: '38s', created_at: '2026-05-09T09:13:22Z' },
    { workflow_id: 'wf_10a4', status: 'success', duration: '2m 01s', created_at: '2026-05-09T09:14:51Z' },
    { workflow_id: 'wf_10a5', status: 'degraded', duration: '2m 47s', created_at: '2026-05-09T09:15:09Z' },
  ],
  workflowDetail: {
    workflow_id: 'wf_10a5',
    timeline: [
      '09:15:09Z · ingestion.start',
      '09:15:21Z · planner.dispatch',
      '09:16:02Z · retrieval.complete',
      '09:16:58Z · synthesis.partial',
      '09:17:56Z · finalization.complete',
    ],
    handoffs: [
      'coordinator -> retrieval-agent',
      'retrieval-agent -> synthesis-agent',
      'synthesis-agent -> compliance-agent',
      'compliance-agent -> coordinator',
    ],
    logs: [
      { ts: '2026-05-09T09:15:09.532Z', level: 'INFO', component: 'workflow-engine', event: 'workflow.started', workflow_id: 'wf_10a5' },
      { ts: '2026-05-09T09:16:14.983Z', level: 'WARN', component: 'retrieval-agent', event: 'latency.spike', p95_ms: 1420 },
      { ts: '2026-05-09T09:17:56.113Z', level: 'INFO', component: 'workflow-engine', event: 'workflow.completed', status: 'degraded' },
    ],
  },
  agents: [
    { name: 'coordinator', status: 'healthy', queueDepth: 3 },
    { name: 'retrieval-agent', status: 'healthy', queueDepth: 7 },
    { name: 'synthesis-agent', status: 'healthy', queueDepth: 4 },
    { name: 'compliance-agent', status: 'degraded', queueDepth: 9 },
  ],
};

const metricsGrid = document.getElementById('metricsGrid');
const workflowTable = document.getElementById('workflowTable');
const timeline = document.getElementById('timeline');
const handoffTrace = document.getElementById('handoffTrace');
const runtimeLogs = document.getElementById('runtimeLogs');
const selectedWorkflow = document.getElementById('selectedWorkflow');
const agentPanel = document.getElementById('agentPanel');

document.getElementById('generatedAt').textContent = `snapshot ${new Date().toISOString()}`;

[
  ['total workflows', mockData.metrics.totalWorkflows],
  ['success rate', mockData.metrics.successRate],
  ['avg duration', mockData.metrics.avgDuration],
  ['active agents', mockData.metrics.activeAgents],
].forEach(([label, value]) => {
  const node = document.createElement('div');
  node.className = 'metric';
  node.innerHTML = `<p>${label}</p><strong>${value}</strong>`;
  metricsGrid.appendChild(node);
});

mockData.workflowExecutions.forEach((row) => {
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td>${row.workflow_id}</td>
    <td>${row.status}</td>
    <td>${row.duration}</td>
    <td>${row.created_at}</td>
  `;
  workflowTable.appendChild(tr);
});

selectedWorkflow.textContent = mockData.workflowDetail.workflow_id;
mockData.workflowDetail.timeline.forEach((entry) => {
  const li = document.createElement('li');
  li.textContent = entry;
  timeline.appendChild(li);
});
mockData.workflowDetail.handoffs.forEach((entry) => {
  const li = document.createElement('li');
  li.textContent = entry;
  handoffTrace.appendChild(li);
});
runtimeLogs.textContent = JSON.stringify(mockData.workflowDetail.logs, null, 2);

mockData.agents.forEach((agent) => {
  const row = document.createElement('div');
  const pillClass = agent.status === 'healthy' ? 'ok' : 'warn';
  row.className = 'agent-row';
  row.innerHTML = `
    <div>
      <strong>${agent.name}</strong>
      <p>queue depth: ${agent.queueDepth}</p>
    </div>
    <span class="status-pill ${pillClass}">${agent.status}</span>
  `;
  agentPanel.appendChild(row);
});
