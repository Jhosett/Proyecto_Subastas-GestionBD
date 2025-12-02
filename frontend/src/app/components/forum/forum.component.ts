import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ForumService } from '../../services/forum.service';
import { ForumPost, ForumComment, CreatePostRequest, CreateCommentRequest } from '../../models/forum.model';

@Component({
  selector: 'app-forum',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './forum.component.html',
  styleUrls: ['./forum.component.css']
})
export class ForumComponent implements OnInit {
  posts: ForumPost[] = [];
  comments: { [postId: string]: ForumComment[] } = {};
  showComments: { [postId: string]: boolean } = {};
  
  newPost: CreatePostRequest = { titulo: '', contenido: '' };
  newComment: { [postId: string]: string } = {};
  
  currentPage = 1;
  totalPages = 1;
  isLoggedIn = false;
  currentUserId = '';
  
  reactionTypes: ('bien' | 'contento' | 'enojado' | 'triste')[] = ['bien', 'contento', 'enojado', 'triste'];
  
  // Notificaciones
  notifications: any[] = [];
  unreadNotifications = 0;
  showNotifications = false;

  constructor(private forumService: ForumService) {}

  ngOnInit() {
    this.checkAuthStatus();
    this.loadPosts();
    if (this.isLoggedIn) {
      this.loadNotifications();
    }
  }

  checkAuthStatus() {
    const token = localStorage.getItem('token');
    this.isLoggedIn = !!token;
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      this.currentUserId = payload.id;
    }
  }

  loadPosts() {
    this.forumService.getPosts(this.currentPage).subscribe({
      next: (response) => {
        this.posts = response.data;
        this.totalPages = response.pagination?.pages || 1;
      },
      error: (error) => console.error('Error loading posts:', error)
    });
  }

  createPost() {
    if (!this.isLoggedIn || !this.newPost.titulo.trim() || !this.newPost.contenido.trim()) {
      return;
    }

    this.forumService.createPost(this.newPost).subscribe({
      next: (response) => {
        this.posts.unshift(response.data);
        this.newPost = { titulo: '', contenido: '' };
      },
      error: (error) => console.error('Error creating post:', error)
    });
  }

  toggleComments(postId: string) {
    this.showComments[postId] = !this.showComments[postId];
    if (this.showComments[postId] && !this.comments[postId]) {
      this.loadComments(postId);
    }
  }

  loadComments(postId: string) {
    this.forumService.getComments(postId).subscribe({
      next: (response) => {
        this.comments[postId] = response.data;
      },
      error: (error) => console.error('Error loading comments:', error)
    });
  }

  createComment(postId: string) {
    const content = this.newComment[postId];
    if (!this.isLoggedIn || !content?.trim()) {
      return;
    }

    this.forumService.createComment(postId, { contenido: content }).subscribe({
      next: (response) => {
        if (!this.comments[postId]) {
          this.comments[postId] = [];
        }
        this.comments[postId].unshift(response.data);
        this.newComment[postId] = '';
        
        // Actualizar contador de comentarios
        const post = this.posts.find(p => p._id === postId);
        if (post) {
          post.totalComentarios++;
        }
      },
      error: (error) => console.error('Error creating comment:', error)
    });
  }

  addReactionToPost(postId: string, tipo: 'bien' | 'contento' | 'enojado' | 'triste') {
    if (!this.isLoggedIn) return;

    this.forumService.addReactionToPost(postId, { tipo }).subscribe({
      next: (response) => {
        const post = this.posts.find(p => p._id === postId);
        if (post) {
          post.reacciones = response.data;
        }
      },
      error: (error) => console.error('Error adding reaction:', error)
    });
  }

  addReactionToComment(commentId: string, tipo: 'bien' | 'contento' | 'enojado' | 'triste') {
    if (!this.isLoggedIn) return;

    this.forumService.addReactionToComment(commentId, { tipo }).subscribe({
      next: (response) => {
        // Actualizar reacciones del comentario
        Object.values(this.comments).forEach(commentList => {
          const comment = commentList.find(c => c._id === commentId);
          if (comment) {
            comment.reacciones = response.data;
          }
        });
      },
      error: (error) => console.error('Error adding reaction:', error)
    });
  }

  getReactionCount(reacciones: any, tipo: string): number {
    return reacciones[tipo]?.length || 0;
  }

  hasUserReacted(reacciones: any, tipo: string): boolean {
    return reacciones[tipo]?.includes(this.currentUserId) || false;
  }

  getUserRole(user: any): string {
    if (user.isAdmin) return 'Administrador';
    if (user.esVendedor) return 'Vendedor';
    return 'Comprador';
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadPosts();
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadPosts();
    }
  }

  getReactionEmoji(tipo: string): string {
    const emojis = {
      bien: '👍',
      contento: '😊',
      enojado: '😠',
      triste: '😢'
    };
    return emojis[tipo as keyof typeof emojis] || '👍';
  }

  getRoleClass(user: any): string {
    if (user.isAdmin) return 'role-admin';
    if (user.esVendedor) return 'role-seller';
    return 'role-buyer';
  }

  getCurrentUserInitial(): string {
    const token = localStorage.getItem('token');
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.nombre?.charAt(0).toUpperCase() || 'U';
    }
    return 'U';
  }

  // Notificaciones
  loadNotifications() {
    this.forumService.getNotifications().subscribe({
      next: (response) => {
        this.notifications = response.data;
        this.unreadNotifications = this.notifications.filter(n => !n.leida).length;
      },
      error: (error) => console.error('Error loading notifications:', error)
    });
  }

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
  }

  markNotificationAsRead(notificationId: string) {
    this.forumService.markNotificationAsRead(notificationId).subscribe({
      next: () => {
        const notification = this.notifications.find(n => n._id === notificationId);
        if (notification && !notification.leida) {
          notification.leida = true;
          this.unreadNotifications--;
        }
      },
      error: (error) => console.error('Error marking notification as read:', error)
    });
  }
}