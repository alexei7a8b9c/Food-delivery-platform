import React from 'react'
import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

const ProtectedRoute = ({ children, requireAdmin = false }) => {
    const { user, token } = useSelector((state) => state.auth)

    if (!token || !user) {
        return <Navigate to="/login" replace />
    }

    if (requireAdmin) {
        const isAdmin = user.roles?.includes('ADMIN')
        if (!isAdmin) {
            return <Navigate to="/" replace />
        }
    }

    return children
}

export default ProtectedRoute