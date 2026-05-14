import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

// Types
interface User {
    id: string;
    name: string;
    role: string;
    avatar?: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isAdmin: boolean;
    isNurse: boolean;
    isDoctor: boolean;
    isLoading: boolean;
    login: (accessToken: string, refreshToken: string) => void;
    logout: () => void;
}

// Create Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // On mount — check if token exists in localStorage
    useEffect(() => {
        const checkToken = () => {
            const token = localStorage.getItem('accessToken');
            if (token) {
                try {
                    const decoded = decodeToken(token);
                    console
                    if (decoded) {
                        setUser(decoded);
                        console.log("decoded", decoded)
                        setIsAuthenticated(true);
                    } else {
                        throw new Error('Token decode returned null (likely expired)');
                    }
                } catch {
                    // Invalid token — clear it
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    setUser(null);
                    setIsAuthenticated(false);
                }
            }
            setIsLoading(false);
        };

        checkToken();

        const handleUnauthorized = () => {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            setUser(null);
            setIsAuthenticated(false);
        };

        window.addEventListener('auth:unauthorized', handleUnauthorized);
        return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
    }, []);

    // Decode JWT token
    const decodeToken = (token: string): User | null => {
        try {
            const decoded: any = jwtDecode(token);
            console.log("decoded", decoded)
            // Check if token is expired
            if (decoded.exp && (decoded.exp * 1000) < Date.now()) {
                return null;
            }

            const rawRole =
                decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
                decoded.role ||
                '';

            // Standardize integer roles to string roles
            const rolesMap: Record<string, string> = {
                '1': 'Admin', '2': 'Doctor', '3': 'Nurse', '4': 'Pharmacist', '5': 'Radiologist', '6': 'Lab Technician'
            };
            const role = rolesMap[String(rawRole)] || (isNaN(parseInt(String(rawRole))) ? String(rawRole) : 'Staff');

            const id =
                decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] ||
                decoded.nameid ||
                decoded.sub ||
                '';

            const rawNameCandidates = [
                decoded.given_name,
                decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname'],
                decoded.name,
                decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'],
                decoded.unique_name,
            ];

            let name = '';
            for (const c of rawNameCandidates) {
                if (c && typeof c === 'string' && c.trim().length > 0) {
                    name = c.trim();
                    // Prefer non-numeric names, but keep the numeric one if it's the only one we find
                    if (!/^\d+$/.test(name)) break;
                }
            }

            // Fallback if all else fails
            if (!name) {
                name = decoded.name || decoded.unique_name || 'Unknown';
            }

            const formattedName = name !== 'Unknown' && !/^\d+$/.test(name)
                ? name.charAt(0).toUpperCase() + name.slice(1)
                : name;

            return { id, name: formattedName, role };
        } catch {
            return null;
        }
    };

    // Login
    const login = (accessToken: string, refreshToken: string) => {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);

        const decoded = decodeToken(accessToken);
        console.log("decoded", decoded)


        if (decoded) {
            setUser(decoded);
            setIsAuthenticated(true);
        }
    };

    // Logout
    const logout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setUser(null);
        setIsAuthenticated(false);
    };

    const isAdmin = user?.role?.toLowerCase() === 'admin';
    const isNurse = user?.role?.toLowerCase() === 'nurse';
    const isDoctor = user?.role?.toLowerCase() === 'doctor';

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, isAdmin, isNurse, isDoctor, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom Hook
export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};