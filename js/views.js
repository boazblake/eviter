import DOM from 'react-dom'
import fbRef from './fbref'
import React, {Component} from 'react'
import {createEvent, createUser, logUserIn, handleEvent, addInput} from './actions'
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
			var eventColl = events.models
			console.log('eventColl', eventColl)
			eventColl.filter(function(model, i){
				if (model.id === undefined) {
					return eventColl.pop(eventColl.model)
				}
			})

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
	 						<p>Title:{event.title}</p>
	 						<p>Date:{event.date}</p>
	 						<p>Host:{event.event_id}</p>
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
	
	getInitialState:function() {
		return {
			eventArr:[],
		}
	},

	componentDidMount:function(){
		var component = this

		let currentEvent = new EventFinder(this.props.eventId)
		currentEvent.fetch()
		currentEvent.on('sync', function(){
			console.log('currentEvent>>>>>',currentEvent)
			var currentEvtArr = currentEvent.models
			currentEvtArr.filter(function(model, i){
				if (model.id === undefined) {
					return currentEvtArr.pop(currentEvtArr.model)
				}
			})

			component.setState({
				eventArr:currentEvtArr
			})
		})
	},

	render:function(){
		return(
			<div className='eventView'>
				<Header/>
				<NavBar/>
				<a href='#dash'>back to dashboard!</a><br/>
				<div className='eventContent'>
					{
						this.state.eventArr.map( function(info, i) {

							console.log('event id>>>',info.id)
							console.log('info>>>',info)
							return (
								<div key={i} className='currentEvent'>
									<p>TITLE: {info.get('title')}</p>
									<p>DATE: {info.get('date')}</p>
									<p>BRING THIS: {info.get('doBringThis')}</p>
									<p>DONT BRING THIS: {info.get('doNotBringThis')}</p>
									<p>LOCATION: {info.get('location')}</p>
								</div>
							)
						})
					}
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

	_addInput:function(evt){
		console.log(evt.target.bringFood)
		var i = 1
		var newDiv = document.createElement('div')
		newDiv.innerHTML = 'Entry' + (i + 1) + `<input type='text' required="required" placeholder='Bring This!' onChange={this._upDateBringItems}/><i className="fa fa-plus-circle" onClick={this._addInput('bringFood')}></i><br/>`
		document.getElementById(divName)
		i++

	},

	render:function(){
		return(
			<div className='createEventView'>
				<Header/>
				<NavBar/>
					<a href='#dash'>back to dashboard!</a><br/>

				<form onSubmit={this._submitMessage}>
					<div className='row'>
						<div clasName='six columns'>
							<label>Name Your Event</label><input type='text' required="required" placeholder='Event Title' onChange={this._upDateEventTitle}/><br/>
						</div>
						<div clasName='six columns'>
							<label>Date</label><input type='date' required="required" placeholder='Event Date' onChange={this._upDateEventDate}/><br/>
						</div>
						<div clasName='six columns'>
							<label>Event Location</label><input type='text' required="required" placeholder='Event Location' onChange={this._upDateEventLocation}/><br/>
						</div>
						<div clasName='six columns'>
							<label>Food To Bring</label><input id='bringFood' type='text' required="required" placeholder='Bring This!' onChange={this._upDateBringItems}/>
							<i className="fa fa-plus-circle" onClick={this._addInput}></i><br/>
						</div>
						<div clasName='six columns'>
						<label>Foods to Not Bring</label><input type='text' required="required" placeholder='DO NOT Bring This!' onChange={this._upDateDONOTBringItems}/><br/>
						</div>
		                <button>Submit!</button>
	                </div>
				</form>
				<Footer/>
			</div>
		)
	}
})


export {DashPage,SplashPage,CreateEvent,EventPage}