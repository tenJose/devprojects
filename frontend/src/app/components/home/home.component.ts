import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProjectService, Project } from '../../services/project.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  projects: Project[] = [];
  filteredProjects: Project[] = [];
  loading = true;
  error = '';
  
  // Filter states
  searchQuery = '';
  selectedStack = '';
  selectedType = '';
  selectedCompensation = '';
  sortBy = 'recent';
  
  // Pagination
  currentPage = 1;
  totalPages = 1;
  itemsPerPage = 6;
  
  // Available filters
  techStacks = ['React', 'Angular', 'Vue', 'Next.js', 'Python', 'FastAPI', 'Docker', 'AWS', 'Node.js', 'Express'];
  projectTypes = ['Frontend', 'Backend', 'Full Stack', 'Mobile', 'DevOps', 'UI/UX', 'Data Science'];
  compensationTypes = ['Fixed Price', 'Hourly Rate', 'Budget Range'];

  constructor(
    private projectService: ProjectService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadProjects();
  }

  loadProjects() {
    this.loading = true;
    this.projectService.getProjects().subscribe({
      next: (data) => {
        this.projects = data;
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar los proyectos';
        this.loading = false;
        console.error(err);
      }
    });
  }

  applyFilters() {
    let filtered = [...this.projects];

    // Search filter
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.techStack.some(tech => tech.toLowerCase().includes(query))
      );
    }

    // Tech stack filter
    if (this.selectedStack) {
      filtered = filtered.filter(p => 
        p.techStack.includes(this.selectedStack)
      );
    }

    // Project type filter
    if (this.selectedType) {
      filtered = filtered.filter(p => p.type === this.selectedType);
    }

    // Compensation filter
    if (this.selectedCompensation) {
      filtered = filtered.filter(p => p.compensationType === this.selectedCompensation);
    }

    // Sort
    if (this.sortBy === 'recent') {
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (this.sortBy === 'budget-high') {
      filtered.sort((a, b) => b.budget - a.budget);
    } else if (this.sortBy === 'budget-low') {
      filtered.sort((a, b) => a.budget - b.budget);
    }

    this.filteredProjects = filtered;
    this.totalPages = Math.ceil(filtered.length / this.itemsPerPage);
    this.currentPage = 1;
  }

  get paginatedProjects() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredProjects.slice(start, end);
  }

  onSearchChange() {
    this.applyFilters();
  }

  onFilterChange() {
    this.applyFilters();
  }

  clearFilters() {
    this.searchQuery = '';
    this.selectedStack = '';
    this.selectedType = '';
    this.selectedCompensation = '';
    this.sortBy = 'recent';
    this.applyFilters();
  }

  viewDetails(projectId: number) {
    this.router.navigate(['/project', projectId]);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
