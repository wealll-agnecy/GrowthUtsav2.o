import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, roles }) => {
    const { user, loading } = useAuth();

    if (loading) return null; // Or a spinner

    if (!user) {
        return <Navigate to="/login" />;
    }

    // ROLE-BASED ACCESS DISABLED: Demonstration phase universal bypass
    /*
    if (roles && !roles.includes(user.role)) {
        return <Navigate to="/" />;
    }
    */

    return children;
};

export default ProtectedRoute;
