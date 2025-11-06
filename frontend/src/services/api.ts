import axios, { AxiosInstance } from 'axios';
import { AuthResponse, Event, SwapRequest, SwapRequestsResponse } from '../types';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: '/api',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Add token to requests
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  // Auth endpoints
  async signup(email: string, name: string, password: string): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>('/auth/signup', {
      email,
      name,
      password
    });
    return response.data;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>('/auth/login', {
      email,
      password
    });
    return response.data;
  }

  // Event endpoints
  async getEvents(): Promise<Event[]> {
    const response = await this.client.get<{ success: boolean; data: Event[] }>('/events');
    return response.data.data;
  }

  async createEvent(title: string, startTime: string, endTime: string): Promise<Event> {
    const response = await this.client.post<{ success: boolean; data: Event }>('/events', {
      title,
      startTime,
      endTime
    });
    return response.data.data;
  }

  async updateEvent(id: string, updates: Partial<Event>): Promise<Event> {
    const response = await this.client.patch<{ success: boolean; data: Event }>(
      `/events/${id}`,
      updates
    );
    return response.data.data;
  }

  async deleteEvent(id: string): Promise<void> {
    await this.client.delete(`/events/${id}`);
  }

  // Swap endpoints
  async getSwappableSlots(): Promise<Event[]> {
    const response = await this.client.get<{ success: boolean; data: Event[] }>(
      '/swappable-slots'
    );
    return response.data.data;
  }

  async getSwapRequests(): Promise<SwapRequestsResponse['data']> {
    const response = await this.client.get<SwapRequestsResponse>('/swap-requests');
    return response.data.data;
  }

  async createSwapRequest(mySlotId: string, theirSlotId: string): Promise<SwapRequest> {
    const response = await this.client.post<{ success: boolean; data: SwapRequest }>(
      '/swap-request',
      { mySlotId, theirSlotId }
    );
    return response.data.data;
  }

  async respondToSwapRequest(requestId: string, accept: boolean): Promise<SwapRequest> {
    const response = await this.client.post<{ success: boolean; data: SwapRequest }>(
      `/swap-response/${requestId}`,
      { accept }
    );
    return response.data.data;
  }
}

export const api = new ApiClient();
