# Soly – A Habit Tracking App

## Overview
Soly is a habit tracking application designed with a neobrutalistic UI style featuring bold colors, chunky elements, and playful contrast. The app is specifically designed to be ADHD-friendly with a simple layout, minimal distractions, and quick habit logging capabilities.

## Core Features

### Habit Management
- Users can create new habits with custom names and descriptions
- Users can edit existing habits to modify details
- Users can delete habits they no longer want to track
- Each habit can have optional short reminders or cues attached

### Daily Progress Tracking
- Users can mark habits as completed for each day
- Simple one-click logging system for quick habit completion
- Visual indicators showing daily completion status
- Enhanced celebratory confetti animation triggers when habits are successfully marked as done
- Confetti features vibrant neobrutalistic colors (bright cyan, pink, lime, yellow) with increased particle count for more visual impact
- Animation parameters optimized for visual satisfaction:
  - Higher particle count for more dramatic effect
  - Adjusted spread and velocity for better coverage
  - Fine-tuned physics properties (gravity, decay) for smooth animation flow
  - Duration optimized to balance visual impact with performance
- Animation is debounced to prevent multiple triggers from rapid clicking
- Performance optimized to ensure smooth operation on mobile and lower-end devices

### Streak and Progress System
- Track consecutive days of habit completion (streaks)
- Calculate and display completion percentages for each habit
- Show overall progress statistics
- Enhanced streak logic implementation:
  - Check if habit completion already exists for the same habit and date (date-only comparison, ignoring timestamps)
  - If completion already exists for that date, skip incrementing the streak and return without modification
  - Find the most recent prior completion date for that specific habit
  - If gap between current date and last completion is more than 1 day, reset streak to 1
  - If consecutive (1 day gap or less), increment streak by 1
  - Update longestStreak when currentStreak exceeds it
  - Total completions counter increases only for new daily completions
- Real-time streak updates in frontend components with corrected values

### Dynamic Leveling System
- User levels based on total habit completions with dynamic threshold progression
- Each new level requires 10% more completions than the previous level
- Level 1 starts at 10 completions, Level 2 requires 11 completions (10% more), Level 3 requires 12 completions (10% more than 11), and so on
- Progress exceeding the threshold rolls over properly to the next level
- Next level threshold is persisted alongside user stats and updated upon level-up
- Real-time level progression updates in frontend during habit completion

### Stats Page
- Dedicated statistics page displaying comprehensive user performance data
- Shows total habits count, total completions, current streak, longest streak, and user level
- Visual progress indicators using icons (streak flame, trophy, level star, progress chart, achievement badge)
- Progress visualization with charts or graphical indicators including level progress bar
- Stats update automatically when habits are completed with corrected streak calculations and level progression
- Real-time data reflection in the dashboard with accurate streak values and level updates

### Gamification Elements
- Habit streaks with visual streak counters
- Dynamic user levels with progressive completion requirements
- Achievement badges for reaching milestones
- Milestone celebrations for significant accomplishments
- Enhanced confetti celebration animation for habit completions with increased particle density

### Progress Visualization
- Statistics dashboard showing habit performance
- Graphs displaying progress over time
- Completion percentage displays for individual habits
- Visual progress indicators
- Level progress bar showing progress toward next level threshold

### Enhanced Actor Reconnection System
- Automatic detection of canister actor unavailability (e.g., "Actor not available" or "failed to fetch" errors)
- Intelligent connection state management with connection status tracking
- Automatic reinitialization flow when connection issues are detected:
  - Reimport or rebind the Soly actor using the latest canister ID
  - Recheck the user's Internet Identity session
  - Retry the failed API call after successful reconnection
- Connection state check before triggering reconnection to prevent redundant attempts
- Debounced reconnection notifications to prevent multiple duplicate toast messages
- Reconnection logic only triggers on actual disconnections or canister errors, not on routine operations
- Seamless recovery without requiring page refresh
- Optimized user feedback system with toast or banner notifications:
  - "Reconnecting to Soly…" message during reconnection process
  - Single confirmation message per reconnection event (no duplicates)
  - Cooldown mechanism to suppress redundant success notifications
- Transparent error handling that maintains user experience continuity
- Actor reuse from context when connection is valid to avoid unnecessary reinitializations

## Design Requirements
- Neobrutalistic UI style with bold, contrasting colors
- Chunky, prominent UI elements
- Playful visual design with strong contrast
- ADHD-friendly interface: simple layout, minimal distractions
- Quick and intuitive habit logging workflow
- Stats page uses neobrutalistic cards and available icons for visual appeal
- Enhanced confetti animation integrated into HabitCard component with neobrutalistic color palette
- Confetti animation optimized with increased particle count and fine-tuned physics for more satisfying visual feedback
- Animation does not block UI interactions and is properly debounced
- Performance considerations ensure smooth operation across all device types
- App content language: English

## Backend Data Storage
The backend must store:
- User habits with names, descriptions, and optional reminders
- Daily completion records for each habit with date-only tracking
- User progress data including streaks and statistics
- Achievement and badge data
- User level information with dynamic threshold tracking
- UserStats records with currentStreak, longestStreak, totalCompletions, level, and nextLevelThreshold

## Backend Operations
- Create, read, update, and delete habits
- Record daily habit completions with enhanced streak calculation logic
- Calculate streak lengths and completion percentages correctly
- Track user achievements and level progression with dynamic threshold system
- Retrieve user's own habit data and progress statistics
- Automatically initialize UserStats when user first marks progress
- Dynamic level progression logic:
  - When totalCompletions surpasses nextLevelThreshold, increment user level by 1
  - Calculate new threshold as 10% more than the current threshold (rounded up)
  - Update nextLevelThreshold value in user stats
  - Handle progress rollover when completions exceed threshold
- Fixed markHabitProgress function with corrected streak logic:
  - Performs date-only comparison to prevent duplicate completions on same day
  - Checks for existing completion entries for the same habit and date before processing
  - Skips streak increment if completion already exists for that habit and date
  - Finds the most recent prior completion date for that specific habit
  - Calculates proper streak based on consecutive daily completions
  - Handles streak resets when gaps exceed 1 day
  - Updates userStats.currentStreak with corrected streak values
  - Updates userStats.longestStreak when currentStreak surpasses it
  - Checks and updates user level based on totalCompletions vs nextLevelThreshold
  - Ensures real-time frontend updates for accurate streak and level display
- Provide UserStats data for the Stats Page display with corrected streak calculations and level progression
- Ensure proper initialization of user data structures:
  - When creating the first habit, properly initialize and store the user's habit map in the habits storage
  - In markHabitProgress, add defensive checks to verify user's progress map and habit map exist
  - If user maps don't exist during progress marking, initialize them before storing progress data
  - Initialize level at 0 and nextLevelThreshold at 10 for new users
  - Ensure first habit completion properly updates stats, streaks, and level progression through proper initialization
  - Maintain backward compatibility for existing users while fixing first-habit creation issues
