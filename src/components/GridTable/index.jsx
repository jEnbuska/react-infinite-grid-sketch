import React from 'react';
import {string, number, array, object, bool, func} from 'prop-types';
import HeaderColumn from './HeaderColumn';
import GridRow from './GridRow';
import Draggable from 'react-draggable';

import './styles.scss';

const SCROLL_BAR_HEIGHT = 10;
const ROW_HEIGHT = 30;
const {min, max, abs} = Math;
const {entries} = Object;

export default class GridTableContainer extends React.Component {
    static propTypes = {
        id: string,
        headers: array,
        columns: array,
        displaySimple: bool,
        handleColumnResize: func,
    };

    stopPropagation = true;
    grid = {scrollTop: 0};
    state = {
        focus: [0, 0],
        fromY: 0,
        toY: 30,
        y: 0, /*fromX: 0, toX: 30,*/
    };

    render() {
        const {grid, props, state, setGridRef, setHeaderRef} = this;
        const views = [];
        const {height, rows, headers, children, handleColumnResize, displaySimple, ...meta} = props;
        const {fromY, toY, y, focus} = state;
        if (displaySimple) {
            views.push(<div key='top-placeholder' style={{height: grid.offsetHeight}}/>);
        } else {
            const {length} = rows;
            views.push(<div key='row-top' style={{height: fromY * ROW_HEIGHT}} className='grid-table-row-placeholder'/>);
            const limit = min(toY, length);
            for (let i = max(fromY, 0); i < limit; i++) {
                views.push(<GridRow key={rows[i].id} rowFocus={i===focus[0]} inputFocus={focus[1]} columns={rows[i].columns} headers={headers}/>);
            }
            if (rows.length > toY) {
                views.push(<div key='bottom-placeholder' style={{height: (length - toY) * ROW_HEIGHT}} className='grid-table-row-placeholder'/>);
            }
        }
        return (
            <div {...meta}>
                <div className='grid-table-container' onMouseDown={e => !displaySimple && e.stopPropagation()}>
                    <div
                        ref={setGridRef}
                        className={'grid-table-content' + (displaySimple ? ' no-scroll' : '')}
                        style={{height: height - SCROLL_BAR_HEIGHT}}>
                        <div
                            key={'header-' + y}
                            ref={setHeaderRef}
                            className='grid-table-header'
                            style={{top: (grid.scrollTop - 1) + 'px'}}>
                            {headers.map(({title, width}, column) => (
                                <HeaderColumn
                                    key={title}
                                    title={title + ''}
                                    width={width}
                                    onResize={width => handleColumnResize({width, column})}/>
                            ))}
                        </div>
                        {views}
                        {children}
                    </div>
                </div>
            </div>
        );
    }

    setHeaderRef = ref => {
        this.header = ref;
    };
    setGridRef = ref => {
        this.grid = ref;
    };

    componentDidMount() {
        let y;
        let prevHeight;
        let prevWidth;
        this.grid.addEventListener('scroll', () => {
            if (!this.props.displaySimple) {
                const {scrollTop, scrollLeft, offsetWidth, offsetHeight} = this.grid;
                this.scrollLeft = scrollLeft;
                if (scrollTop !== y || offsetHeight !== prevHeight || offsetWidth !== prevWidth) {
                    y = scrollTop;
                    this.setState(function ({fromY, toY}) {
                        fromY = parseInt(y / ROW_HEIGHT) - 1;
                        toY = fromY + parseInt(offsetHeight / ROW_HEIGHT) + 2;
                        return {
                            fromY,
                            toY,
                            y
                        };
                    });
                }

                prevWidth = offsetWidth;
                prevHeight = offsetHeight;
            }
        });
    }

    componentWillReceiveProps({height}) {
        const {state: {y}, props} = this;
        console.log('receive props');
        if (height > props.height) {
            console.log('props change set state');
            const toY = parseInt(y / ROW_HEIGHT) + parseInt(height / ROW_HEIGHT) + 1;
            this.setState({toY});
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        return entries(this.state).some(([k, v]) => nextState[k] !== v) || entries(this.props).some(([k, v]) => nextProps[k] !== v);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.displaySimple && !this.props.displaySimple) {
            console.log('scroll manual on did update');
            this.grid.scrollTo(this.scrollLeft, this.state.y);
        }
    }
}
