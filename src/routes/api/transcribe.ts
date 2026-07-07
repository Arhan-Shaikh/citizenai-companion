import { createFileRoute } from "@tanstack/react-router";
import { STT_MODEL, requireApiKey } from "@/lib/ai-gateway.server";

export const Route = createFileRoute("/api/transcribe")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const key = requireApiKey();
          const inbound = await request.formData();
          const file = inbound.get("file");
          if (!(file instanceof File)) {
            return new Response("file is required", { status: 400 });
          }
          if (file.size < 1024) {
            return new Response("Recording too short", { status: 400 });
          }
          if (file.size > 20 * 1024 * 1024) {
            return new Response("Recording too large", { status: 413 });
          }

          const upstream = new FormData();
          upstream.append("model", STT_MODEL);
          upstream.append("file", file, file.name || "recording.wav");

          const res = await fetch("https://ai.gateway.lovable.dev/v1/audio/transcriptions", {
            method: "POST",
            headers: { Authorization: `Bearer ${key}` },
            body: upstream,
          });
          if (!res.ok) {
            const errText = await res.text().catch(() => "");
            return new Response(errText || "Transcription failed", { status: res.status });
          }
          const json = (await res.json()) as { text?: string };
          return Response.json({ text: json.text ?? "" });
        } catch (err) {
          const message = err instanceof Error ? err.message : "Unexpected error";
          return new Response(message, { status: 500 });
        }
      },
    },
  },
});
