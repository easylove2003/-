import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import cors from "cors";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Add robust JSON parsing with a higher limit for deep reasoning outputs if necessary
  app.use(express.json({ limit: "50mb" }));
  
  // CORS configuration for global access
  app.use(cors({ origin: "*" }));

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Report API endpoints
  const REPORTS_FILE = path.join(process.cwd(), "reports.json");
  const fs = await import("fs/promises");

  async function getReportsData() {
    try {
      const data = await fs.readFile(REPORTS_FILE, "utf-8");
      return JSON.parse(data);
    } catch {
      return {};
    }
  }

  // ── Tiny in-memory mutex for reports.json ──────────────────────
  // Serializes read-modify-write so concurrent /api/report/save calls
  // don't clobber each other. Errors don't break the chain.
  let reportsWriteQueue: Promise<void> = Promise.resolve();
  function withReportsLock<T>(task: () => Promise<T>): Promise<T> {
    const next = reportsWriteQueue.then(task, task);
    reportsWriteQueue = next.then(() => undefined, () => undefined);
    return next;
  }

  app.post("/api/report/save", async (req, res) => {
    try {
      const { reportId, content } = req.body;
      if (!reportId || !content) {
        return res.status(400).json({ error: "Missing reportId or content" });
      }

      await withReportsLock(async () => {
        const reports = await getReportsData();
        reports[reportId] = {
          id: reportId,
          content,
          createdAt: new Date().toISOString()
        };
        await fs.writeFile(REPORTS_FILE, JSON.stringify(reports));
      });

      res.json({ success: true, shareUrl: `/shared/${reportId}` });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to save report" });
    }
  });

  app.get("/api/report/get/:id", async (req, res) => {
    try {
      const reports = await getReportsData();
      const report = reports[req.params.id];
      if (!report) {
         return res.status(404).json({ error: "Report not found" });
      }
      res.json(report);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch report" });
    }
  });

  app.post("/api/chat", async (req, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    try {
      const { contents, systemInstruction } = req.body;
      const clientApiKey = req.headers.authorization?.replace("Bearer ", "").trim();
      
      const apiKey = clientApiKey || process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === "undefined") {
        throw new Error("API_KEY_MISSING");
      }

      // Allow using a custom proxy base URL for mainland China access
      const customOptions: any = { apiKey };
      if (process.env.GEMINI_BASE_URL) {
        customOptions.baseUrl = process.env.GEMINI_BASE_URL;
      }

      const ai = new GoogleGenAI(customOptions);
      
      const responseStream = await ai.models.generateContentStream({
        model: "gemini-2.5-flash",
        contents: contents,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.2,
        }
      });

      for await (const chunk of responseStream) {
        if (chunk.text) {
          res.write(`data: ${JSON.stringify({type: 'token', content: chunk.text})}\n\n`);
        }
      }
      res.write("data: [DONE]\n\n");
      res.end();

    } catch (err: any) {
      console.error("Error from AI API:", err);
      let errorMessage = "服务器内部错误，请稍后重试。";
      const errMessageStripped = String(err).toLowerCase() + String(err.message).toLowerCase();
      if (err.message === "API_KEY_MISSING") {
         errorMessage = "未检测到有效的 Gemini API 密钥。请点击左下角设置配置您的个人 API Key。由于本服务部署于云端，配置后可支持全球无障碍访问。";
      } else if (errMessageStripped.includes("api key not valid")) {
        errorMessage = "您提供的 Gemini API 密钥无效，请求被拒绝。请在左下角设置中检查并更新您的 API Key。";
      } else if (errMessageStripped.includes("429") || errMessageStripped.includes("quota")) {
        errorMessage = "请求频率过高或超出配额限制，请稍后重试。";
      } else if (errMessageStripped.includes("503") || errMessageStripped.includes("high demand") || errMessageStripped.includes("unavailable")) {
        errorMessage = "当前模型由于需求过高暂时无法响应。这通常是暂时的，请您稍后重试。";
      } else if (err.status === 503 || err.code === 503) {
        errorMessage = "当前模型由于需求过高暂时无法响应。这通常是暂时的，请您稍后重试。";
      }
      // If headers are already sent, we could write an error event, but we'll try to just write an error data payload.
      res.write(`data: ${JSON.stringify({ type: 'error', error: errorMessage })}\n\n`);
      res.end();
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // Support client-side routing
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(console.error);
