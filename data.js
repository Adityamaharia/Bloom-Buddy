/**
 * BloomBuddy Data Management
 * Handles all user data stored in localStorage
 */

const DataManager = {
  _cachedUser: null,
  // Default user object
  defaultUser: {
    id: Date.now(),
    name: "",
    email: "",
    createdAt: new Date().toISOString(),
    plant: {
      type: "basic", // basic, flower, cactus
      name: "",
      emoji: "🌿",
      pot: "classic",
      potEmoji: "🪴",
      stage: "seed", // seed, sprout, bloom
      health: 100,
      createdAt: new Date().toISOString(),
    },
    goals: [],
    streak: {
      current: 0,
      longest: 0,
      lastActivity: null,
    },
    moods: [], // array of { mood, date }
    preferences: {
      theme: "day", // day, night, rain
      notifications: true,
      reminders: [],
    },
  },

  _generateGoalId: function () {
    return Date.now() + Math.floor(Math.random() * 1000000);
  },

  _normalizeGoalIds: function (user) {
    if (!user || !Array.isArray(user.goals)) return false;

    const seenIds = new Set();
    let changed = false;

    user.goals.forEach((goal) => {
      if (!goal.id || seenIds.has(goal.id)) {
        goal.id = this._generateGoalId();
        changed = true;
      }
      seenIds.add(goal.id);
    });

    return changed;
  },

  // Get all user data
  getUser: function () {
    if (this._cachedUser) return this._cachedUser;
    const data = localStorage.getItem("bloomBuddy_user");
    if (data) {
      const parsedUser = JSON.parse(data);
      const changed = this._normalizeGoalIds(parsedUser);
      this._cachedUser = parsedUser;
      if (changed) {
        this.saveUser(parsedUser);
      }
      return this._cachedUser;
    }
    return null;
  },

  // Save user data
  saveUser: function (user) {
    this._cachedUser = user;
    try {
      localStorage.setItem("bloomBuddy_user", JSON.stringify(user));
    } catch (e) {
      console.warn("Storage quota exceeded or unavailable.", e);
    }
  },
  clearSession: function () {
    this._cachedUser = null;
    sessionStorage.removeItem("loggedIn");
    sessionStorage.removeItem("visited");
  },
  // Initialize new user after signup
  initializeUser: function (name, email, password) {
    let user = JSON.parse(JSON.stringify(this.defaultUser));
    user.name = name;
    user.email = email;
    user.password = password;
    this.saveUser(user);
    return user;
  },

  // Update user profile
  updateProfile: function (name) {
    let user = this.getUser();
    if (user) {
      user.name = name;
      this.saveUser(user);
    }
  },

  // Plant Methods
  setPlant: function (type, name, emoji) {
    let user = this.getUser();
    if (user) {
      user.plant.type = type;
      user.plant.name = name;
      user.plant.emoji = emoji;
      user.plant.createdAt = new Date().toISOString();
      this.saveUser(user);
    }
  },

  getPlant: function () {
    let user = this.getUser();
    return user ? user.plant : null;
  },

  // Update plant growth stage
  updatePlantStage: function (stage) {
    let user = this.getUser();
    if (user) {
      user.plant.stage = stage;
      this.saveUser(user);
    }
  },

  // Goals Methods
  addGoal: function (goal) {
    let user = this.getUser();
    if (user) {
      goal.id = this._generateGoalId();
      goal.createdAt = new Date().toISOString();
      goal.completed = false;
      user.goals.push(goal);
      this.saveUser(user);
      return goal;
    }
  },

  getGoals: function () {
    let user = this.getUser();
    return user ? user.goals : [];
  },

  // Get today's goals
  getTodayGoals: function () {
    let user = this.getUser();
    if (!user) return [];

    // Check streak first to handle midnight rollover
    this.checkStreak();
    // Reload user after potential streak check mutation
    user = this.getUser();

    const today = new Date().toDateString();
    let updated = false;
    user.goals.forEach((goal) => {
      if (goal.completed) {
        const lastCompleted = new Date(
          goal.lastCompleted || goal.createdAt,
        ).toDateString();
        if (lastCompleted !== today) {
          goal.completed = false;
          updated = true;
        }
      }
    });
    if (updated) this.saveUser(user);

    return user.goals;
  },

  toggleGoal: function (goalId) {
    let user = this.getUser();
    if (user) {
      const goal = user.goals.find((g) => g.id === goalId);
      if (goal) {
        goal.completed = !goal.completed;
        if (goal.completed) {
          goal.lastCompleted = new Date().toISOString();
          this.saveUser(user);
          this.updateStreak();
        } else {
          this.saveUser(user);
        }
        return goal;
      }
    }
  },

  deleteGoal: function (goalId) {
    let user = this.getUser();
    if (user) {
      user.goals = user.goals.filter((g) => g.id !== goalId);
      this.saveUser(user);
    }
  },

  // Streak Methods
  checkStreak: function () {
    let user = this.getUser();
    if (!user) return;

    const today = new Date().toDateString();
    const lastDate = user.streak.lastActivity
      ? new Date(user.streak.lastActivity).toDateString()
      : null;

    if (lastDate && lastDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toDateString();

      if (lastDate !== yesterdayStr) {
        user.streak.current = 0;
        this.saveUser(user);
      }
    }
  },

  updateStreak: function () {
    let user = this.getUser();
    if (!user) return;

    const today = new Date().toDateString();
    const lastDate = user.streak.lastActivity
      ? new Date(user.streak.lastActivity).toDateString()
      : null;

    if (lastDate !== today) {
      user.streak.lastActivity = new Date().toISOString();

      // Check if continuation
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toDateString();

      if (lastDate === yesterdayStr || !lastDate) {
        user.streak.current++;
        if (user.streak.current > user.streak.longest) {
          user.streak.longest = user.streak.current;
        }
      } else {
        user.streak.current = 1;
      }
      this.saveUser(user);
    }
  },

  getStreak: function () {
    let user = this.getUser();
    return user ? user.streak : { current: 0, longest: 0 };
  },

  // Mood Methods
  addMood: function (mood) {
    let user = this.getUser();
    if (user) {
      user.moods.push({
        mood: mood,
        date: new Date().toISOString(),
      });
      this.saveUser(user);
    }
  },

  getTodayMood: function () {
    let user = this.getUser();
    if (!user) return null;

    const today = new Date().toDateString();
    const todayMood = user.moods.find((m) => {
      return new Date(m.date).toDateString() === today;
    });
    return todayMood ? todayMood.mood : null;
  },

  // Preferences
  updatePreferences: function (prefs) {
    let user = this.getUser();
    if (user) {
      user.preferences = { ...user.preferences, ...prefs };
      this.saveUser(user);
    }
  },

  getPreferences: function () {
    let user = this.getUser();
    return user ? user.preferences : {};
  },

  applyTheme: function () {
    let user = this.getUser();
    if (user && user.preferences && user.preferences.theme) {
      document.body.setAttribute("data-theme", user.preferences.theme);
    }
  },
};

// Export for use in other files
if (typeof module !== "undefined" && module.exports) {
  module.exports = DataManager;
}

// ===== GLOBAL UI COMPONENTS (V3 Polish) =====
document.addEventListener("DOMContentLoaded", () => {
  // 1. Toast Container
  const toastContainer = document.createElement("div");
  toastContainer.id = "global-toast-container";
  document.body.appendChild(toastContainer);

  window.showToast = function (message) {
    const toast = document.createElement("div");
    toast.className = "global-toast";
    toast.innerHTML = message;
    toastContainer.appendChild(toast);

    // Trigger entrance animation
    setTimeout(() => toast.classList.add("show"), 10);

    // Auto remove
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 400);
    }, 3000);
  };

  // 2. Confirm Modal
  const confirmModal = document.createElement("div");
  confirmModal.className = "modal global-confirm-modal";
  confirmModal.id = "global-confirm-modal";
  confirmModal.innerHTML = `
    <div class="modal-content">
      <h2 id="global-confirm-title" style="margin-bottom:8px;">Confirm</h2>
      <p id="global-confirm-message" style="margin-bottom:24px;"></p>
      <div style="display:flex; gap:12px;">
        <button class="btn-secondary" id="global-confirm-cancel" style="flex:1; padding:12px; border:1px solid var(--border-color); background:transparent; color:var(--text-primary);">Cancel</button>
        <button class="btn-primary" id="global-confirm-ok" style="flex:1; margin-bottom:0;">OK</button>
      </div>
    </div>
  `;
  document.body.appendChild(confirmModal);

  window.showConfirm = function (message, onConfirm, title = "Are you sure?") {
    document.getElementById("global-confirm-title").textContent = title;
    document.getElementById("global-confirm-message").textContent = message;

    const modal = document.getElementById("global-confirm-modal");
    const okBtn = document.getElementById("global-confirm-ok");
    const cancelBtn = document.getElementById("global-confirm-cancel");

    modal.style.display = "flex";

    const close = () => {
      modal.style.display = "none";
    };

    okBtn.onclick = () => {
      close();
      if (onConfirm) onConfirm();
    };

    cancelBtn.onclick = close;
  };
});
