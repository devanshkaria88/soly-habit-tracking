import AccessControl "authorization/access-control";
import Principal "mo:base/Principal";
import OrderedMap "mo:base/OrderedMap";
import Debug "mo:base/Debug";
import Time "mo:base/Time";
import Array "mo:base/Array";
import Iter "mo:base/Iter";
import Text "mo:base/Text";
import Nat "mo:base/Nat";
import Int "mo:base/Int";



actor Soly {
  // Initialize the user system state
  let accessControlState = AccessControl.initState();

  // Initialize auth (first caller becomes admin, others become users)
  public shared ({ caller }) func initializeAccessControl() : async () {
    AccessControl.initialize(accessControlState, caller);
  };

  public query ({ caller }) func getCallerUserRole() : async AccessControl.UserRole {
    AccessControl.getUserRole(accessControlState, caller);
  };

  public shared ({ caller }) func assignCallerUserRole(user : Principal, role : AccessControl.UserRole) : async () {
    // Admin-only check happens inside
    AccessControl.assignRole(accessControlState, caller, user, role);
  };

  public query ({ caller }) func isCallerAdmin() : async Bool {
    AccessControl.isAdmin(accessControlState, caller);
  };

  public type UserProfile = {
    name : Text;
    // Other user metadata if needed
  };

  transient let principalMap = OrderedMap.Make<Principal>(Principal.compare);
  var userProfiles = principalMap.empty<UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can save profiles");
    };
    principalMap.get(userProfiles, caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Debug.trap("Unauthorized: Can only view your own profile");
    };
    principalMap.get(userProfiles, user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles := principalMap.put(userProfiles, caller, profile);
  };

  // Habit Tracking Types
  public type Habit = {
    id : Nat;
    name : Text;
    description : Text;
    reminder : ?Text;
    createdAt : Time.Time;
  };

  public type HabitProgress = {
    habitId : Nat;
    date : Time.Time;
    completed : Bool;
  };

  public type Achievement = {
    id : Nat;
    name : Text;
    description : Text;
    achievedAt : Time.Time;
  };

  public type UserStats = {
    totalHabits : Nat;
    totalCompletions : Nat;
    currentStreak : Nat;
    longestStreak : Nat;
    level : Nat;
    nextLevelThreshold : Nat;
  };

  // OrderedMap instances
  transient let natMap = OrderedMap.Make<Nat>(Nat.compare);

  // Storage
  var habits = principalMap.empty<OrderedMap.Map<Nat, Habit>>();
  var progress = principalMap.empty<OrderedMap.Map<Nat, HabitProgress>>();
  var achievements = principalMap.empty<OrderedMap.Map<Nat, Achievement>>();
  var userStats = principalMap.empty<UserStats>();
  var nextId : Nat = 0;

  // Habit Management
  public shared ({ caller }) func createHabit(name : Text, description : Text, reminder : ?Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can create habits");
    };

    let habitId = nextId;
    nextId += 1;

    let habit : Habit = {
      id = habitId;
      name;
      description;
      reminder;
      createdAt = Time.now();
    };

    let userHabits = switch (principalMap.get(habits, caller)) {
      case null { natMap.empty<Habit>() };
      case (?existing) { existing };
    };

    let updatedHabits = natMap.put(userHabits, habitId, habit);
    habits := principalMap.put(habits, caller, updatedHabits);

    habitId;
  };

  public shared ({ caller }) func updateHabit(habitId : Nat, name : Text, description : Text, reminder : ?Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can update habits");
    };

    switch (principalMap.get(habits, caller)) {
      case null { Debug.trap("No habits found for user") };
      case (?userHabits) {
        switch (natMap.get(userHabits, habitId)) {
          case null { Debug.trap("Habit not found") };
          case (?existingHabit) {
            let updatedHabit : Habit = {
              id = habitId;
              name;
              description;
              reminder;
              createdAt = existingHabit.createdAt;
            };
            let updatedHabits = natMap.put(userHabits, habitId, updatedHabit);
            habits := principalMap.put(habits, caller, updatedHabits);
          };
        };
      };
    };
  };

  public shared ({ caller }) func deleteHabit(habitId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can delete habits");
    };

    switch (principalMap.get(habits, caller)) {
      case null { Debug.trap("No habits found for user") };
      case (?userHabits) {
        let updatedHabits = natMap.delete(userHabits, habitId);
        habits := principalMap.put(habits, caller, updatedHabits);
      };
    };
  };

  public query ({ caller }) func getHabits() : async [Habit] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can view habits");
    };

    switch (principalMap.get(habits, caller)) {
      case null { [] };
      case (?userHabits) {
        Iter.toArray(natMap.vals(userHabits));
      };
    };
  };

  // Progress Tracking
  public shared ({ caller }) func markHabitProgress(habitId : Nat, date : Time.Time, completed : Bool) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can mark progress");
    };

    let progressId = nextId;
    nextId += 1;

    let habitProgress : HabitProgress = {
      habitId;
      date;
      completed;
    };

    let userProgress = switch (principalMap.get(progress, caller)) {
      case null { natMap.empty<HabitProgress>() };
      case (?existing) { existing };
    };

    let updatedProgress = natMap.put(userProgress, progressId, habitProgress);
    progress := principalMap.put(progress, caller, updatedProgress);

    // Update user stats if habit is completed
    if (completed) {
      let currentStats = switch (principalMap.get(userStats, caller)) {
        case null {
          {
            totalHabits = 1;
            totalCompletions = 1;
            currentStreak = 1;
            longestStreak = 1;
            level = 0;
            nextLevelThreshold = 10;
          };
        };
        case (?existing) { existing };
      };

      // Calculate new streak based on previous progress
      let dayInNanos = 86400000000000;
      let currentDay = date / dayInNanos;

      // Check if there's already a completion for today
      let hasToday = Array.find<HabitProgress>(
        Iter.toArray(natMap.vals(userProgress)),
        func(p) { p.habitId == habitId and (p.date / dayInNanos) == currentDay },
      );

      if (hasToday == null) {
        // Find the latest previous completion date for this habit
        let previousProgress = Array.filter<HabitProgress>(
          Iter.toArray(natMap.vals(userProgress)),
          func(p) { p.habitId == habitId and (p.date / dayInNanos) < currentDay },
        );

        let latestPrevious = Array.foldLeft<HabitProgress, ?HabitProgress>(
          previousProgress,
          null,
          func(acc, p) {
            switch (acc) {
              case null { ?p };
              case (?existing) {
                if ((p.date / dayInNanos) > (existing.date / dayInNanos)) {
                  ?p;
                } else {
                  ?existing;
                };
              };
            };
          },
        );

        let newStreak = switch (latestPrevious) {
          case null { 1 };
          case (?prev) {
            let daysDiff = currentDay - (prev.date / dayInNanos);
            if (daysDiff > 1) { 1 } else { currentStats.currentStreak + 1 };
          };
        };

        var updatedStats = {
          currentStats with
          totalCompletions = currentStats.totalCompletions + 1;
          currentStreak = newStreak;
          longestStreak = if (newStreak > currentStats.longestStreak) {
            newStreak;
          } else {
            currentStats.longestStreak;
          };
        };

        // Level progression logic
        if (updatedStats.totalCompletions >= updatedStats.nextLevelThreshold) {
          updatedStats := {
            updatedStats with
            level = updatedStats.level + 1;
            nextLevelThreshold = Nat.max(1, updatedStats.nextLevelThreshold + (updatedStats.nextLevelThreshold / 10));
          };
        };

        userStats := principalMap.put(userStats, caller, updatedStats);
      };
    };
  };

  public query ({ caller }) func getHabitProgress(habitId : Nat) : async [HabitProgress] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can view progress");
    };

    switch (principalMap.get(progress, caller)) {
      case null { [] };
      case (?userProgress) {
        let allProgress = Iter.toArray(natMap.vals(userProgress));
        Array.filter<HabitProgress>(allProgress, func(p) { p.habitId == habitId });
      };
    };
  };

  // Achievements and Stats
  public shared ({ caller }) func addAchievement(name : Text, description : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can add achievements");
    };

    let achievementId = nextId;
    nextId += 1;

    let achievement : Achievement = {
      id = achievementId;
      name;
      description;
      achievedAt = Time.now();
    };

    let userAchievements = switch (principalMap.get(achievements, caller)) {
      case null { natMap.empty<Achievement>() };
      case (?existing) { existing };
    };

    let updatedAchievements = natMap.put(userAchievements, achievementId, achievement);
    achievements := principalMap.put(achievements, caller, updatedAchievements);
  };

  public query ({ caller }) func getAchievements() : async [Achievement] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can view achievements");
    };

    switch (principalMap.get(achievements, caller)) {
      case null { [] };
      case (?userAchievements) {
        Iter.toArray(natMap.vals(userAchievements));
      };
    };
  };

  public shared ({ caller }) func updateUserStats(stats : UserStats) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can update stats");
    };

    userStats := principalMap.put(userStats, caller, stats);
  };

  public query ({ caller }) func getUserStats() : async ?UserStats {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can view stats");
    };

    principalMap.get(userStats, caller);
  };
};

