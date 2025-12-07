export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
export const ROLES = {
    USER: 'USER',
    MANAGER: 'MANAGER',
    ADMIN: 'ADMIN'
};

// Функция для нормализации ролей (удаление префикса ROLE_)
export const normalizeRole = (role) => {
    if (!role) return '';
    const roleStr = String(role).toUpperCase();
    return roleStr.startsWith('ROLE_') ? roleStr.substring(5) : roleStr;
};

// Функция для проверки роли с поддержкой префикса ROLE_
export const hasRole = (userRoles, requiredRole) => {
    if (!userRoles || !requiredRole) return false;

    const normalizedRequiredRole = normalizeRole(requiredRole);

    // Преобразуем userRoles в массив строк
    const rolesArray = Array.isArray(userRoles)
        ? userRoles
        : String(userRoles).split(',').map(r => r.trim());

    return rolesArray.some(role => {
        const normalizedUserRole = normalizeRole(role);
        return normalizedUserRole === normalizedRequiredRole;
    });
};