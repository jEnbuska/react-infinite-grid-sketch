import React, {PureComponent} from 'react';

export default class FocusInput extends PureComponent {
    render() {
        const {focused, ...props} = this.props;
        return <input {...props} ref={this.setRef}/>;
    }

    setRef = ref => { this.ref = ref; };

    componentDidMount() {
        if (this.props.focused) {
            this.ref.focus();
        }
    }

    componentDidUpdate({focused}) {
        if (focused && !this.props.focused) {
            this.ref.blur();
        } else if (!focused && this.props.focused) {
            this.ref.focus();
        }
    }
}