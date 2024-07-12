// Имитация задержки сети
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Фиктивные данные пользователя
const dummyUser = {
  id: '1',
  username: 'testuser',
  email: 'testuser@example.com'
};

export interface UserType {
    id: string;
    username: string;
    email: string;
}

export const login = async (credentials: { username: string; password: string }) => {
  await delay(1000); // Имитация задержки сети
  
  if (credentials.username === 'testuser' && credentials.password === 'password') {
    localStorage.setItem('token', 'dummy_jwt_token');
    return dummyUser;
  } else {
    throw new Error('Invalid credentials');
  }
};

export const logout = async () => {
  await delay(500); // Имитация задержки сети
  localStorage.removeItem('token');
};

export const checkAuthStatus = async () => {
  await delay(500); // Имитация задержки сети
  const token = localStorage.getItem('token');
  
  if (token) {
    return dummyUser;
  } else {
    throw new Error('Not authenticated');
  }
};

export const register = async (userData: { username: string; email: string; password: string }) => {
  await delay(1000); // Имитация задержки сети
  
  // В реальном приложении здесь была бы проверка уникальности username и email
  localStorage.setItem('token', 'dummy_jwt_token');
  return { ...dummyUser, ...userData };
};