import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-project-completion-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-overlay" (click)="onCancel()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>{{ isConfirming ? 'Confirmar Finalización' : 'Finalizar Proyecto' }}</h2>
          <button class="btn-close" (click)="onCancel()">×</button>
        </div>
        
        <div class="modal-body">
          <p *ngIf="!isConfirming">
            ¿Estás seguro de que deseas marcar este proyecto como finalizado?
          </p>
          <p *ngIf="!isConfirming" class="info-text">
            Se enviará una notificación a la otra parte para que confirme la finalización.
          </p>
          
          <p *ngIf="isConfirming">
            <strong>{{ requesterName }}</strong> ha solicitado finalizar este proyecto.
          </p>
          <p *ngIf="isConfirming" class="info-text">
            ¿Confirmas que el proyecto ha sido completado exitosamente?
          </p>
        </div>
        
        <div class="modal-footer">
          <button class="btn btn-secondary" (click)="onCancel()">
            Cancelar
          </button>
          <button 
            *ngIf="!isConfirming" 
            class="btn btn-primary" 
            (click)="onConfirm()"
            [disabled]="loading">
            {{ loading ? 'Enviando...' : 'Solicitar Finalización' }}
          </button>
          <button 
            *ngIf="isConfirming" 
            class="btn btn-danger" 
            (click)="onReject()"
            [disabled]="loading">
            {{ loading ? 'Procesando...' : 'Rechazar' }}
          </button>
          <button 
            *ngIf="isConfirming" 
            class="btn btn-success" 
            (click)="onConfirmCompletion()"
            [disabled]="loading">
            {{ loading ? 'Procesando...' : 'Confirmar Finalización' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal-content {
      background: white;
      border-radius: 8px;
      width: 90%;
      max-width: 500px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .modal-header {
      padding: 20px;
      border-bottom: 1px solid #e0e0e0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .modal-header h2 {
      margin: 0;
      font-size: 1.5rem;
      color: #333;
    }

    .btn-close {
      background: none;
      border: none;
      font-size: 2rem;
      color: #999;
      cursor: pointer;
      padding: 0;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .btn-close:hover {
      color: #333;
    }

    .modal-body {
      padding: 20px;
    }

    .modal-body p {
      margin: 0 0 15px 0;
      font-size: 1rem;
      color: #555;
    }

    .info-text {
      font-size: 0.9rem;
      color: #777;
    }

    .modal-footer {
      padding: 15px 20px;
      border-top: 1px solid #e0e0e0;
      display: flex;
      gap: 10px;
      justify-content: flex-end;
    }

    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-size: 1rem;
      transition: all 0.3s;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-secondary {
      background: #6c757d;
      color: white;
    }

    .btn-secondary:hover:not(:disabled) {
      background: #5a6268;
    }

    .btn-primary {
      background: #007bff;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: #0056b3;
    }

    .btn-success {
      background: #28a745;
      color: white;
    }

    .btn-success:hover:not(:disabled) {
      background: #218838;
    }

    .btn-danger {
      background: #dc3545;
      color: white;
    }

    .btn-danger:hover:not(:disabled) {
      background: #c82333;
    }

    @media (max-width: 768px) {
      .modal-content {
        width: 95%;
        margin: 10px;
      }

      .modal-footer {
        flex-direction: column;
      }

      .btn {
        width: 100%;
      }
    }
  `]
})
export class ProjectCompletionModalComponent {
  @Input() isConfirming = false;
  @Input() requesterName = '';
  @Input() loading = false;
  @Output() confirm = new EventEmitter<void>();
  @Output() reject = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onConfirm() {
    this.confirm.emit();
  }

  onConfirmCompletion() {
    this.confirm.emit();
  }

  onReject() {
    this.reject.emit();
  }

  onCancel() {
    this.cancel.emit();
  }
}
