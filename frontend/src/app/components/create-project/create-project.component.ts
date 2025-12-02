import { Component, OnInit } from "@angular/core"; // 1. Agregado OnInit
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Router, ActivatedRoute, RouterLink } from "@angular/router"; // 2. Agregado ActivatedRoute
import { ProjectService } from "../../services/project.service";
import { AuthService } from "../../services/auth.service";
import { UsuarioService } from "../../services/usuario.service";
import { AiAssistService } from '../../services/ai-assist.service';

@Component({
  selector: "app-create-project",
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: "./create-project.component.html",
  styleUrls: ["./create-project.component.css"],
})
export class CreateProjectComponent implements OnInit { // 3. Implementar OnInit

  // Mode: 'assist' -> AI assisted flow, 'advanced' -> current form
  mode: 'assist' | 'advanced' = 'advanced';

  // AI assistant state
  aiPrompt = '';
  aiLoading = false;
  aiError = '';
  // Q&A step to reduce AI calls
  qaActive = false;
  // Single-question iterative flow state
  currentQuestion: string = '';
  currentAnswer: string = '';
  qaHistory: { question: string; answer: string }[] = [];
  qaLoading = false;
  // When true, the assistant just asked '¿Qué estás buscando?' and waits for user's idea
  awaitingUserResponse = false;

  // File attachments for upload
  selectedFiles: FileList | null = null;
  showDeleteConfirm = false;

  currentUser: any = null;
  isEditMode = false;
  projectId: number | null = null;

  project = {
    title: "",
    description: "",
    techStack: [] as string[],
    newTech: "",
    type: "Frontend",
    platform: "",
    features: [] as string[],
    adjuntos: [] as string[],
    budget: null,
    compensationType: "Fixed Price",
    duration: "",
    location: "Remote",
    teamSize: "",
    deadline: "",
  };

  // AI-provided title suggestions (if any)
  titleSuggestions: string[] = [];

  techInput = "";
  loading = false;
  error = "";

  availableTechs = ["React", "Angular", "Vue", "Node.js", "Python", "Java", "AWS", "Docker", "Figma", "TypeScript"];
  projectTypes = ["Frontend", "Backend", "Full Stack", "Mobile", "DevOps", "UI/UX", "Data Science"];

  constructor(
    private projectService: ProjectService,
    private router: Router,
    private route: ActivatedRoute, // 4. Inyectar ActivatedRoute (Soluciona error 'route does not exist')
    private authService: AuthService,      
    private usuarioService: UsuarioService
    , private aiAssist: AiAssistService
  ) {}

  ngOnInit() {
    this.loadUserProfile();
    
    // 5. Tipar 'params' explícitamente como 'any' (Soluciona error 'implicitly has an any type')
    this.route.params.subscribe((params: any) => {
      if (params['id']) {
        this.isEditMode = true;
        this.projectId = +params['id'];
        this.loadProjectData(this.projectId);
      }
    });
  }

  switchMode(m: 'assist' | 'advanced') {
    this.mode = m;
    if (m === 'assist') {
      // Automatically start the conversational flow when switching to assist
      this.startQuestionnaire();
    }
  }

  // Entry point when user clicks generate: if questionnaire not done, open it
  generateFromAi() {
    if (!this.aiPrompt || this.aiPrompt.trim().length < 6) {
      this.aiError = 'Por favor ingresa una breve descripción o idea del proyecto.';
      return;
    }

    // Directly generate the project from the user's idea/prompt
    this.aiLoading = true;
    this.aiError = '';

    this.aiAssist.generateProjectFromPrompt(this.aiPrompt).subscribe({
      next: (res: any) => {
        const payload = res.data || res || {};
        // Prefer improved title if provided, otherwise first suggestion, otherwise raw title
        const suggestions = payload.title_suggestions || payload.titleSuggestions || payload.title_alternatives || payload.title_suggestions || [];
        this.titleSuggestions = Array.isArray(suggestions) ? suggestions : [];
        // Apply returned values, prefer explicit payloads
        this.project.title = payload.title || this.titleSuggestions[0] || this.project.title || this.aiPrompt.substring(0, 60);
        this.project.description = payload.description || payload.description_improved || this.project.description || this.aiPrompt;
        this.project.techStack = Array.isArray(payload.techStack) ? payload.techStack : (payload.techStack ? [payload.techStack] : []);
        // If the model explicitly set platform or a Mobile type, ensure project.type is Mobile
        if (payload.platform || (payload.type && String(payload.type).toLowerCase().includes('mobile'))) {
          this.project.type = 'Mobile';
        } else {
          this.project.type = payload.type || this.project.type;
        }
        // Store platform and features if provided
        this.project.platform = payload.platform || payload.platform_detected || this.project.platform;
        this.project.features = Array.isArray(payload.features) ? payload.features : (payload.features ? [payload.features] : this.project.features);
        this.project.duration = payload.duration || this.project.duration;
        this.project.budget = payload.budget || this.project.budget;
        this.project.teamSize = payload.teamSize || this.project.teamSize;

        this.aiLoading = false;
        this.mode = 'advanced';
        // Reset QA flow so user can re-run if needed
        this.qaActive = false;
      },
      error: (err: any) => {
        console.error('AI generation error', err);
        this.aiError = 'Ocurrió un error generando el proyecto con IA.';
        this.aiLoading = false;
      }
    });
  }

  // Allow user to pick one of the suggestions to set as title
  pickTitleSuggestion(s: string) {
    if (s && s.trim().length > 0) {
      this.project.title = s.trim();
    }
  }

  startQuestionnaire() {
    // Open the conversational flow without any pre-defined question.
    // The UI will ask the user to describe their idea; after the user submits
    // the initial description, the assistant will generate follow-up questions dynamically.
    this.aiError = '';
    this.aiPrompt = '';
    this.currentQuestion = '';
    this.currentAnswer = '';
    this.qaHistory = [];
    this.qaActive = true;
    this.awaitingUserResponse = true;
    this.qaLoading = false;
    // Reset AI-related transient state so the assistant can run repeatedly
    this.aiLoading = false;
    this.titleSuggestions = [];
  }

  // Build combined prompt from initial idea + QA answers
  buildCombinedPrompt(): string {
    // Build a clear prompt that asks the assistant to:
    // - Improve the title and description into an engineer-friendly form
    // - Suggest an appropriate tech stack based on user answers
    // - Return a JSON with fields: title, description, techStack(array), type, duration, budget(number), teamSize
    const lines: string[] = [];
    lines.push(`User idea: ${this.aiPrompt.trim()}`);
    lines.push('User answers:');
    this.qaHistory.forEach((qa, i) => {
      if (qa.answer && qa.answer.trim().length > 0) {
        lines.push(`${i + 1}. ${qa.question} ${qa.answer.trim()}`);
      }
    });

    lines.push('\nInstruction: From the idea and answers above, produce a JSON object with keys:\n'
      + 'title (short, improved and clear for engineers),\n'
      + 'description (detailed technical description including features and API/UX notes),\n'
      + 'techStack (array of recommended technologies/frameworks),\n'
      + 'type (one of: Frontend, Backend, Full Stack, Mobile, DevOps, UI/UX, Data Science),\n'
      + 'duration (string),\n'
      + 'budget (number in USD),\n'
      + 'teamSize (string),\n'
      + 'rationale (short explanation why the suggested tech stack fits the request).\n'
      + 'Only return valid JSON in the response.');

    return lines.join('\n');
  }
  // Submit the current single question answer and continue the iterative loop
  submitCurrentAnswer() {
    // If we are waiting for user's initial idea, directly generate the project
    if (this.awaitingUserResponse) {
      if (!this.currentAnswer || this.currentAnswer.trim().length === 0) {
        this.aiError = 'Por favor describe tu idea antes de continuar.';
        return;
      }
      this.aiError = '';
      // Save user's idea as the main prompt
      this.aiPrompt = this.currentAnswer.trim();
      this.currentAnswer = '';
      this.qaLoading = true;
      this.awaitingUserResponse = false;
      
      // Directly generate the project without asking follow-up questions
      this.generateFromAi();
      return;
    }

    // Otherwise this is an answer to a dynamically generated follow-up question
    if (!this.currentQuestion) {
      // Nothing to answer
      this.aiError = 'No hay una pregunta activa para responder.';
      return;
    }

    // Save the answer to history and ask AI for the next dynamic question
    this.qaHistory.push({ question: this.currentQuestion, answer: this.currentAnswer });
    this.currentAnswer = '';
    this.aiError = '';
    this.qaLoading = true;
    this.aiAssist.generateQuestions(this.aiPrompt, this.qaHistory).subscribe({
      next: (res: { questions: string[]; done: boolean }) => {
        const questions = res && Array.isArray(res.questions) ? res.questions : [];
        const done = !!res.done;
        if (questions.length > 0) {
          this.currentQuestion = questions[0];
          this.qaActive = true;
        } else if (done) {
          // AI decided it's done — generate final draft
          this.currentQuestion = '';
          this.qaActive = false;
          this.generateFromAi();
        } else {
          // Proceed to generate with collected info
          this.currentQuestion = '';
          this.qaActive = false;
          this.generateFromAi();
        }
        this.qaLoading = false;
      },
      error: (err) => {
        console.error('Error continuing questions', err);
        this.aiError = 'No se pudieron continuar las preguntas. Generando con la información disponible.';
        this.qaActive = false;
        this.qaLoading = false;
        this.generateFromAi();
      }
    });
  }

  // Omit remaining questions and generate using collected history (if any)
  omitAndGenerate() {
    // Save current answer (if any) and generate draft with collected info
    if (this.currentAnswer && this.currentAnswer.trim().length > 0) {
      // If there was no explicit question (initial idea), store it as 'Idea'
      const q = this.currentQuestion || 'Idea';
      this.qaHistory.push({ question: q, answer: this.currentAnswer });
    }
    this.currentAnswer = '';
    this.currentQuestion = '';
    this.qaActive = false;
    this.generateFromAi();
  }

  loadProjectData(id: number) {
    this.loading = true;
    this.projectService.getProjectById(id).subscribe({
      next: (data: any) => {
        // Try to extract platform/features metadata if backend stored them
        let detectedPlatform = '';
        let detectedFeatures: string[] = [];
        try {
          const meta = data.caracteristicas_detectadas || data.caracteristicasDetectadas || data.metadata || null;
          if (meta) {
            const parsedMeta = typeof meta === 'string' ? JSON.parse(meta) : meta;
            detectedPlatform = parsedMeta.platform || parsedMeta.plataforma || '';
            const feats = parsedMeta.features || parsedMeta.funcionalidades || parsedMeta.features_list || [];
            if (typeof feats === 'string') {
              detectedFeatures = feats.split(/\n|,|;|\.|\-|\u2022/).map((s: string) => s.trim()).filter((s: string) => s.length > 0);
            } else if (Array.isArray(feats)) {
              detectedFeatures = feats;
            }
          }
        } catch (err) {
          console.warn('No se pudo parsear caracteristicas_detectadas:', err);
        }

        this.project = {
          title: data.titulo,
          description: data.descripcion,
          // Aseguramos que sea array. Si el backend lo devuelve como string JSON, lo parseamos.
          techStack: Array.isArray(data.tecnologias) ? data.tecnologias : JSON.parse(data.tecnologias || '[]'),
          newTech: "",
          type: data.tipo_proyecto || data.tipoProyecto, // Ajustar según lo que devuelva tu backend
          platform: detectedPlatform || '',
          features: detectedFeatures,
          adjuntos: Array.isArray(data.adjuntos) ? data.adjuntos : (data.adjuntos ? JSON.parse(data.adjuntos) : []),
          budget: data.presupuesto,
          compensationType: data.presupuestoTipo || "Fixed Price",
          duration: data.duracion || data.duracionEstimada,
          location: data.ubicacion,
          teamSize: data.tamanoEquipo || "",
          deadline: data.fechaLimite ? (typeof data.fechaLimite === 'string' ? data.fechaLimite.split('T')[0] : new Date(data.fechaLimite).toISOString().split('T')[0]) : ""
        };
        this.loading = false;
      },
      error: (err) => {
        this.error = "Error al cargar el proyecto";
        this.loading = false;
      }
    });
  }

  addTech(tech: string) {
    if (tech && !this.project.techStack.includes(tech)) {
      this.project.techStack.push(tech);
    }
    this.techInput = "";
  }

  removeTech(tech: string) {
    this.project.techStack = this.project.techStack.filter((t) => t !== tech);
  }

  onTechInputKeydown(event: KeyboardEvent) {
    if (event.key === "Enter") {
      event.preventDefault();
      this.addTech(this.techInput);
    }
  }

  createProject() {
    if (!this.project.title || !this.project.description) {
      this.error = "Por favor completa los campos requeridos";
      return;
    }

    if (!this.currentUser?.id) {
      this.error = "No se pudo identificar al usuario";
      return;
    }

    this.loading = true;
    this.error = "";

    const projectData = {
      nombre: this.project.title,
      descripcion: this.project.description,
      tecnologias: JSON.stringify(this.project.techStack),
      // Append detected platform/features to description so they are persisted as part of the project
      // (backend database may not have dedicated fields for these)
      caracteristicas_detectadas: JSON.stringify({ platform: this.project.platform, features: this.project.features }),
      tipoProyecto: this.project.type,
      presupuesto: this.project.budget,
      presupuestoTipo: this.project.compensationType,
      duracionEstimada: this.project.duration,
      ubicacion: this.project.location,
      tamanoEquipo: this.project.teamSize,
      fechaLimite: this.project.deadline ? new Date(this.project.deadline) : null,
      usuarioCreadorId: this.currentUser.id
    };

    if (this.isEditMode && this.projectId) {
      // For update, backend expects 'titulo' rather than 'nombre' in some controllers
      const updatePayload: any = { ...projectData, titulo: projectData.nombre };
      // 6. Usamos 'as any' para evitar el conflicto de tipos (string vs string[])
      this.projectService.updateProject(this.projectId, updatePayload as any).subscribe({
        next: () => {
          // If there are selected files, upload them and then navigate
          if (this.selectedFiles && this.selectedFiles.length > 0) {
            this.projectService.uploadProjectFiles(this.projectId as number, this.selectedFiles).subscribe({
              next: () => {
                this.loading = false;
                this.router.navigate(["/home"]);
              },
              error: (err) => {
                console.error('Error uploading files after update', err);
                this.loading = false;
                this.router.navigate(["/home"]);
              }
            });
          } else {
            this.loading = false;
            this.router.navigate(["/home"]);
          }
        },
        error: (err) => {
          this.loading = false;
          this.error = "Error al actualizar el proyecto.";
          console.error(err);
        }
      });
    } else {
      // Usamos 'as any' aquí también
      this.projectService.createProject(projectData as any).subscribe({
        next: (res) => {
          // If there are selected files, upload them to the newly created project
          const newId = (res as any)?.id;
          if (this.selectedFiles && this.selectedFiles.length > 0 && newId) {
            this.projectService.uploadProjectFiles(newId, this.selectedFiles).subscribe({
              next: () => {
                this.loading = false;
                this.router.navigate(["/home"]);
              },
              error: (err) => {
                console.error('Error uploading files after create', err);
                this.loading = false;
                this.router.navigate(["/home"]);
              }
            });
          } else {
            this.loading = false;
            this.router.navigate(["/home"]);
          }
        },
        error: (err) => {
          this.loading = false;
          this.error = "Error al crear el proyecto. Intenta nuevamente.";
          console.error(err);
        },
      });
    }
  }

  loadUserProfile() {
    this.usuarioService.obtenerPerfil().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.currentUser = res.data;
        }
      },
      error: (err) => console.error("Error loading profile:", err)
    });
  }

  getFullPhotoUrl(fileName: string | null | undefined): string {
    if (!fileName) return 'assets/default-avatar.png';
    if (fileName.startsWith('/uploads')) return `http://localhost:3000${fileName}`;
    return `http://localhost:3000/uploads/${fileName}`;
  }

  isImage(file: string | undefined): boolean {
    if (!file) return false;
    return /\.(png|jpg|jpeg|gif)$/i.test(file);
  }

  openFile(url: string) {
    const full = this.getFullPhotoUrl(url);
    window.open(full, '_blank');
  }

saveAsDraft() {
    console.log("Guardando borrador...", this.project);
    // Aquí puedes implementar la lógica real, por ejemplo guardar en localStorage
    alert("Funcionalidad de borrador no implementada aún, pero el botón funciona.");
  }

  get selectedFilesArray(): File[] {
    return this.selectedFiles ? Array.from(this.selectedFiles) : [];
  }

  confirmDelete() {
    if (!this.projectId) return;
    this.loading = true;
    this.projectService.deleteProject(this.projectId).subscribe({
      next: () => {
        this.loading = false;
        this.showDeleteConfirm = false;
        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.loading = false;
        this.showDeleteConfirm = false;
        this.error = 'Error al eliminar el proyecto.';
        console.error(err);
      }
    });
  }

}