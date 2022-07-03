import {Container, Nav, Navbar, NavDropdown} from "react-bootstrap";
import {useUsers} from "../contexts/UsersContext";

export default function AppNavbar() {
    const {isAdmin} = useUsers();

    return (
        <Navbar className='w-100 navbar navbar-dark bg-dark mb-5'>
            <Container>
                <Navbar.Brand href='/'>Blockchain App</Navbar.Brand>
                <Nav className="container-fluid">
                    {isAdmin !== undefined ?
                        <>
                            <Nav.Link href="/dashboard">Account Details</Nav.Link>
                            <Nav.Link href="/courses">Courses</Nav.Link>
                            <Nav.Link href="/transaction-pool">Transaction Pool</Nav.Link>
                            <Nav.Link href="/blocks">Blocks</Nav.Link>
                            {isAdmin ?
                                <NavDropdown className="ms-auto"
                                             id="nav-dropdown-admin"
                                             title="Teacher Panel"
                                             menuVariant="dark"
                                >
                                    <NavDropdown.Item href="/conduct-transaction">Award Points</NavDropdown.Item>
                                    <NavDropdown.Item href="/add-course">Add Course</NavDropdown.Item>
                                    <NavDropdown.Item href="/leaderboard">Leaderboard</NavDropdown.Item>
                                </NavDropdown> :
                                <Nav.Link href="/points-overview">Points Overview</Nav.Link>}</> : null
                    }
                </Nav>
            </Container>
        </Navbar>
    );
}