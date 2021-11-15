import React, {Component} from "react";
import {Icon, Menu, Table} from "semantic-ui-react";


/**
 * EvaluationRule Table footer.
 */
class TFooter extends Component {

    getPaginationLength(paginationLength) {
        if (paginationLength >= 10) {
            return 10 + paginationLength % 10;
        } else {
            return paginationLength;
        }
    }

    getIncrement(paginationLength, activePage) {
        let i = this.getPaginationLength(paginationLength);
        if (paginationLength >= 10) {
            return Math.max(1, Math.min(paginationLength - i + 1, activePage - i / 2));
        }
        return 1;
    }

    render() {
        const {
            paginationLength, dragging, activePage, droppedPageId,
            handlePageClick, onMouseOver, onMouseLeave,
            handleStartPage, handlePrevPage, handleEndPage, handleNextPage
        } = this.props;

        const increment = this.getIncrement(paginationLength, activePage);
        const length = this.getPaginationLength(paginationLength);

        return (
            <Table.Footer>
                <Table.Row>
                    <Table.HeaderCell colSpan='15'>
                        <Menu pagination>
                            <Menu.Item as='a' icon onClick={handleStartPage}>
                                <Icon name='angle double left'/>
                            </Menu.Item>
                            <Menu.Item as='a' icon onClick={handlePrevPage}>
                                <Icon name='chevron left'/>
                            </Menu.Item>
                            {
                                paginationLength > 10 &&
                                activePage >= length / 2 + increment &&
                                <Menu.Item disabled>...</Menu.Item>
                            }
                            {Array.from(
                                {length: length},
                                (_, index) =>
                                    (index + increment)
                            ).map(i => {
                                return (
                                    <div
                                        key={i}
                                        onMouseOver={onMouseOver(i)}
                                        onMouseLeave={onMouseLeave}
                                        className={dragging && i === droppedPageId ? "bordered" : ""}
                                    >
                                        <Menu.Item
                                            as='a'
                                            active={activePage === i}
                                            onClick={handlePageClick(i)}
                                        >
                                            {i}
                                        </Menu.Item>
                                    </div>
                                )
                            })
                            }
                            {
                                paginationLength > 10 &&
                                activePage <= length / 2 + increment &&
                                <Menu.Item disabled>...</Menu.Item>
                            }
                            <Menu.Item as='a' icon onClick={handleNextPage}>
                                <Icon name='chevron right'/>
                            </Menu.Item>
                            <Menu.Item as='a' icon onClick={handleEndPage}>
                                <Icon name='angle double right'/>
                            </Menu.Item>
                        </Menu>
                    </Table.HeaderCell>
                </Table.Row>
            </Table.Footer>
        )
    }
}

export default TFooter;