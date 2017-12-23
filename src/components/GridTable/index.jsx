import React from 'react';
import {string, number, array, object, bool, func} from 'prop-types';
import {findDOMNode} from 'react-dom';
import { Sticky, StickyContainer} from 'react-sticky';
import HeaderColumn from './HeaderColumn';

import './styles.scss';

const SCROLL_BAR_HEIGHT = 10;
const ROW_HEIGHT = 30;
const COLUMN_WIDTH = 100;
const {min, max, abs} = Math;
const {entries} = Object;

export default class GridTableContainer extends React.Component {
    static propTypes = {
        id: string,
        headers: array,
        columns: array,
        data: object,
        initialHeight: number,
        initialSize: object,
        displaySimple: bool,
        handleColumnResize: func,
    };

    grid = {scrollTop: 0};
    scrolls = 0;
    scrollPosition = {top: 0, left: 0}
    state = {fromY: 0, toY: 30, y: 0, /*fromX: 0, toX: 30,*/};

    render() {
        const {grid, props, state, setGridRef, setHeaderRef} = this;
        const views = [];
        const {id, width, height, displaySimple, rows, headers, initialSize: _, children, handleColumnResize, ...meta } = props;
        const {fromY, toY, y} = state;
        const limit = min(toY, rows.length);
        if (displaySimple) {
            views.push(<div key='top-placeholder' style={{height: grid.scrollTop}} />);
            for (let i = 0; i<limit-fromY; i++) {
                views.push(<div key={'row-' + i} className='grid-table-row-dummy' />);
            }
        } else {
            for (let i = 0; i<fromY; i++) {
                views.push(<div key={'row-' +i} className='grid-table-row-placeholder' />);
            }
            for (let i = max(fromY, 0); i<limit; i++) {
                const columns = [];
                for (let j = 0; j<headers.length; j++) {
                    columns.push(<input
                        key={i + '-' + j}
                        className='grid-table-column'
                        style={{width: headers[j].width}}
                        defaultValue={i + '-' + j} />);
                }
                views.push(<div key={'row-' + i} className='grid-table-row'>{columns}</div>);
            }
            for (let i = toY; i<rows.length; i++) {
                views.push(<div key={'row-' +i} className='grid-table-row-placeholder' />);
            }
        }
        return (
            <div {...meta}>
                <div className='grid-table-container'>
                    <div
                         ref={setGridRef}
                         className={'grid-table-content' + (displaySimple ? ' no-scroll' : '')}
                         style={{height: height - SCROLL_BAR_HEIGHT}}>
                        <div
                             key={'header-'+y}
                             ref={setHeaderRef}
                             className='grid-table-header'
                             style={{top: (grid.scrollTop - 1) + 'px'}}>
                            {headers.map(({title, width}, column) => (
                                <HeaderColumn
                                     key={title}
                                    title={title+''}
                                    width={width}
                                    onResize={width => handleColumnResize({width, column})} />
                            ))}
                        </div>
                        {views}
                        {children}
                    </div>
                </div>
            </div>
        );
    }

    setHeaderRef = ref => { this.header = ref; }
    setGridRef = ref => { this.grid = ref; };

    componentDidMount() {
        let y;
        let prevHeight;
        let prevWidth;
        this.grid.addEventListener('scroll', () => {
            console.log('scroll');
            if (!this.props.displaySimple) {
                console.log('not display simple');
                const {scrollTop, scrollLeft, offsetWidth, offsetHeight} = this.grid;
                this.scrollLeft = scrollLeft;
                if (scrollTop!==y || offsetWidth!== prevWidth || offsetHeight!==prevHeight) {
                    y = scrollTop;
                    this.setState(function ({fromY, toY}) {
                        fromY = parseInt(y / ROW_HEIGHT) - 1;
                        toY = fromY + parseInt(offsetHeight / ROW_HEIGHT) + 2;
                        return {fromY, toY, y};
                    });
                    prevWidth = offsetWidth;
                    prevHeight = offsetHeight;
                }
            }
        });
    }

    componentWillReceiveProps({height}) {
        const {state: {y}, props} = this;
        if (height > props.height) {
            const toY = parseInt(y / ROW_HEIGHT) + parseInt(height / ROW_HEIGHT) + 1;
            this.setState({toY});
        }
    }

    shouldComponentUpdate(nextProps, nextState, nextContext) {
        return entries(this.state).some(([k, v]) => nextState[k] !==v)
        || entries(this.props).some(([k, v]) => nextProps[k] !==v);
    }

    componentDidUpdate(prevProps, prevState, prevContext) {
        if (prevProps.displaySimple && !this.props.displaySimple) {
            this.grid.scrollTo(this.scrollLeft, this.state.y);
        }
    }
}
