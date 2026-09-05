export type Language = "en" | "zh";

export const translations = {
  en: {
    app: {
      name: "Planora",
      subtitle: "Daily Work Organizer",
      loading: "Loading your workspace...",
    },

    sidebar: {
      today: "Today",
      allTasks: "All Tasks",
      active: "Pending",
      completed: "Completed",
      todayFocus: "Today's Focus",
      minutesShort: "min",
      language: "Language",
      english: "English",
      chinese: "中文",
    },

    taskList: {
      titles: {
        today: "Today",
        all: "All Tasks",
        active: "Pending",
        completed: "Completed",
      },

      todaySubtitle: "things to move forward",
      activeSubtitle: "tasks to do",
      recordSubtitle: "tasks",

      addTask: "New Task",

      empty: {
        today: "Nothing planned for today yet. Choose what you want to move forward.",
        all: "No tasks yet. Add something you want to move forward.",
        active: "Nothing pending. Take a break or decide what comes next.",
        completed: "No completed tasks yet. Your finished work will appear here.",
      },
    },

    task: {
      addToToday: "Add to Today",
      removeFromToday: "Remove from Today",
      today: "Today",
      setFocusTask: "Focus on this task",
      edit: "Edit",
      delete: "Delete",
      toggleComplete: "Toggle completion",
      focused: "Focused",
      timerTarget: "Focus task",
      overdue: "Overdue",

      priority: {
        high: "High",
        medium: "Medium",
        low: "Low",
      },

      time: {
        minute: "min",
        minutes: "min",
        hour: "hr",
        hours: "hrs",
      },
    },

    dialog: {
      newTask: "New Task",
      editTask: "Edit Task",

      createDescription:
        "Capture the work first. You can organize the details later.",
      editDescription:
        "Update the task details. Changes are saved locally.",

      title: "Task title",
      titlePlaceholder: "e.g. Update Planora localization",
      titleRequired: "Please enter a task title",

      note: "Notes",
      notePlaceholder: "Context, next step, links, or acceptance criteria (optional)",

      deadline: "Deadline",
      priority: "Priority",

      cancel: "Cancel",
      create: "Create Task",
      save: "Save Changes",
    },

    pomodoro: {
      title: "Focus Timer",
      settings: "Timer settings",

      focusMinutes: "Focus (minutes)",
      breakMinutes: "Break (minutes)",

      taskLabel: "Focus task",
      chooseTask: "Choose a pending task",
      noTasks: "No pending tasks",

      focus: "Focus",
      break: "Break",

      runningFocus: "Focusing",
      runningBreak: "On a break",
      paused: "Paused",
      ready: "Ready",

      taskPrefix: "Working on:",
      chooseFirst: "Choose a task to begin",

      pause: "Pause",
      resume: "Resume",
      start: "Start",
      stop: "Stop",

      todayLog: "Today's Focus Log",
      noRecords: "No focus sessions yet today.",
      endedEarly: "Stopped early",

      chooseTaskWarning: "Choose a task before starting.",
      stoppedMessage: "Focus time recorded.",

      focusFinished: "Focus session complete. Time for a short break.",
      breakFinished: "Break complete. Ready for the next focus session.",
      focusRecorded: "Your focus time was added to this task.",

      deletedTask: "Deleted task",
    },

    progress: {
      title: "Today's Progress",
      focused: "Focused",
      sessions: "Focus sessions",
      completed: "Tasks completed",
      noProgress:
        "Start with one task. Your work will become visible here as the day moves forward.",
    },

    toast: {
      created: "Task created",
      updated: "Task updated",
      deleted: "Task deleted",
      addedToToday: "Added to Today",
      removedFromToday: "Removed from Today",
    },
  },

  zh: {
    app: {
      name: "Planora",
      subtitle: "日常工作整理工具",
      loading: "正在加载你的工作空间...",
    },

    sidebar: {
      today: "今天",
      allTasks: "全部任务",
      active: "待完成",
      completed: "已完成",
      todayFocus: "今日专注",
      minutesShort: "分钟",
      language: "语言",
      english: "English",
      chinese: "中文",
    },

    taskList: {
      titles: {
        today: "今天",
        all: "全部任务",
        active: "待完成",
        completed: "已完成",
      },

      todaySubtitle: "件今天想推进的事情",
      activeSubtitle: "件待处理任务",
      recordSubtitle: "项任务",

      addTask: "新增任务",

      empty: {
        today: "今天还没有安排任务。选择几件你真正想推进的事情吧。",
        all: "还没有任务。先记下你想推进的事情。",
        active: "没有待完成任务。休息一下，或者想想下一步。",
        completed: "还没有已完成任务。完成的工作会出现在这里。",
      },
    },

    task: {
      addToToday: "加入今天",
      removeFromToday: "移出今天",
      today: "今天",
      setFocusTask: "专注这项任务",
      edit: "编辑",
      delete: "删除",
      toggleComplete: "切换完成状态",
      focused: "累计专注",
      timerTarget: "当前专注",
      overdue: "已逾期",

      priority: {
        high: "高",
        medium: "中",
        low: "低",
      },

      time: {
        minute: "分钟",
        minutes: "分钟",
        hour: "小时",
        hours: "小时",
      },
    },

    dialog: {
      newTask: "新增任务",
      editTask: "编辑任务",

      createDescription:
        "先把事情记下来，不需要现在就把所有细节规划完整。",
      editDescription:
        "更新任务信息，修改会保存到本地。",

      title: "任务标题",
      titlePlaceholder: "例如：更新 Planora 多语言",
      titleRequired: "请输入任务标题",

      note: "备注",
      notePlaceholder: "上下文、下一步、链接或验收标准（可选）",

      deadline: "截止日期",
      priority: "优先级",

      cancel: "取消",
      create: "创建任务",
      save: "保存修改",
    },

    pomodoro: {
      title: "专注计时",
      settings: "计时设置",

      focusMinutes: "专注时长（分钟）",
      breakMinutes: "休息时长（分钟）",

      taskLabel: "专注任务",
      chooseTask: "选择一条待完成任务",
      noTasks: "暂无待完成任务",

      focus: "专注",
      break: "休息",

      runningFocus: "专注进行中",
      runningBreak: "休息进行中",
      paused: "已暂停",
      ready: "准备开始",

      taskPrefix: "正在进行：",
      chooseFirst: "选择一条任务开始",

      pause: "暂停",
      resume: "继续",
      start: "开始",
      stop: "停止",

      todayLog: "今日专注记录",
      noRecords: "今天还没有专注记录。",
      endedEarly: "提前结束",

      chooseTaskWarning: "请先选择一条任务。",
      stoppedMessage: "本次专注时间已记录。",

      focusFinished: "专注时段结束，休息一下吧。",
      breakFinished: "休息结束，可以开始下一段专注了。",
      focusRecorded: "本次投入已记录到任务。",

      deletedTask: "已删除的任务",
    },

    progress: {
      title: "今日进展",
      focused: "专注时间",
      sessions: "专注次数",
      completed: "完成任务",
      noProgress:
        "从一件事情开始。随着一天推进，你真正完成的工作会逐渐出现在这里。",
    },

    toast: {
      created: "任务已创建",
      updated: "任务已更新",
      deleted: "任务已删除",
      addedToToday: "已加入今天",
      removedFromToday: "已移出今天",
    },
  },
} as const;

export type Translation = typeof translations.en;