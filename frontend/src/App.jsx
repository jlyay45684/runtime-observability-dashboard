const mockMetrics = [
  { label: 'Requests/min', value: '2,481', delta: '+6.3%' },
  { label: 'Avg Latency', value: '184ms', delta: '-12ms' },
  { label: 'Error Rate', value: '1.2%', delta: '-0.2%' },
  { label: 'Active Agents', value: '37', delta: '+4' },
]

const mockAgents = [
  { name: 'agent-alpha', status: 'Healthy', tasks: 58 },
  { name: 'agent-beta', status: 'Degraded', tasks: 41 },
  { name: 'agent-gamma', status: 'Healthy', tasks: 63 },
  { name: 'agent-delta', status: 'Offline', tasks: 0 },
]

const mockExecutions = [
  { id: 'wf-9012', workflow: 'Session Replay', agent: 'agent-alpha', duration: '1m 12s', status: 'Completed' },
  { id: 'wf-9013', workflow: 'Trace Aggregation', agent: 'agent-beta', duration: '2m 08s', status: 'Running' },
  { id: 'wf-9014', workflow: 'Error Triage', agent: 'agent-gamma', duration: '53s', status: 'Completed' },
  { id: 'wf-9015', workflow: 'Anomaly Scan', agent: 'agent-delta', duration: '—', status: 'Failed' },
]

const mockTimeline = [
  { time: '10:02', event: 'Workflow wf-9012 completed' },
  { time: '10:01', event: 'Latency spike detected in us-east-1' },
  { time: '09:58', event: 'Agent beta moved to degraded' },
  { time: '09:54', event: 'Workflow wf-9013 started' },
]

export default function App() {
  return (
    <main className="dashboard">
      <header>
        <h1>Runtime Observability Dashboard</h1>
        <p>Live operational view of workflow and agent health.</p>
      </header>

      <section className="grid metrics">
        {mockMetrics.map((metric) => (
          <article key={metric.label} className="card">
            <h3>{metric.label}</h3>
            <p className="value">{metric.value}</p>
            <small>{metric.delta}</small>
          </article>
        ))}
      </section>

      <section className="grid main">
        <article className="card table-wrap">
          <h2>Workflow Executions</h2>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Workflow</th>
                <th>Agent</th>
                <th>Duration</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {mockExecutions.map((execution) => (
                <tr key={execution.id}>
                  <td>{execution.id}</td>
                  <td>{execution.workflow}</td>
                  <td>{execution.agent}</td>
                  <td>{execution.duration}</td>
                  <td>{execution.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>

        <aside className="card">
          <h2>Agent Status</h2>
          <ul className="agent-list">
            {mockAgents.map((agent) => (
              <li key={agent.name}>
                <strong>{agent.name}</strong>
                <span>{agent.status}</span>
                <small>{agent.tasks} tasks</small>
              </li>
            ))}
          </ul>
        </aside>
      </section>

      <section className="card">
        <h2>Execution Timeline</h2>
        <ul className="timeline">
          {mockTimeline.map((item) => (
            <li key={`${item.time}-${item.event}`}>
              <strong>{item.time}</strong>
              <span>{item.event}</span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}
