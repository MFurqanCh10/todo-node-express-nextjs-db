
"use client";

import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  CheckCheck,
  Circle,
  CircleCheck,
  ClipboardList,
  Clock3,
  LayoutDashboard,
  ListTodo,
  LoaderCircle,
  LogOut,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Trash2,
} from "lucide-react";
import { apiRequest } from "../lib/api";

const FILTERS = [
  { id: "all", label: "All tasks" },
  { id: "active", label: "In progress" },
  { id: "completed", label: "Completed" },
];

export default function DashboardPage() {
  const router = useRouter();

  const [token, setToken] = useState("");
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState(null);
  const [editingTaskId, setEditingTaskId] = useState(null);
const composerRef = useRef(null);

  const loadTasks = useCallback(
    async (authToken) => {
      setLoading(true);

      try {
        const result = await apiRequest("/api/tasks", {
          token: authToken,
        });

        setTasks(result?.data?.tasks || []);
      } catch (error) {
        if (error.statusCode === 401) {
          localStorage.removeItem("taskly_token");
          localStorage.removeItem("taskly_user");
          router.replace("/login");
          return;
        }

        setNotice({
          type: "error",
          text: error.message || "Could not load your tasks.",
        });
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  useEffect(() => {
    const savedToken = localStorage.getItem("taskly_token");

    if (!savedToken) {
      router.replace("/login");
      return;
    }

    setToken(savedToken);

    try {
      const savedUser = localStorage.getItem("taskly_user");
      if (savedUser) setUser(JSON.parse(savedUser));
    } catch {
      localStorage.removeItem("taskly_user");
    }

    loadTasks(savedToken);
  }, [loadTasks, router]);

  const completedCount = tasks.filter((task) => task.isCompleted).length;
  const activeCount = tasks.length - completedCount;

  const progress = tasks.length
    ? Math.round((completedCount / tasks.length) * 100)
    : 0;

  const filteredTasks = useMemo(() => {
    const query = search.trim().toLowerCase();

    return tasks.filter((task) => {
      const matchesFilter =
        filter === "all" ||
        (filter === "active" && !task.isCompleted) ||
        (filter === "completed" && task.isCompleted);

      const matchesSearch =
        !query ||
        task.title.toLowerCase().includes(query) ||
        (task.description || "").toLowerCase().includes(query);

      return matchesFilter && matchesSearch;
    });
  }, [tasks, filter, search]);

  const showNotice = (type, text) => {
    setNotice({ type, text });
  };

 
const handleSaveTask = async (event) => {
  event.preventDefault();
  setNotice(null);

  if (!title.trim()) {
    showNotice("error", "Please enter a task title.");
    return;
  }

  setSaving(true);

  const isEditing = Boolean(editingTaskId);

  try {
    const result = await apiRequest(
      isEditing
        ? `/api/tasks/${editingTaskId}`
        : "/api/tasks",
      {
        method: isEditing ? "PATCH" : "POST",
        token,
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
        }),
      }
    );

    const savedTask = result?.data?.task;

    if (!savedTask) {
      throw new Error("The server did not return the saved task.");
    }

    if (isEditing) {
      setTasks((current) =>
        current.map((task) =>
          task.id === savedTask.id ? savedTask : task
        )
      );

      showNotice("success", "Task updated successfully!");
    } else {
      setTasks((current) => [savedTask, ...current]);

      showNotice("success", "Task added successfully!");
    }

    setTitle("");
    setDescription("");
    setEditingTaskId(null);
  } catch (error) {
    showNotice(
      "error",
      error.message || "Could not save your task."
    );
  } finally {
    setSaving(false);
  }
};


  const handleToggleTask = async (task) => {
    setNotice(null);

    try {
      const result = await apiRequest(`/api/tasks/${task.id}`, {
        method: "PATCH",
        token,
        body: JSON.stringify({
          isCompleted: !task.isCompleted,
        }),
      });

      const updatedTask = result?.data?.task;

      if (!updatedTask) {
        throw new Error("The server did not return the updated task.");
      }

      setTasks((current) =>
        current.map((item) =>
          item.id === task.id ? updatedTask : item
        )
      );
      showNotice(
        "success",
        updatedTask.isCompleted
          ? "Nice work! Task completed."
          : "Task moved back to in progress."
      );
    } catch (error) {
      showNotice("error", error.message || "Could not update the task.");
    }
  };

  
const handleEditTask = (task) => {
  setEditingTaskId(task.id);
  setTitle(task.title);
  setDescription(task.description || "");
  setNotice(null);

  composerRef.current?.scrollIntoView({
    behavior: "smooth",
    block: "center",
  });
};

const handleCancelEdit = () => {
  setEditingTaskId(null);
  setTitle("");
  setDescription("");
  setNotice(null);
};


  const handleDeleteTask = async (task) => {
    const confirmed = window.confirm(
      `Delete "${task.title}"? This cannot be undone.`
    );

    if (!confirmed) return;

    setNotice(null);

    try {
      await apiRequest(`/api/tasks/${task.id}`, {
        method: "DELETE",
        token,
      });

      setTasks((current) =>
        current.filter((item) => item.id !== task.id)
      );
      showNotice("success", "Task deleted.");
    } catch (error) {
      showNotice("error", error.message || "Could not delete the task.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("taskly_token");
    localStorage.removeItem("taskly_user");
    router.replace("/login");
  };

  const firstName = user?.fullName?.trim().split(/\s+/)[0] || "there";

  const initials = user?.fullName
    ? user.fullName
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase()
    : "TU";

  if (loading && !token) {
    return (
      <main className="center-state">
        <LoaderCircle size={28} className="spinner" />
        <p>Preparing your workspace...</p>
      </main>
    );
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a href="/" className="brand">
          <span className="brand-icon">
            <CheckCheck size={23} />
          </span>
          <span className="brand-name">
            Task<span>ly</span>
          </span>
        </a>

        <div className="sidebar-caption">Workspace</div>

        <nav className="sidebar-nav" aria-label="Task filters">
          <button
            className={`nav-button ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            <LayoutDashboard size={18} />
            <span>My tasks</span>
            <span className="nav-count">{tasks.length}</span>
          </button>

          <button
            className={`nav-button ${filter === "active" ? "active" : ""}`}
            onClick={() => setFilter("active")}
          >
            <ListTodo size={18} />
            <span>In progress</span>
            <span className="nav-count">{activeCount}</span>
          </button>

          <button
            className={`nav-button ${filter === "completed" ? "active" : ""}`}
            onClick={() => setFilter("completed")}
          >
            <CircleCheck size={18} />
            <span>Completed</span>
            <span className="nav-count">{completedCount}</span>
          </button>
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-tip">
            <div className="sidebar-tip-icon">
              <Sparkles size={17} />
            </div>
            <strong>Little by little</strong>
            <p>Progress is built one task at a time. Keep going!</p>
          </div>

          <div className="profile">
            <div className="avatar">{initials}</div>
            <div className="profile-info">
              <strong>{user?.fullName || "Taskly user"}</strong>
              <span>{user?.email || "Your workspace"}</span>
            </div>
            <button
              className="logout-button"
              title="Log out"
              aria-label="Log out"
              onClick={handleLogout}
            >
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="dashboard-topbar">
          <div>
            <div className="eyebrow">YOUR PERSONAL WORKSPACE</div>
            <h1 className="page-title">My dashboard</h1>
            <p className="page-subtitle">
              Keep your focus on what matters, {firstName}.
            </p>
          </div>

          <div className="today-chip">
            <Clock3 size={16} />
            Stay on track
          </div>
        </header>

        <section className="welcome-banner">
          <div className="welcome-content">
            <div className="welcome-kicker">
              <Sparkles size={15} />
              A FRESH START, EVERY DAY
            </div>

            <h2>Let&apos;s make today count.</h2>

            <p>
              One clear plan can make a big difference. Add your next task
              and start building momentum.
            </p>
          </div>

          <div className="banner-decoration">
            <CheckCheck size={43} />
          </div>
        </section>

        <section className="stats-grid" aria-label="Task statistics">
          <article className="stat-card">
            <div className="stat-top">
              <div className="stat-icon purple">
                <ClipboardList size={20} />
              </div>
            </div>
            <div className="stat-label">Total tasks</div>
            <div className="stat-number">{tasks.length}</div>
            <div className="stat-note">All tasks in your workspace</div>
          </article>

          <article className="stat-card">
            <div className="stat-top">
              <div className="stat-icon orange">
                <Circle size={20} />
              </div>
            </div>
            <div className="stat-label">In progress</div>
            <div className="stat-number">{activeCount}</div>
            <div className="stat-note">Tasks still to work on</div>
          </article>

          <article className="stat-card">
            <div className="stat-top">
              <div className="stat-icon green">
                <CheckCircle2Icon />
              </div>
            </div>
            <div className="stat-label">Completed</div>
            <div className="stat-number">{completedCount}</div>
            <div className="stat-note">{progress}% of all tasks completed</div>
            <div
              className="progress-track"
              role="progressbar"
              aria-label="Task completion"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="progress-fill"
                style={{ width: `${progress}%` }}
              />
            </div>
          </article>
        </section>

        <section className="content-heading">
          <div>
            <h2>Your tasks</h2>
            <p>A little progress each day adds up.</p>
          </div>
        </section>

        {notice && (
          <div className={`notice ${notice.type}`} role="status">
            {notice.text}
          </div>
        )}

        <div className="task-layout">
          <section className="task-main">
           
<form
  ref={composerRef}
  className="task-composer"
  onSubmit={handleSaveTask}
>
  <div className="composer-heading">
    <span className="composer-plus">
      {editingTaskId ? (
        <Pencil size={17} />
      ) : (
        <Plus size={17} />
      )}
    </span>

    {editingTaskId ? "Edit task" : "Add a new task"}
  </div>

  <input
    className="field"
    type="text"
    placeholder={
      editingTaskId
        ? "Update your task title"
        : "What would you like to get done?"
    }
    value={title}
    onChange={(event) => setTitle(event.target.value)}
    maxLength={150}
    required
  />

  <textarea
    className="field task-description-input"
    placeholder="Add a few details (optional)"
    value={description}
    onChange={(event) => setDescription(event.target.value)}
  />

  <div className="composer-footer">
    <span className="field-hint">
      {editingTaskId
        ? "Update your details and save your changes."
        : "Keep it simple. Start with one thing."}
    </span>

    <div className="composer-actions">
      {editingTaskId && (
        <button
          type="button"
          className="secondary-button"
          onClick={handleCancelEdit}
          disabled={saving}
        >
          Cancel
        </button>
      )}

      <button
        className="primary-button"
        type="submit"
        disabled={saving}
      >
        {saving ? (
          <LoaderCircle size={15} className="spinner" />
        ) : editingTaskId ? (
          <Check size={16} />
        ) : (
          <Plus size={16} />
        )}

        {saving
          ? "Saving..."
          : editingTaskId
            ? "Save changes"
            : "Add task"}
      </button>
    </div>
  </div>
</form>


            <div className="task-toolbar">
              <div className="filter-tabs">
                {FILTERS.map((item) => (
                  <button
                    key={item.id}
                    className={`filter-tab ${filter === item.id ? "active" : ""}`}
                    onClick={() => setFilter(item.id)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <label className="search-box">
                <Search size={15} />
                <input
                  type="search"
                  placeholder="Search tasks..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  aria-label="Search tasks"
                />
              </label>
            </div>

            {loading ? (
              <div className="center-state">
                <LoaderCircle size={24} className="spinner" />
                <p>Loading your tasks...</p>
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <ClipboardList size={25} />
                </div>
                <h3>
                  {search
                    ? "No matching tasks"
                    : filter === "completed"
                      ? "Nothing completed yet"
                      : filter === "active"
                        ? "You're all caught up"
                        : "Your space is ready"}
                </h3>
                <p>
                  {search
                    ? "Try another search term."
                    : filter === "all"
                      ? "Add your first task above and start making progress."
                      : "Tasks matching this filter will appear here."}
                </p>
              </div>
            ) : (
              <div className="task-list">
                {filteredTasks.map((task) => (
                  <article className="task-card" key={task.id}>
                    <button
                      className={`task-check ${task.isCompleted ? "completed" : ""}`}
                      title={task.isCompleted ? "Mark as in progress" : "Mark as completed"}
                      aria-label={task.isCompleted ? "Mark task as in progress" : "Complete task"}
                      onClick={() => handleToggleTask(task)}
                    >
                      {task.isCompleted && <Check size={15} />}
                    </button>

                    <div className="task-details">
                      <div
                        className={`task-title ${task.isCompleted ? "completed" : ""}`}
                      >
                        {task.title}
                      </div>

                      {task.description && (
                        <div className="task-description">
                          {task.description}
                        </div>
                      )}

                      <div className="task-meta">
                        {task.createdAt && (
                          <span>
                            {new Date(task.createdAt).toLocaleDateString(
                              undefined,
                              { month: "short", day: "numeric", year: "numeric" }
                            )}
                          </span>
                        )}
                        <span
                          className={`status-chip ${task.isCompleted ? "done" : ""}`}
                        >
                          {task.isCompleted ? "Completed" : "In progress"}
                        </span>
                      </div>
                    </div>

                    <div className="task-actions">
                      <button
                        className="icon-button"
                        title="Edit task title"
                        aria-label={`Edit ${task.title}`}
                        onClick={() => handleEditTask(task)}
                      >
                        <Pencil size={15} />
                      </button>

                      <button
                        className="icon-button delete"
                        title="Delete task"
                        aria-label={`Delete ${task.title}`}
                        onClick={() => handleDeleteTask(task)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <aside className="side-panel">
            <section className="side-card">
              <h3>Your progress</h3>
              <p className="side-card-description">
                Every completed task is a step forward.
              </p>

              <div
                className="progress-circle"
                style={{ "--progress-angle": `${progress * 3.6}deg` }}
              >
                <div className="progress-circle-inner">
                  <strong>{progress}%</strong>
                  <span>completed</span>
                </div>
              </div>

              <div className="progress-summary">
                <span>Finished tasks</span>
                <strong>{completedCount}</strong>
              </div>

              <div className="progress-summary">
                <span>Left to do</span>
                <strong>{activeCount}</strong>
              </div>
            </section>

            <section className="mini-tip">
              <div className="mini-tip-icon">
                <Sparkles size={20} />
              </div>
              <h3>A small reminder</h3>
              <p>
                You don't need to do everything today. Choose what matters
                most and take it one task at a time.
              </p>
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
}

function CheckCircle2Icon() {
  return <CircleCheck size={20} />;
}
