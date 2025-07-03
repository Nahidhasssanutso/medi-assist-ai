"use client";

import React, { useState, useRef, useEffect } from "react";
import { aiMedicalAssistant } from "@/ai/flows/ai-medical-assistant";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DashboardLayout } from "@/components/dashboard-layout";
import { cn } from "@/lib/utils";
import { Bot, Info, Loader2, Send, User } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const defaultInitialMessage: Message = {
  role: "assistant",
  content: "Hello! I am your AI Medical Assistant. How can I help you today? Please describe your symptoms or ask a health-related question.",
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatContext, setChatContext] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedContext = localStorage.getItem("chatContext");
    let initialMessages: Message[] = [defaultInitialMessage];
    if (storedContext) {
      setChatContext(storedContext);
      initialMessages = [
        {
          role: "assistant",
          content: "I've reviewed your recent analysis report. Feel free to ask any questions you have about it."
        }
      ];
    }
    setMessages(initialMessages);
  }, []);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const result = await aiMedicalAssistant({ 
        message: input,
        ...(chatContext && { context: chatContext }),
       });
      const assistantMessage: Message = {
        role: "assistant",
        content: result.response,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
      };
      setMessages((prev) => [...prev, errorMessage]);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex justify-center items-start h-[calc(100vh-4rem)]">
        <Card className="w-full max-w-4xl h-full flex flex-col">
          <CardHeader>
            <CardTitle>AI Medical Assistant</CardTitle>
            <CardDescription>
                Get personalized advice and support. This is not a substitute for professional medical advice.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto" ref={scrollAreaRef}>
            <div className="space-y-6">
              {chatContext && (
                 <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 text-blue-800 text-sm rounded-md p-3 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-300">
                    <Info className="h-5 w-5"/>
                    <p>This conversation is based on your recent symptom analysis report.</p>
                 </div>
              )}
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex items-start gap-4",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {message.role === "assistant" && (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        <Bot className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={cn(
                      "max-w-[75%] rounded-lg p-3 text-sm",
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    )}
                  >
                    {message.content.split('\n').map((line, i) => <p key={i}>{line}</p>)}
                  </div>
                  {message.role === "user" && (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        <User className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              {loading && (
                <div className="flex items-start gap-4 justify-start">
                   <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        <Bot className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-muted rounded-lg p-3 flex items-center space-x-2">
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">AI is thinking...</span>
                    </div>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="pt-4 border-t">
            <form onSubmit={handleSubmit} className="flex w-full items-center space-x-2">
              <Input
                id="message"
                placeholder="Type your message..."
                className="flex-1"
                autoComplete="off"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
              />
              <Button type="submit" size="icon" disabled={loading}>
                <Send className="h-4 w-4" />
                <span className="sr-only">Send</span>
              </Button>
            </form>
          </CardFooter>
        </Card>
      </div>
    </DashboardLayout>
  );
}
