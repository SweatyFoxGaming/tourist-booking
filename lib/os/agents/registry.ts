import type { AgentDefinition } from "@/lib/os/agents/types";

const agents = new Map<string, AgentDefinition>();

export function registerAgent(agent: AgentDefinition): void {
  agents.set(agent.id, agent);
}

export function getAgent(id: string): AgentDefinition | undefined {
  return agents.get(id);
}

export function listAgents(): AgentDefinition[] {
  return [...agents.values()];
}

export function requireAgent(id: string): AgentDefinition {
  const agent = getAgent(id);
  if (!agent) {
    throw new Error(`Agent not registered: ${id}`);
  }
  return agent;
}
