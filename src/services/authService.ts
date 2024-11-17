// Simplified auth service without database
export const authService = {
  async login(email: string) {
    return {
      user: {
        email,
        name: email.split('@')[0]
      }
    };
  }
};