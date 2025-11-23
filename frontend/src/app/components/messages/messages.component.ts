import { Component, type OnInit, ViewChild, type ElementRef, type AfterViewChecked } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { RouterLink } from "@angular/router"
import type { MessageService, Conversation, Message } from "../../services/message.service"
import type { AuthService } from "../../services/auth.service"

@Component({
  selector: "app-messages",
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
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

  constructor(
    private messageService: MessageService,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    const user = this.authService.getCurrentUser()
    if (user) {
      this.currentUserId = user.id
    }
    this.loadConversations()
  }

  ngAfterViewChecked() {
    this.scrollToBottom()
  }

  scrollToBottom(): void {
    try {
      this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight
    } catch (err) {}
  }

  loadConversations() {
    this.loading = true
    this.messageService.getConversations().subscribe({
      next: (data) => {
        this.conversations = data
        this.filteredConversations = data
        this.loading = false

        // Auto-select first conversation if available
        if (this.conversations.length > 0 && !this.currentConversation) {
          this.selectConversation(this.conversations[0])
        }
      },
      error: (err) => {
        console.error("Error loading conversations:", err)
        this.loading = false
      },
    })
  }

  selectConversation(conversation: Conversation) {
    this.currentConversation = conversation
    this.loadMessages(conversation.otherUser.id)

    // Update local read status
    if (conversation.mensajesNoLeidos > 0) {
      conversation.mensajesNoLeidos = 0
      conversation.leido = true
    }
  }

  loadMessages(otherUserId: number) {
    this.messageService.getMessages(otherUserId).subscribe({
      next: (data) => {
        this.messages = data
        this.scrollToBottom()
      },
      error: (err) => console.error(err),
    })
  }

  sendMessage() {
    if (!this.newMessage.trim() || !this.currentConversation || !this.currentUserId) return

    const content = this.newMessage
    const recipientId = this.currentConversation.otherUser.id

    // Optimistic UI update
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
    this.scrollToBottom()

    this.messageService.sendMessage(recipientId, content).subscribe({
      next: (sentMessage) => {
        // Replace temp message or just update ID if needed
        const index = this.messages.findIndex((m) => m.id === tempMessage.id)
        if (index !== -1) {
          this.messages[index] = sentMessage
        }

        // Update conversation preview
        if (this.currentConversation) {
          this.currentConversation.ultimoMensaje = content
          this.currentConversation.fecha = new Date().toISOString()

          // Move conversation to top
          this.conversations = [
            this.currentConversation,
            ...this.conversations.filter((c) => c !== this.currentConversation),
          ]
          this.filterConversations()
        }
      },
      error: (err) => {
        console.error("Error sending message:", err)
        // Remove temp message on error
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
          c.otherUser.apellido?.toLowerCase().includes(query) ||
          c.proyecto?.nombre.toLowerCase().includes(query),
      )
    }
  }
}
