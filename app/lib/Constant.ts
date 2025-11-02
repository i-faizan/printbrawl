// Countdown target - designs reset at 12AM US Central Time every 2 days
export const getNextRotationDate = () => {
  // Get current time
  const now = new Date()
  
  // Get Central Time components
  const centralNow = new Date(now.toLocaleString("en-US", { timeZone: "America/Chicago" }))
  const centralYear = centralNow.getFullYear()
  const centralMonth = centralNow.getMonth()
  const centralDate = centralNow.getDate()
  
  // Create today's midnight in Central Time
  const todayCentralMidnight = new Date(`${centralYear}-${String(centralMonth + 1).padStart(2, '0')}-${String(centralDate).padStart(2, '0')}T00:00:00`)
  
  // Calculate days since epoch
  const daysSinceEpoch = Math.floor(todayCentralMidnight.getTime() / (1000 * 60 * 60 * 24))
  const cycleDay = daysSinceEpoch % 2 // 0 = reset day, 1 = off day
  
  // Get current Central time in milliseconds since midnight
  const centralMsSinceMidnight = centralNow.getHours() * 3600000 + centralNow.getMinutes() * 60000 + centralNow.getSeconds() * 1000
  
  // Calculate next reset
  let daysToAdd = 0
  if (cycleDay === 0) {
    // Today is a reset day
    if (centralMsSinceMidnight >= 0) {
      // Already past or at midnight, next reset is in 2 days
      daysToAdd = 2
    } else {
      // Before midnight, next reset is today
      daysToAdd = 0
    }
  } else {
    // Today is off day, next reset is tomorrow at midnight
    daysToAdd = 1
  }
  
  // Calculate next reset date in Central Time
  const nextResetCentral = new Date(todayCentralMidnight)
  nextResetCentral.setDate(nextResetCentral.getDate() + daysToAdd)
  
  // Convert Central midnight to UTC for the countdown
  // We need to find what UTC time corresponds to Central midnight
  const centralOffset = now.getTime() - centralNow.getTime()
  const nextResetUTC = new Date(nextResetCentral.getTime() + centralOffset)
  
  return nextResetUTC.toISOString()
}

// Product Links - These will be loaded from API
export const DESIGN_A_LINK = "YOUR_GUMROAD_DESIGN_A_LINK"
export const DESIGN_B_LINK = "YOUR_GUMROAD_DESIGN_B_LINK"

// Product Configuration - These will be loaded from API
export const PRICE_USD = "24.99"

// Simulated Purchase Counts - These will be loaded from API
export const INITIAL_DESIGN_A_PURCHASES = 127
export const INITIAL_DESIGN_B_PURCHASES = 143

// Design Names - These will be loaded from API
export const DESIGN_A_NAME = "Design A"
export const DESIGN_B_NAME = "Design B"
