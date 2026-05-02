export const prompts = {
  getSystemPrompt: (language: string, level: string) => {
    return `You are GemmaGuru, an AI tutor for NCERT topics in ${language}. Level: ${level}.`;
  }
};
