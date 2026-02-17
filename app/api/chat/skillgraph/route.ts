import { streamText, convertToModelMessages, type UIMessage } from "ai";
import { createVertex } from "@ai-sdk/google-vertex";
import * as fs from "fs";
import * as path from "path";

export const runtime = "nodejs";
export const maxDuration = 30;

// Load credentials from JSON file
function loadCredentials() {
  const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (credentialsPath) {
    try {
      const absolutePath = path.resolve(process.cwd(), credentialsPath);
      const content = fs.readFileSync(absolutePath, "utf-8");
      return JSON.parse(content);
    } catch (e) {
      console.error("Failed to load credentials from file:", e);
    }
  }
  return undefined;
}

// Initialize Vertex AI client with explicit credentials
const credentials = loadCredentials();
const vertex = createVertex({
  project: process.env.GOOGLE_VERTEX_PROJECT ?? "gitroll-dev",
  location: process.env.GOOGLE_VERTEX_LOCATION ?? "us-central1",
  googleAuthOptions: credentials
    ? {
        credentials: {
          client_email: credentials.client_email,
          private_key: credentials.private_key,
        },
        projectId: credentials.project_id,
      }
    : undefined,
});

export async function POST(req: Request) {
  try {
    const { messages, systemPrompt }: { messages: UIMessage[]; systemPrompt: string } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "messages array is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!systemPrompt || typeof systemPrompt !== "string") {
      return new Response(
        JSON.stringify({ error: "systemPrompt is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const result = streamText({
      model: vertex("gemini-2.5-flash-lite"),
      system: systemPrompt,
      messages: await convertToModelMessages(messages),
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to process chat request",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
