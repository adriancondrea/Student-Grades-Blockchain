import React from 'react'
import {render} from 'react-dom';
import {BrowserRouter, Route, Routes} from "react-router-dom";
import './index.css'
import App from "./components/App";
import Blocks from "./components/Blocks";
import ConductTransaction from "./components/ConductTransaction";
import TransactionPool from "./components/TransactionPool";
import 'bootstrap/dist/css/bootstrap.min.css';
import {AuthProvider} from "./contexts/AuthContext";
import Signup from "./components/auth/Signup";
import Dashboard from "./components/auth/Dashboard";
import Login from "./components/auth/Login";
import PrivateOutlet from "./components/auth/PrivateOutlet";
import ResetPassword from "./components/auth/ResetPassword";
import UpdateProfile from "./components/auth/UpdateProfile";
import CoursesList from "./components/CoursesList";
import AddCourse from "./components/AddCourse";
import PointsOverview from "./components/PointsOverview";
import {CoursesProvider} from "./contexts/CoursesContext";
import {UsersProvider} from "./contexts/UsersContext";
import LeaderboardPage from "./components/LeaderboardPage";

render(
    <BrowserRouter>
        <AuthProvider>
            <CoursesProvider>
                <UsersProvider>
                    <Routes>
                        <Route exact path='/' element={<PrivateOutlet/>}>
                            <Route exact path='/' element={<App/>}/>
                            <Route path='/blocks' element={<Blocks/>}/>
                            <Route path='/dashboard' element={<Dashboard/>}/>
                            <Route path='/conduct-transaction' element={<ConductTransaction/>}/>
                            <Route path='/transaction-pool' element={<TransactionPool/>}/>
                            <Route path='/update-profile' element={<UpdateProfile/>}/>
                            <Route path='/courses' element={<CoursesList/>}/>
                            <Route path='/add-course' element={<AddCourse/>}/>
                            <Route path='/points-overview' element={<PointsOverview/>}/>
                            <Route path='/leaderboard' element={<LeaderboardPage/>}/>
                        </Route>
                        <Route path='/signup' element={<Signup/>}/>
                        <Route path='/login' element={<Login/>}/>
                        <Route path='/reset-password' element={<ResetPassword/>}/>
                    </Routes>
                </UsersProvider>
            </CoursesProvider>
        </AuthProvider>
    </BrowserRouter>,
    document.getElementById('root'));