import React, {useContext, useEffect, useState} from "react";
import {database} from "../firebase";
import {useAuth} from "./AuthContext";

const UsersContext = React.createContext({});

export function useUsers() {
    return useContext(UsersContext);
}

export function UsersProvider({children}) {
    const [usersList, setUsersList] = useState([]);
    const [isAdmin, setIsAdmin] = useState();
    const {currentUser} = useAuth();

    useEffect(() => {
        const usersRef = database.ref('/users');
        usersRef.on('value', (snapshot) => {
            const users = snapshot.val();
            const usersList = [];
            for (let id in users) {
                if(id === currentUser?.uid){
                    setIsAdmin(users[id].isAdmin)
                }
                usersList.push({id, ...users[id]});
            }

            setUsersList(usersList);
        })
    }, [currentUser]);

    const getTransactionsGivenUser = (userId) => {
        return fetch(`${document.location.origin}/api/transactions/${userId}`)
            .then(response => response.json());
    }

    const getWalletInfoGivenUser = (userId) => {
        return fetch(`${document.location.origin}/api/wallet-info`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({'uid': userId})
        })
            .then(response => response.json())
    }

    const value = {
        usersList,
        isAdmin,
        getTransactionsGivenUser,
        getWalletInfoGivenUser
    }

    return (
        <UsersContext.Provider value={value}>
            {children}
        </UsersContext.Provider>
    );
}