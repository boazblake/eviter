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
// FireBase Refs Models and Collections
var fbRef = new Firebase('https://eviter.firebaseio.com/')

var UserModel = BackboneFire.Firebase.Model.extend({
	initialize:function(uid){
		this.url = `https://eviter.firebaseio.com/users/${uid}`
	}
})

var UserSearch = BackboneFire.Firebase.Collection.extend({
	initialize:function(targetEmail){
		this.url = fbRef.child('users').orderByChild('email').equalTo(targetEmail)
		return 
	},
	autoSync: false
})

var EventInvite = BackboneFire.Firebase.Collection.extend({
	initialize:function(uid){
		this.url = `https://eviter.firebaseio.com/users/${uid}/events`
	}
})

//Modules
var Header = React.createClass({
	render: function(){
		return(
			<div className='header'>HEADER
				<a href='#logout'>LOGOUT</a>
			</div>
		)
	}
})


var NavBar = React.createClass({
	render: function(){
		return(
			<div>NAVBAR
				<a href='#createvent'>Create Event!</a>
			</div>
		)
	}
})

var Footer = React.createClass({
	render: function(){return(<div>FOOTER</div>)}
})

//Incoming invitaions
var EviteBox = React.createClass({
	_eventInvite:function(model, i){
		return <Event eventInfo={model} key={i} />
	},
	 
	 render:function(){
	 	return(
	 		<div className='EviteBox'>
	 			{this.props.eventColl.map(this._eventInvite)}
	 		</div>
	 	)
	 }
})

var Event = React.createClass({
	render:function(){
		var displayType = 'block'
		if (this.props.eventInfo.id === undefined) displayType = 'none'
		console.log('eventInfo>>>>', this.props.eventInfo)
		return(
			<div style={{display:displayType}} className='event'>
				<p>New Invite!</p><br/>
				<p>from:{this.props.eventInfo.get('sender_email')}</p>
				<p>for:{this.props.eventInfo.get('content').title}</p>
				<a href='#'>click to rsvp</a>
			</div>
		)
	}
})

//Views
var DashPage = React.createClass({
	
	componentWillMount:function(){
		var self = this
		self.props.eventColl.on('sync', function(){
			self.forceUpdate()
		})
	},

	render:function(){
		return(
			<div className='dashPage'>
				<Header/>
				<NavBar/>
				<div className='invites'>
					<EviteBox eventColl={this.props.eventColl}/>
				</div>
				<Footer/>
			</div>
		)
	}
})

var CreateEvent = React.createClass({

	eventObj:{
		'title':'',
		'date':'',
		'location':'',
		'guestName':'',
		'doBringThis':'',
		'dONOTBringThis':'',

	},

	_upDateEventTitle:function(evt){
		this.eventObj.title = evt.target.value
	},

	_upDateEventDate:function(evt){
		this.eventObj.date = evt.target.value
	},

	_upDateEventLocation:function(evt){
		this.eventObj.location = evt.target.value
	},

	_upDateGuestName:function(evt){
		this.eventObj.guestName = evt.target.value
	},

	_upDateEventName:function(evt){
		this.eventObj.name = evt.target.value
	},

	_upDateBringItems:function(evt){
		this.eventObj.doBringThis = evt.target.value
	},

	_upDateDONOTBringItems:function(evt){
		this.eventObj.dONOTBringThis = evt.target.value
	},

	_submitMessage:function(evt){
		var self = this
		console.log('eventObj.guestName', self.eventObj.guestName)
		var newGuest = new UserSearch(self.eventObj.guestName)
		newGuest.fetch()
		newGuest.on('sync', function(){
			var guestID =  newGuest.models[0].get('id')
			var eventInviteColl = new EventInvite(guestID)
			eventInviteColl.create({
				content: self.eventObj,
				sender_email: fbRef.getAuth().password.email,
				sender_id: fbRef.getAuth().uid,
				sender_name:fbRef.getAuth().password.email
			})
		})
	},


	render:function(){
		return(
			<div className='createEvent'>
				<Header/>
				<NavBar/>
				<input type='text' placeholder='Event Title' onChange={this._upDateEventTitle}/><br/>
				<input type='text' placeholder='Event Date' onChange={this._upDateEventDate}/><br/>
				<input type='text' placeholder='Event Location' onChange={this._upDateEventLocation}/><br/>
				<input type='text' placeholder='Guest Email' onChange={this._upDateGuestName}/><br/>
				<input type='text' placeholder='Bring This!' onChange={this._upDateBringItems}/><br/>
				<input type='text' placeholder='DO NOT Bring This!' onChange={this._upDateDONOTBringItems}/><br/>
                <button onClick={this._submitMessage} >submit!</button>
				<Footer/>
			</div>
		)
	}
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
    		this.fbRef = new Firebase('https://eviter.firebaseio.com/')

    		if (!this.fbRef.getAuth()) {
    			location.hash = 'splash'
    		} 

    		// this.fbRef.on('route', function(){
    		// 	if (!this.fbRef.getAuth()){
    		// 		location.hash = 'splash'
    		// 	}
    		// })
    	},

    	routes:{
    		'dash':'showDashPage',
    		'logout':'doLogOut',
    		'createvent':'doCreateEvent',
    		'*splash':'showSplashPage',

    	},

    	showSplashPage: function(){
    		DOM.render(<SplashPage createUser={ this._createUser.bind( this ) } logUserIn={ this._LogUserIn.bind( this ) } />, document.querySelector('.container'))
    	},

    	showDashPage: function(){
    		var uid = fbRef.getAuth().uid
    		console.log('uid', uid)
			var eventColl = new EventInvite(uid)
			console.log('eventColl>>>>',eventColl)
    		DOM.render(<DashPage eventColl={eventColl}/>, document.querySelector('.container'))
    	},

    	doCreateEvent:function(){
    		DOM.render(<CreateEvent/>, document.querySelector('.container'))
    	},

    	doLogOut:function(){
    		console.log('fbref:>>>> ', this.fbRef)
    		this.fbRef.unauth()
    		location.hash = 'splash'
    		console.log('fbref:>>>> ', this.fbRef)
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
					self._LogUserIn(userObj)
				}
			})
		},

		_LogUserIn: function(userObj){
			console.log('userObj',userObj)
			var self = this
			this.fbRef.authWithPassword({
				email:userObj.email,
				password:userObj.passWord
			}, function(err, authData){
				if (err) console.log(err)
				else {
					location.hash = 'dash'
				}
			})
		},
	})

	var rtr = new AppRouter()
	BackboneFire.history.start()
}
app()
