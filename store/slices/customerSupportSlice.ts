import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { ChatMessage } from "@/lib/customer-support/types";
import { apiSendSupportMessage } from "@/lib/customer-support/api";
import { logout } from "@/store/slices/authSlice";
import type { RootState } from "@/store";

const MAX_HISTORY = 8;

function getUserType(role: string | undefined): string {
  if (!role) return "guest";
  if (role === "ORGANIZATION_ADMIN") return "admin";
  return role.toLowerCase();
}

interface CustomerSupportState {
  messages: ChatMessage[];
  isSending: boolean;
  error: string | null;
}

const initialState: CustomerSupportState = {
  messages: [],
  isSending: false,
  error: null,
};

// Asincron
export const sendMessageThunk = createAsyncThunk(
  "customerSupport/sendMessage",
  async ({ message, page }: { message: string; page: string }, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const userType = getUserType(state.auth.user?.role);
      // The pending reducer has already added the current user message for optimistic display.
      const history = state.customerSupport.messages.slice(0, -1).slice(-MAX_HISTORY);

      const data = await apiSendSupportMessage({
        message,
        history,
        context: { page, userType },
      });

      return data.answer;
    } catch (err: unknown) {
      const message = err instanceof Error
        ? err.message
        : "Could not send message. Please try again.";
      return rejectWithValue(message);
    }
  }
);

const customerSupportSlice = createSlice({
  name: "customerSupport",
  initialState,
  reducers: {
    // Resetare conversatie
    resetChat() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    // Trimitere mesaj
    builder.addCase(sendMessageThunk.pending, (state, action) => {
      state.isSending = true;
      state.error = null;
      state.messages.push({ role: "user", content: action.meta.arg.message });
    });
    builder.addCase(sendMessageThunk.fulfilled, (state, action) => {
      state.isSending = false;
      state.messages.push({ role: "assistant", content: action.payload });
    });
    builder.addCase(sendMessageThunk.rejected, (state, action) => {
      state.isSending = false;
      state.error = action.payload as string;
      state.messages.pop(); // scoate mesajul user-ului adaugat optimistic
    });

    builder.addCase(logout.pending, () => initialState);
  },
});

export const { resetChat } = customerSupportSlice.actions;
export default customerSupportSlice.reducer;
