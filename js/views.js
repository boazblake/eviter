import DOM from 'react-dom'
import fbRef from './fbref'
import React, {Component} from 'react'
import {createEvent, createUser, logUserIn, handleEvent} from './actions'
import {User, Users, Event, Events, Attendances, EventFinder} from './data'

//Modules
var Header = React.createClass({
	render: function(){
		return(
			<div className='header'>HEADER
			</div>
		)
	}
})

var NavBar = React.createClass({
	render: function(){
		return(
			<div>NAVBAR
				<a href='#logout'>LOGOUT</a>
			</div>
		)
	}
})

var Footer = React.createClass({
	render: function(){
		return (
			<div className='footer'>
			<img className='logo' src='http://landing.theironyard.com/images/home/tiy-logo.png'/>
			FOOTER
			</div>
		)
	}
})

//Views
var SplashPage = React.createClass({

	userObj:{
		email:'',
		firstName:'',
		lastName:'',
		passWord:'',
		eventsAttending:{}
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
		createUser(this.userObj)
	},

	_handleLogin:function(){
		logUserIn(this.userObj)
	},

	render:function(){
		return(
			<div className='splashPageView'>
				<Header/>
				<div className='signUp'>
					<input type='text' placeholder='email@host.com' onChange={this._upDateEmail}/><br/>
					<input type='passWord' placeholder='password' onChange={this._upDatePass}/><br/>
					<input type='text' placeholder='First name' onChange={this._firstName}/><br/>
					<input type='text' placeholder='Last Name' onChange={this._lastName}/><br/>
					<button onClick={this._handleSubmit}>SIGN UP!</button>
				</div><br/><br/>
				<div className='logIn'>
					<input type='text' placeholder='email@host.com' onChange={this._upDateEmail}/><br/>
					<input type='passWord' placeholder='password' onChange={this._upDatePass}/><br/>
					<button onClick={this._handleLogin}>LOG IN</button>
				</div>
				<Footer/>	
			</div>

		)
	},
})

var DashPage = React.createClass({
	render:function(){
		return(
			<div className='dashPageView'>
				<Header/>
				<NavBar/>
				<div className='invites'>
					<a href="#createevent">Create Event!</a>
					<MyEvents />
				</div>
				<Footer/>
			</div>
		)
	}
})

var MyEvents = React.createClass({
	getInitialState:function(){
		return{
			events:[]
		}
	},

	_eventInvite:function(model, i){
		console.log('model:>>>>',model)
		if (model.id)
		return <EventItem eventInfo={model} key={i} viewEvent={this.props.viewEvent}/>
	},

	componentDidMount(){
		var component = this
		let events = new Attendances(fbRef.getAuth().uid)
		events.fetch()
		events.once('sync', function() {
			component.setState({
				events: events.toJSON()
			})
		})
	},
	 
	 render:function(){
	 	console.log('this.state.events>>>>:',this.state.events)
	 	return(
	 		<div className='myEvents'>
	 			{
	 				this.state.events.map( function(event, i ){
	 					return (
	 						<div key={i} className='event' id={event.event_id} onClick={handleEvent}>
	 						<p>{event.title}</p>
	 						<p>{event.date}</p>
	 						<p>{event.event_id}</p>
	 						</div>
	 					)
	 				})
	 			}
	 		</div>
	 	)
	 }
})

var EventItem = React.createClass({
	

	_handleRsvp:function(evt){
		var eventID = evt.currentTarget.value
		console.log(evt.currentTarget)
		this.props.viewEvent(this.props.eventInfo)
	},

	render:function(){
		self = this
		var displayType = 'inline-block'
		if (self.props.eventInfo.id === undefined) displayType = 'none'
		console.log('eventInfo>>>>', self.props.eventInfo)
		return(
			<div style={{display:displayType}} className='event'>
				<p>Event</p><br/>
				<p>from:{self.props.eventInfo.get('sender_email')}</p>
				<p>for:{self.props.eventInfo.get('content').title}</p>
				<p>when:{self.props.eventInfo.get('content').date}</p>
				<button onClick={self._handleRsvp}>click to rsvp</button>
			</div>
		)
	}
})

var EventPage = React.createClass({
	componentDidMount:function(){
	var eventArr = []
	var event
		var eventColl = new EventFinder(this.props.eventId)

		eventColl.on('sync', function(){
			eventArr = eventColl.models
			eventArr.filter(function(model, i){
				if (model.id !== undefined) {
					return event =  model
				}
			})
			console.log('event>>>',event)
			// 1. parse event
			//  2. render jsx
			// 

		})
	},



	render:function(){
		return(
			<div className='eventView'>
			<Header/>
			<NavBar/>
				<a href='#dash'>back to dashboard!</a><br/>
			<div className='eventContent'>
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
		'doBringThis':'',
		'doNotBringThis':'',
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

	_upDateEventName:function(evt){
		this.eventObj.name = evt.target.value
	},

	_upDateBringItems:function(evt){
		this.eventObj.doBringThis = evt.target.value
	},

	_upDateDONOTBringItems:function(evt){
		this.eventObj.doNotBringThis = evt.target.value
	},

	_submitMessage:function(evt){
		evt.preventDefault()
		createEvent(this.eventObj)
	},

	render:function(){
		return(
			<form className='createEventView' onSubmit={this._submitMessage}>
				<Header/>
				<NavBar/>
				<a href='#dash'>back to dashboard!</a><br/>
				<input type='text' placeholder='Event Title' onChange={this._upDateEventTitle}/><br/>
				<input type='text' placeholder='Event Date' onChange={this._upDateEventDate}/><br/>
				<input type='text' placeholder='Event Location' onChange={this._upDateEventLocation}/><br/>
				<input type='text' placeholder='Bring This!' onChange={this._upDateBringItems}/><br/>
				<input type='text' placeholder='DO NOT Bring This!' onChange={this._upDateDONOTBringItems}/><br/>
                <button>Submit!</button>
				<Footer/>
			</form>
		)
	}
})


export {DashPage,SplashPage,CreateEvent,EventPage}