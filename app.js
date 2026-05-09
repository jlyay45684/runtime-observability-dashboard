const runtimeData = {
  workflows: [
    {
      id: 'wf-1001',
      name: 'Customer Support Triage',
      status: 'running',
      startedAt: '2026-05-09T11:18:00Z',
      durationMs: 224000,
      timeline: [
        { agent: 'agent-planner', startPct: 0, widthPct: 28, label: 'plan' },
        { agent: 'agent-executor', startPct: 30, widthPct: 52, label: 'execute' },
        { agent: 'agent-validator', startPct: 84, widthPct: 12, label: 'validate' }
      ],
      logs: [
        { ts: '11:18:01.031', level: 'info', event: 'workflow.started', agent: 'planner', meta: { ticketId: 'T-1922' } },
        { ts: '11:18:33.310', level: 'warn', event: 'context.low_confidence', agent: 'executor', meta: { threshold: 0.62 } },
        { ts: '11:19:05.443', level: 'info', event: 'handoff.sent', agent: 'executor', meta: { to: 'validator' } }
      ],
      handoffs: [
        { from: 'planner', to: 'executor', reason: 'task graph ready' },
        { from: 'executor', to: 'validator', reason: 'candidate output complete' }
      ]
    },
    {
      id: 'wf-1002',
      name: 'Incident Root Cause Analysis',
      status: 'failed',
      startedAt: '2026-05-09T10:51:00Z',
      durationMs: 318000,
      timeline: [
        { agent: 'agent-planner', startPct: 0, widthPct: 20, label: 'scope' },
        { agent: 'agent-executor', startPct: 25, widthPct: 46, label: 'trace correlation' },
        { agent: 'agent-validator', startPct: 73, widthPct: 20, label: 'assertion check' }
      ],
      logs: [
        { ts: '10:54:13.100', level: 'info', event: 'workflow.started', agent: 'planner', meta: { env: 'staging' } },
        { ts: '10:56:22.300', level: 'error', event: 'query.timeout', agent: 'executor', meta: { timeoutMs: 10000 } },
        { ts: '10:56:23.024', level: 'warn', event: 'retry.scheduled', agent: 'executor', meta: { retryInMs: 2000 } }
      ],
      handoffs: [
        { from: 'planner', to: 'executor', reason: 'investigation prompt prepared' },
        { from: 'executor', to: 'planner', reason: 'insufficient signal; fallback path' }
      ]
    },
    {
      id: 'wf-1003',
      name: 'Release Safety Gate',
      status: 'success',
      startedAt: '2026-05-09T09:40:00Z',
      durationMs: 132000,
      timeline: [
        { agent: 'agent-planner', startPct: 0, widthPct: 22, label: 'checklist load' },
        { agent: 'agent-executor', startPct: 25, widthPct: 45, label: 'diff and rule eval' },
        { agent: 'agent-validator', startPct: 73, widthPct: 25, label: 'gate approval' }
      ],
      logs: [
        { ts: '09:40:02.821', level: 'info', event: 'workflow.started', agent: 'planner', meta: { release: 'v2.4.1' } },
        { ts: '09:41:01.111', level: 'info', event: 'check.passed', agent: 'executor', meta: { policies: 19 } },
        { ts: '09:42:10.005', level: 'info', event: 'workflow.completed', agent: 'validator', meta: { verdict: 'approved' } }
      ],
      handoffs: [
        { from: 'planner', to: 'executor', reason: 'policy bundle parsed' },
        { from: 'executor', to: 'validator', reason: 'all checks green' }
      ]
    }
  ]
};

const workflowList = document.getElementById('workflowList');
const statusFilter = document.getElementById('statusFilter');
const statusLegend = document.getElementById('statusLegend');
const timeline = document.getElementById('timeline');
const timelineMeta = document.getElementById('timelineMeta');
const logViewer = document.getElementById('logViewer');
const handoffTrace = document.getElementById('handoffTrace');
const drawer = document.getElementById('workflowDrawer');
const drawerClose = document.getElementById('drawerClose');
const drawerTitle = document.getElementById('drawerTitle');
const drawerBody = document.getElementById('drawerBody');

let activeWorkflow = runtimeData.workflows[0];

function statusBadge(status) {
  return `<span class="badge ${status}">${status.toUpperCase()}</span>`;
}

function renderStatusControls() {
  const statuses = [...new Set(runtimeData.workflows.map((w) => w.status))];
  statuses.forEach((status) => {
    const option = document.createElement('option');
    option.value = status;
    option.textContent = status;
    statusFilter.appendChild(option);
  });
  statusLegend.innerHTML = statuses.map(statusBadge).join('');
}

function renderWorkflows() {
  const filter = statusFilter.value;
  const rows = runtimeData.workflows.filter((w) => filter === 'all' || w.status === filter);
  workflowList.innerHTML = rows.map((w) => `
    <li class="workflow-item" data-id="${w.id}">
      <strong>${w.name}</strong><br />
      ${statusBadge(w.status)}
      <span class="subtle"> · ${Math.round(w.durationMs / 1000)}s</span>
    </li>
  `).join('');

  workflowList.querySelectorAll('.workflow-item').forEach((node) => {
    node.addEventListener('click', () => {
      activeWorkflow = runtimeData.workflows.find((w) => w.id === node.dataset.id);
      renderActiveWorkflow();
      openDrawer(activeWorkflow);
    });
  });
}

function renderActiveWorkflow() {
  timelineMeta.textContent = `${activeWorkflow.id} · ${activeWorkflow.startedAt}`;
  timeline.innerHTML = `
    <div class="timeline-row">
      <span>${activeWorkflow.name}</span>
      <div class="track">
        ${activeWorkflow.timeline.map((step) => `
          <div class="bar ${step.agent}" style="left:${step.startPct}%;width:${step.widthPct}%" title="${step.label}"></div>
        `).join('')}
      </div>
    </div>
  `;

  logViewer.innerHTML = activeWorkflow.logs.map((log) => `
    <div class="log-entry level-${log.level}">
      ${log.ts} ${log.level.toUpperCase()} ${log.event}
      <div>${JSON.stringify({ agent: log.agent, ...log.meta })}</div>
    </div>
  `).join('');

  handoffTrace.innerHTML = activeWorkflow.handoffs.map((h, i) => `
    <div class="handoff-node">
      <strong>${i + 1}. ${h.from} → ${h.to}</strong>
      <div class="subtle">${h.reason}</div>
    </div>
  `).join('');
}

function openDrawer(workflow) {
  drawer.classList.add('open');
  drawer.setAttribute('aria-hidden', 'false');
  drawerTitle.textContent = `${workflow.name} (${workflow.id})`;
  drawerBody.innerHTML = `<pre>${JSON.stringify(workflow, null, 2)}</pre>`;
}

function closeDrawer() {
  drawer.classList.remove('open');
  drawer.setAttribute('aria-hidden', 'true');
}

statusFilter.addEventListener('change', renderWorkflows);
drawerClose.addEventListener('click', closeDrawer);
drawer.addEventListener('click', (event) => {
  if (event.target === drawer) closeDrawer();
});

renderStatusControls();
renderWorkflows();
renderActiveWorkflow();
