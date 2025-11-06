export interface User {
  id: string;
  email: string;
  name: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
  };
}

export enum EventStatus {
  BUSY = 'BUSY',
  SWAPPABLE = 'SWAPPABLE',
  SWAP_PENDING = 'SWAP_PENDING'
}

export interface Event {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  status: EventStatus;
  userId: string;
  createdAt: string;
  updatedAt: string;
  user?: User;
}

export enum SwapRequestStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED'
}

export interface SwapRequest {
  id: string;
  initiatorId: string;
  receiverId: string;
  initiatorSlotId: string;
  receiverSlotId: string;
  status: SwapRequestStatus;
  createdAt: string;
  updatedAt: string;
  initiator: User;
  receiver: User;
  initiatorSlot: Event;
  receiverSlot: Event;
}

export interface SwapRequestsResponse {
  success: boolean;
  data: {
    incoming: SwapRequest[];
    outgoing: SwapRequest[];
  };
}
