<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, watch } from "vue";
import { io, Socket } from "socket.io-client";
import { ChatBubbleLeftIcon } from "@heroicons/vue/20/solid";

const STORAGE_KEY = "chat_nickname";

interface ChatMessage {
  nickname: string;
  content: string;
  createdAt: string;
}

const props = defineProps<{ modelValue: boolean }>();
const emit = defineEmits<{ "update:modelValue": [value: boolean] }>();

const isOpen = ref(false);

// 外部控制同步
watch(() => props.modelValue, (val) => {
  if (!val) isOpen.value = false;
});

function setOpen(val: boolean) {
  isOpen.value = val;
  emit("update:modelValue", val);
}
const nickname = ref("");
const inputMsg = ref("");
const messages = ref<ChatMessage[]>([]);
const onlineCount = ref(0);
const unreadCount = ref(0);
const hasSetNickname = ref(false);

let socket: Socket | null = null;
const listEl = ref<HTMLDivElement | null>(null);

// 读取已保存的昵称，有昵称就直接连接（保持长连接接收消息）
onMounted(() => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    nickname.value = saved;
    hasSetNickname.value = true;
    connect();
  }
});

// 连接 Socket.IO（仅在展开且已设置昵称后）
function connect() {
  if (socket?.connected) return;
  socket = io("http://localhost:3000");

  socket.on("chat history", (msgs: ChatMessage[]) => {
    messages.value = msgs;
    scrollToBottom();
  });

  socket.on("chat message", (msg: ChatMessage) => {
    messages.value.push(msg);
    // 面板关闭时收到的他人消息记为未读
    if (!isOpen.value && msg.nickname !== nickname.value) {
      unreadCount.value++;
    }
    if (isOpen.value) {
      scrollToBottom();
    }
  });

  socket.on("online count", (count: number) => {
    onlineCount.value = count;
  });
}

function disconnect() {
  socket?.disconnect();
  socket = null;
}

// 展开/折叠
function toggle() {
  if (!hasSetNickname.value) {
    setOpen(true);
    return;
  }
  setOpen(!isOpen.value);
}

// 设置昵称
function setNickname() {
  const name = nickname.value.trim();
  if (!name) return;
  localStorage.setItem(STORAGE_KEY, name);
  hasSetNickname.value = true;
  connect();
}

// 发送消息
function send() {
  const content = inputMsg.value.trim();
  if (!content) return;
  socket?.emit("chat message", { nickname: nickname.value, content });
  inputMsg.value = "";
}

// 滚动到底部
async function scrollToBottom() {
  await nextTick();
  if (listEl.value) {
    listEl.value.scrollTop = listEl.value.scrollHeight;
  }
}

// 面板开关：打开时清零未读，关闭时保持连接
watch(isOpen, (val) => {
  if (val) {
    unreadCount.value = 0;
    if (hasSetNickname.value) connect();
  }
});

// 判断是否自己发的消息
function isMine(msg: ChatMessage) {
  return msg.nickname === nickname.value;
}

// 格式化时间
function formatTime(dateStr: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
}

onUnmounted(() => disconnect());
</script>

<template>
  <div class="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
    <!-- 聊天面板 -->
    <transition name="chat-panel">
      <div
        v-if="isOpen"
        class="w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden"
        style="height: 420px"
      >
        <!-- 头部 -->
        <div class="flex items-center justify-between px-4 py-3 bg-gradient-primary text-white shrink-0">
          <div class="flex items-center gap-2">
            <ChatBubbleLeftIcon class="w-5 h-5" />
            <span class="font-bold text-sm">聊天室</span>
            <span class="text-xs text-white/70">· {{ onlineCount }} 人在线</span>
          </div>
          <button class="p-1 rounded-lg hover:bg-white/20 transition-colors" @click="setOpen(false)">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- 昵称设置 -->
        <div v-if="!hasSetNickname" class="flex-1 flex flex-col items-center justify-center gap-3 px-6">
          <p class="text-gray-500 text-sm">请输入你的昵称</p>
          <input
            v-model="nickname"
            type="text"
            maxlength="20"
            placeholder="你的昵称..."
            class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary-400"
            @keyup.enter="setNickname"
          />
          <button
            class="w-full py-2.5 bg-gradient-primary text-white text-sm font-medium rounded-xl hover:shadow-glow transition-all"
            @click="setNickname"
          >
            进入聊天室
          </button>
        </div>

        <!-- 消息区域 -->
        <template v-else>
          <div ref="listEl" class="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-gray-50/50 flex flex-col">
            <div
              v-for="(msg, idx) in messages"
              :key="idx"
              :class="['flex flex-col gap-0.5 max-w-[85%]', isMine(msg) ? 'self-end items-end ml-auto' : 'self-start']"
            >
              <!-- 昵称 -->
              <span class="text-[10px] text-gray-400 px-1">{{ isMine(msg) ? '我' : msg.nickname }}</span>
              <!-- 气泡 -->
              <div
                :class="[
                  'px-3 py-2 rounded-2xl text-sm leading-relaxed break-words',
                  isMine(msg)
                    ? 'bg-gradient-primary text-white rounded-br-md'
                    : 'bg-white text-gray-700 rounded-bl-md shadow-sm border border-gray-100',
                ]"
              >
                {{ msg.content }}
              </div>
              <!-- 时间 -->
              <span class="text-[10px] text-gray-300 px-1">{{ formatTime(msg.createdAt) }}</span>
            </div>
          </div>

          <!-- 输入区 -->
          <div class="flex items-center gap-2 px-3 py-2.5 border-t border-gray-100 bg-white shrink-0">
            <input
              v-model="inputMsg"
              type="text"
              maxlength="500"
              placeholder="说点什么..."
              class="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
              @keyup.enter="send"
            />
            <button
              class="p-2 bg-gradient-primary text-white rounded-xl hover:shadow-glow transition-all shrink-0"
              @click="send"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </template>
      </div>
    </transition>

    <!-- 浮动按钮 -->
    <button
      class="w-14 h-14 bg-gradient-primary text-white rounded-2xl shadow-lg hover:shadow-glow hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center relative"
      @click="toggle"
    >
      <span v-if="isOpen" class="text-xl">✕</span>
      <ChatBubbleLeftIcon v-else class="w-5 h-5" />
      <!-- 未读消息红点 -->
      <span
        v-if="!isOpen && unreadCount > 0"
        class="absolute -top-1 -right-1 min-w-[20px] h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow px-1"
      >
        {{ unreadCount > 99 ? '99+' : unreadCount }}
      </span>
    </button>
  </div>
</template>

<style scoped>
.chat-panel-enter-active,
.chat-panel-leave-active {
  transition: all 0.3s ease;
}
.chat-panel-enter-from,
.chat-panel-leave-to {
  opacity: 0;
  transform: translateY(16px) scale(0.95);
}
</style>
