export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}
 
export interface CustomerSupportRequest {
  message: string;
  history: ChatMessage[];
  context: {
    page: string;
    userType: string;
  };
}
 
export interface CustomerSupportResponse {
  answer: string;
  chatbot: string;
}