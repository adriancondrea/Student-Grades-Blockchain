import React, {Component} from "react";
import Block from "./Block";
import {Button, Card} from "react-bootstrap";
import AppNavbar from "./AppNavbar";

class Blocks extends Component {
    state = {blocks: [], paginatedId: 1, blocksLength: 0};

    componentDidMount() {
        fetch(`${document.location.origin}/api/blocks/length`)
            .then(response => response.json())
            .then(json => this.setState({blocksLength: json}));

        this.fetchPaginatedBlocks(this.state.paginatedId)();
    }

    fetchPaginatedBlocks = paginatedId => () => {
        fetch(`${document.location.origin}/api/blocks/${paginatedId}`)
            .then(response => response.json())
            .then(json => this.setState({blocks: json}));
    };

    render() {
        return (
            <>
                <AppNavbar/>
                <Card className='mx-3'>
                    <Card.Body>
                        <h3 className="text-center mb-4">Blocks</h3>
                        <div>
                            {
                                [...Array(Math.ceil(this.state.blocksLength / 5)).keys()].map(key => {
                                    const paginatedId = key + 1;

                                    return (
                                        <span key={key} onClick={this.fetchPaginatedBlocks(paginatedId)}>
                                    <Button className='btn btn-secondary' bssize="small" bsstyle="danger">{paginatedId}</Button>{' '}
                                </span>
                                    )
                                })
                            }
                        </div>
                        {
                            this.state.blocks.map(block => {
                                return (
                                    <Block key={block.hash} block={block}/>
                                );
                            })
                        }
                    </Card.Body>
                </Card>
            </>
        );
    }
}

export default Blocks;