import { OpenAI } from "openai";
import {
  Agent,
  OpenAIChatCompletionsModel,
  run,
  setDefaultOpenAIClient,
  tool,
  handoff,
  RunContext,
  type InputGuardrail,
  InputGuardrailTripwireTriggered,
} from "@openai/agents";
import { z } from "zod";

// Instantiate the OpenAI client.
// We conditionally set the API key and Base URL to allow usage of OpenAI-compatible local APIs
// (e.g., Ollama, LM Studio) during development. In production, it defaults to standard OpenAI settings.
const client = new OpenAI({
  apiKey:
    process.env.NODE_ENV === "development" ? process.env.LLM_KEY : undefined,
  baseURL:
    process.env.NODE_ENV === "development" ? process.env.LLM_URL! : undefined,
});

// Register the custom client as the default for the agent framework.
// This ensures all agents created subsequently utilize this specific client instance.
setDefaultOpenAIClient(client);

// Define the Model configuration.
// The Agents SDK typically uses the OpenAI Responses API. However, for local development
// (or non-OpenAI providers), we wrap the client in `OpenAIChatCompletionsModel`.
// This acts as an adapter to ensure compatibility with standard Chat Completion endpoints.
const model =
  process.env.NODE_ENV === "development"
    ? new OpenAIChatCompletionsModel(client, process.env.LLM_MODEL!)
    : process.env.LLM_MODEL!;

// --- Handoffs with three Agents + Guardrail ---

// Define the schema for data passed during escalation handoffs
const EscalationData = z.object({ reason: z.string() });
type EscalationDataType = z.infer<typeof EscalationData>;

// 1. Guardrail Agent (The Logic)
// This agent acts like a "Topic Checker." Its only job is to look at what the user said
// and decide: "Is this actually about pillows?"
const guardrailAgent = new Agent({
  name: "Guardrail check",
  instructions:
    "We sell pillows. If the input is remotely about pillows return isNotAboutPillows: false, otherwise return true.",
  model,
  outputType: z.object({
    isNotAboutPillows: z.boolean(),
    reasoning: z.string(),
  }),
});

// 2. The Guardrail (The Enforcer)
// This wraps the agent above. If the agent says "Not about pillows" (tripwireTriggered: true),
// this Guardrail will block the request and throw a specific error, stopping the workflow.
const pillowGuardrails: InputGuardrail = {
  name: "Pillow Customer Support Guardrail",
  execute: async ({ input, context }) => {
    const result = await run(guardrailAgent, input, { context });
    return {
      outputInfo: result.finalOutput,
      tripwireTriggered: result.finalOutput?.isNotAboutPillows ?? false,
    };
  },
};

// 3. Customer Support Agent (Standard)
const customerSupportAgent = new Agent({
  name: "Customer Support Agent",
  instructions: `You are a customer support agent in a company that sells very fluffy pillows. 
  Be friendly, helpful. and concise.`,
  model,
});

// 4. Escalation Control Agent (Negative Sentiment)
const escalationControlAgent = new Agent({
  name: "Escalation Control Agent",
  instructions: `You are an escalation control agent that handles negative customer interactions. 
            If the customer is upset, you will apologize and offer to escalate the issue to a manager.
            Be friendly, helpful, reassuring and concise.`,
  model,
});

// 5. Triage Agent (The Router)
// This is the "Receptionist." It listens to the user first.
// - First, it runs the 'pillowGuardrails' to ensure the topic is valid.
// - Then, it decides who should handle the request (Support vs. Escalation) based on the user's tone.
const triageAgent = Agent.create({
  name: "Triage Agent",
  instructions: `
        If the question is about pillows, route it to the customer support agent. 
        If the customer's tone is negative, route it to the escalation control agent.
        `,
  model,
  inputGuardrails: [pillowGuardrails],
  handoffs: [
    customerSupportAgent,
    handoff(escalationControlAgent, {
      inputType: EscalationData,
      // onHandoff callback allows us to perform side effects (like logging or db writes)
      // when control is transferred to this agent. In this case we simply console.log().
      onHandoff: async (
        ctx: RunContext<EscalationDataType>,
        input: EscalationDataType | undefined
      ) => {
        console.log(`Handoff to Escalation Control Agent: ${input?.reason}`);
      },
    }),
  ],
});

// Example usage:
// const result = await run(triageAgent, "Is my pillow fluffy enough?"); // Standard flow
// const result = await run(triageAgent, "My pillow is terrible!"); // Escalation flow
// const result = await run(triageAgent, "What is the capital of France?"); // Guardrail trip

// Execute the workflow wrapped in a try/catch block.
// This is necessary to gracefully handle the 'InputGuardrailTripwireTriggered' error
// if the input violates the defined guardrails.
try {
  // Run the agent with a specific task
  const result = await run(
    triageAgent,
    "My pillow is terrible! I'm very upset about that!"
  );
  // Log the final output of the agent
  console.log(result.finalOutput);
} catch (error: unknown) {
  if (error instanceof InputGuardrailTripwireTriggered) {
    console.log(
      "Customer is not asking about pillows, or the input is not valid for the guardrail."
    );
  } else {
    console.error("An error occurred:", error);
  }
}

// --- Single Agent with Tool-Calling Example (Commented Out) ---

// // Define a tool schema and execution logic
// const pokemonTool = tool({
//   name: "pokemon_info",
//   description: "Get information about a Pokémon by name or ID",
//   parameters: z.object({
//     pokemon: z.string().describe("The name or ID of the Pokémon to look up"),
//   }),
//   execute: async ({ pokemon }) => {
//     console.log(`Looking up Pokémon: ${pokemon}`);
//     return `${pokemon} is a Pokémon. I'll provide more details from my own knowledge.`;
//   },
// });

// // Create an Orchestrator Agent that has access to the tool
// const agent = new Agent({
//   name: "Orchestrator Agent",
//   instructions: `
// - You have ONE tool: pokemon_info. Use it ONLY if the user asks about a Pokémon.
// - For tacos: DO NOT use any tools. Answer with exactly a 3-line haiku (5-7-5).
// - For other topics: reply briefly, no tools.
// - Never invent tools. Only pokemon_info exists.
// `,
//   model,
//   tools: [pokemonTool],
// });

// // Run the agent
// const result = await run(agent, "What is Pikachu?");

// // Log result
// console.log(result.finalOutput);
