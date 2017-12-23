import React from 'react';
import {string, number, array, object, bool, func} from 'prop-types';
import HeaderColumn from './HeaderColumn';
import GridRow from './GridRow';
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
        preventInteraction: bool,
        handleColumnResize: func,
    };
    grid = {scrollTop: 0};
    state = {
        focus: [0, 0],
        fromY: 0,
        toY: 30,
        y: 0, /*fromX: 0, toX: 30,*/
    };

    render() {
        const {grid, props, state, setGridRef, setHeaderRef} = this;
        console.log(state);
        const views = [];
        const {height, rows, headers, children, handleColumnResize, preventInteraction, ...meta} = props;
        const {fromY, toY, y, focus} = state;
        if (fromY>0) {
            views.push(<div key='top-placeholder' style={{height: (fromY*ROW_HEIGHT) + 'px'}}/>);
        }
        const {length} = rows;
        for (let i = max(fromY, 0); i < min(toY, length); i++) {
            views.push(<GridRow
                key={rows[i].id}
                rowFocus={i===focus[0]}
                inputFocus={focus[1]}
                columns={rows[i].columns}
                headers={headers}
                displayPlaceholder={preventInteraction}/>);
        }
        if (toY<length) {
            views.push(<div key='bottom-placeholder' style={{height: ((length-toY)*ROW_HEIGHT) + 'px'}}/>);
        }
        return (
            <div {...meta}>
                <div className='grid-table-container' onMouseDown={e => !preventInteraction && e.stopPropagation()}>
                    <div
                        ref={setGridRef}
                        className={'grid-table-content' + (preventInteraction ? ' no-scroll' : '')}
                        style={{height: height - SCROLL_BAR_HEIGHT}}>
                        <div
                            key={'header-' + y}
                            ref={setHeaderRef}
                            className='grid-table-header'
                            style={{top: (grid.scrollTop - 1) + 'px'}}>
                            {headers.map(({title, width}, column) => (
                                <HeaderColumn
                                    key={column}
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
            if (this.props.displaySimple) {
                return;
            }
            const {scrollTop, scrollLeft, offsetWidth, offsetHeight} = this.grid;
            if (scrollTop !== y || offsetHeight !== prevHeight || offsetWidth !== prevWidth) {
                this.setState(function () {
                    const fromY = parseInt(scrollTop / ROW_HEIGHT) - 1;
                    const toY = fromY + parseInt(offsetHeight / ROW_HEIGHT) + 2;
                    return { fromY, toY, y: scrollTop};
                });
            }
            y = scrollTop;
            prevWidth = offsetWidth;
            prevHeight = offsetHeight;
            this.scrollLeft = scrollLeft;
        });
    }

    componentWillReceiveProps({height}) {
        const {state: {y}, props} = this;
        if (height > props.height) {
            const toY = parseInt(y / ROW_HEIGHT) + parseInt(height / ROW_HEIGHT) + 1;
            this.setState({toY});
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        return entries(this.state).some(([k, v]) => nextState[k] !== v) || entries(this.props).some(([k, v]) => nextProps[k] !== v);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.displaySimple && !this.props.displaySimple) {
            this.grid.scrollTo(this.scrollLeft, this.state.y);
        }
    }
}
