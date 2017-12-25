import React from 'react';
import {string, number, array, object, bool, func} from 'prop-types';
import HeaderColumn from './HeaderColumn';
import GridRow from './GridRow';
import {hasDiffs} from '../../utils';
import './styles.scss';

const SCROLL_BAR_HEIGHT = 10;
const ROW_HEIGHT = 30;
const {min, max, trunc} = Math;
const {entries} = Object;

export default class GridTableContainer extends React.Component {
    static propTypes = {
        headers: array,
        rows: array,
        preventInteraction: bool,
        handleColumnResize: func,
    };
    grid = {scrollTop: 0};
    state = {
        focus: [0, 0],
        fromY: 0,
        toY: 30
    };

    render() {
        const {grid: {scrollTop}, props, state, setGridRef, setHeaderRef} = this;
        const views = [];
        const {rows, headers, children, handleColumnResize, preventInteraction, ...meta} = props;

        const {fromY, toY, focus} = state;
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
        const contentHeight = parseInt(meta.style.height.replace('px', '')) - SCROLL_BAR_HEIGHT;
        return (
            <div {...meta}>
                <div className='grid-table-container' onMouseDown={e => !preventInteraction && e.stopPropagation()}>
                    <div
                        ref={setGridRef}
                        className={'grid-table-content' + (preventInteraction ? ' no-scroll' : '')}
                        style={{height: contentHeight + 'px'}}>
                        <div
                            key={'header-' + scrollTop}
                            ref={setHeaderRef}
                            className='grid-table-header'
                            style={{top: (scrollTop - 1) + 'px'}}>
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
        let prevScrollTop;
        this.offsetHeight = this.grid.offsetHeight;
        this.grid.addEventListener('scroll', () => {
            const {scrollTop, offsetHeight} = this.grid;
            if (scrollTop !== prevScrollTop) {
                this.setState(function () {
                    const fromY = trunc(scrollTop / ROW_HEIGHT) - 1;
                    const toY = fromY + trunc(offsetHeight / ROW_HEIGHT) + 2;
                    return { fromY, toY };
                });
            }
            prevScrollTop = scrollTop;
        });
    }

    componentDidUpdate() {
        const {offsetHeight, scrollTop} = this.grid;
        if (offsetHeight!==this.offsetHeight) {
            const toY = trunc((scrollTop / ROW_HEIGHT) + (offsetHeight / ROW_HEIGHT)) + 1;
            // eslint-disable-next-line react/no-did-update-set-state
            this.setState({toY});
        }
        this.offsetHeight = offsetHeight;
    }
}
