---
status: testing
phase: 01-mvp
source: [manual-extraction-from-session]
started: 2026-04-08T17:37:00Z
updated: 2026-04-08T17:37:00Z
---

## Current Test

number: 1
name: Transactions List & Grouping
expected: |
  Open the Transactions tab. You should see a list of transactions (seeded mock data by default). Transactions must be grouped by date (e.g., "Today", "Yesterday"). Each row should show the name, category, and a color-coded amount.
awaiting: user response

## Tests

### 1. Transactions List & Grouping
expected: |
  Open the Transactions tab. You should see a list of transactions (seeded mock data by default). Transactions must be grouped by date (e.g., "Today", "Yesterday"). Each row should show the name, category, and a color-coded amount.
result: [pending]

### 2. Transaction Filters & Search
expected: |
  On the Transactions screen, toggle between "All", "Income", and "Expense". The list should filter immediately. Try searching for a specific name (e.g., "Netflix") in the search bar.
result: [pending]

### 3. Analytics Dashboard
expected: |
  Switch to the Analytics tab. You should see high-level summary cards (Income, Expense, Savings) and two charts: a Pie chart (Category breakdown) and a Bar chart (Monthly comparison).
result: [pending]

### 4. Add Transaction Modal
expected: |
  Tap the center "+" button in the tab bar. A bottom-sheet modal should slide up. Fill in an Amount ($0.01+), a Name, and select a Category. Tap "Save". The modal should close.
result: [pending]

### 5. Data Syncing
expected: |
  After saving the new transaction in Test #4, check the Transactions and Analytics tabs. The new entry should appear in the list, and the chart/summary totals should update instantly.
result: [pending]

### 6. Profile & Theme Toggle
expected: |
  Go to the Profile/Settings tab. Toggle the "Dark Mode" switch. The entire app should transition smoothly between light and dark themes using a fade animation.
result: [pending]

### 7. Clear All Data
expected: |
  On the Profile screen, tap "Clear All Data". A confirmation alert must appear. Confirm the clearing. All transactions should be deleted, and all screens should revert to empty states.
result: [pending]

## Summary

total: 7
passed: 0
issues: 0
pending: 7
skipped: 0

## Gaps

[none yet]
