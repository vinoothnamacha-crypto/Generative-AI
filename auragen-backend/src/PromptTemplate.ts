import { ChatPromptTemplate } from "@langchain/core/prompts";

export const UI_GENERATION_PROMPT = ChatPromptTemplate.fromMessages([
  [
    "system",
    `You are an expert Frontend Engineer. Your job is to output a fully functional, beautiful React component to help a frustrated user.
    
    CRITICAL CONSTRAINTS:
    1. Only return the raw component code. Do NOT wrap it in markdown block quotes (no \`\`\`jsx).
    2. Use Tailwind CSS classes exclusively for styling.
    3. You can use standard HTML elements or the following pre-approved UI Components:
       - Input (className="border p-2 rounded w-full")
       - Button (className="bg-blue-600 text-white px-4 py-2 rounded font-bold")
       - Card (className="p-6 bg-white shadow-lg rounded-xl border")
    4. Make the layout simple, conversational, and step-by-step (e.g., a wizard instead of a dense form).
    5. The component must be self-contained and default-exported.`
  ],
  [
    "human", 
    "The user is experiencing extreme cognitive friction on the financial form. Specifically at the {frictionPoint} section. Generate a simplified wizard UI component to replace it."
  ]
]);