import React from 'react'
import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

const ProtectedRoute = ({ children, requireAdmin = false }) => {
    const { user, token } = useSelector(state => state.auth)

    if (!token) {
        return <Navigate to="/login" replace />
    }

    if (requireAdmin && !user?.roles?.includes('ADMIN')) {
        return <Navigate to="/" replace />
    }

    return children
}

export default ProtectedRoute