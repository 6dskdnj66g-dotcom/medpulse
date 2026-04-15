import { AGENT_A_PROMPT, AGENT_B_PROMPT, AGENT_C_PROMPT } from '../lib/mdt-prompts';

describe('mdt-prompts', () => {
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

  it('AGENT_A_PROMPT identifies the agent as Clinical Researcher', () => {
    expect(AGENT_A_PROMPT).toContain('Agent A');
    expect(AGENT_A_PROMPT).toContain('Clinical Researcher');
  });

  it('AGENT_B_PROMPT identifies the agent as MDT Reviewer/Skeptic', () => {
    expect(AGENT_B_PROMPT).toContain('Agent B');
    expect(AGENT_B_PROMPT).toContain('Skeptic');
  });

  it('AGENT_C_PROMPT identifies the agent as Chief Medical Officer', () => {
    expect(AGENT_C_PROMPT).toContain('Agent C');
    expect(AGENT_C_PROMPT).toContain('Chief Medical Officer');
  });

  it('AGENT_A_PROMPT requires USMLE/Cochrane standards', () => {
    expect(AGENT_A_PROMPT).toContain('USMLE');
    expect(AGENT_A_PROMPT).toContain('Cochrane');
  });

  it('AGENT_A_PROMPT requires Evidence Level tagging on each claim', () => {
    expect(AGENT_A_PROMPT).toContain('Evidence Level');
  });

  it('AGENT_A_PROMPT includes the [RETRIEVED CONTEXT] placeholder', () => {
    expect(AGENT_A_PROMPT).toContain('[RETRIEVED CONTEXT]');
  });

  it('AGENT_B_PROMPT includes [AGENT A\'S FINDINGS] placeholder', () => {
    expect(AGENT_B_PROMPT).toContain("[AGENT A'S FINDINGS]");
  });

  it('AGENT_C_PROMPT requires [Final Consensus: Verified] at the bottom', () => {
    expect(AGENT_C_PROMPT).toContain('[Final Consensus: Verified]');
  });

  it('all prompts include mandatory global medical sources', () => {
    const commonSource = 'UpToDate';
    expect(AGENT_A_PROMPT).toContain(commonSource);
    expect(AGENT_B_PROMPT).toContain(commonSource);
    expect(AGENT_C_PROMPT).toContain(commonSource);
  });

  it('AGENT_B_PROMPT instructs to look for drug-drug interactions', () => {
    expect(AGENT_B_PROMPT).toContain('drug-drug interactions');
  });

  it('AGENT_C_PROMPT instructs to explicitly cite sources used', () => {
    expect(AGENT_C_PROMPT).toContain('citing the specific global sources');
  });

  it('AGENT_A_PROMPT states "Data not found in verified corpus" when context is missing', () => {
    expect(AGENT_A_PROMPT).toContain('Data not found in verified corpus');
  });
});
