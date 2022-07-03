import AppNavbar from "./AppNavbar";
import React from "react";
import Leaderboard from "./Leaderboard";
import {useUsers} from "../contexts/UsersContext";

export default function LeaderboardPage() {
    const {isAdmin} = useUsers();

    if (!isAdmin) {
        return null;
    }

    return (
        <>
            <AppNavbar/>
            <Leaderboard/>
        </>
    );
}