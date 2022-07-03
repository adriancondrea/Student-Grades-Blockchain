import React, {useRef, useState} from "react";
import {Alert, Button, Card, Form} from 'react-bootstrap';
import {useAuth} from "../../contexts/AuthContext";
import {Link, useNavigate} from "react-router-dom";
import {database} from "../../firebase";

export default function Signup() {
    const emailRef = useRef();
    const passwordRef = useRef();
    const passwordConfirmRef = useRef();
    const [isAdmin, setIsAdmin] = useState(false);
    const {signup} = useAuth();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        if (passwordRef.current?.value !== passwordConfirmRef.current?.value) {
            return setError('Passwords do not match');
        }
        try {
            setError('');
            setLoading(true);
            const email = emailRef.current?.value;
            signup(email, passwordRef.current?.value)
                .then(async authUser => {
                    await database.ref(`/users/${authUser.user.uid}`).set({
                        email,
                        isAdmin
                    });
                });
            navigate('/');
        } catch {
            setError('failed to create account');
        }
        setLoading(false);
    }

    return (
        <div className='auth-inner'>
            <Card>
                <Card.Body>
                    <h3 className="text-center mb-4">Sign Up</h3>
                    {error && <Alert variant="danger">{error}</Alert>}
                    <Form onSubmit={handleSubmit}>
                        <Form.Group id="email">
                            <Form.Label>Email</Form.Label>
                            <Form.Control type="email" ref={emailRef} required/>
                        </Form.Group>
                        <Form.Group id="password">
                            <Form.Label>Password</Form.Label>
                            <Form.Control type="password" ref={passwordRef} required/>
                        </Form.Group>
                        <Form.Group id="password-confirm">
                            <Form.Label>Confirm Password</Form.Label>
                            <Form.Control type="password" ref={passwordConfirmRef} required/>
                        </Form.Group>
                        <Form.Group className="mt-3" id="admin-checkbox">
                            <Form.Check type="switch" label="Admin" checked={isAdmin}
                                        onChange={() => setIsAdmin(!isAdmin)}/>
                        </Form.Group>
                        <Button disabled={loading} className="w-100 mt-2 btn btn-secondary" type="submit">Sign
                            up</Button>
                    </Form>
                </Card.Body>
            </Card>
            <div className="w-100 text-center mt-2">
                Have an account? <Link to="/login">Log In</Link>
            </div>
        </div>
    );
}