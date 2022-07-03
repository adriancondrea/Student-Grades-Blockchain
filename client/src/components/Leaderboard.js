import React, {useEffect, useState} from "react";
import {Button, Card, Modal} from "react-bootstrap";
import {useUsers} from "../contexts/UsersContext";
import UserPoints from "./UserPoints";

export default function Leaderboard() {
    const {usersList, getWalletInfoGivenUser} = useUsers();
    const [usersWalletInfo, setUsersWalletInfo] = useState([]);
    const [selectedUser, setSelectedUser] = useState();
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);


    useEffect(() => {
        (async () => {
            for (const user of usersList) {
                const userWalletInfo = await getWalletInfoGivenUser(user.id);
                userWalletInfo['id'] = user.id;
                userWalletInfo['email'] = user.email;
                userWalletInfo['isAdmin'] = user.isAdmin;
                setUsersWalletInfo(usersWalletInfo => [...usersWalletInfo, userWalletInfo]);
            }
        })();
    }, [usersList]);

    const handleDoubleClick = (user) => {
        setSelectedUser(user);
        handleShow();
    }
    return (
        <>
            <Card className='mx-3'>
                <Card.Body>
                    <h3 className="text-center mb-4">Leaderboard</h3>
                    {usersWalletInfo && usersWalletInfo.length > 0 ?
                        usersWalletInfo.filter(user => !user.isAdmin)
                            .sort((user1, user2) => user2.balance - user1.balance)
                            .map((user, index) =>
                                <Card onDoubleClick={() => handleDoubleClick(user)} key={index} className='m-5'>
                                    <Card.Title>
                                        Email: {user.email}
                                    </Card.Title>
                                    <Card.Subtitle>
                                        Points: {user.balance}
                                    </Card.Subtitle>
                                    <Card.Body>
                                        Public address: {user.address}
                                    </Card.Body>
                                </Card>)
                        : <>No users!</>
                    }
                </Card.Body>
            </Card>

            <Modal show={show} onHide={handleClose}>
                <Modal.Header className='leaderboard-modal' closeButton>
                    <Modal.Title>{selectedUser?.email} - Points Overview</Modal.Title>
                </Modal.Header>
                <Modal.Body className='leaderboard-modal'>
                    <UserPoints userId={selectedUser?.id}/>
                </Modal.Body>
                <Modal.Footer className='leaderboard-modal'>
                    <Button variant="secondary" onClick={handleClose}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}