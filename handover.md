# Jelly Bean Feature Handover

## 1. Editable Pomodoro & Break Timers
- **Target**: `PomodoroSheet` component in `src/App.tsx`.
- **Requirement**: Allow the user to edit the default durations for "Focus" (25 min) and "Break" (5 min).
- **Style**: Use the established premium UI style (custom inputs, warm colors, rounded corners) to allow users to adjust these times before starting the timer.

## 2. UI Layout Adjustment
- **Target**: Floating Island Dock (Navbar) in `src/App.tsx`.
- **Requirement**: Increase the bottom offset of the navbar to make it float slightly higher than its current position.
- **Current value**: `bottom: 'calc(env(safe-area-inset-bottom, 24px) + 48px)'`. Adjust as needed to improve visual balance.

## 3. Daily Motivational Quotes & Notifications
- **Target**: `src/constants.tsx` (for the data) and `src/App.tsx` (for the logic).
- **Data**: Include the following 75 motivational quotes in a constant array:
  1. Small actions repeated daily become identities stronger than motivation ever could.
  2. Discipline builds the future your temporary emotions keep trying to destroy.
  3. One difficult day never ruins progress, quitting repeatedly always does.
  4. Consistency beats intensity when success depends on long-term transformation.
  5. Your future self is watching every excuse you make today.
  6. Habits decide your direction long before results become visible.
  7. Progress grows quietly while distractions scream for your attention.
  8. Motivation starts journeys, discipline finishes them without negotiation.
  9. Every repetition strengthens the person you are becoming daily.
  10. Greatness is usually boring routines executed with brutal consistency.
  11. Miss once, recover immediately, never allow failure to become identity.
  12. Tiny improvements compound faster than most people can imagine.
  13. Your comfort zone charges interest on every dream you abandon.
  14. Discipline is self-respect expressed through consistent daily action.
  15. Build habits that make difficult choices feel automatic over time.
  16. Momentum begins the moment excuses stop controlling your schedule.
  17. Success loves routines more than dramatic bursts of motivation.
  18. Every completed task teaches your brain to trust itself again.
  19. The strongest people master themselves before trying to master anything else.
  20. You become whatever your repeated actions silently reinforce every day.
  21. Hard days create resilient minds capable of extraordinary achievements.
  22. The life you want requires habits your current self resists.
  23. Excellence grows from repeated effort nobody else notices initially.
  24. Discipline turns impossible goals into scheduled daily responsibilities.
  25. Results appear slowly, then suddenly, after enough consistent effort.
  26. Your routines reveal priorities more honestly than your words ever will.
  27. Strong habits protect your future during moments of weakness.
  28. Improvement begins where excuses lose their emotional power over you.
  29. Action destroys anxiety faster than endless overthinking ever could.
  30. Every disciplined choice strengthens your ability to make another tomorrow.
  31. Habits create freedom by removing unnecessary daily decision-making.
  32. Your goals deserve effort even when motivation disappears completely.
  33. Consistency during difficult moments separates growth from wishful thinking.
  34. Discipline is choosing long-term pride over short-term comfort repeatedly.
  35. Tiny wins create unstoppable momentum when repeated without interruption.
  36. Growth feels uncomfortable because transformation demands leaving familiar patterns behind.
  37. Successful people protect routines like others protect their excuses.
  38. Every day is another opportunity to become harder to defeat.
  39. Self-control today creates opportunities unavailable to undisciplined people tomorrow.
  40. Dreams stay fantasies until routines begin supporting them consistently.
  41. The strongest foundation for confidence is keeping promises to yourself.
  42. Difficult routines become easy after enough repeated exposure and persistence.
  43. Every challenge completed increases your tolerance for future discomfort.
  44. Progress requires patience when results refuse to appear immediately.
  45. Discipline survives days when inspiration completely abandons you.
  46. Consistent effort eventually embarrasses natural talent lacking discipline.
  47. Habits shape character quietly while people focus only on outcomes.
  48. Small disciplined actions eventually create massive life-changing transformations.
  49. Your future depends heavily on today's repeated invisible choices.
  50. Every repetition builds evidence that you are capable of more.
  51. Real confidence comes from proving reliability to yourself repeatedly.
  52. Discipline means acting correctly despite emotional resistance and discomfort.
  53. Long-term success begins with winning ordinary daily battles consistently.
  54. Improvement becomes inevitable when quitting stops being considered an option.
  55. The hardest step is usually beginning before feeling completely ready.
  56. Successful routines remove opportunities for laziness to negotiate with you.
  57. Every disciplined morning increases the probability of a successful future.
  58. Habits determine outcomes long before motivation enters the conversation.
  59. Repetition creates mastery even when progress feels painfully slow.
  60. Your strongest weapon against failure is relentless consistent execution.
  61. Comfort delays growth while disciplined discomfort accelerates transformation.
  62. The version of yourself you admire requires daily intentional effort.
  63. Great achievements are collections of small disciplined decisions repeated consistently.
  64. Discipline creates stability when emotions become unpredictable and unreliable.
  65. Every difficult task completed increases your mental resilience significantly.
  66. Habits either build your future or quietly destroy it daily.
  67. Consistency is powerful because most people eventually stop trying.
  68. Daily discipline creates opportunities luck alone can never provide.
  69. Self-improvement starts with controlling actions before controlling outcomes.
  70. You are always training yourself, either intentionally or accidentally.
  71. Difficult habits become easier once identity aligns with the behavior.
  72. Your routines today are previews of your future tomorrow.
  73. Discipline transforms ordinary people into exceptionally reliable individuals over time.
  74. The gap between goals and reality is filled through consistent action.
  75. Success rewards persistence far more often than raw potential alone.

- **Notification Logic**:
  - Use `@capacitor/local-notifications` for scheduling.
  - On app start (initial onboarding or fresh install), request notification permissions.
  - If permissions are granted:
    - If it's a first-time install/launch, schedule the first notification to arrive **5 minutes** after the start.
    - Subsequent notifications should arrive at **12 AM (Midnight)** every day.
    - Schedule them to cycle through the 75 quotes sequentially.

---
*Note: This document incorporates previous UI requirements regarding duration inputs and general aesthetics.*
