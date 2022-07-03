import React, {useRef, useState} from "react";
import {Alert, Button, Card, Form} from 'react-bootstrap';
import {useAuth} from "../../contexts/AuthContext";
import {Link, useNavigate} from "react-router-dom";
import AppNavbar from "../AppNavbar";

export default function UpdateProfile() {
    const emailRef = useRef();
    const passwordRef = useRef();
    const passwordConfirmRef = useRef();
    const {currentUser, updateEmail, updatePassword} = useAuth();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (passwordRef.current?.value !== passwordConfirmRef.current?.value) {
            setLoading(false);
            return setError('Passwords do not match');
        }

        const promises = [];
        if (emailRef.current?.value && emailRef.current?.value !== currentUser.email) {
            promises.push(updateEmail(emailRef.current.value));
        }

        if (passwordRef.current?.value) {
            promises.push(updatePassword(passwordRef.current.value));
        }

        Promise.all(promises).then(() => {
            navigate('/');
        }).catch(() => {
            setError('Failed to update profile')
        }).finally(() => {
            setLoading(false);
        });
    }

    return (
        <>
            <AppNavbar/>
            <Card>
                <Card.Body>
                    <h3 className="text-center mb-4">Update Profile</h3>
                    {error && <Alert variant="danger">{error}</Alert>}
                    <Form onSubmit={handleSubmit}>
                        <Form.Group id="email">
                            <Form.Label>Email</Form.Label>
                            <Form.Control type="email" ref={emailRef} required defaultValue={currentUser.email}/>
                        </Form.Group>
                        <Form.Group id="password">
                            <Form.Label>Password</Form.Label>
                            <Form.Control type="password" ref={passwordRef}
                                          placeholder='Type in new password or leave empty'/>
                        </Form.Group>
                        <Form.Group id="password-confirm">
                            <Form.Label>Confirm Password</Form.Label>
                            <Form.Control type="password" ref={passwordConfirmRef}
                                          placeholder='Type in new password or leave empty'/>
                        </Form.Group>
                        <Button disabled={loading} className="w-100 mt-2 btn btn-secondary" type="submit">Update Profile</Button>
                    </Form>
                </Card.Body>
            </Card>
        </>
    );
}