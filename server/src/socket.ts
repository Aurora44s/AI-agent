import { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { db } from "./db";
import { messages } from "./db/schema";
import { desc, eq } from "drizzle-orm";

let io: Server | null = null;

export function initSocket(httpServer: HttpServer) {
  io = new Server(httpServer, {
    cors: { origin: "*", methods: ["GET", "POST"] },
  });

  io.on("connection", async (socket) => {
    console.log(`🔗 用户连接: ${socket.id}，在线: ${io!.engine.clientsCount}`);

    // 推送在线人数
    io!.emit("online count", io!.engine.clientsCount);

    // 推送最近 50 条历史消息
    try {
      const history = await db
        .select()
        .from(messages)
        .orderBy(desc(messages.createdAt))
        .limit(50);
      socket.emit("chat history", history.reverse());
    } catch (err) {
      console.error("加载历史消息失败:", err);
    }

    // 收到聊天消息
    socket.on("chat message", async (data: { nickname: string; content: string }) => {
      const { nickname, content } = data;
      if (!nickname?.trim() || !content?.trim()) return;

      const now = new Date();
      const msg = { nickname: nickname.trim(), content: content.trim(), createdAt: now };

      try {
        await db.insert(messages).values(msg);
      } catch (err) {
        console.error("保存消息失败:", err);
      }

      // 广播给所有客户端（包括发送者）
      io!.emit("chat message", msg);
    });

    // 断开连接
    socket.on("disconnect", () => {
      console.log(`🔌 用户断开: ${socket.id}，在线: ${io!.engine.clientsCount}`);
      io!.emit("online count", io!.engine.clientsCount);
    });
  });

  return io;
}

export { io };
