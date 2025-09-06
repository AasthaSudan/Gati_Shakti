// File: src/types/index.ts
export interface Train {
    _id: string;
    trainNumber: string;
    trainName: string;
    currentLocation: {
      type: string;
      coordinates: number[];
      updatedAt: string;
    };
    currentSpeed: number;
    status: string;
    driver: {
      name: string;
      contactNumber: string;
      id: string;
    };
    createdAt: string;
    updatedAt: string;
  }
  
  export interface Camera {
    _id: string;
    cameraId: string;
    location: {
      type: string;
      coordinates: number[];
    };
    railwaySection: string;
    nearestStation: string;
    status: string;
    powerSource: string;
    lastMaintenance: string;
    installationDate: string;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface Station {
    _id: string;
    stationCode: string;
    stationName: string;
    location: {
      type: string;
      coordinates: number[];
    };
    contactNumber: string;
    emergencyContact: string;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface DetectionEvent {
    _id: string;
    camera: string;
    detectedAt: string;
    animalType: string;
    confidence: number;
    imageUrl: string;
    status: string;
    duration: number;
    actionsTaken: Array<{
      actionType: string;
      timestamp: string;
      details: string;
    }>;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface Alert {
    _id: string;
    eventId: string;
    camera: string;
    alertType: string;
    alertSeverity: string;
    status: string;
    affectedTrains: string[];
    notifiedStations: string[];
    acknowledgedBy?: {
      userId: string;
      userName: string;
      timestamp: string;
    };
    resolvedAt?: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
  }

  export interface ChatMessage {
    id: string;
    senderId: string;
    senderName: string;
    senderRole: 'train_driver' | 'station_admin';
    message: string;
    timestamp: number;
    trainNumber?: string;
    stationCode?: string;
    isRead: boolean;
    messageType: 'text' | 'alert' | 'emergency' | 'status_update';
    priority: 'low' | 'medium' | 'high' | 'emergency';
  }

  export interface ChatRoom {
    id: string;
    trainNumber: string;
    stationCode: string;
    participants: {
      trainDriver: {
        id: string;
        name: string;
        trainNumber: string;
      };
      stationAdmin: {
        id: string;
        name: string;
        stationCode: string;
      };
    };
    lastMessage?: ChatMessage;
    unreadCount: {
      trainDriver: number;
      stationAdmin: number;
    };
    isActive: boolean;
    createdAt: number;
    updatedAt: number;
  }

  export interface User {
    id: string;
    name: string;
    role: 'train_driver' | 'station_admin';
    trainNumber?: string;
    stationCode?: string;
    contactNumber: string;
    isOnline: boolean;
    lastSeen: number;
  }