import React, {useEffect, useState} from 'react';
import logo from '../assets/logo.png';
import {useAuth} from "../contexts/AuthContext";
import AppNavbar from "./AppNavbar";
import {Card} from "react-bootstrap";
import CardHeader from "react-bootstrap/CardHeader";
import {useUsers} from "../contexts/UsersContext";
import Leaderboard from "./Leaderboard";

export default function App() {
    const [walletInfo, setWalletInfo] = useState({});
    const {currentUser} = useAuth();
    const {getWalletInfoGivenUser, isAdmin} = useUsers();

    useEffect(() => {
        (async () => {
            getWalletInfoGivenUser(currentUser.uid).then(json => {
                setWalletInfo(json);
            });
        })();
    }, []);

    return (
        <div className='App'>
            <AppNavbar/>
            <img className='logo' src={logo}/>
            <br/>
            <h1>Welcome to the Blockchain Attendance App!</h1>
            <br/>
            {isAdmin !== undefined ?
                isAdmin ?
                    <Leaderboard/>
                    : <Card className='auth-inner'>
                        <CardHeader>Wallet</CardHeader>
                        <Card.Body>
                            <div className='text-center'>Address: {walletInfo?.address}</div>
                            <hr/>
                            <div className='text-center'>Points: {walletInfo?.balance}</div>
                        </Card.Body>
                    </Card>
                : null
            }
        </div>
    );
}