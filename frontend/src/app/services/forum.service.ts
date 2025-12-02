import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ForumPost, ForumComment, CreatePostRequest, CreateCommentRequest, ReactionRequest } from '../models/forum.model';

@Injectable({
  providedIn: 'root'
})
export class ForumService {
  private apiUrl = 'http://localhost:8000/api/forum';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // Posts
  createPost(post: CreatePostRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/posts`, post, { headers: this.getHeaders() });
  }

  getPosts(page: number = 1, limit: number = 10): Observable<any> {
    return this.http.get(`${this.apiUrl}/posts?page=${page}&limit=${limit}`);
  }

  addReactionToPost(postId: string, reaction: ReactionRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/posts/${postId}/reactions`, reaction, { headers: this.getHeaders() });
  }

  // Comments
  createComment(postId: string, comment: CreateCommentRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/posts/${postId}/comments`, comment, { headers: this.getHeaders() });
  }

  getComments(postId: string, page: number = 1): Observable<any> {
    return this.http.get(`${this.apiUrl}/posts/${postId}/comments?page=${page}`);
  }

  addReactionToComment(commentId: string, reaction: ReactionRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/comments/${commentId}/reactions`, reaction, { headers: this.getHeaders() });
  }

  // Notificaciones
  getNotifications(): Observable<any> {
    return this.http.get(`${this.apiUrl}/notifications`, { headers: this.getHeaders() });
  }

  markNotificationAsRead(notificationId: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/notifications/${notificationId}/read`, {}, { headers: this.getHeaders() });
  }
}