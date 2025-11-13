import { Component, OnInit, OnDestroy, HostListener, inject, signal, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../../components/header/header.component';
import { UsersService } from '../../services/users.service';
import { AnalyticsService } from '../../services/analytics.service';
import { take } from 'rxjs/operators';
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
  private authSubscription?: Subscription;

  // Estado para guardar el ID de sesión de analíticas
  private analyticsSessionId = signal<string | null>(null);
  
  // Flag para evitar múltiples inicializaciones
  private sessionInitialized = signal<boolean>(false);

  constructor() {
    // Escuchar cambios en userId para iniciar/cerrar sesión de analytics de forma reactiva
    effect(() => {
      const uid = this.userService.userId(); // ✅ Ahora es un computed, necesita ()
      const session = this.analyticsSessionId();
      const initialized = this.sessionInitialized();
      
      console.log('🔄 MainLayout Effect - userId:', uid, 'session:', session, 'initialized:', initialized);

      if (uid && !session && !initialized) {
        // Iniciar sesión de analytics cuando aparece userId
        console.log('🚀 Iniciando sesión de analytics...');
        this.startAnalyticsSession(uid);
      } else if (!uid && session) {
        // Cerrar sesión de analytics cuando userId desaparece
        console.log('🚪 Cerrando sesión de analytics...');
        this.closeAnalyticsSession();
      }
    });
  }

  ngOnInit(): void {
    console.log('🎯 MainLayout inicializado');
    
    // 1. Intentar recuperar la sesión de analíticas del almacenamiento local
    const storedSessionId = localStorage.getItem('analyticsSessionId');
    if (storedSessionId) {
      this.analyticsSessionId.set(storedSessionId);
      this.sessionInitialized.set(true);
      console.log('📦 Sesión de analytics recuperada del localStorage:', storedSessionId);
    }
    
    // 2. Si hay userId pero no hay sesión, iniciar una nueva
    const currentUserId = this.userService.userId();
    if (currentUserId && !storedSessionId) {
      console.log('🔑 UserId detectado, iniciando nueva sesión de analytics...');
      this.startAnalyticsSession(currentUserId);
    }
  }

  // Hook para asegurar el cierre de sesión antes de que el usuario abandone la página
  @HostListener('window:beforeunload', ['$event'])
  beforeUnloadHandler(event: Event) {
    console.log('⚠️ Usuario abandonando la página, cerrando sesión de analytics...');
    this.closeAnalyticsSession();
  }

  // Hook para cerrar la sesión al destruir el componente
  ngOnDestroy(): void {
    console.log('💥 MainLayout destruido, cerrando sesión de analytics...');
    this.closeAnalyticsSession();
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  // Inicia la sesión de analíticas al autenticar al usuario
  private startAnalyticsSession(userId: string): void {
    // Evitar inicializar múltiples veces
    if (this.sessionInitialized()) {
      console.log('⚠️ Sesión de analytics ya inicializada, ignorando...');
      return;
    }

    this.sessionInitialized.set(true);
    
    this.analyticsService.registerEntry(userId).subscribe({
      next: (response) => {
        const sessionId = response.sessionId;
        this.analyticsSessionId.set(sessionId);
        localStorage.setItem('analyticsSessionId', sessionId);
        console.log(`✅ [Analytics] Sesión iniciada: ${sessionId}. Usuario: ${userId}`);
      },
      error: (err) => {
        console.error('❌ [Analytics] Error al iniciar sesión:', err);
        this.sessionInitialized.set(false); // Permitir reintentos en caso de error
      }
    });
  }

  // Cierra la sesión de analíticas y calcula el tiempo de permanencia
  private closeAnalyticsSession(): void {
    const sessionId = this.analyticsSessionId();
    if (sessionId) {
      // Envía la solicitud de salida sin preocuparse por la respuesta inmediata
      this.analyticsService.registerExit(sessionId).pipe(take(1)).subscribe({
        next: (response) => {
          console.log(`✅ [Analytics] Sesión ${sessionId} cerrada. Tiempo: ${response.timeSpent}s`);
          localStorage.removeItem('analyticsSessionId');
          this.analyticsSessionId.set(null);
          this.sessionInitialized.set(false);
        },
        error: (err) => {
          console.error('❌ [Analytics] Error al cerrar sesión:', err);
          // Limpiar de todas formas
          localStorage.removeItem('analyticsSessionId');
          this.analyticsSessionId.set(null);
          this.sessionInitialized.set(false);
        }
      });
    }
  }

  // Método público que los otros componentes llamarán al hacer clic en categorías
  public registerCategoryClick(categoryName: string): void {
    const sessionId = this.analyticsSessionId();
    if (sessionId) {
      this.analyticsService.registerCategoryClick(sessionId, categoryName).subscribe({
        next: () => console.log(`✅ [Analytics] Click registrado: ${categoryName}`),
        error: (err) => console.error('❌ [Analytics] Error al registrar click:', err)
      });
    } else {
      console.warn('⚠️ [Analytics] Sesión no activa, no se pudo registrar el click.');
    }
  }

  /**
   * Método público para registrar que el usuario intentó subastar un producto.
   */
  public registerIntentoSubastar(): void {
    const sessionId = this.analyticsSessionId();
    if (sessionId) {
      this.analyticsService.registerAuctionAttempt(sessionId).pipe(take(1)).subscribe({
        next: () => console.log('✅ [Analytics] Intento de subasta registrado.'),
        error: (err) => console.error('❌ [Analytics] Error al registrar intento de subasta:', err)
      });
    } else {
      console.warn('⚠️ [Analytics] Sesión no activa, no se pudo registrar el intento de subasta.');
    }
  }

  /**
   * Método público para forzar el cierre de sesión de analytics (útil para logout manual)
   */
  public forceCloseAnalyticsSession(): void {
    console.log('🔒 Forzando cierre de sesión de analytics...');
    this.closeAnalyticsSession();
  }
}