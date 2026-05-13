export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  role: ChatRole;
  content: string;
};

export type CustomerSupportRequest = {
  message: string;
  history: ChatMessage[];
  context?: {
    page?: string;
    userType?: string;
  };
};

export type CustomerSupportResponse = {
  answer: string;
};

