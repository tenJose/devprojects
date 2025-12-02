import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AiAssistService {
  // Use explicit backend URL in development to avoid depending on angular proxy configuration
  private baseUrl = 'http://localhost:3000/api/ai';
  private apiUrl = `${this.baseUrl}/generate`;

  constructor(private http: HttpClient) {}

  generateProjectFromPrompt(prompt: string): Observable<any> {
    // Try backend AI endpoint if available; otherwise fallback to a small local mock
    return this.http.post(this.apiUrl, { prompt }).pipe(
      map((res: any) => res),
      catchError(() => {
        // Fallback: simple heuristic parser to generate a project skeleton
        const lower = (prompt || '').toLowerCase();
        const result: any = {
          title: '',
          description: '',
          techStack: [] as string[],
          type: 'Full Stack',
          duration: '3 meses',
          budget: 1000,
          teamSize: '1-3',
          rationale: ''
        };

        // Try to detect common intents and suggest a stack
        if (lower.includes('tiend') || lower.includes('ecommerce') || lower.includes('shop') || lower.includes('inventario') || lower.includes('punto de venta') || lower.includes('pos')) {
          result.title = 'Sistema de gestión para tienda (Inventario + Punto de Venta)';
          result.description = 'Plataforma para gestionar productos, control de inventario, ventas en punto de venta (POS) y reportes. Incluye roles para empleados, manejo de stock y generación de facturas.';
          result.techStack = ['Node.js', 'Angular', 'MySQL'];
          result.type = 'Full Stack';
          result.budget = 3000;
          result.duration = '2-3 meses';
          result.teamSize = '2-4';
          result.rationale = 'Node.js + Angular + MySQL proporciona rapidez en desarrollo full-stack y facilidad de despliegue para aplicaciones CRUD con panel administrativo.';
        } else if (lower.includes('app') || lower.includes('mobile') || lower.includes('movil')) {
          result.title = 'Aplicación móvil';
          result.description = 'Aplicación móvil con las funcionalidades solicitadas; incluye conexión a backend para sincronización y notificaciones.';
          result.techStack = ['React Native', 'Node.js'];
          result.type = 'Mobile';
          result.rationale = 'React Native permite desarrollar para iOS y Android rápidamente compartiendo código con un backend Node.js.';
        } else {
          // Generic fallback: create improved title and description
          const firstSentence = prompt.split(/[\.\n]/)[0];
          result.title = firstSentence ? `${firstSentence.trim().slice(0, 60)}` : 'Proyecto generado por IA';
          result.description = `${prompt}\n\nGenerado automáticamente. Por favor revise y ajuste.`;
          // Heuristic: suggest Node.js for general web apps
          result.techStack = ['Node.js', 'Express', 'MySQL'];
          result.rationale = 'Stack genérico recomendado para aplicaciones web con base de datos relacional.';
        }

        return of(result);
      })
    );
  }

  generateQuestions(prompt: string, history?: Array<{question:string, answer:string}>): Observable<{questions:string[], done:boolean}> {
    const base = this.baseUrl;
    return this.http.post(`${base}/questions`, { prompt, history }).pipe(
      map((res: any) => {
        if (res && typeof res === 'object') {
          return { questions: Array.isArray(res.questions) ? res.questions : [], done: !!res.done };
        }
        return { questions: [], done: true };
      }),
      catchError(() => {
        // Fallback local heuristic: create a single user-friendly question based on prompt and history
        const lower = (prompt || '').toLowerCase();
        const hist: any[] = Array.isArray(history) ? history : [];
        if (hist.length === 0) {
          return of({ questions: ['¿Quién usará principalmente la aplicación? (clientes, empleados o ambos)'], done: false });
        }
        const askedBudget = hist.some(h => /presupuest|invers|usd|\d+/.test(String(h.question).toLowerCase()) || /\d+/.test(String(h.answer)));
        if (!askedBudget) return of({ questions: ['¿Cuánto planeas invertir aproximado en USD? (ej: 1000)'], done: false });
        const askedTime = hist.some(h => /tiemp|mes|semana|plazo/.test(String(h.question).toLowerCase()) || /mes|semana|\d+/.test(String(h.answer)));
        if (!askedTime) return of({ questions: ['¿En cuánto tiempo te gustaría tenerlo listo? (ej: 1 mes, 3 meses)'], done: false });
        return of({ questions: [], done: true });
      })
    );
  }
}
