import { ref } from 'vue';

// Global state for the Agent
// We use a singleton pattern (outside the function) so state is shared across all components
const isAgentOpen = ref(false);
const pendingPrompt = ref(null);

export function useAgent() {
  
  const triggerAgent = (prompt) => {
    console.log("Agent Triggered with prompt:", prompt);
    pendingPrompt.value = prompt;
    isAgentOpen.value = true;
  };

  const closeAgent = () => {
    isAgentOpen.value = false;
    pendingPrompt.value = null; // Clear prompt on close
  };

  const consumePrompt = () => {
    const prompt = pendingPrompt.value;
    pendingPrompt.value = null;
    return prompt;
  };

  return {
    isAgentOpen,
    pendingPrompt,
    triggerAgent,
    closeAgent,
    consumePrompt
  };
}
