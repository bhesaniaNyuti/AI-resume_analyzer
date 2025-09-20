/**
 * Generates a greeting message for dashboard header based on user profile
 * @param {Object} user - User profile object
 * @returns {string} Greeting message
 */
export const generateGreeting = (user) => {
  if (!user) {
    return "Welcome back 👋";
  }

  // Prefer user.name (from registration form)
  if (user.name) {
    return `Welcome back, ${user.name} 👋`;
  }

  // If missing, use user.displayName
  if (user.displayName) {
    return `Welcome back, ${user.displayName} 👋`;
  }

  // If missing, use user.firstName
  if (user.firstName) {
    return `Welcome back, ${user.firstName} 👋`;
  }

  // If missing, use the part of user.email before '@'
  if (user.email) {
    const emailName = user.email.split('@')[0];
    return `Welcome back, ${emailName} 👋`;
  }

  // If none are available, just say "Welcome back 👋"
  return "Welcome back 👋";
};
