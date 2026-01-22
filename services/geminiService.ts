
import { GoogleGenAI, Chat } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants";

export class LaborLawService {
  private ai: GoogleGenAI;
  private chat: Chat | null = null;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  private initChat() {
    this.chat = this.ai.chats.create({
      model: 'gemini-3-pro-preview',
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
        topP: 0.95,
      },
    });
  }

  async sendMessage(message: string): Promise<string> {
    if (!this.chat) {
      this.initChat();
    }

    try {
      const response = await this.chat!.sendMessage({ message });
      return response.text || "죄송합니다. 답변을 생성하는 중에 문제가 발생했습니다.";
    } catch (error) {
      console.error("Gemini API Error:", error);
      throw new Error("노무사님과의 연결에 실패했습니다. 잠시 후 다시 시도해주세요.");
    }
  }

  async *sendMessageStream(message: string) {
    if (!this.chat) {
      this.initChat();
    }

    try {
      const result = await this.chat!.sendMessageStream({ message });
      for await (const chunk of result) {
        yield chunk.text;
      }
    } catch (error) {
      console.error("Gemini Stream Error:", error);
      throw error;
    }
  }
}

export const laborLawService = new LaborLawService();
