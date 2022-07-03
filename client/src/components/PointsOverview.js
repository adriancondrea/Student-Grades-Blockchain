import AppNavbar from "./AppNavbar";
import React from "react";
import {Card} from "react-bootstrap";
import UserPoints from "./UserPoints";
import {useAuth} from "../contexts/AuthContext";

export default function PointsOverview() {
    const {currentUser} = useAuth();

    return (
        <>
            <AppNavbar/>
            <Card className='mx-3'>
                <Card.Body>
                    <h3 className="text-center mb-4">Points Overview</h3>
                    <UserPoints userId={currentUser.uid}/>
                </Card.Body>
            </Card>
        </>
    );
}