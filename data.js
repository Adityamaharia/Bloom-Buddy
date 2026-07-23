/**
 * BloomBuddy Data Management
 * Handles all user data stored in localStorage
 */

const DataManager = {
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
      createdAt: new Date().toISOString()
    },
    goals: [],
    streak: {
      current: 0,
      longest: 0,
      lastActivity: null
    },
    moods: [], // array of { mood, date }
    preferences: {
      theme: "day", // day, night, rain
      notifications: true,
      reminders: []
    }
  },

  // Get all user data
  getUser: function() {
    const data = localStorage.getItem("bloomBuddy_user");
    return data ? JSON.parse(data) : null;
  },

  // Save user data
  saveUser: function(user) {
    localStorage.setItem("bloomBuddy_user", JSON.stringify(user));
  },

  // Initialize new user after signup
  initializeUser: function(name, email) {
    let user = JSON.parse(JSON.stringify(this.defaultUser));
    user.name = name;
    user.email = email;
    this.saveUser(user);
    return user;
  },

  // Update user profile
  updateProfile: function(name) {
    let user = this.getUser();
    if (user) {
      user.name = name;
      this.saveUser(user);
    }
  },

  // Plant Methods
  setPlant: function(type, name, emoji) {
    let user = this.getUser();
    if (user) {
      user.plant.type = type;
      user.plant.name = name;
      user.plant.emoji = emoji;
      user.plant.createdAt = new Date().toISOString();
      this.saveUser(user);
    }
  },

  getPlant: function() {
    let user = this.getUser();
    return user ? user.plant : null;
  },

  // Update plant growth stage
  updatePlantStage: function(stage) {
    let user = this.getUser();
    if (user) {
      user.plant.stage = stage;
      this.saveUser(user);
    }
  },

  // Goals Methods
  addGoal: function(goal) {
    let user = this.getUser();
    if (user) {
      goal.id = Date.now();
      goal.createdAt = new Date().toISOString();
      goal.completed = false;
      user.goals.push(goal);
      this.saveUser(user);
      return goal;
    }
  },

  getGoals: function() {
    let user = this.getUser();
    return user ? user.goals : [];
  },

  // Get today's goals
  getTodayGoals: function() {
    let user = this.getUser();
    if (!user) return [];
    
    const today = new Date().toDateString();
    let updated = false;
    user.goals.forEach(goal => {
      if (goal.completed) {
        const lastCompleted = new Date(goal.lastCompleted || goal.createdAt).toDateString();
        if (lastCompleted !== today) {
          goal.completed = false;
          updated = true;
        }
      }
    });
    if (updated) this.saveUser(user);
    
    return user.goals;
  },

  toggleGoal: function(goalId) {
    let user = this.getUser();
    if (user) {
      const goal = user.goals.find(g => g.id === goalId);
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

  deleteGoal: function(goalId) {
    let user = this.getUser();
    if (user) {
      user.goals = user.goals.filter(g => g.id !== goalId);
      this.saveUser(user);
    }
  },

  // Streak Methods
  updateStreak: function() {
    let user = this.getUser();
    if (!user) return;

    const today = new Date().toDateString();
    const lastDate = user.streak.lastActivity ? new Date(user.streak.lastActivity).toDateString() : null;

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

  getStreak: function() {
    let user = this.getUser();
    return user ? user.streak : { current: 0, longest: 0 };
  },

  // Mood Methods
  addMood: function(mood) {
    let user = this.getUser();
    if (user) {
      user.moods.push({
        mood: mood,
        date: new Date().toISOString()
      });
      this.saveUser(user);
    }
  },

  getTodayMood: function() {
    let user = this.getUser();
    if (!user) return null;

    const today = new Date().toDateString();
    const todayMood = user.moods.find(m => {
      return new Date(m.date).toDateString() === today;
    });
    return todayMood ? todayMood.mood : null;
  },

  // Preferences
  updatePreferences: function(prefs) {
    let user = this.getUser();
    if (user) {
      user.preferences = { ...user.preferences, ...prefs };
      this.saveUser(user);
    }
  },

  getPreferences: function() {
    let user = this.getUser();
    return user ? user.preferences : {};
  },

  applyTheme: function() {
    let user = this.getUser();
    if (user && user.preferences && user.preferences.theme) {
      document.body.setAttribute('data-theme', user.preferences.theme);
    }
  }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DataManager;
}
