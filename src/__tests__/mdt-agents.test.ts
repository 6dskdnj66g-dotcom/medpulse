import { AGENT_A_PROMPT, AGENT_B_PROMPT, AGENT_C_PROMPT } from '../lib/mdt-agents';

describe('mdt-agents prompts', () => {
  it('AGENT_A_PROMPT is a non-empty string', () => {
    expect(typeof AGENT_A_PROMPT).toBe('string');
    expect(AGENT_A_PROMPT.trim().length).toBeGreaterThan(0);
  });

  it('AGENT_B_PROMPT is a non-empty string', () => {
    expect(typeof AGENT_B_PROMPT).toBe('string');
    expect(AGENT_B_PROMPT.trim().length).toBeGreaterThan(0);
  });

  it('AGENT_C_PROMPT is a non-empty string', () => {
    expect(typeof AGENT_C_PROMPT).toBe('string');
    expect(AGENT_C_PROMPT.trim().length).toBeGreaterThan(0);
  });

  it('AGENT_A_PROMPT identifies the agent as the Clinical Researcher', () => {
    expect(AGENT_A_PROMPT).toContain('Agent A');
    expect(AGENT_A_PROMPT).toContain('Clinical Researcher');
  });

  it('AGENT_B_PROMPT identifies the agent as the Skeptic/Reviewer', () => {
    expect(AGENT_B_PROMPT).toContain('Agent B');
    expect(AGENT_B_PROMPT).toContain('Skeptic');
  });

  it('AGENT_C_PROMPT identifies the agent as the Chief Medical Officer', () => {
    expect(AGENT_C_PROMPT).toContain('Agent C');
    expect(AGENT_C_PROMPT).toContain('Chief Medical Officer');
  });

  it('AGENT_A_PROMPT includes Evidence Level tagging instruction', () => {
    expect(AGENT_A_PROMPT).toContain('Evidence Level');
  });

  it('AGENT_C_PROMPT includes the consensus finalization phrase', () => {
    expect(AGENT_C_PROMPT).toContain('Flawless Medical Consensus');
  });

  it('all prompts include mandatory global medical sources', () => {
    const sources = 'UpToDate';
    expect(AGENT_A_PROMPT).toContain(sources);
    expect(AGENT_B_PROMPT).toContain(sources);
    expect(AGENT_C_PROMPT).toContain(sources);
  });

  it('AGENT_A_PROMPT instructs to output "Insufficient verified medical data" when evidence is missing', () => {
    expect(AGENT_A_PROMPT).toContain('Insufficient verified medical data');
  });

  it('AGENT_B_PROMPT instructs to concur when data is insufficient', () => {
    expect(AGENT_B_PROMPT).toContain('MDT Reviewer: Concur');
  });

  it('AGENT_C_PROMPT handles the insufficient data case with a CMO declaration', () => {
    expect(AGENT_C_PROMPT).toContain('As CMO');
    expect(AGENT_C_PROMPT).toContain('insufficient verified evidence');
  });
});
