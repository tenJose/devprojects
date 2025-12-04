import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { RouterLink, ActivatedRoute, Router } from "@angular/router"
import { MessageService, Conversation, Message } from "../../services/message.service"
import { AuthService } from "../../services/auth.service"
import { UsuarioService } from "../../services/usuario.service"
import { RatingService } from "../../services/rating.service"
import { ProjectCompletionModalComponent } from "../project-completion-modal/project-completion-modal.component"
import { RatingModalComponent } from "../rating-modal/rating-modal.component"

@Component({
  selector: "app-messages",
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ProjectCompletionModalComponent, RatingModalComponent],
  templateUrl: "./messages.component.html",
  styleUrls: ["./messages.component.css"],
})
export class MessagesComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild("scrollContainer") private scrollContainer!: ElementRef

  conversations: Conversation[] = []
  filteredConversations: Conversation[] = []
  currentConversation: Conversation | null = null
  messages: Message[] = []
  newMessage = ""
  searchQuery = ""
  currentUserId: number | null = null
  loading = true
  targetUserId: number | null = null;
  
  // Variables para la Sidebar
  currentUser: any = null;
  showLogoutModal = false;
  
  // ✅ NUEVO: Variables para finalización y calificación
  showCompletionModal = false;
  showRatingModal = false;
  isConfirmingCompletion = false;
  requesterName = '';
  completionLoading = false;
  projectStatus: any = null;
  
  // ✅ NUEVO: Polling para mensajes en tiempo real
  private messagePollingInterval: any = null;
  
  // Cambia esto si tu puerto de backend es diferente
  private readonly API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000' 
    : 'https://devback.mnz.dom.my.id';

  constructor(
    private messageService: MessageService,
    private authService: AuthService,
    private usuarioService: UsuarioService,
    private ratingService: RatingService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    // 1. Obtener usuario actual
    const user = this.authService.getCurrentUser()
    if (user) {
      this.currentUserId = user.id
    }

    // 2. Cargar perfil para la sidebar
    this.loadUserProfile();

    // 3. Detectar si venimos redirigidos para hablar con alguien específico
    this.route.queryParams.subscribe(params => {
      if (params['userId']) {
        this.targetUserId = +params['userId'];
      }
      this.loadConversations();
    });

    // 4. Verificar si hay una conversación nueva desde notificaciones
    this.checkNewConversation();
  }

  checkNewConversation() {
    const newConvData = localStorage.getItem('newConversation');
    if (newConvData) {
      const { userId, projectId, initialMessage } = JSON.parse(newConvData);
      
      // Enviar el mensaje inicial automáticamente
      this.messageService.sendMessage(userId, initialMessage, projectId).subscribe({
        next: () => {
          // Limpiar localStorage
          localStorage.removeItem('newConversation');
          
          // Recargar conversaciones
          this.loadConversations();
        },
        error: (err) => console.error('Error al crear conversación:', err)
      });
    }
  }

  loadUserProfile() {
    this.usuarioService.obtenerPerfil().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.currentUser = response.data
        }
      },
      error: (err) => console.error("Error loading profile:", err)
    })
  }

  // Navegación de Sidebar
  navigateToHome() { this.router.navigate(['/home']); }
  navigateToCreateProject() { this.router.navigate(['/create-project']); }
  navigateToProfile() { this.router.navigate(['/configurar-perfil']); }
  navigateToMessages() { this.router.navigate(['/messages']); }
  
  confirmLogout() { this.showLogoutModal = true; }
  cancelLogout() { this.showLogoutModal = false; }
  
  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
    this.showLogoutModal = false;
  }

  ngAfterViewChecked() {
    this.scrollToBottom()
  }

  ngOnDestroy() {
    // Limpiar el polling cuando se destruya el componente
    if (this.messagePollingInterval) {
      clearInterval(this.messagePollingInterval);
    }
  }

  scrollToBottom(): void {
    try {
      if (this.scrollContainer) {
        this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight
      }
    } catch (err) {}
  }

  loadConversations() {
    this.loading = true
    this.messageService.getConversations().subscribe({
      next: (data) => {
        this.conversations = data
        this.filteredConversations = data
        this.loading = false

        if (this.targetUserId) {
          // Buscamos si ya existe conversación
          const existingConv = this.conversations.find(c => c.otherUser.id === this.targetUserId);
          
          if (existingConv) {
            this.selectConversation(existingConv);
          } else {
            // Si no existe, iniciamos una nueva (virtual)
            this.startNewConversation(this.targetUserId);
          }
        } else if (this.conversations.length > 0 && !this.currentConversation) {
          this.selectConversation(this.conversations[0])
        }
      },
      error: (err) => {
        console.error("Error loading conversations:", err)
        this.loading = false
      },
    })
  }

  startNewConversation(userId: number) {
    this.usuarioService.obtenerUsuarioPorId(userId).subscribe({
      next: (res) => {
        const user = res.data || res; 
        const newConv: Conversation = {
          conversacionId: 'new',
          otherUser: {
            id: user.id,
            nombre: user.nombre,
            apellido: user.apellido,
            fotoPerfil: user.fotoPerfil
          },
          ultimoMensaje: '',
          fecha: new Date().toISOString(),
          leido: true,
          mensajesNoLeidos: 0
        };
        
        this.currentConversation = newConv;
        this.messages = [];
      }
    });
  }

  selectConversation(conversation: Conversation) {
    // Limpiar polling anterior
    if (this.messagePollingInterval) {
      clearInterval(this.messagePollingInterval);
    }

    this.currentConversation = conversation
    if (conversation.conversacionId !== 'new') {
        // Extract proyectoId from conversacionId if it exists
        const proyectoId = this.extractProyectoId(conversation.conversacionId);
        this.loadMessages(conversation.otherUser.id, proyectoId)
        
        // ✅ Iniciar polling cada 3 segundos para mensajes en tiempo real
        this.messagePollingInterval = setInterval(() => {
          this.loadMessagesQuietly(conversation.otherUser.id, proyectoId);
        }, 3000);
    } else {
        this.messages = [];
    }

    if (conversation.mensajesNoLeidos > 0) {
      conversation.mensajesNoLeidos = 0
      conversation.leido = true
    }
  }

  extractProyectoId(conversacionId: string): number | undefined {
    // Format: "userId1-userId2-proyecto-123"
    const match = conversacionId.match(/-proyecto-(\d+)$/);
    return match ? parseInt(match[1], 10) : undefined;
  }

  loadMessages(otherUserId: number, proyectoId?: number) {
    this.messageService.getMessages(otherUserId, proyectoId).subscribe({
      next: (data) => {
        this.messages = data
        setTimeout(() => this.scrollToBottom(), 100);
      },
      error: (err) => console.error(err),
    })
  }

  // ✅ NUEVO: Cargar mensajes sin hacer scroll (para polling)
  loadMessagesQuietly(otherUserId: number, proyectoId?: number) {
    this.messageService.getMessages(otherUserId, proyectoId).subscribe({
      next: (data) => {
        const currentLength = this.messages.length;
        const newLength = data.length;
        
        // Solo actualizar si hay nuevos mensajes
        if (newLength > currentLength) {
          const wasAtBottom = this.isScrolledToBottom();
          this.messages = data;
          
          // Solo hacer scroll si el usuario ya estaba al final
          if (wasAtBottom) {
            setTimeout(() => this.scrollToBottom(), 50);
          }
        }
      },
      error: (err) => console.error(err),
    });
  }

  // ✅ Verificar si el usuario está al final del scroll
  isScrolledToBottom(): boolean {
    if (!this.scrollContainer) return true;
    const element = this.scrollContainer.nativeElement;
    const threshold = 150;
    return element.scrollHeight - element.scrollTop - element.clientHeight < threshold;
  }

  sendMessage() {
    if (!this.newMessage.trim() || !this.currentConversation || !this.currentUserId) return

    const content = this.newMessage
    const recipientId = this.currentConversation.otherUser.id
    
    // Extract proyectoId from current conversation if it's project-based
    const proyectoId = this.currentConversation.proyecto?.id || 
                       this.extractProyectoId(this.currentConversation.conversacionId);

    // Optimistic Update
    const tempMessage: Message = {
      id: Date.now(),
      remitente: this.currentUserId,
      destinatario: recipientId,
      contenido: content,
      leido: false,
      createdAt: new Date().toISOString(),
    }

    this.messages.push(tempMessage)
    this.newMessage = ""
    setTimeout(() => this.scrollToBottom(), 50);

    this.messageService.sendMessage(recipientId, content, proyectoId).subscribe({
      next: (sentMessage) => {
        const index = this.messages.findIndex((m) => m.id === tempMessage.id)
        if (index !== -1) {
          this.messages[index] = sentMessage
        }

        if (this.currentConversation) {
            this.currentConversation.ultimoMensaje = content;
            this.currentConversation.fecha = new Date().toISOString();
            
            // Si era 'new', recargar para obtener IDs reales
            if (this.currentConversation.conversacionId === 'new') {
                 this.loadConversations(); 
            }
        }
      },
      error: (err) => {
        console.error("Error sending message:", err)
        this.messages = this.messages.filter((m) => m.id !== tempMessage.id)
      },
    })
  }

  onSearchChange() {
    this.filterConversations()
  }

  filterConversations() {
    if (!this.searchQuery) {
      this.filteredConversations = this.conversations
    } else {
      const query = this.searchQuery.toLowerCase()
      this.filteredConversations = this.conversations.filter(
        (c) =>
          c.otherUser.nombre.toLowerCase().includes(query) ||
          (c.otherUser.apellido && c.otherUser.apellido.toLowerCase().includes(query)) ||
          (c.proyecto && c.proyecto.nombre.toLowerCase().includes(query)),
      )
    }
  }
  
  getFullPhotoUrl(fileName: string | null | undefined): string {
    if (!fileName) return 'assets/default-avatar.png';
    if (fileName.startsWith('http')) return fileName;
    if (fileName.startsWith('/uploads')) {
        return `${this.API_BASE_URL}${fileName}`;
    }
    return `${this.API_BASE_URL}/uploads/${fileName}`;
  }

  navigateToProject(projectId: number) {
    this.router.navigate(['/project', projectId]);
  }

  // ✅ NUEVO: Métodos para finalización de proyectos
  canFinishProject(): boolean {
    if (!this.currentConversation?.proyecto || !this.currentUserId) {
      return false;
    }
    
    const project = this.currentConversation.proyecto as any;
    const isCreator = project.usuarioCreadorId === this.currentUserId;
    const isAssigned = project.usuarioAsignadoId === this.currentUserId;
    
    return (isCreator || isAssigned);
  }

  getFinishButtonState(): { text: string; disabled: boolean; style: string } {
    if (!this.currentConversation?.proyecto) {
      return { text: '✓ Finalizar Proyecto', disabled: true, style: '' };
    }

    const project = this.currentConversation.proyecto as any;
    const isCreator = project.usuarioCreadorId === this.currentUserId;
    const estado = project.estadoFinalizacion || 'pendiente';

    // Proyecto ya finalizado
    if (estado === 'finalizado') {
      return { 
        text: '✓ Proyecto Finalizado', 
        disabled: true, 
        style: 'background: linear-gradient(135deg, #10b981 0%, #059669 100%); cursor: not-allowed; opacity: 0.7;' 
      };
    }

    // Yo solicité la finalización
    const miSolicitud = (isCreator && estado === 'finalizado_por_creador') || 
                        (!isCreator && estado === 'finalizado_por_asignado');
    
    if (miSolicitud) {
      return { 
        text: '⏳ Esperando Confirmación...', 
        disabled: true, 
        style: 'background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); cursor: not-allowed;' 
      };
    }

    // La otra parte solicitó la finalización
    const solicitudPendiente = (isCreator && estado === 'finalizado_por_asignado') || 
                               (!isCreator && estado === 'finalizado_por_creador');
    
    if (solicitudPendiente) {
      return { 
        text: '✓ Confirmar Finalización', 
        disabled: false, 
        style: 'background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); animation: pulse 2s infinite;' 
      };
    }

    // Estado normal - puede solicitar
    return { 
      text: '✓ Finalizar Proyecto', 
      disabled: false, 
      style: '' 
    };
  }

  openCompletionModal() {
    if (!this.currentConversation?.proyecto) return;
    
    const project = this.currentConversation.proyecto as any;
    const estado = project.estadoFinalizacion || 'pendiente';
    const isCreator = project.usuarioCreadorId === this.currentUserId;

    // Si ya está finalizado, no hacer nada
    if (estado === 'finalizado') {
      return;
    }

    // Verificar si yo solicité y estoy esperando
    const miSolicitud = (isCreator && estado === 'finalizado_por_creador') || 
                        (!isCreator && estado === 'finalizado_por_asignado');
    
    if (miSolicitud) {
      // Mostrar modal informativo
      alert('Ya has solicitado la finalización. Esperando que la otra parte confirme o rechace.');
      return;
    }

    // Verificar si la otra parte solicitó (necesito confirmar)
    const solicitudPendiente = (isCreator && estado === 'finalizado_por_asignado') || 
                               (!isCreator && estado === 'finalizado_por_creador');
    
    this.isConfirmingCompletion = solicitudPendiente;
    
    if (this.isConfirmingCompletion) {
      this.requesterName = this.currentConversation!.otherUser.nombre;
    }
    
    this.showCompletionModal = true;
  }

  handleCompletionConfirm() {
    if (!this.currentConversation?.proyecto || !this.currentUserId) return;
    
    this.completionLoading = true;
    const projectId = this.currentConversation.proyecto.id;

    if (this.isConfirmingCompletion) {
      // Confirmar la finalización solicitada por la otra parte
      this.ratingService.confirmCompletion(projectId, this.currentUserId, true).subscribe({
        next: (response) => {
          this.completionLoading = false;
          this.showCompletionModal = false;
          
          // Actualizar el estado del proyecto en la conversación actual
          if (this.currentConversation) {
            (this.currentConversation.proyecto as any).estadoFinalizacion = 'finalizado';
          }
          
          alert('Proyecto finalizado exitosamente');
          
          // Mostrar modal de calificación si es el creador
          const project = this.currentConversation!.proyecto as any;
          if (project.usuarioCreadorId === this.currentUserId) {
            setTimeout(() => {
              this.showRatingModal = true;
            }, 500);
          }
          
          // Recargar conversaciones para actualizar UI
          this.loadConversations();
        },
        error: (err) => {
          this.completionLoading = false;
          console.error('Error confirming completion:', err);
          alert('Error al confirmar finalización');
        }
      });
    } else {
      // Solicitar finalización
      this.ratingService.requestCompletion(projectId, this.currentUserId).subscribe({
        next: (response) => {
          this.completionLoading = false;
          this.showCompletionModal = false;
          
          // Actualizar el estado en la UI
          if (this.currentConversation && response.estadoFinalizacion) {
            (this.currentConversation.proyecto as any).estadoFinalizacion = response.estadoFinalizacion;
          }
          
          alert('Solicitud de finalización enviada. Esperando confirmación de la otra parte.');
          
          // Recargar conversaciones
          this.loadConversations();
        },
        error: (err) => {
          this.completionLoading = false;
          console.error('Error requesting completion:', err);
          alert('Error al solicitar finalización');
        }
      });
    }
  }

  handleCompletionReject() {
    if (!this.currentConversation?.proyecto || !this.currentUserId) return;
    
    this.completionLoading = true;
    const projectId = this.currentConversation.proyecto.id;

    this.ratingService.confirmCompletion(projectId, this.currentUserId, false).subscribe({
      next: (response) => {
        this.completionLoading = false;
        this.showCompletionModal = false;
        
        // Actualizar el estado del proyecto a pendiente
        if (this.currentConversation) {
          (this.currentConversation.proyecto as any).estadoFinalizacion = 'pendiente';
        }
        
        alert('Solicitud de finalización rechazada');
        
        // Recargar conversaciones
        this.loadConversations();
      },
      error: (err) => {
        this.completionLoading = false;
        console.error('Error rejecting completion:', err);
        alert('Error al rechazar finalización');
      }
    });
  }

  handleCompletionCancel() {
    this.showCompletionModal = false;
    this.isConfirmingCompletion = false;
    this.completionLoading = false;
  }

  // ✅ NUEVO: Métodos para calificación
  handleRatingSubmit(data: { rating: number; comentario: string }) {
    if (!this.currentConversation?.proyecto || !this.currentUserId) return;
    
    this.completionLoading = true;
    const projectId = this.currentConversation.proyecto.id;

    this.ratingService.rateProject(
      projectId,
      this.currentUserId,
      data.rating,
      data.comentario
    ).subscribe({
      next: (response) => {
        this.completionLoading = false;
        this.showRatingModal = false;
        alert('Calificación enviada exitosamente');
      },
      error: (err) => {
        this.completionLoading = false;
        console.error('Error rating project:', err);
        alert(err.error?.error || 'Error al enviar calificación');
      }
    });
  }

  handleRatingCancel() {
    this.showRatingModal = false;
    this.completionLoading = false;
  }
}