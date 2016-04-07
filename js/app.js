// es5, 6, and 7 polyfills, powered by babel
import polyfill from "babel-polyfill"

//
// fetch method, returns es6 promises
// if you uncomment 'universal-utils' below, you can comment out this line
import fetch from "isomorphic-fetch"

// universal utils: cache, fetch, store, resource, fetcher, router, vdom, etc
// import * as u from 'universal-utils'

// the following line, if uncommented, will enable browserify to push
// a changed fn to you, with source maps (reverse map from compiled
// code line # to source code line #), in realtime via websockets
// -- browserify-hmr having install issues right now
// if (module.hot) {
//     module.hot.accept()
//     module.hot.dispose(() => {
//         app()
//     })
// }

// Check for ServiceWorker support before trying to install it
// if ('serviceWorker' in navigator) {
//     navigator.serviceWorker.register('./serviceworker.js').then(() => {
//         // Registration was successful
//         console.info('registration success')
//     }).catch(() => {
//         console.error('registration failed')
//             // Registration failed
//     })
// } else {
//     // No ServiceWorker Support
// }

import DOM from 'react-dom'
import React, {Component} from 'react'
import $ from 'jquery'
import _ from 'underscore'
import Firebase from 'firebase'
import BackboneFire from 'bbfire'
////
////
////

var fbRootURL = 'https://eviter.firebaseio.com/'
var fbRef = new Firebase(fbRootURL)

var UserModel = BackboneFire.Firebase.Model.extend({
	initialize:function(uid){
		this.url = `https://eviter.firebaseio.com/${uid}`
	}
})

var Header = React.createClass({
	render: function(){return(<div>HEADER</div>)}
})
var NavBar = React.createClass({
	render: function(){return(<div>NAVBAR</div>)}
})
var Footer = React.createClass({
	render: function(){return(<div>FOOTER</div>)}
})

var SplashPage = React.createClass({

	userObj:{
		email:'',
		firstName:'',
		lastName:'',
		passWord:'',
	},

	_upDateEmail:function(evt){
		this.userObj.email = evt.currentTarget.value
	},

	_upDatePass:function(evt){
		this.userObj.passWord = evt.currentTarget.value
	},

	_firstName:function(evt){
		this.userObj.firstName = evt.currentTarget.value
	},

	_lastName:function(evt){
		this.userObj.lastName = evt.currentTarget.value
	},

	_handleSubmit:function(){
		this.props.createUser(this.userObj)
	},

	_handleLogin:function(){
		this.props.logUserIn(this.userObj)
	},

	render:function(){
		return(
			<div className='splashPage'>
				<Header/>
				<NavBar/>
				<div className='signUp'>
					<input type='text' placeholder='email@host.com' onChange={this._upDateEmail}/><br/>
					<input type='passWord' placeholder='password' onChange={this._upDatePass}/><br/>
					<input type='text' placeholder='First name' onChange={this._firstName}/><br/>
					<input type='text' placeholder='Last Name' onChange={this._lastName}/><br/>
					<button onClick={this._handleSubmit}>SUBMIT</button>
				</div><br/><br/>
				<div className='logIn'>
					<input type='text' placeholder='email@host.com' onChange={this._upDateEmail}/><br/>
					<input type='passWord' placeholder='password' onChange={this._upDatePass}/><br/>
					<button onClick={this._handleLogin}>SUBMIT</button>
				</div>
				<Footer/>	
			</div>

		)
	},
})

function app() {
    // start app
    // new Router()
    var AppRouter = BackboneFire.Router.extend({
    	initialize: function(){
    		console.log('app is routing')
    		this.fbRef = new Firebase(fbRootURL)

    		// if (!this.fbRef.getAuth()) {
    		// 	location.hash = 'splash'
    		// } 

    		// this.fbRef.on('route', function(){
    		// 	if (!this.fbRef.getAuth()){
    		// 		location.hash = 'splash'
    		// 	}
    		// })
    	},

    	routes:{
    		'dash':'showDashPage',
    		'*splash':'showSplashPage',
    	},

    	showSplashPage: function(){
    		DOM.render(<SplashPage createUser={ this._createUser.bind( this ) } logUserIn={ this._LogUserIn.bind( this ) } />, document.querySelector('.container'))
    	},

    	showDashPage: function(){
    		DOM.render(<DashPage/>, document.querySelector('.container'))
    	},

		_createUser: function(userObj){
			console.log('userObj',userObj)
			var self = this
			this.fbRef.createUser({
				email:userObj.email,
				password:userObj.passWord},
				function(err, authData){
				console.log('authData',authData)
				if (err) console.log('err',err)
				else {
					var userMod = new UserModel(authData.uid)
					userMod.set({
						firstName: userObj.firstName,
						lastName: userObj.lastName,
						email:userObj.email,
						id:authData.uid,
					})
				}
			})
		},

		_LogUserIn: function(userObj){
			console.log('userObj',userObj)
		},
	})

	var rtr = new AppRouter()
	BackboneFire.history.start()
}
app()
