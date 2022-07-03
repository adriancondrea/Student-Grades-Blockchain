import React, {Component} from "react";
import {Button} from 'react-bootstrap';
import Transaction from './Transaction';

class Block extends Component {
    state = {displayTransaction: false};

    get displayTransaction() {
        const {data} = this.props.block;

        const stringifiedData = JSON.stringify(data);

        const dataDisplay = stringifiedData.length > 35 ? `${stringifiedData.substring(0, 35)}...` : stringifiedData;

        if (this.state.displayTransaction) {
            return (
                <div>
                    {
                        data.map(transaction => (
                            <div key={transaction.id}>
                                <hr/>
                                <Transaction transaction={transaction}/>
                            </div>
                        ))
                    }
                    <br/>
                    <Button
                        className='btn btn-secondary'
                        bsstyle="danger"
                        bssize="small"
                        onClick={this.toggleTransaction}
                    >
                        Show Less
                    </Button>
                </div>
            )
        }

        return (
            <div>
                <div>
                    Data: {dataDisplay}
                </div>
                <Button
                    className='btn btn-secondary'
                    bsstyle="danger"
                    bssize="small"
                    onClick={this.toggleTransaction}
                >
                    Show More
                </Button>
            </div>
        );
    }

    toggleTransaction = () => {
        this.setState({displayTransaction: !this.state.displayTransaction});
    };

    render() {
        const {timestamp, hash} = this.props.block;

        const hashDisplay = `${hash.substring(0, 15)}...`;

        return (
            <div className='Block'>
                <div>Hash: {hashDisplay}</div>
                <div>Timestamp: {new Date(timestamp).toLocaleString()}</div>
                {this.displayTransaction}
            </div>
        );
    }
}

export default Block;