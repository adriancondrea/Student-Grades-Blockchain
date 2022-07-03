import React, {useRef, useState} from "react";
import {useAuth} from "../../contexts/AuthContext";
import {Link} from "react-router-dom";
import {Alert, Button, Card, Form} from "react-bootstrap";

export default function ResetPassword() {
    const emailRef = useRef();
    const {resetPassword} = useAuth();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    async function handleSubmit(e) {
        e.preventDefault();

        try {
            setMessage('');
            setError('');
            setLoading(true);
            await resetPassword(emailRef.current?.value);
            setMessage('Password reset request successful! Check email for instructions.');
        } catch {
            setError('failed to reset password!');
        }
        setLoading(false);
    }

    return (
        <>
            <Card>
                <Card.Body>
                    <h3 className="text-center mb-4">Reset Password</h3>
                    {error && <Alert variant="danger">{error}</Alert>}
                    {message && <Alert variant="success">{message}</Alert>}
                    <Form onSubmit={handleSubmit}>
                        <Form.Group id="email">
                            <Form.Label>Email</Form.Label>
                            <Form.Control type="email" ref={emailRef} required/>
                        </Form.Group>
                        <Button disabled={loading} className="w-100 mt-2" type="submit">Reset Password</Button>
                    </Form>
                    <div className="w-100 text-center mt-3">
                        <Link to="/login">Log in</Link>
                    </div>
                </Card.Body>
            </Card>
            <div className="w-100 text-center mt-2">
                Don't have an account? <Link to="/signup">Sign Up</Link>
            </div>
        </>
    );
}