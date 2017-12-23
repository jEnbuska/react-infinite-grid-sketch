import React from 'react';
import ReactDOM from 'react-dom';
import 'react-resizable/css/styles';
import 'react-grid-layout/css/styles';
import GridLayout from 'react-grid-layout';
import GridTable from './components/GridTable';

import './styles';

const ROW_HEIGHT = 20;
const rows = [];
const headers = [];
for (let i = 0; i < 500; i++) {
    rows.push({id: i, columns: []});
}
for (let i = 0; i < 40; i++) {
    headers.push({title: i, width: 100});
    rows.forEach(e => e.columns.push(i));
}
class Root extends React.Component {
    heightChangeCallbacks = {};
    timeout = null;
    state = {
        underChange: false,
        layout: ['a',].map((i) => ({i, x: 5, y: 5, w: 5, h: 4, minW: 5, minH: 4})),
        headers,
        rows
    }

    render() {
        const {headers, rows, layout, underChange} = this.state;
        return (
            <div className={underChange ? 'blur-filter' : ''} >
                <GridLayout
                     className='layout'
                     layout={layout}
                     cols={12}
                    rows={12}
                     rowHeight={ROW_HEIGHT}
                     width={1200}
                    height={500}
                     onResize={this.handleResize}
                     useCSSTransforms={false}
                     onResizeStart={this.onChange}
                     onResizeEnd={this.onChangeEnd}
                     onDragStart={this.onChange}
                     onDragStop={this.onChangeEnd}
                     onDrag={this.onChange}
                >
                    {layout.map(({i, w, h}) => (
                        <GridTable
                             key={i}
                             id={i}
                             headers={headers}
                             rows={rows}
                             displaySimple={underChange}
                             width={w*30}
                             handleColumnResize={this.handleColumnResize}
                             height={h*30} />
                    ))}
                </GridLayout>
            </div>
        );
    }

    onChange = () => {
        this.setState(({underChange}) => (underChange ? {} : {underChange: true}));
        clearTimeout(this.timeout);
        this.timeout = setTimeout(this.onChangeEnd, 850);
    }
    onChangeEnd = () => {
        clearTimeout(this.timeout);
        this.setState(({underChange}) => (!underChange ? {} : {underChange: false}));
    }

    handleResize = (layout) => {
        this.onChange();
        this.setState(() => ({layout}));
    };

    handleColumnResize = ({column, width}) => {
        const headers = [...this.state.headers];
        const header = {...headers[column]};
        header.width = width;
        headers[column] = header;
        this.setState({headers});
    }

    createHeightChangeCallbackReceiver = (key) => (onChange) => {
        this.heightChangeCallbacks[key] = onChange;
    };

    shouldComponentUpdate(_, nextState) {
        return Object.entries(this.state).some(([k, v]) => nextState[k]!==v);
    }
}

ReactDOM.render(<Root />, document.getElementById('app'));