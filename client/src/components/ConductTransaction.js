import React, {useEffect, useState} from "react";
import {Button, Card, Form} from "react-bootstrap";
import {useNavigate} from "react-router-dom";
import {useAuth} from "../contexts/AuthContext";
import AppNavbar from "./AppNavbar";
import {useUsers} from "../contexts/UsersContext";

export default function ConductTransaction() {
    const [recipient, setRecipient] = useState('');
    const [amount, setAmount] = useState(0);
    const navigate = useNavigate();
    const {currentUser} = useAuth();
    const {usersList, isAdmin} = useUsers();


    const updateRecipient = event => {
        try {
            const wallet = JSON.parse(event.target.value);
            setRecipient(wallet.publicKey);
        } catch (e) {
        }
    }

    const updateAmount = event => {
        setAmount(Number(event.target.value));
    }

    const conductTransaction = (e) => {
        e.preventDefault();
        fetch(`${document.location.origin}/api/transact`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({'uid': currentUser.uid, recipient, amount})
        }).then(response => response.json())
            .then(json => {
                alert(json.message || json.type);
                navigate('/transaction-pool');
            });
    }

    if(!isAdmin){
        return null;
    }

    return (
        <>
            <AppNavbar/>
            <Card className='auth-inner'>
                <Card.Body>
                    <h3 className="text-center mb-4">Award Points</h3>
                    <Form onSubmit={conductTransaction}>
                        <Form.Group>
                            <Form.Label>Recipient</Form.Label>
                            <Form.Select onChange={updateRecipient}>
                                <option>Select user to award points</option>
                                {usersList && usersList.length > 0 ?
                                    usersList
                                        .filter(user => !user.isAdmin)
                                        .map((user, index) =>
                                            <option key={index}
                                                    value={user.wallet}>{user.email}</option>) :
                                    <option>No users!</option>}
                            </Form.Select>
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Amount</Form.Label>
                            <Form.Control
                                input='number'
                                value={amount}
                                onChange={updateAmount}
                            />
                        </Form.Group>
                        <Button className="w-100 mt-2 btn btn-secondary" type='submit'>Submit</Button>
                    </Form>
                    <hr/>
                </Card.Body>
            </Card>
        </>
    );
}