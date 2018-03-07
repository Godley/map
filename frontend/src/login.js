import React, { Component } from 'react';
import auth from './Auth';

class LoginPage extends Component {
    constructor() {
        super();
        this.handleSubmit = this.handleSubmit.bind(this);
        this.contextTypes = {
        router: React.PropTypes.object.isRequired
        }
    }


    getInitialState() {
        return {
          login_error: false
        }
      }

    handleSubmit(e) {
        e.preventDefault();

        var username = this.refs.username.value;
        var pass = this.refs.pass.value;

        auth.login(username, pass, (loggedIn) => {
            if (loggedIn) {
                this.context.router.replace('/app/')
            } else {
                this.setState({login_error:true})
            }
        })
    }

    render() {
        return (
            <form onSubmit={this.handleSubmit}>
                <input type="text" placeholder="username" ref="username"/>
                <input type="password" placeholder="password" ref="pass"/>
                <input type="submit"/>
            </form>
        )
    }
}

export default LoginPage;