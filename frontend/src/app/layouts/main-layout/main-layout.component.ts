import { Component, OnInit, OnDestroy, HostListener, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../../components/header/header.component';
import { UsersService } from '../../services/users.service'; // Asegúrate de que esta ruta sea correcta
import { AnalyticsService } from '../../services/analytics.service'; // Servicio de analíticas
import { take, filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.css']
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  private userService = inject(UsersService);
  private analyticsService = inject(AnalyticsService);
  private authSubscription!: Subscription;

  // Estado para guardar el ID de sesión de analíticas
  private analyticsSessionId = signal<string | null>(null);

  constructor() {
    // Escuchar cambios en userId para iniciar/cerrar sesión de analytics de forma reactiva
    effect(() => {
      const uid = this.userService.userId;
      const session = this.analyticsSessionId();
      if (uid && !session) {
        // Iniciar sesión de analytics cuando aparece userId
        this.startAnalyticsSession(uid);
      } else if (!uid && session) {
        // Cerrar sesión de analytics cuando userId desaparece
        this.closeAnalyticsSession();
      }
    });
  }

  ngOnInit(): void {
    // 1. Intentar recuperar la sesión de analíticas del almacenamiento local
    const storedSessionId = localStorage.getItem('analyticsSessionId');
    if (storedSessionId) {
      this.analyticsSessionId.set(storedSessionId);
    }
    
    // 2. Suscribirse al estado de autenticación (simulando, ya que usamos localStorage/signals)
    // Usamos el userId del servicio como indicador de sesión activa
    if (this.userService.userId) {
        this.startAnalyticsSession(this.userService.userId);
    }
  }

  // Hook para asegurar el cierre de sesión antes de que el usuario abandone la página
  @HostListener('window:beforeunload', ['$event'])
  beforeUnloadHandler(event: Event) {
    this.closeAnalyticsSession();
    // Nota: El navegador puede no garantizar que esta llamada HTTP termine, pero es la mejor práctica.
  }

  // Hook para cerrar la sesión al destruir el componente (ej. al salir de la ruta protegida)
  ngOnDestroy(): void {
    this.closeAnalyticsSession();
    if (this.authSubscription) {
        this.authSubscription.unsubscribe();
    }
  }

  // Inicia la sesión de analíticas al autenticar al usuario
  private startAnalyticsSession(userId: string): void {
    this.analyticsService.registerEntry(userId).subscribe({
      next: (response) => {
        const sessionId = response.sessionId;
        this.analyticsSessionId.set(sessionId);
        localStorage.setItem('analyticsSessionId', sessionId);
        console.log(`[Analytics] Sesión iniciada: ${sessionId}. Usuario: ${userId}`);
      },
      error: (err) => console.error('[Analytics] Error al iniciar sesión:', err)
    });
  }

  // Cierra la sesión de analíticas y calcula el tiempo de permanencia
  private closeAnalyticsSession(): void {
    const sessionId = this.analyticsSessionId();
    if (sessionId) {
      // Envía la solicitud de salida sin preocuparse por la respuesta inmediata
      this.analyticsService.registerExit(sessionId).pipe(take(1)).subscribe({
        next: (response) => {
            console.log(`[Analytics] Sesión ${sessionId} cerrada. Tiempo: ${response.timeSpent}s`);
            localStorage.removeItem('analyticsSessionId');
            this.analyticsSessionId.set(null);
        },
        error: (err) => console.error('[Analytics] Error al cerrar sesión:', err)
      });
    }
  }

  // Método público que los otros componentes llamarán al hacer clic en categorías
  public registerCategoryClick(categoryName: string): void {
    const sessionId = this.analyticsSessionId();
    if (sessionId) {
      this.analyticsService.registerCategoryClick(sessionId, categoryName).subscribe({
        next: () => console.log(`[Analytics] Click registrado: ${categoryName}`),
        error: (err) => console.error('[Analytics] Error al registrar click:', err)
      });
    } else {
        console.warn('[Analytics] Sesión no activa, no se pudo registrar el click.');
    }
  }

  /**
   * NUEVO: Método público para registrar que el usuario intentó subastar un producto.
   * Asume que AnalyticsService.registerAuctionAttempt() ha sido implementado 
   * (llamando al endpoint POST /api/analytics/attempt).
   */
  public registerIntentoSubastar(): void {
    const sessionId = this.analyticsSessionId();
    if (sessionId) {
      // Se asume que registerAuctionAttempt existe en el servicio.
      this.analyticsService.registerAuctionAttempt(sessionId).pipe(take(1)).subscribe({
        next: () => console.log('[Analytics] Intento de subasta registrado.'),
        error: (err) => console.error('[Analytics] Error al registrar intento de subasta:', err)
      });
    } else {
        console.warn('[Analytics] Sesión no activa, no se pudo registrar el intento de subasta.');
    }
  }
}