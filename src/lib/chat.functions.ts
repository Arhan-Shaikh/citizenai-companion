import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import { CHAT_MODEL, createGateway } from "./ai-gateway.server";
import { personaForLanguage } from "./prompt-templates";

const MessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().max(20_000),
});

const ChatInput = z.object({
  messages: z.array(MessageSchema).min(1).max(40),
  language: z.string().max(10).default("en"),
});

export type ChatMessage = z.infer<typeof MessageSchema>;

export const askAssistant = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => ChatInput.parse(data))
  .handler(async ({ data }): Promise<{ reply: string }> => {
    const gateway = createGateway();
    const model = gateway(CHAT_MODEL);

    const system = personaForLanguage(data.language);
    const { text } = await generateText({
      model,
      system,
      messages: data.messages.map((m) => ({ role: m.role, content: m.content })),
    });
    return { reply: text.trim() };
  });
