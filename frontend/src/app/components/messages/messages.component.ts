import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { RouterLink, ActivatedRoute, Router } from "@angular/router"
import { MessageService, Conversation, Message } from "../../services/message.service"
import { AuthService } from "../../services/auth.service"
import { UsuarioService } from "../../services/usuario.service"

@Component({
  selector: "app-messages",
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink], // ✅ CommonModule es vital aquí
  templateUrl: "./messages.component.html",
  styleUrls: ["./messages.component.css"],
})
export class MessagesComponent implements OnInit, AfterViewChecked {
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
  
  // Cambia esto si tu puerto de backend es diferente
  API_BASE_URL = 'http://localhost:3000';

  constructor(
    private messageService: MessageService,
    private authService: AuthService,
    private usuarioService: UsuarioService,
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
    this.currentConversation = conversation
    if (conversation.conversacionId !== 'new') {
        this.loadMessages(conversation.otherUser.id)
    } else {
        this.messages = [];
    }

    if (conversation.mensajesNoLeidos > 0) {
      conversation.mensajesNoLeidos = 0
      conversation.leido = true
    }
  }

  loadMessages(otherUserId: number) {
    this.messageService.getMessages(otherUserId).subscribe({
      next: (data) => {
        this.messages = data
        setTimeout(() => this.scrollToBottom(), 100);
      },
      error: (err) => console.error(err),
    })
  }

  sendMessage() {
    if (!this.newMessage.trim() || !this.currentConversation || !this.currentUserId) return

    const content = this.newMessage
    const recipientId = this.currentConversation.otherUser.id

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

    this.messageService.sendMessage(recipientId, content).subscribe({
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
}