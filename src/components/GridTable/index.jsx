import React from 'react';
import {string, number, array, object, bool, func} from 'prop-types';
import HeaderColumn from './HeaderColumn';
import GridRow from './GridRow';
import './styles.scss';

const SCROLL_BAR_HEIGHT = 10;
const ROW_HEIGHT = 30;
const {min, max, trunc} = Math;

export default class GridTable extends React.Component {
    static propTypes = {
        headers: array,
        rows: array,
        preventInteraction: bool,
        handleColumnResize: func,
    };
    list = {scrollTop: 0};
    state = {
        focus: [0, 0],
        from: 0,
        to: 30
    };

    render() {
        const {list: {scrollTop}, props, state, setListRef, setHeaderRef} = this;
        const views = [];
        const {rows, headers, children, handleColumnResize, preventInteraction, ...meta} = props;

        const {from, to, focus} = state;
        if (from>0) {
            views.push(<div key='top-placeholder' style={{height: (from*ROW_HEIGHT) + 'px'}}/>);
        }
        const {length} = rows;
        for (let i = max(from, 0); i < min(to, length); i++) {
            views.push(<GridRow
                key={rows[i].id}
                rowFocus={i===focus[0]}
                inputFocus={focus[1]}
                columns={rows[i].columns}
                headers={headers}
                displayPlaceholder={preventInteraction}/>);
        }
        if (to<length) {
            views.push(<div key='bottom-placeholder' style={{height: ((length-to)*ROW_HEIGHT) + 'px'}}/>);
        }
        const contentHeight = parseInt(meta.style.height.replace('px', '')) - SCROLL_BAR_HEIGHT;
        return (
            <div {...meta}>
                <div className='grid-table-container' onMouseDown={e => !preventInteraction && e.stopPropagation()}>
                    <div
                        ref={setListRef}
                        className={'grid-table-content' + (preventInteraction ? ' no-scroll' : '')}
                        style={{height: contentHeight + 'px'}}>
                        <div
                            key={'header-' + scrollTop}
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

    setListRef = ref => {
        this.list = ref;
    };

    componentDidMount() {
        let prevScrollTop;
        this.offsetHeight = this.list.offsetHeight;
        this.list.addEventListener('scroll', () => {
            const {scrollTop, offsetHeight} = this.list;
            if (scrollTop !== prevScrollTop) {
                this.setState(function () {
                    const from = trunc(scrollTop / ROW_HEIGHT) - 1;
                    const to = from + trunc(offsetHeight / ROW_HEIGHT) + 2;
                    return { from, to };
                });
            }
            prevScrollTop = scrollTop;
        });
    }

    componentDidUpdate() {
        const {offsetHeight, scrollTop} = this.list;
        if (offsetHeight!==this.offsetHeight) {
            const to = trunc((scrollTop / ROW_HEIGHT) + (offsetHeight / ROW_HEIGHT)) + 1;
            // eslint-disable-next-line react/no-did-update-set-state
            this.setState({to});
        }
        this.offsetHeight = offsetHeight;
    }
}
