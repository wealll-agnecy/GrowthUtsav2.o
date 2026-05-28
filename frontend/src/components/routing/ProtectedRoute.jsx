import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, roles }) => {
    const { user, loading, serverVerified } = useAuth();

    if (loading) return null; // Or a spinner

    if (!user) {
        return <Navigate to="/login" />;
    }

    if (roles) {
        // If roles are restricted, the server MUST have verified this user's session
        // to prevent an attacker from modifying localStorage to bypass UI rendering.
        if (!serverVerified || !roles.includes(user.role)) {
            return <Navigate to="/" />;
        }
    }

    return children;
};

export default ProtectedRoute;
