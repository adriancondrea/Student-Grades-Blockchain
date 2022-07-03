import React, {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {Button, Card} from "react-bootstrap";
import Transaction from "./Transaction";
import AppNavbar from "./AppNavbar";

const POLL_INTERVAL_MS = 10000;

export default function TransactionPool() {
    const [transactionPoolMap, setTransactionPoolMap] = useState({});
    const navigate = useNavigate();
    const [fetchPoolMapInterval, setFetchPoolMapInterval] = useState();

    const fetchTransactionPoolMap = () => {
        fetch(`${document.location.origin}/api/transaction-pool-map`)
            .then(response => response.json())
            .then(json => setTransactionPoolMap(json));
    }

    const fetchMineTransactions = () => {
        fetch(`${document.location.origin}/api/mine-transactions`)
            .then(response => {
                if (response.status === 200) {
                    alert('success');
                    navigate('/blocks');
                } else {
                    alert('mine-transactions request did not complete');
                }
            });
    }

    useEffect(() => {
        fetchTransactionPoolMap();

        setFetchPoolMapInterval(setInterval(
            () => fetchTransactionPoolMap(),
            POLL_INTERVAL_MS
        ));

        return clearInterval(fetchPoolMapInterval);
    }, []);

    return (
        <>
            <AppNavbar/>
            <Card className='auth-inner'>
                <Card.Body>
                    <h3 className="text-center mb-4">Transaction Pool</h3>
                    <Button className="w-100 mt-2 btn btn-secondary" onClick={fetchMineTransactions}>
                        Mine Transactions
                    </Button>
                    {
                        Object.values(transactionPoolMap).map(transaction => {
                            return (
                                <div key={transaction.id}>
                                    <hr/>
                                    <Transaction transaction={transaction}/>
                                </div>
                            )
                        })
                    }
                </Card.Body>
            </Card>
        </>
    );
}