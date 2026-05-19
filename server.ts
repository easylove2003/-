import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import cors from "cors";
import { callProvider } from "./src/server-providers";

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

  // ── Auto-prune reports older than 90 days, keep newest 5000 entries ──────
  // 在每次写入前调用，避免 reports.json 无限增长
  function pruneOldReports(reports: Record<string, any>): Record<string, any> {
    const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000;
    const MAX_ENTRIES = 5000;
    const now = Date.now();

    // 按 createdAt 降序，保留最新 MAX_ENTRIES 条
    const entries = Object.entries(reports)
      .filter(([_, r]: [string, any]) => {
        // 没有 createdAt 的旧数据先保留（避免误删）
        if (!r?.createdAt) return true;
        const age = now - new Date(r.createdAt).getTime();
        return age < NINETY_DAYS_MS;
      })
      .sort(([_a, a]: any, [_b, b]: any) => {
        const ta = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
        const tb = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
        return tb - ta;
      })
      .slice(0, MAX_ENTRIES);

    return Object.fromEntries(entries);
  }

  app.post("/api/report/save", async (req, res) => {
    try {
      const { reportId, content } = req.body;

      // 必填校验
      if (!reportId || !content) {
        return res.status(400).json({ error: "Missing reportId or content" });
      }

      // reportId 格式校验：6-64 位字母数字下划线短横线
      if (typeof reportId !== 'string' || !/^[a-zA-Z0-9_-]{6,64}$/.test(reportId)) {
        return res.status(400).json({ error: "Invalid reportId format" });
      }

      // 内容类型校验
      if (typeof content !== 'string' && (typeof content !== 'object' || content === null)) {
        return res.status(400).json({ error: "Invalid content type" });
      }

      // 内容大小限制（5 MB）
      const contentSize = typeof content === 'string'
        ? content.length
        : JSON.stringify(content).length;
      if (contentSize > 5 * 1024 * 1024) {
        return res.status(413).json({ error: "Content too large (max 5MB)" });
      }

      await withReportsLock(async () => {
        let reports = await getReportsData();
        reports = pruneOldReports(reports);
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
      const provider = String(req.headers['x-llm-provider'] || 'gemini');
      const model = String(req.headers['x-llm-model'] || '');
      const baseUrl = String(req.headers['x-llm-base-url'] || '');
      const temperature = Number(req.headers['x-llm-temperature'] || 0.2);

      // 兜底逻辑：优先 DeepSeek（国内可直连），其次 Gemini
      let finalProvider = provider;
      let finalApiKey = clientApiKey || '';
      let finalModel = model;
      let finalBaseUrl = baseUrl || undefined;

      if (!finalApiKey || finalApiKey === 'undefined') {
        // 客户端没传 key，尝试服务端环境变量
        if (process.env.DEEPSEEK_API_KEY) {
          finalProvider = 'deepseek';
          finalApiKey = process.env.DEEPSEEK_API_KEY;
          finalModel = finalModel || 'deepseek-chat';
          finalBaseUrl = finalBaseUrl || 'https://api.deepseek.com/v1';
        } else if (process.env.GEMINI_API_KEY) {
          finalProvider = 'gemini';
          finalApiKey = process.env.GEMINI_API_KEY;
          finalModel = finalModel || 'gemini-2.5-flash';
        }
      }

      if (!finalApiKey || finalApiKey === "undefined") {
        throw new Error("API_KEY_MISSING");
      }
      if (!finalModel && finalProvider !== 'gemini') {
        finalModel = 'deepseek-chat';
      }

      await callProvider(finalProvider, {
        contents,
        systemInstruction,
        apiKey: finalApiKey,
        model: finalModel || 'gemini-2.5-flash',
        baseUrl: finalBaseUrl,
        temperature: isNaN(temperature) ? 0.2 : temperature,
      }, (token) => {
        res.write(`data: ${JSON.stringify({ type: 'token', content: token })}\n\n`);
      });

      res.write("data: [DONE]\n\n");
      res.end();
    } catch (err: any) {
      console.error("Error from AI API:", err);
      let errorMessage = "服务器内部错误，请稍后重试。";
      const m = String(err?.message || err).toLowerCase();
      if (err.message === "API_KEY_MISSING") {
        errorMessage = "未检测到有效的 API 密钥。请点击左下角设置选择厂商并配置 API Key。";
      } else if (err.message === "MODEL_MISSING") {
        errorMessage = "未指定模型名称，请在设置面板里选择或填写一个模型。";
      } else if (m.includes("api key") && (m.includes("invalid") || m.includes("not valid") || m.includes("incorrect"))) {
        errorMessage = "您提供的 API 密钥无效，请检查并更新。";
      } else if (m.includes("401") || m.includes("unauthorized")) {
        errorMessage = "鉴权失败 (401)：API Key 错误或无权限。";
      } else if (m.includes("429") || m.includes("quota") || m.includes("rate limit")) {
        errorMessage = "请求频率过高或超出配额，请稍后重试。";
      } else if (m.includes("503") || m.includes("unavailable") || m.includes("high demand")) {
        errorMessage = "上游模型暂不可用，请稍后重试。";
      } else if (m.includes("upstream")) {
        errorMessage = `上游接口报错：${String(err.message).slice(0, 300)}`;
      }
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
