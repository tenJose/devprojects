import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-rating-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-overlay" (click)="onCancel()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>Calificar Proyecto</h2>
          <button class="btn-close" (click)="onCancel()">×</button>
        </div>
        
        <div class="modal-body">
          <div class="engineer-info" *ngIf="engineerName">
            <p>Califica el trabajo de <strong>{{ engineerName }}</strong></p>
          </div>

          <div class="rating-section">
            <label>Calificación:</label>
            <div class="stars">
              <span 
                *ngFor="let star of [1,2,3,4,5]" 
                class="star" 
                [class.filled]="star <= rating"
                (click)="setRating(star)"
                (mouseenter)="hoverRating = star"
                (mouseleave)="hoverRating = 0">
                {{ (hoverRating >= star || (!hoverRating && rating >= star)) ? '★' : '☆' }}
              </span>
            </div>
            <p class="rating-text">{{ getRatingText() }}</p>
          </div>

          <div class="comment-section">
            <label for="comentario">Comentario (opcional):</label>
            <textarea 
              id="comentario"
              [(ngModel)]="comentario"
              placeholder="Comparte tu experiencia trabajando en este proyecto..."
              rows="4"
              maxlength="500">
            </textarea>
            <span class="char-count">{{ comentario.length }}/500</span>
          </div>

          <p class="error-message" *ngIf="error">{{ error }}</p>
        </div>
        
        <div class="modal-footer">
          <button class="btn btn-secondary" (click)="onCancel()" [disabled]="loading">
            Cancelar
          </button>
          <button 
            class="btn btn-primary" 
            (click)="onSubmit()"
            [disabled]="loading || rating === 0">
            {{ loading ? 'Enviando...' : 'Enviar Calificación' }}
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
      max-width: 550px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      max-height: 90vh;
      overflow-y: auto;
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

    .engineer-info {
      margin-bottom: 20px;
    }

    .engineer-info p {
      margin: 0;
      font-size: 1rem;
      color: #555;
    }

    .rating-section {
      margin-bottom: 20px;
      text-align: center;
    }

    .rating-section label {
      display: block;
      margin-bottom: 10px;
      font-weight: 600;
      color: #333;
    }

    .stars {
      font-size: 3rem;
      cursor: pointer;
      user-select: none;
    }

    .star {
      color: #ddd;
      transition: color 0.2s;
      margin: 0 5px;
    }

    .star.filled,
    .star:hover {
      color: #ffc107;
    }

    .rating-text {
      margin-top: 10px;
      font-size: 1rem;
      color: #666;
      min-height: 24px;
    }

    .comment-section {
      margin-bottom: 15px;
    }

    .comment-section label {
      display: block;
      margin-bottom: 8px;
      font-weight: 600;
      color: #333;
    }

    textarea {
      width: 100%;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 5px;
      font-family: inherit;
      font-size: 0.95rem;
      resize: vertical;
    }

    textarea:focus {
      outline: none;
      border-color: #007bff;
    }

    .char-count {
      display: block;
      text-align: right;
      font-size: 0.85rem;
      color: #999;
      margin-top: 5px;
    }

    .error-message {
      color: #dc3545;
      font-size: 0.9rem;
      margin-top: 10px;
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

    @media (max-width: 768px) {
      .modal-content {
        width: 95%;
        margin: 10px;
      }

      .stars {
        font-size: 2.5rem;
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
export class RatingModalComponent {
  @Input() engineerName = '';
  @Input() loading = false;
  @Output() submit = new EventEmitter<{ rating: number; comentario: string }>();
  @Output() cancel = new EventEmitter<void>();

  rating = 0;
  hoverRating = 0;
  comentario = '';
  error = '';

  setRating(value: number) {
    this.rating = value;
    this.error = '';
  }

  getRatingText(): string {
    const rating = this.hoverRating || this.rating;
    switch(rating) {
      case 1: return 'Muy malo';
      case 2: return 'Malo';
      case 3: return 'Regular';
      case 4: return 'Bueno';
      case 5: return 'Excelente';
      default: return 'Selecciona una calificación';
    }
  }

  onSubmit() {
    if (this.rating === 0) {
      this.error = 'Por favor selecciona una calificación';
      return;
    }

    this.submit.emit({
      rating: this.rating,
      comentario: this.comentario.trim()
    });
  }

  onCancel() {
    this.cancel.emit();
  }
}
