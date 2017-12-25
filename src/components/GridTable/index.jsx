import React from 'react';
import {string, number, array, object, bool, func} from 'prop-types';
import HeaderColumn from './HeaderColumn';
import GridRow from './GridRow';
import Margin from './Margin';
import './styles.scss';

const SCROLL_BAR_HEIGHT = 10;
const ROW_HEIGHT = 30;
const {min, max, trunc} = Math;
const {assign} = Object;

export default class GridTable extends React.Component {
    static propTypes = {
        headers: array,
        rows: array,
        preventInteraction: bool,
        handleColumnResize: func,
    };

    list = {scrollTop: 0};
    state = {
        cursor: {
            status: 'intent',
            target: {row: 0, column: 0}
        },
        from: 0,
        to: 30
    };

    render() {
        const {list: {scrollTop}, props, state, setListRef} = this;
        const views = [];
        const {rows, headers, children, handleColumnResize, preventInteraction, ...meta} = props;
        const {from, to, cursor} = state;
        const {length} = rows;
        for (let i = max(from, 0); i < min(to, length); i++) {
            views.push(<GridRow
                key={rows[i].id}
                rowId={i}
                cursor={cursor}
                columns={rows[i].columns}
                headers={headers}
                onColumnClick={this.onColumnClick}
                onFocusChanged={this.onFocusChanged}
                displayPlaceholder={preventInteraction}/>);
        }
        const contentHeight = parseInt(meta.style.height.replace('px', '')) - SCROLL_BAR_HEIGHT;
        return (
            <div {...meta}>
                <div className='grid-table-container' onMouseDown={e => !preventInteraction && e.stopPropagation()}>
                    <div
                        ref={setListRef}
                        className={`grid-table-content${preventInteraction ? ' no-scroll' : ''}`}
                        style={{height: `${contentHeight}px`}}>
                        <div
                            key={`header-${scrollTop}`}
                            className='grid-table-header'
                            style={{top: `${scrollTop - 1}px`}}>
                            {headers.map(({title, width}, column) => (
                                <HeaderColumn
                                    key={column}
                                    title={title + ''}
                                    width={width}
                                    onResize={width => handleColumnResize({width, column})}/>
                            ))}
                        </div>
                        <Margin key='top' height={from > 0 ? from * ROW_HEIGHT : 0}/>
                        <div onKeyDown={this.onKeyDown}>
                            {views}
                        </div>
                        <Margin key='bottom' height={to < length ? (length-to) * ROW_HEIGHT : 0}/>
                        {children}
                    </div>
                </div>
            </div>
        );
    }

    onColumnClick = ({row, column}) => this.setState({cursor: {status: 'intent', target: {row, column}}});

    onKeyDown = ({key}) => {
        // eslint-disable-next-line default-case
        switch (key) {
            case 'Escape':
                this.handleEscape();
                break;
            case 'ArrowRight':
                this.handleArrowRight();
                break;
            case 'ArrowLeft':
                this.handleArrowLeft();
                break;
            case 'ArrowUp':
                this.handleArrowUp();
                break;
            case 'ArrowDown':
                this.handleArrowDown();
                break;
        }
    };

    handleEscape() {
        const {status, target} = this.state.cursor;
        if (status === 'active') {
            this.setState(() => ({cursor: {status: 'intent', target}}));
        } else if (status === 'intent') {
            this.setState(() => ({cursor: {status: 'scroll', target: {}}}));
        }
    }

    handleArrowRight() {
        const {status, target: {row, column}} = this.state.cursor;
        if (status === 'intent') {
            const nextColumn = (column + 1) % this.props.headers.length;
            this.setState(() => ({cursor: {status, target: {row, column: nextColumn}}}));
        }
    }

    handleArrowLeft() {
        const {status, target: {row, column}} = this.state.cursor;
        if (status === 'intent') {
            const nextColumn = column > 0 ? column - 1 : this.props.headers.length - 1;
            this.setState(() => ({cursor: {status, target: {row, column: nextColumn}}}));
        }
    }

    handleArrowUp() {
        const {cursor: {status, target: {row, column}}} = this.state;
        if (status !== 'scroll') {
            const nextRow = row > 0 ? row-1 : row;
            if (nextRow <= this.state.from) {
                this.list.scrollTo(this.list.scrollLeft, this.list.scrollTop - ROW_HEIGHT); // triggers handleScroll
            }
            this.setState({cursor: {status, target: {column, row: nextRow}}});
        }
    }

    handleArrowDown() {
        const {cursor: {status, target: {row, column}}} = this.state;
        if (status !== 'scroll') {
            const nextRow = row < (this.props.rows.length - 1) ? row + 1 : row;
            this.setState({cursor: {status, target: {row: nextRow, column}}});
        }
    }

    onFocusChanged = ({row, column, status}) => {
        this.setState({cursor: {row, column, status}});
    };

    setListRef = ref => {
        this.list = ref;
    };

    componentDidMount() {
        let prevScrollTop;
        this.offsetHeight = this.list.offsetHeight;
        this.list.addEventListener('scroll', () => {
            const {scrollTop} = this.list;
            if (scrollTop !== prevScrollTop) {
                this.handleScroll();
                prevScrollTop = scrollTop;
            }
        });
    }

    componentDidUpdate() {
        const {offsetHeight} = this.list;
        if (this.list.offsetHeight!==this.offsetHeight) {
            this.handleScroll();
            this.offsetHeight = offsetHeight;
        }
    }

    handleScroll() {
        const {scrollTop, offsetHeight} = this.list;
        this.setState(function () {
            const from = trunc((scrollTop + 1) / ROW_HEIGHT);
            const to = from + trunc(offsetHeight / ROW_HEIGHT) + 2;
            return { from, to };
        });
    }
}
