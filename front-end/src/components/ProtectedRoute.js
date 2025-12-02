import { Navigate, Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'

const ProtectedRoute = ({ requireAdmin = false }) => {
    const { user, token } = useSelector((state) => state.auth)

    if (!token || !user) {
        return <Navigate to="/login" />
    }

    if (requireAdmin && !user.roles?.includes('ADMIN')) {
        return <Navigate to="/" />
    }

    return <Outlet />
}

export default ProtectedRoute