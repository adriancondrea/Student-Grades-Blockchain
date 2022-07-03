import React, {useState} from 'react'
import {Alert, Button, Card} from "react-bootstrap";
import {useAuth} from "../../contexts/AuthContext";
import {Link, useNavigate} from "react-router-dom";
import AppNavbar from "../AppNavbar";

export default function Dashboard() {
    const [error, setError] = useState('');
    const {currentUser, logout} = useAuth();
    const navigate = useNavigate();

    async function handleLogout() {
        setError('');
        try {
            await logout();
            navigate('/login');
        } catch (e) {
            setError('failed to log out!');
        }
    }

    return(
        <>
            <AppNavbar/>
            <Card className='auth-inner'>
                <Card.Body>
                    <h3 className="text-center mb-4">Profile</h3>
                    {error && <Alert variant="danger">{error}</Alert>}
                    <strong>Email:</strong>{currentUser.email}
                    <Link to="/update-profile" className="btn btn-secondary w-100 mt-3">
                        Update Profile
                    </Link>
                    <div className="w-100 text-center mt-2">
                        <Button variant="btn btn-secondary w-100" onClick={handleLogout}>Log Out</Button>
                    </div>
                </Card.Body>
            </Card>
        </>
    )
}