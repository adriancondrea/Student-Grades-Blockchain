import React, {useContext, useEffect, useState} from "react";
import {auth, database} from "../firebase";

const AuthContext = React.createContext({});

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({children}) {
    const [currentUser, setCurrentUser] = useState();
    const [loading, setLoading] = useState(true);

    function signup(email, password) {
        return auth.createUserWithEmailAndPassword(email, password);
    }

    function login(email, password) {
        return auth.signInWithEmailAndPassword(email, password);
    }

    function logout() {
        return auth.signOut();
    }

    function resetPassword(email) {
        return auth.sendPasswordResetEmail(email);
    }

    async function updateEmail(email) {
        const result = await currentUser?.updateEmail(email);
        if (currentUser) {
            await database.ref('/users').child(currentUser?.uid).update({
                email: email
            });
        }
        return result;
    }

    function updatePassword(newPassword) {
        return currentUser?.updatePassword(newPassword);
    }

    useEffect(() => {
        return auth.onAuthStateChanged(user => {
            setCurrentUser(user);
            setLoading(false);
        });
    }, []);

    const value = {
        currentUser,
        login,
        logout,
        signup,
        resetPassword,
        updateEmail,
        updatePassword
    }
    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}