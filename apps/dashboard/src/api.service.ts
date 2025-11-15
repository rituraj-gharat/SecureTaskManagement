import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type Task = {
  id: string;
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string; // ISO date string
  status: 'todo' | 'doing' | 'done';
  category: 'Work' | 'Personal';
  position: number;
};

export type RegisterRequest = {
  email: string;
  password: string;
  orgName: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type AuthResponse = {
  access_token: string;
};

@Injectable({ providedIn: 'root' })
export class ApiService {
  base = 'http://localhost:3333';
  tasksSig = signal<Task[]>([]);

  constructor(private http: HttpClient) {}

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.base}/auth/register`, data);
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.base}/auth/login`, {
      email,
      password,
    });
  }

  loadTasks() {
    return this.http
      .get<Task[]>(`${this.base}/tasks`)
      .subscribe((ts) => this.tasksSig.set(ts));
  }

  createTask(body: Partial<Task>) {
    return this.http.post<Task>(`${this.base}/tasks`, body);
  }

  updateTask(id: string, body: Partial<Task>) {
    return this.http.put<Task>(`${this.base}/tasks/${id}`, body);
  }

  deleteTask(id: string) {
    return this.http.delete(`${this.base}/tasks/${id}`);
  }

  audit() {
    return this.http.get<any[]>(`${this.base}/audit-log`);
  }

  // Team management
  getTeamMembers() {
    return this.http.get<TeamMember[]>(`${this.base}/team/members`);
  }

  updateMemberRole(userId: string, role: 'OWNER' | 'ADMIN' | 'VIEWER') {
    return this.http.put<TeamMember>(`${this.base}/team/members/${userId}/role`, { role });
  }

  inviteUser(email: string, role: 'OWNER' | 'ADMIN' | 'VIEWER') {
    return this.http.post<TeamMember>(`${this.base}/team/members/invite`, { email, role });
  }

  deleteMember(userId: string) {
    return this.http.delete<{ deleted: boolean }>(`${this.base}/team/members/${userId}`);
  }
}

export type TeamMember = {
  userId: string;
  email: string;
  role: 'OWNER' | 'ADMIN' | 'VIEWER';
};
