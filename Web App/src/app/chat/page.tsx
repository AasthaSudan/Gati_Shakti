"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MessageCircle,
  Send,
  AlertTriangle,
  Train as TrainIcon,
  MapPin,
  Languages,
  Home,
  Shield,
  User as UserIcon,
  Circle,
  CheckCircle2,
} from "lucide-react";
import { ChatMessage, ChatRoom, User } from "@/types";
import { chatService } from "@/services/chatService";
import { useLanguage } from "@/context/LanguageContext";
import TranslatedText from "@/components/TranslatedText";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

// Mock current user data - in real app, this would come from authentication
const mockCurrentUser: User = {
  id: "driver_001",
  name: "Rajesh Kumar",
  role: "train_driver",
  trainNumber: "12345",
  contactNumber: "+91-9876543210",
  isOnline: true,
  lastSeen: Date.now(),
};

const mockStationAdmin: User = {
  id: "admin_001", 
  name: "Priya Sharma",
  role: "station_admin",
  stationCode: "NDLS",
  contactNumber: "+91-9876543211",
  isOnline: true,
  lastSeen: Date.now(),
};

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { language, setLanguage, supportedLanguages } = useLanguage();

  useEffect(() => {
    initializeChat();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeChat = async () => {
    try {
      // Create or get chat room
      const roomId = await chatService.createOrGetChatRoom(
        mockCurrentUser.trainNumber!,
        mockStationAdmin.stationCode!,
        mockCurrentUser,
        mockStationAdmin
      );
      
      setCurrentRoomId(roomId);

      // Subscribe to chat rooms
      const unsubscribeRooms = chatService.subscribeToUserChatRooms(
        mockCurrentUser.id,
        mockCurrentUser.role,
        (rooms) => {
          setChatRooms(rooms);
        }
      );

      // Subscribe to messages
      const unsubscribeMessages = chatService.subscribeToMessages(roomId, (roomMessages) => {
        setMessages(roomMessages);
        // Mark messages as read when viewing
        chatService.markMessagesAsRead(roomId, mockCurrentUser.role);
      });

      setLoading(false);

      return () => {
        unsubscribeRooms();
        unsubscribeMessages();
      };
    } catch (error) {
      console.error("Failed to initialize chat:", error);
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentRoomId) return;

    try {
      await chatService.sendMessage(currentRoomId, {
        senderId: mockCurrentUser.id,
        senderName: mockCurrentUser.name,
        senderRole: mockCurrentUser.role,
        message: newMessage.trim(),
        isRead: false,
        messageType: "text",
        priority: "medium",
        trainNumber: mockCurrentUser.trainNumber,
      });

      setNewMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const sendEmergencyAlert = async () => {
    if (!currentRoomId) return;

    try {
      await chatService.sendEmergencyAlert(
        currentRoomId,
        mockCurrentUser.id,
        mockCurrentUser.name,
        mockCurrentUser.role,
        "🚨 EMERGENCY: Immediate assistance required!"
      );
    } catch (error) {
      console.error("Failed to send emergency alert:", error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getMessagePriorityColor = (priority: string) => {
    switch (priority) {
      case "emergency":
        return "bg-red-500";
      case "high":
        return "bg-orange-500";
      case "medium":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-md border-b border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/" className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">
                    <TranslatedText text="Rail Kavach" />
                  </h1>
                  <div className="flex gap-2 items-center mt-1">
                    <div className="h-1 w-12 bg-blue-500 rounded-full"></div>
                    <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                      Communication Hub
                    </span>
                  </div>
                </div>
              </Link>
            </div>

            <div className="flex items-center gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 h-10 w-10 rounded-lg border border-slate-700"
                  >
                    <Languages className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-gray-800 border-gray-700">
                  {supportedLanguages.map((lang) => (
                    <DropdownMenuItem
                      key={lang.code}
                      className={`hover:bg-gray-700 cursor-pointer ${
                        language === lang.code ? "text-blue-400" : "text-gray-200"
                      }`}
                      onClick={() => setLanguage(lang.code)}
                    >
                      {lang.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="hidden md:flex items-center gap-2 bg-slate-800 py-1 px-3 rounded-full">
                <Circle className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs text-slate-300">Online</span>
              </div>

              <Link href="/">
                <Button
                  variant="ghost"
                  size="icon"
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 h-10 w-10 rounded-lg border border-slate-700"
                >
                  <Home className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-140px)]">
          {/* Chat Rooms Sidebar */}
          <div className="lg:col-span-1">
            <Card className="bg-gray-900 border-gray-800 h-full">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MessageCircle className="h-5 w-5 text-blue-500" />
                  <TranslatedText text="Active Chats" />
                </CardTitle>
                <CardDescription className="text-slate-400">
                  <TranslatedText text="Communication channels" />
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Current User Info */}
                <div className="p-3 bg-gray-800 rounded-lg border border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-600 rounded-full">
                      <UserIcon className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {mockCurrentUser.name}
                      </p>
                      <p className="text-xs text-slate-400 flex items-center gap-1">
                        <TrainIcon className="h-3 w-3" />
                        Train {mockCurrentUser.trainNumber}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Circle className="h-2 w-2 bg-green-500 rounded-full" />
                    </div>
                  </div>
                </div>

                {/* Chat Rooms List */}
                {chatRooms.map((room) => (
                  <motion.div
                    key={room.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                      currentRoomId === room.id
                        ? "bg-blue-900/50 border-blue-700"
                        : "bg-gray-800 border-gray-700 hover:bg-gray-750"
                    }`}
                    onClick={() => setCurrentRoomId(room.id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-slate-400" />
                        <span className="text-sm font-medium text-white">
                          {room.stationCode}
                        </span>
                      </div>
                      {room.unreadCount.trainDriver > 0 && (
                        <Badge variant="destructive" className="h-5 text-xs">
                          {room.unreadCount.trainDriver}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mb-1">
                      {room.participants.stationAdmin.name}
                    </p>
                    {room.lastMessage && (
                      <p className="text-xs text-slate-500 truncate">
                        {room.lastMessage.message}
                      </p>
                    )}
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-3">
            <Card className="bg-gray-900 border-gray-800 h-full flex flex-col">
              {currentRoomId ? (
                <>
                  {/* Chat Header */}
                  <CardHeader className="pb-3 border-b border-gray-800">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-600 rounded-full">
                          <MapPin className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">
                            Station {mockStationAdmin.stationCode}
                          </CardTitle>
                          <CardDescription className="text-slate-400">
                            {mockStationAdmin.name} • Online
                          </CardDescription>
                        </div>
                      </div>
                      <Button
                        onClick={sendEmergencyAlert}
                        variant="destructive"
                        size="sm"
                        className="bg-red-600 hover:bg-red-700"
                      >
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Emergency
                      </Button>
                    </div>
                  </CardHeader>

                  {/* Messages Area */}
                  <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${
                          message.senderId === mockCurrentUser.id
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg p-3 ${
                            message.senderId === mockCurrentUser.id
                              ? "bg-blue-600 text-white"
                              : "bg-gray-800 text-white"
                          } ${
                            message.messageType === "emergency"
                              ? "border-2 border-red-500 animate-pulse"
                              : ""
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium">
                              {message.senderName}
                            </span>
                            {message.messageType === "emergency" && (
                              <AlertTriangle className="h-3 w-3 text-red-400" />
                            )}
                            <div
                              className={`h-2 w-2 rounded-full ${getMessagePriorityColor(
                                message.priority
                              )}`}
                            />
                          </div>
                          <p className="text-sm mb-1">{message.message}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs opacity-70">
                              {formatTime(message.timestamp)}
                            </span>
                            {message.senderId === mockCurrentUser.id && (
                              <CheckCircle2 className="h-3 w-3 opacity-70" />
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                    <div ref={messagesEndRef} />
                  </CardContent>

                  {/* Message Input */}
                  <div className="p-4 border-t border-gray-800">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                        placeholder="Type your message..."
                        className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <Button
                        onClick={sendMessage}
                        disabled={!newMessage.trim()}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <MessageCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-400">
                      Select a chat to start messaging
                    </p>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
