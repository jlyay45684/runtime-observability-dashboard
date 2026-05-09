const state = {
  metrics: {
    totalWorkflows: 142,
    successRate: 97.2,
    avgDurationSec: 88,
    activeAgents: 6,
  },
  workflowExecutions: [
    { workflow_id: 'wf_10a2', status: 'success', durationSec: 74, created_at: '2026-05-09T09:12:10Z' },
    { workflow_id: 'wf_10a3', status: 'running', durationSec: 38, created_at: '2026-05-09T09:13:22Z' },
    { workflow_id: 'wf_10a4', status: 'success', durationSec: 121, created_at: '2026-05-09T09:14:51Z' },
    { workflow_id: 'wf_10a5', status: 'degraded', durationSec: 167, created_at: '2026-05-09T09:15:09Z' },
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
const generatedAt = document.getElementById('generatedAt');

const metricDefs = [
  { key: 'totalWorkflows', label: 'total workflows', format: (v) => v.toString() },
  { key: 'successRate', label: 'success rate', format: (v) => `${v.toFixed(1)}%` },
  { key: 'avgDurationSec', label: 'avg duration', format: formatDuration },
  { key: 'activeAgents', label: 'active agents', format: (v) => v.toString() },
];

function formatDuration(totalSec) {
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}m ${String(sec).padStart(2, '0')}s`;
}

function stampNow() {
  generatedAt.textContent = `live ${new Date().toISOString()}`;
}

function renderMetrics() {
  metricsGrid.innerHTML = '';
  metricDefs.forEach(({ key, label, format }) => {
    const node = document.createElement('div');
    node.className = 'metric pulse-in';
    node.innerHTML = `<p>${label}</p><strong>${format(state.metrics[key])}</strong>`;
    metricsGrid.appendChild(node);
  });
}

function renderWorkflowTable() {
  workflowTable.innerHTML = '';
  state.workflowExecutions.forEach((row) => {
    const tr = document.createElement('tr');
    tr.className = 'row-enter';
    tr.innerHTML = `
      <td>${row.workflow_id}</td>
      <td><span class="status-pill ${row.status === 'success' ? 'ok' : row.status === 'running' ? 'info' : 'warn'}">${row.status}</span></td>
      <td>${formatDuration(row.durationSec)}</td>
      <td>${row.created_at}</td>
    `;
    workflowTable.appendChild(tr);
  });
}

function renderWorkflowDetail() {
  selectedWorkflow.textContent = state.workflowDetail.workflow_id;

  timeline.innerHTML = '';
  state.workflowDetail.timeline.forEach((entry, index) => {
    const li = document.createElement('li');
    li.textContent = entry;
    if (index === state.workflowDetail.timeline.length - 1) {
      li.className = 'timeline-active';
    }
    timeline.appendChild(li);
  });

  handoffTrace.innerHTML = '';
  state.workflowDetail.handoffs.forEach((entry) => {
    const li = document.createElement('li');
    li.textContent = entry;
    handoffTrace.appendChild(li);
  });

  runtimeLogs.textContent = JSON.stringify(state.workflowDetail.logs.slice(-12), null, 2);
}

function renderAgents() {
  agentPanel.innerHTML = '';
  state.agents.forEach((agent) => {
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
}

function tickLiveWorkflow() {
  const running = state.workflowExecutions.find((w) => w.status === 'running');

  if (running) {
    running.durationSec += 3;

    if (running.durationSec > 78 && Math.random() > 0.55) {
      running.status = Math.random() > 0.2 ? 'success' : 'degraded';
      state.metrics.totalWorkflows += 1;
      state.workflowDetail.logs.push({
        ts: new Date().toISOString(),
        level: running.status === 'success' ? 'INFO' : 'WARN',
        component: 'workflow-engine',
        event: 'workflow.completed',
        workflow_id: running.workflow_id,
        status: running.status,
      });

      const suffix = running.status === 'success' ? 'finalization.complete' : 'finalization.degraded';
      state.workflowDetail.timeline.push(`${new Date().toISOString().slice(11, 19)}Z · ${suffix}`);
    }
  } else if (Math.random() > 0.45) {
    const nextId = `wf_${(1000 + state.metrics.totalWorkflows).toString(16)}`;
    const now = new Date().toISOString();
    const newRun = { workflow_id: nextId, status: 'running', durationSec: 6, created_at: now };
    state.workflowExecutions.unshift(newRun);
    state.workflowExecutions = state.workflowExecutions.slice(0, 6);
    state.workflowDetail.workflow_id = newRun.workflow_id;
    state.workflowDetail.timeline = [`${now.slice(11, 19)}Z · ingestion.start`];
    state.workflowDetail.logs.push({
      ts: now,
      level: 'INFO',
      component: 'workflow-engine',
      event: 'workflow.started',
      workflow_id: nextId,
    });
  }
}

function tickMetrics() {
  const drift = () => (Math.random() > 0.5 ? 1 : -1);
  state.metrics.successRate = Math.max(95.2, Math.min(99.8, state.metrics.successRate + drift() * 0.1));
  state.metrics.avgDurationSec = Math.max(62, Math.min(210, state.metrics.avgDurationSec + drift() * 2));

  state.agents.forEach((agent) => {
    agent.queueDepth = Math.max(0, Math.min(14, agent.queueDepth + drift()));
    if (agent.queueDepth > 10) {
      agent.status = 'degraded';
    } else if (agent.queueDepth < 8) {
      agent.status = 'healthy';
    }
  });

  state.metrics.activeAgents = state.agents.filter((a) => a.status === 'healthy').length;
}

function appendRuntimeTelemetry() {
  const active = state.workflowExecutions.find((row) => row.status === 'running');
  if (!active) return;

  const logEvent = Math.random() > 0.8
    ? { event: 'tool.retry', level: 'WARN', component: 'retrieval-agent', backoff_ms: 220 }
    : { event: 'heartbeat', level: 'INFO', component: 'coordinator', tick: Date.now() % 10000 };

  state.workflowDetail.logs.push({
    ts: new Date().toISOString(),
    workflow_id: active.workflow_id,
    ...logEvent,
  });

  if (state.workflowDetail.timeline.length < 9 && Math.random() > 0.55) {
    const stages = ['planner.dispatch', 'retrieval.complete', 'synthesis.partial', 'compliance.pass'];
    state.workflowDetail.timeline.push(`${new Date().toISOString().slice(11, 19)}Z · ${stages[Math.floor(Math.random() * stages.length)]}`);
  }
}

function renderAll() {
  stampNow();
  renderMetrics();
  renderWorkflowTable();
  renderWorkflowDetail();
  renderAgents();
}

renderAll();
setInterval(() => {
  tickLiveWorkflow();
  tickMetrics();
  appendRuntimeTelemetry();
  renderAll();
}, 3000);
