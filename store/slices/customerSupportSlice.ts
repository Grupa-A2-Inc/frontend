import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { ChatMessage } from "@/types/domain/support";

interface CustomerSupportState {
  messages: ChatMessage[];
  error: string | null;
}

const initialState: CustomerSupportState = {
  messages: [],
  error: null,
};

const customerSupportSlice = createSlice({
  name: "customerSupport",
  initialState,
  reducers: {
    addUserMessage(state, action: PayloadAction<string>) {
      state.error = null;
      state.messages.push({ role: "user", content: action.payload });
    },
    addAssistantMessage(state, action: PayloadAction<string>) {
      state.messages.push({ role: "assistant", content: action.payload });
    },
    removeLastUserMessage(state) {
      const lastMessage = state.messages.at(-1);
      if (lastMessage?.role === "user") {
        state.messages.pop();
      }
    },
    setSupportError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    resetChat() {
      return initialState;
    },
  },
});

export const {
  addUserMessage,
  addAssistantMessage,
  removeLastUserMessage,
  setSupportError,
  resetChat,
} = customerSupportSlice.actions;
export default customerSupportSlice.reducer;
