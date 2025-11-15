import { Component, computed, signal, effect } from '@angular/core';
import { DatePipe, NgFor, NgClass, UpperCasePipe, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  CdkDrag,
  CdkDropList,
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { ApiService, Task, TeamMember } from './api.service';
import { firstValueFrom } from 'rxjs';

type Status = Task['status'];

@Component({
  standalone: true,
  selector: 'app-board',
  imports: [
    NgFor,
    NgIf,
    NgClass,
    FormsModule,
    DragDropModule,
    CdkDropList,
    CdkDrag,
    DatePipe,
    UpperCasePipe,
  ],
  styleUrls: ['./board.component.css'],
  template: `
    <div class="app-shell">
      <!-- Top header -->
      <header class="app-header">
        <div class="app-title-block">
          <div class="app-kicker">Workspace</div>
          <div class="app-title">Tasks</div>
          <div class="app-subtitle">Lightweight task board for your secure-tasks demo.</div>
        </div>

        <div class="app-header-right">
          <div class="app-user-meta">
            <div class="app-user-email">{{ email() || 'owner@example.com' }}</div>
            <div class="app-user-role">Org owner</div>
          </div>
          <div class="app-avatar">
            {{ (email() || 'O')[0] | uppercase }}
          </div>
          <button class="pill pill-soft" (click)="logout()">
            Logout
          </button>
        </div>
      </header>

      <!-- Main layout -->
      <main class="app-main">
        <!-- Left sidebar -->
        <aside class="sidebar">
          <div class="sidebar-section-label">Overview</div>
          <div class="sidebar-pill">
            <span class="sidebar-pill-dot"></span>
            <span>1 workspace · Kanban</span>
          </div>
          <div class="sidebar-meta">
            Drag cards between columns. Changes are persisted via your NestJS API.
          </div>
        </aside>

        <!-- Board -->
        <section class="board">
          <div class="board-header">
            <div class="board-title-block">
              <div class="board-title">Today's board</div>
              <div class="board-meta">
                {{ allTasks().length }} tasks · {{ now | date : 'MMM d' }}
              </div>
            </div>

            <button class="pill pill-strong" type="button" (click)="openNewTask()">
              New Task
            </button>
          </div>

          <!-- Columns -->
          <div class="board-columns" cdkDropListGroup>
            <!-- To-Do -->
            <div class="column">
              <div class="column-header">
                <div class="column-title-row">
                  <span class="column-dot todo"></span>
                  <span class="column-title">To-Do</span>
                </div>
                <span class="column-count-badge">
                  {{ todo().length }} tasks
                </span>
              </div>

              <div
                class="column-drop"
                cdkDropList
                [cdkDropListData]="todoList()"
                (cdkDropListDropped)="onDrop($event, 'todo')"
              >
                @for (task of todo(); track task.id) {
                  <div class="task-card" cdkDrag [cdkDragData]="task">
                    <div class="task-header">
                      <div>
                        <div class="task-title">{{ task.title }}</div>
                        <div class="task-meta">
                          {{ task.category || 'General' }} · pos {{ task.position }}
                        </div>
                      </div>
                      <div class="task-actions">
                        <button
                          class="icon-button icon-button-edit"
                          (click)="editTask(task); $event.stopPropagation()"
                          type="button"
                          title="Edit task"
                        >
                          ✎
                        </button>
                        <select
                          class="status-select"
                          [value]="task.status"
                          (change)="changeStatus(task, $event)"
                          (click)="$event.stopPropagation()"
                        >
                          <option value="todo">To-Do</option>
                          <option value="doing">Doing</option>
                          <option value="done">Done</option>
                        </select>
                        <button
                          class="icon-button"
                          (click)="deleteTask(task); $event.stopPropagation()"
                          type="button"
                          title="Delete task"
                        >
                          ✕
                        </button>
                      </div>
                    </div>

                    <div class="task-footer">
                      <span class="pill pill-soft">To-Do</span>
                    </div>
                  </div>
                }
              </div>
            </div>

            <!-- Doing -->
            <div class="column">
              <div class="column-header">
                <div class="column-title-row">
                  <span class="column-dot in-progress"></span>
                  <span class="column-title">Doing</span>
                </div>
                <span class="column-count-badge">
                  {{ doing().length }} tasks
                </span>
              </div>

              <div
                class="column-drop"
                cdkDropList
                [cdkDropListData]="doingList()"
                (cdkDropListDropped)="onDrop($event, 'doing')"
              >
                @for (task of doing(); track task.id) {
                  <div class="task-card" cdkDrag [cdkDragData]="task">
                    <div class="task-header">
                      <div>
                        <div class="task-title">{{ task.title }}</div>
                        <div class="task-meta">
                          {{ task.category || 'General' }} · pos {{ task.position }}
                        </div>
                      </div>
                      <div class="task-actions">
                        <button
                          class="icon-button icon-button-edit"
                          (click)="editTask(task); $event.stopPropagation()"
                          type="button"
                          title="Edit task"
                        >
                          ✎
                        </button>
                        <select
                          class="status-select"
                          [value]="task.status"
                          (change)="changeStatus(task, $event)"
                          (click)="$event.stopPropagation()"
                        >
                          <option value="todo">To-Do</option>
                          <option value="doing">Doing</option>
                          <option value="done">Done</option>
                        </select>
                        <button
                          class="icon-button"
                          (click)="deleteTask(task); $event.stopPropagation()"
                          type="button"
                          title="Delete task"
                        >
                          ✕
                        </button>
                      </div>
                    </div>

                    <div class="task-footer">
                      <span class="pill pill-soft">In progress</span>
                    </div>
                  </div>
                }
              </div>
            </div>

            <!-- Done -->
            <div class="column">
              <div class="column-header">
                <div class="column-title-row">
                  <span class="column-dot done"></span>
                  <span class="column-title">Done</span>
                </div>
                <span class="column-count-badge">
                  {{ done().length }} tasks
                </span>
              </div>

              <div
                class="column-drop"
                cdkDropList
                [cdkDropListData]="doneList()"
                (cdkDropListDropped)="onDrop($event, 'done')"
              >
                @for (task of done(); track task.id) {
                  <div class="task-card" cdkDrag [cdkDragData]="task">
                    <div class="task-header">
                      <div>
                        <div class="task-title">{{ task.title }}</div>
                        <div class="task-meta">
                          {{ task.category || 'General' }} · pos {{ task.position }}
                        </div>
                      </div>
                      <div class="task-actions">
                        <button
                          class="icon-button icon-button-edit"
                          (click)="editTask(task); $event.stopPropagation()"
                          type="button"
                          title="Edit task"
                        >
                          ✎
                        </button>
                        <select
                          class="status-select"
                          [value]="task.status"
                          (change)="changeStatus(task, $event)"
                          (click)="$event.stopPropagation()"
                        >
                          <option value="todo">To-Do</option>
                          <option value="doing">Doing</option>
                          <option value="done">Done</option>
                        </select>
                        <button
                          class="icon-button"
                          (click)="deleteTask(task); $event.stopPropagation()"
                          type="button"
                          title="Delete task"
                        >
                          ✕
                        </button>
                      </div>
                    </div>

                    <div class="task-footer">
                      <span class="pill pill-soft">Done</span>
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>

          <!-- Team Members Section -->
          <div class="team-section">
            <div class="team-section-header">
              <div class="sidebar-section-label">Team members</div>
            </div>
            
            <div class="team-add-form">
              <div class="team-add-row">
                <input
                  class="team-email-input"
                  type="email"
                  placeholder="user@example.com"
                  [(ngModel)]="inviteEmail"
                  name="inviteEmail"
                  id="teamEmailInput"
                />
                <select
                  class="team-role-dropdown"
                  [(ngModel)]="inviteRoleDisplay"
                  (change)="onRoleChange($event)"
                  name="inviteRole"
                  id="teamRoleSelect"
                  title="Select role for the user"
                >
                  <option value="Owner" title="Full access: Create, Read, Update, Delete tasks, View audit logs, Manage team members">Owner - Full Access</option>
                  <option value="Admin" title="Full access: Create, Read, Update, Delete tasks, View audit logs, Manage team members">Admin - Full Access</option>
                  <option value="Viewer" title="Read-only: Can only view tasks, Cannot create/edit/delete tasks or manage team">Viewer - Read Only</option>
                </select>
                <button 
                  class="pill pill-strong team-add-button" 
                  type="button"
                  (click)="inviteUser()"
                  [disabled]="!inviteEmail.trim()"
                >
                  Add
                </button>
              </div>
            </div>
            
            <div class="team-members-list">
              @if (teamMembersLoading()) {
                <div class="team-empty">Loading team members...</div>
              } @else if (teamMembers().length === 0) {
                <div class="team-empty">No Members Added.</div>
              } @else {
                    @for (member of teamMembers(); track member.userId) {
                      <div class="team-member-item">
                        <div class="team-member-email">{{ member.email }}</div>
                        <div class="team-member-actions">
                          <div class="team-member-role-badge">{{ getRoleDisplayName(member.role) }}</div>
                          @if (canManageTeam() && member.userId !== getCurrentUserId()) {
                            <button
                              class="icon-button icon-button-delete"
                              (click)="deleteMember(member); $event.stopPropagation()"
                              type="button"
                              title="Remove team member"
                            >
                              ✕
                            </button>
                          }
                        </div>
                      </div>
                    }
              }
            </div>
          </div>
        </section>
      </main>
    </div>

    <!-- New Task Modal -->
    @if (showModal()) {
      <div class="modal-overlay" (click)="closeModal()">
        <div class="modal-dialog" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2 class="modal-title">New Task</h2>
            <button class="modal-close" (click)="closeModal()" type="button">
              ✕
            </button>
          </div>
          <form class="modal-form" (ngSubmit)="createTask()" #taskForm="ngForm">
            <div class="form-group">
              <label class="form-label" for="taskTitle">
                Task Title <span class="required-asterisk">*</span>
              </label>
              <input
                class="form-input"
                id="taskTitle"
                type="text"
                placeholder="Enter task title..."
                [(ngModel)]="newTaskTitle"
                name="taskTitle"
                required
                autofocus
                (keydown.escape)="closeModal()"
                [class.error]="taskForm.submitted && !newTaskTitle.trim()"
              />
              <div class="form-error" *ngIf="taskForm.submitted && !newTaskTitle.trim()">
                Title is required
              </div>
            </div>
            
            <div class="form-group">
              <label class="form-label" for="taskDescription">Description</label>
              <textarea
                class="form-input form-textarea"
                id="taskDescription"
                placeholder="Enter task description..."
                [(ngModel)]="newTaskDescription"
                name="taskDescription"
                rows="4"
              ></textarea>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="taskPriority">Priority</label>
                <select
                  class="form-input"
                  id="taskPriority"
                  [(ngModel)]="newTaskPriority"
                  name="taskPriority"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              
              <div class="form-group">
                <label class="form-label" for="taskCategory">Category</label>
                <select
                  class="form-input"
                  id="taskCategory"
                  [(ngModel)]="newTaskCategory"
                  name="taskCategory"
                >
                  <option value="Work">Work</option>
                  <option value="Personal">Personal</option>
                </select>
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="taskDueDate">Due Date</label>
                <input
                  class="form-input"
                  id="taskDueDate"
                  type="date"
                  [(ngModel)]="newTaskDueDate"
                  name="taskDueDate"
                  [min]="now.toISOString().split('T')[0]"
                />
              </div>
              
              <div class="form-group">
                <label class="form-label" for="taskDueTime">Due Time</label>
                <input
                  class="form-input"
                  id="taskDueTime"
                  type="time"
                  [(ngModel)]="newTaskDueTime"
                  name="taskDueTime"
                  [disabled]="!newTaskDueDate"
                />
              </div>
            </div>
            
            <div class="modal-actions">
              <button
                class="modal-button modal-button-secondary"
                type="button"
                (click)="closeModal()"
              >
                Cancel
              </button>
              <button
                class="modal-button modal-button-primary"
                type="submit"
                [disabled]="!newTaskTitle.trim()"
              >
                Create Task
              </button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- Error Modal -->
    @if (showErrorModal()) {
      <div class="modal-overlay" (click)="closeErrorModal()">
        <div class="modal-dialog modal-dialog-error" (click)="$event.stopPropagation()">
          <div class="modal-header modal-header-error">
            <div class="modal-icon-error">⚠️</div>
            <h2 class="modal-title modal-title-error">Permission Denied</h2>
            <button class="modal-close" (click)="closeErrorModal()" type="button">
              ✕
            </button>
          </div>
          <div class="modal-body-error">
            <p class="modal-message">{{ errorMessage() }}</p>
          </div>
          <div class="modal-actions modal-actions-error">
            <button
              class="modal-button modal-button-primary"
              type="button"
              (click)="closeErrorModal()"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    }

    <!-- Edit Task Modal -->
    @if (showEditModal()) {
      <div class="modal-overlay" (click)="closeModal()">
        <div class="modal-dialog" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2 class="modal-title">Edit Task</h2>
            <button class="modal-close" (click)="closeModal()" type="button">
              ✕
            </button>
          </div>
          <form class="modal-form" (ngSubmit)="createTask()" #editTaskForm="ngForm">
            <div class="form-group">
              <label class="form-label" for="editTaskTitle">
                Task Title <span class="required-asterisk">*</span>
              </label>
              <input
                class="form-input"
                id="editTaskTitle"
                type="text"
                placeholder="Enter task title..."
                [(ngModel)]="newTaskTitle"
                name="editTaskTitle"
                required
                autofocus
                (keydown.escape)="closeModal()"
                [class.error]="editTaskForm.submitted && !newTaskTitle.trim()"
              />
              <div class="form-error" *ngIf="editTaskForm.submitted && !newTaskTitle.trim()">
                Title is required
              </div>
            </div>
            
            <div class="form-group">
              <label class="form-label" for="editTaskDescription">Description</label>
              <textarea
                class="form-input form-textarea"
                id="editTaskDescription"
                placeholder="Enter task description..."
                [(ngModel)]="newTaskDescription"
                name="editTaskDescription"
                rows="4"
              ></textarea>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="editTaskPriority">Priority</label>
                <select
                  class="form-input"
                  id="editTaskPriority"
                  [(ngModel)]="newTaskPriority"
                  name="editTaskPriority"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              
              <div class="form-group">
                <label class="form-label" for="editTaskCategory">Category</label>
                <select
                  class="form-input"
                  id="editTaskCategory"
                  [(ngModel)]="newTaskCategory"
                  name="editTaskCategory"
                >
                  <option value="Work">Work</option>
                  <option value="Personal">Personal</option>
                </select>
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="editTaskDueDate">Due Date</label>
                <input
                  class="form-input"
                  id="editTaskDueDate"
                  type="date"
                  [(ngModel)]="newTaskDueDate"
                  name="editTaskDueDate"
                  [min]="now.toISOString().split('T')[0]"
                />
              </div>
              
              <div class="form-group">
                <label class="form-label" for="editTaskDueTime">Due Time</label>
                <input
                  class="form-input"
                  id="editTaskDueTime"
                  type="time"
                  [(ngModel)]="newTaskDueTime"
                  name="editTaskDueTime"
                  [disabled]="!newTaskDueDate"
                />
              </div>
            </div>
            
            <div class="modal-actions">
              <button
                class="modal-button modal-button-secondary"
                type="button"
                (click)="closeModal()"
              >
                Cancel
              </button>
              <button
                class="modal-button modal-button-primary"
                type="submit"
                [disabled]="!newTaskTitle.trim()"
              >
                Update Task
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
})
export class BoardComponent {
  private readonly order: Status[] = ['todo', 'doing', 'done'];

  email = signal<string | null>(null);
  now = new Date();
  showModal = signal<boolean>(false);
  showEditModal = signal<boolean>(false);
  showErrorModal = signal<boolean>(false);
  errorMessage = signal<string>('');
  editingTask: Task | null = null;
  newTaskTitle = '';
  newTaskDescription = '';
  newTaskPriority: 'low' | 'medium' | 'high' = 'low';
  newTaskDueDate = '';
  newTaskDueTime = '';
  newTaskCategory: 'Work' | 'Personal' = 'Work';
  
  // Team management
  teamMembers = signal<TeamMember[]>([]);
  teamMembersLoading = signal<boolean>(false);
  inviteEmail = '';
  inviteRoleDisplay = 'Viewer'; // Display value for dropdown
  inviteRole: 'OWNER' | 'ADMIN' | 'VIEWER' = 'VIEWER'; // Backend value
  currentUserRole = signal<'OWNER' | 'ADMIN' | 'VIEWER' | null>(null);
  
  // Use writable signals for drag-drop lists so CDK can mutate them
  todoList = signal<Task[]>([]);
  doingList = signal<Task[]>([]);
  doneList = signal<Task[]>([]);
  private isDragging = false;

  constructor(private readonly api: ApiService) {
    // Check if user is logged in before loading tasks
    const token = localStorage.getItem('jwt');
    if (!token) {
      console.warn('[BoardComponent] No JWT token found - user may not be logged in');
      // Redirect to login if not authenticated
      window.location.href = '/login';
      return;
    }
    
    console.log('[BoardComponent] JWT token found, loading tasks');
    this.api.loadTasks();
    
    // Try to get email and roles from localStorage or JWT
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.email.set(payload.email || null);
        console.log('[BoardComponent] User email:', payload.email);
        console.log('[BoardComponent] User roles from JWT:', payload.roles);
        
        // Set current user role from JWT payload
        // Use the first role, or check if user has OWNER/ADMIN
        if (payload.roles && Array.isArray(payload.roles) && payload.roles.length > 0) {
          // Prefer OWNER, then ADMIN, then first role
          const ownerRole = payload.roles.find((r: string) => r === 'OWNER');
          const adminRole = payload.roles.find((r: string) => r === 'ADMIN');
          const roleToSet = ownerRole || adminRole || payload.roles[0];
          this.currentUserRole.set(roleToSet);
          console.log('[BoardComponent] Set current user role to:', roleToSet);
        } else {
          console.warn('[BoardComponent] No roles found in JWT payload');
        }
      } catch (error) {
        console.error('[BoardComponent] Failed to parse JWT token:', error);
        // Ignore if token parsing fails
      }
    }
    
    // Update lists when tasks change, but not during drag operations
    effect(() => {
      // Access tasksSig to create dependency
      this.api.tasksSig();
      if (!this.isDragging) {
        this.updateLists();
      }
    });
    
    // Initial load
    this.updateLists();
    
    // Load team members on init (after roles are extracted from JWT)
    // Small delay to ensure JWT is parsed and currentUserRole is set
    setTimeout(() => {
      this.loadTeamMembers();
    }, 100);
  }

  readonly allTasks = computed(() => this.api.tasksSig());
  
  // Computed properties for template (for backward compatibility)
  readonly todo = computed(() => this.todoList());
  readonly doing = computed(() => this.doingList());
  readonly done = computed(() => this.doneList());

  private updateLists() {
    const tasks = this.api.tasksSig();
    this.todoList.set(tasks.filter(t => t.status === 'todo').sort((a, b) => a.position - b.position));
    this.doingList.set(tasks.filter(t => t.status === 'doing').sort((a, b) => a.position - b.position));
    this.doneList.set(tasks.filter(t => t.status === 'done').sort((a, b) => a.position - b.position));
  }

  private byStatus(status: Status) {
    return [
      ...this.api
        .tasksSig()
        .filter((task) => task.status === status)
        .sort((a, b) => a.position - b.position),
    ];
  }

  trackById(_index: number, task: Task): string {
    return task.id;
  }

  openNewTask() {
    this.editingTask = null;
    this.newTaskTitle = '';
    this.newTaskDescription = '';
    this.newTaskPriority = 'low';
    this.newTaskDueDate = '';
    this.newTaskDueTime = '';
    this.newTaskCategory = 'Work';
    this.showModal.set(true);
    this.showEditModal.set(false);
  }

  editTask(task: Task) {
    this.editingTask = task;
    this.newTaskTitle = task.title;
    this.newTaskDescription = task.description || '';
    this.newTaskPriority = task.priority || 'low';
    this.newTaskCategory = task.category;
    
    // Parse due date if exists
    if (task.dueDate) {
      const dueDate = new Date(task.dueDate);
      this.newTaskDueDate = dueDate.toISOString().split('T')[0];
      const hours = dueDate.getHours().toString().padStart(2, '0');
      const minutes = dueDate.getMinutes().toString().padStart(2, '0');
      this.newTaskDueTime = `${hours}:${minutes}`;
    } else {
      this.newTaskDueDate = '';
      this.newTaskDueTime = '';
    }
    
    this.showEditModal.set(true);
    this.showModal.set(false);
  }

  closeModal() {
    this.showModal.set(false);
    this.showEditModal.set(false);
    this.editingTask = null;
    this.newTaskTitle = '';
    this.newTaskDescription = '';
    this.newTaskDueDate = '';
    this.newTaskDueTime = '';
  }

  showError(message: string) {
    // Close any open modals first
    this.showModal.set(false);
    this.showEditModal.set(false);
    
    // Then show the error modal
    this.errorMessage.set(message);
    this.showErrorModal.set(true);
  }

  closeErrorModal() {
    this.showErrorModal.set(false);
    this.errorMessage.set('');
  }

  createTask() {
    // Ensure title is required
    if (!this.newTaskTitle.trim()) {
      return;
    }

    // Build dueDate string if both date and time are provided
    let dueDateStr: string | undefined;
    if (this.newTaskDueDate) {
      if (this.newTaskDueTime) {
        // Combine date and time into ISO string
        const dateTime = new Date(`${this.newTaskDueDate}T${this.newTaskDueTime}`);
        dueDateStr = dateTime.toISOString();
      } else {
        // Just date, set to end of day
        const dateTime = new Date(`${this.newTaskDueDate}T23:59:59`);
        dueDateStr = dateTime.toISOString();
      }
    }

    const taskData = {
      title: this.newTaskTitle.trim(),
      description: this.newTaskDescription.trim() || undefined,
      priority: this.newTaskPriority || 'low',
      dueDate: dueDateStr,
      category: this.newTaskCategory,
    };

    if (this.editingTask) {
      // Update existing task
      firstValueFrom(
        this.api.updateTask(this.editingTask.id, taskData),
      )
        .then(() => {
          this.api.loadTasks();
          this.closeModal();
        })
        .catch((error) => {
          console.error('Error updating task:', error);
          
          // Check for permission errors (403 Forbidden or "Insufficient permissions")
          if (error?.status === 403 || 
              error?.error?.message?.toLowerCase().includes('permission') ||
              error?.message?.toLowerCase().includes('permission')) {
            this.showError('You cannot modify tasks you don\'t have permission');
            return;
          }
          
          const errorMessage = error?.error?.message || error?.message || 'Unknown error occurred';
          const fullError = error?.error || error;
          console.error('Full error details:', fullError);
          alert(`Failed to update task: ${errorMessage}. Check console for details.`);
        });
    } else {
      // Create new task
      const createPayload = {
        ...taskData,
        status: 'todo' as const,
        position: this.todo().length,
      };
      
      // Verify token before making request
      const token = localStorage.getItem('jwt');
      if (!token) {
        alert('You are not logged in. Please log in again.');
        window.location.href = '/login';
        return;
      }
      
      console.log('Creating task with payload:', createPayload);
      console.log('JWT token present:', !!token);
      
      firstValueFrom(
        this.api.createTask(createPayload),
      )
        .then((response) => {
          console.log('Task created successfully:', response);
          this.api.loadTasks();
          this.closeModal();
        })
        .catch((error) => {
          console.error('Error creating task:', error);
          const errorMessage = error?.error?.message || error?.message || 'Unknown error occurred';
          const fullError = error?.error || error;
          console.error('Full error details:', fullError);
          console.error('Error status:', error?.status);
          console.error('Error statusText:', error?.statusText);
          alert(`Failed to create task: ${errorMessage}. Check console for details.`);
        });
    }
  }

  onDrop(event: CdkDragDrop<Task[]>, targetStatus: Status) {
    const task = event.item.data as Task;

    // Always use the targetStatus parameter since each handler is bound to a specific column
    // This ensures correct status even when dropping into empty lists
    const finalTargetStatus = targetStatus;
    this.isDragging = true;

    if (event.previousContainer === event.container) {
      // Moving within the same list - update positions
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      
          // Update positions via API
          event.container.data.forEach((t, index) => {
            if (t.position !== index) {
              firstValueFrom(
                this.api.updateTask(t.id, {
                  position: index,
                }),
              )
                .then(() => {
                  this.api.loadTasks();
                  // Allow lists to update after API call completes
                  setTimeout(() => {
                    this.isDragging = false;
                    this.updateLists();
                  }, 100);
                })
                .catch((error) => {
                  this.isDragging = false;
                  this.updateLists(); // Reset lists on error
                  
                  // Check for permission errors (403 Forbidden or "Insufficient permissions")
                  if (error?.status === 403 || 
                      error?.error?.message?.toLowerCase().includes('permission') ||
                      error?.message?.toLowerCase().includes('permission')) {
                    this.showError('You cannot modify tasks you don\'t have permission');
                    return;
                  }
                  
                  console.error('Error updating task position:', error);
                });
            }
          });
    } else {
      // Moving between different lists
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
      
      // Update the task with new status and position via API
      firstValueFrom(
        this.api.updateTask(task.id, {
          status: finalTargetStatus,
          position: event.currentIndex,
        }),
      )
        .then(() => {
          this.api.loadTasks();
          // Allow lists to update after API call completes
          setTimeout(() => {
            this.isDragging = false;
            this.updateLists();
          }, 100);
        })
        .catch((error) => {
          this.isDragging = false;
          this.updateLists(); // Reset lists on error
          
          // Check for permission errors (403 Forbidden or "Insufficient permissions")
          if (error?.status === 403 || 
              error?.error?.message?.toLowerCase().includes('permission') ||
              error?.message?.toLowerCase().includes('permission')) {
            this.showError('You cannot modify tasks you don\'t have permission');
            return;
          }
          
          console.error('Error updating task status via drag:', error);
          const errorMessage = error?.error?.message || error?.message || 'Unknown error occurred';
          alert(`Failed to update task: ${errorMessage}. Check console for details.`);
        });
    }
  }

  changeStatus(task: Task, event: Event) {
    const select = event.target as HTMLSelectElement;
    const newStatus = select.value as Status;

    if (newStatus === task.status) {
      return;
    }

    // Get the target list length for position
    let targetListLength = 0;
    if (newStatus === 'todo') {
      targetListLength = this.todo().length;
    } else if (newStatus === 'doing') {
      targetListLength = this.doing().length;
    } else if (newStatus === 'done') {
      targetListLength = this.done().length;
    }

    firstValueFrom(
      this.api.updateTask(task.id, {
        status: newStatus,
        position: targetListLength,
      }),
    )
      .then(() => this.api.loadTasks())
      .catch((error) => {
        // Check for permission errors (403 Forbidden or "Insufficient permissions")
        if (error?.status === 403 || 
            error?.error?.message?.toLowerCase().includes('permission') ||
            error?.message?.toLowerCase().includes('permission')) {
          alert('You cannot modify tasks you don\'t have permission');
          return;
        }
        
        console.error('Error changing task status:', error);
        const errorMessage = error?.error?.message || error?.message || 'Unknown error occurred';
        alert(`Failed to update task: ${errorMessage}. Check console for details.`);
      });
  }

  deleteTask(task: Task) {
    firstValueFrom(this.api.deleteTask(task.id))
      .then(() => this.api.loadTasks())
      .catch((error) => {
        // Check for permission errors (403 Forbidden or "Insufficient permissions")
        if (error?.status === 403 || 
            error?.error?.message?.toLowerCase().includes('permission') ||
            error?.message?.toLowerCase().includes('permission')) {
          alert('You cannot modify tasks you don\'t have permission');
          return;
        }
        
        console.error('Error deleting task:', error);
        const errorMessage = error?.error?.message || error?.message || 'Unknown error occurred';
        alert(`Failed to delete task: ${errorMessage}. Check console for details.`);
      });
  }

  logout() {
    localStorage.removeItem('jwt');
    window.location.href = '/login';
  }

  // Team management methods
  loadTeamMembers() {
    // Only try to load if user has permission (OWNER or ADMIN)
    const role = this.currentUserRole();
    if (role !== 'OWNER' && role !== 'ADMIN') {
      console.log('[BoardComponent] User does not have permission to view team members. Role:', role);
      this.teamMembersLoading.set(false);
      return;
    }

    this.teamMembersLoading.set(true);
    firstValueFrom(this.api.getTeamMembers())
      .then((members) => {
        console.log('[BoardComponent] Loaded team members:', members);
        this.teamMembers.set(members);
        // Update current user role if found (as a fallback, but we already have it from JWT)
        const currentEmail = this.email();
        const currentMember = members.find(m => m.email === currentEmail);
        if (currentMember) {
          this.currentUserRole.set(currentMember.role);
          console.log('[BoardComponent] Updated current user role from team members:', currentMember.role);
        }
        this.teamMembersLoading.set(false);
      })
      .catch((error) => {
        console.error('[BoardComponent] Error loading team members:', error);
        console.error('[BoardComponent] Error status:', error?.status);
        console.error('[BoardComponent] Error message:', error?.error?.message || error?.message);
        
        // Don't show error if user doesn't have permission
        if (error.status === 403) {
          console.warn('[BoardComponent] User does not have permission to view team members (403 Forbidden)');
          // Clear team members list if permission denied
          this.teamMembers.set([]);
        } else if (error.status === 0 || error.status === undefined) {
          console.warn('[BoardComponent] API server not running. Start it with: nx serve api');
        } else {
          console.error('[BoardComponent] Failed to load team members:', error);
        }
        this.teamMembersLoading.set(false);
      });
  }

  canManageTeam(): boolean {
    const role = this.currentUserRole();
    return role === 'OWNER' || role === 'ADMIN';
  }

  onRoleChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    const displayValue = select.value;
    
    // Map display values to backend roles
    if (displayValue === 'Owner') {
      this.inviteRole = 'OWNER';
    } else if (displayValue === 'Admin') {
      this.inviteRole = 'ADMIN';
    } else if (displayValue === 'Viewer') {
      this.inviteRole = 'VIEWER';
    }
  }

  inviteUser() {
    if (!this.inviteEmail.trim()) {
      return;
    }

    const emailToInvite = this.inviteEmail.trim();
    const roleToAssign = this.inviteRole;

    console.log('[BoardComponent] Inviting user:', { email: emailToInvite, role: roleToAssign });
    console.log('[BoardComponent] API base URL:', this.api.base);
    console.log('[BoardComponent] Full URL will be:', `${this.api.base}/team/members/invite`);

    firstValueFrom(this.api.inviteUser(emailToInvite, roleToAssign))
      .then((newMember) => {
        console.log('[BoardComponent] User invited successfully:', newMember);
        // Refresh the members list
        this.loadTeamMembers();
        // Clear the form
        this.inviteEmail = '';
        this.inviteRoleDisplay = 'Viewer';
        this.inviteRole = 'VIEWER';
      })
      .catch((error) => {
        console.error('[BoardComponent] Error inviting user:', error);
        console.error('[BoardComponent] Error status:', error?.status);
        console.error('[BoardComponent] Error URL:', error?.url);
        console.error('[BoardComponent] Full error:', JSON.stringify(error, null, 2));
        
        if (error?.status === 0 || error?.status === undefined) {
          alert('Cannot connect to API server. Please make sure the API server is running on port 3333.\n\nRun: nx serve api');
        } else if (error?.status === 404) {
          alert('API endpoint not found. Please restart the API server to load the TeamModule.');
        } else {
          alert(`Failed to add user: ${error.error?.message || error.message || 'Unknown error'}`);
        }
      });
  }

  getRoleDisplayName(role: 'OWNER' | 'ADMIN' | 'VIEWER'): string {
    // Map backend roles to display names
    if (role === 'OWNER') return 'Owner';
    if (role === 'ADMIN') return 'Admin';
    if (role === 'VIEWER') return 'Viewer';
    return role;
  }

  getCurrentUserId(): string | null {
    const token = localStorage.getItem('jwt');
    if (!token) return null;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.sub || null;
    } catch {
      return null;
    }
  }

  deleteMember(member: TeamMember) {
    if (!confirm(`Are you sure you want to remove ${member.email} from the team?`)) {
      return;
    }

    const currentUserId = this.getCurrentUserId();
    if (!currentUserId) {
      alert('Cannot identify current user. Please log in again.');
      return;
    }

    if (member.userId === currentUserId) {
      alert('Cannot remove yourself from the team');
      return;
    }

    firstValueFrom(this.api.deleteMember(member.userId))
      .then(() => {
        console.log('[BoardComponent] Member removed successfully:', member.email);
        // Refresh the members list
        this.loadTeamMembers();
      })
      .catch((error) => {
        console.error('[BoardComponent] Error removing member:', error);
        const errorMessage = error?.error?.message || error?.message || 'Unknown error';
        
        if (error?.status === 0 || error?.status === undefined) {
          alert('Cannot connect to API server. Please make sure the API server is running on port 3333.\n\nRun: nx serve api');
        } else if (error?.status === 403) {
          alert('You do not have permission to remove team members. Only OWNER and ADMIN can remove members.');
        } else {
          alert(`Failed to remove member: ${errorMessage}`);
        }
      });
  }
}
