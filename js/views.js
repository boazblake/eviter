import DOM from 'react-dom'
import fbRef from './fbref'
import React, {Component} from 'react'
import {createEvent, createUser, logUserIn, handleEvent, addInput, removeEventAttendance, addGuest} from './actions'
import {User, Users, Event, Events, Attendances, EventFinder} from './data'

//Modules
var Header = React.createClass({
	render: function(){
		return(
			<div className='header'>
				<p className='heading'>EVITER</p>
				<p className='subHeading'> Your goto Event Organizer</p>
			</div>
		)
	}
})

var NavBar = React.createClass({
	_showDashButton:function(){
		if (location.hash !=='#dash') {
			return (<i className='fa fa-reply pure-menu-heading pure-menu-link'>back to dashboard</i>)
		} else {
			return ''
		}
	},


	render: function(){
		return(
			<div className='pure-menu pure-menu-horizontal navBar'>
				<a href='#dash'>{this._showDashButton()}</a>
				<a href='#logout'><i className='fa fa-sign-out pure-menu-heading pure-menu-link'> Sign Out</i></a>
			</div>
		)
	}
})

var Footer = React.createClass({
	render: function(){
		return (
			<div className='footer'>
			<img className='logo' src='http://landing.theironyard.com/images/home/tiy-logo.png'/>
			<p>Boaz Blake, 2016</p>
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
				<form className='signUp pure-form'>
					<h3>SIGN UP HERE</h3>
					<input type='text' placeholder='email@host.com' onChange={this._upDateEmail}/>
					<input type='passWord' placeholder='password' onChange={this._upDatePass}/><br/>
					<input type='text' placeholder='First name' onChange={this._firstName}/>
					<input type='text' placeholder='Last Name' onChange={this._lastName}/><br/>
					<button className='pure-button pure-button-primary' onClick={this._handleSubmit}>SIGN UP!</button>
				</form><br/><br/>
				<form className='logIn pure-form'>
					<h3>LOG IN HERE</h3>
					<input type='text' placeholder='email@host.com' onChange={this._upDateEmail}/>
					<input type='passWord' placeholder='password' onChange={this._upDatePass}/>
					<button className='pure-button pure-button-primary' onClick={this._handleLogin}>LOG IN</button>
				</form>
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
					<a className='pure-button pure-button-primary' href="#createevent">Create New Event!</a>
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

	 	return(
	 		<div className='myEvents pure-g'>
	 			{
	 				this.state.events.map( function(event, i ){
	 					
	 					return (
	 						<EventItem event={event} key={i} />
	 					)

	 				})
	 			}
	 		</div>
	 	)
	 }
})

var EventItem = React.createClass({
	

	_removeEvent: function(evt) {
		this.props.event.destroy()
	},

	render:function(){
		var event = this.props.event
		console.log('event>>>>',event)
		return(
			<div className='event pure-u-1-3 button-secondary'>
				<button data-id={event.id} onClick={removeEventAttendance} className='removeEventButton button-error'><i className="fa fa-times"></i></button>
				<div className='eventInfo' onClick={handleEvent} id={event.event_id}>
					<p>Title:{event.title}</p>
					<p>Date:{event.date}</p>
					<p>eventID:{event.event_id}</p>
				</div>
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
		var newUserEmail=''

		function _upDateGuestEmail(evt){
			console.log(evt.target.value)
			// var email = evt.target.value
			// component.newUser = email
			newUserEmail = evt.target.value
			console.log(newUserEmail)
		}

		function addNewGuest(){
			addGuest(newUserEmail)
		}


		return(
			<div className='eventView'>
				<Header/>
				<NavBar/>
				<br/>
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
									<form data-id='newUserEmail'>
										<input type='text' placeholder='email@host.com' onChange={_upDateGuestEmail} data-id='newUserEmail'/>
										<button onClick={addNewGuest} className='adduserbutton button-secondary pure-button'>
											<i className="fa fa-user-plus" aria-hidden="true"></i>
										</button>
									</form>
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
				<form className='pure-form' onSubmit={this._submitMessage}>
					<div className='row createEvent'>
							<label>Name Your Event</label>
							<input type='text' required="required" placeholder='Event Title' onChange={this._upDateEventTitle}/>
							
							<label>Date</label>
							<input type='date' required="required" placeholder='Event Date' onChange={this._upDateEventDate}/>
							<br/>
							<label>Event Location</label>
							<input type='text' required="required" placeholder='Event Location' onChange={this._upDateEventLocation}/><br/>
							
							<div className='bringThis'>
								<label>Food To Bring</label>
								<input type='text' id='itemName' required="required" placeholder='Bring This!' onChange={this._upDateBringItems}/>
								<input type='number' id='itemQ'required="required" placeholder='quantity' onChange={this._upDateItemQuantity}/>
								<i className="fa fa-plus-square-o pure-button pure-button-primary"></i>
							</div>
							<br/>
							<label>Foods to Not Bring</label>
							<input type='textarea'  placeholder='DO NOT Bring This!' onChange={this._upDateDONOTBringItems}/><br/>
					</div><br/>
		            <button className='pure-button pure-button-primary'>Submit!</button>
				</form>
				<Footer/>
			</div>
		)
	}
})


export {DashPage,SplashPage,CreateEvent,EventPage}