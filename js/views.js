import DOM from 'react-dom'
import fbRef from './fbref'
import React, {Component} from 'react'
import {createEvent, createUser, logUserIn, handleEvent, addInput, removeEventAttendance, addGuestToEvent} from './actions'
import {User, Users, Event, Events, Attendances, EventFinder, QueriedAttendance} from './data'


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
					<input required='required' type='text' placeholder='email@host.com' onChange={this._upDateEmail}/>
					<input required='required' type='passWord' placeholder='password' onChange={this._upDatePass}/><br/>
					<input required='required' type='text' placeholder='First name' onChange={this._firstName}/>
					<input required='required' type='text' placeholder='Last Name' onChange={this._lastName}/><br/>
					<button className='pure-button pure-button-primary' onClick={this._handleSubmit}>SIGN UP!</button>
				</form><br/><br/>
				<form className='logIn pure-form'>
					<h3>LOG IN HERE</h3>
					<input required='required' type='text' placeholder='email@host.com' onChange={this._upDateEmail}/>
					<input required='required' type='passWord' placeholder='password' onChange={this._upDatePass}/>
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
			attendanceMods:[]
		}
	},


	_eventInvite:function(model, i){
		// console.log('model:>>>>',model)
		if (model.id)
		return <EventItem eventInfo={model} key={i} viewEvent={this.props.viewEvent} />
	},


	componentDidMount(){
		var component = this
		console.log('user uid',fbRef.getAuth().uid)
		this.myAttendances = new QueriedAttendance('user_uid', fbRef.getAuth().uid )
		
		this.myAttendances.on('sync update', function() {
			console.log('myAttendances', component.myAttendances)

			var modsArr = component.myAttendances.models
			var noGhostList = modsArr.filter(function(model, i){
				 return model.id
			})

			// console.log('noooo ghosts', noGhostList)
			component.setState({
				attendanceMods: noGhostList
			})
		})
	},

	  componentWillUnmount: function(){
	  	this.myAttendances.off()
	  },
	 
	 render:function(){

	 	// console.log('this.state.attendanceMods', this.state.attendanceMods)
	 	return(
	 		<div className='myEvents pure-g'>
	 			{
	 				this.state.attendanceMods.map( function(attendanceMod, i ){
	 					return (
	 						<EventItem attendanceMod={attendanceMod} key={i} />
	 					)
	 				})
	 			}
	 		</div>
	 	)
	 }
})

var EventItem = React.createClass({
	

	removeAttendance: function(evt) {
		this.props.attendanceMod.destroy()
		// console.log('this.props.attendanceMod', this.props.attendanceMod)
	},

	render:function(){
		var attendanceMod = this.props.attendanceMod
		// console.log('attendanceMod>>>>',attendanceMod)
		return(
			<div className='attendance pure-u-1-3 button-secondary'>
				<button data-id={attendanceMod.id} onClick={this.removeAttendance} className='removeAttendanceButton button-error'>
					<i className="fa fa-times"></i>
				</button>
				<div className='eventInfo' onClick={handleEvent} data-event-id={attendanceMod.get('event_id')}>
					<p>Title:{attendanceMod.get('title')}</p>
					<p>Date:{attendanceMod.get('date')}</p>
					<p>Host:{attendanceMod.get('hostName')}</p>
				</div>
			</div>		
		)
	}
})

var EventPage = React.createClass({

	getInitialState:function() {
		return {event: new Event(this.props.eventID)}
	},

	componentWillMount:function(){
		this.state.event.fetchWithPromise().then(() => this.forceUpdate())
	},


	_handleAddGuest: function(eventInfo){

		var userEmail = this.refs.userEmail.value
		var eventID = this.props.eventID
		this.refs.userEmail.value = ''

		var searchForAttendance = new QueriedAttendance('email', userEmail)
		console.log('searchForAttendance', searchForAttendance)
		
		if (!searchForAttendance.models.id) {
			addGuestToEvent(userEmail, this.state.event)
		}
		else {
			alert( userEmail +'has already been invited!')
		}

		// else pop an alertt
	},

	render:function(){

		var component = this
		var event = this.state.event

		// console.log('currentEvent',currentEvent)
		var newUserEmail = ''
		var eventInfo = ''

		function _upDateGuestEmail(evt){
			newUserEmail = evt.target.value
			// console.log(newUserEmail)
		}
		// console.log('component.props.event',component.props.event)
		return(
			<div className='eventView'>
				<Header/>
				<NavBar/>
				<br/>
				<div className='eventContent'>
					<div className='currentEvent'>
						<p>{event.get('date')}</p>
						<p>{event.get('location')}</p>
						<p>{event.get('title')}</p>
						<p>{event.get('doBringThis')}</p>
						<p>{event.get('doNotBringThis')}</p>
						<form data-id='newUserEmail'>
							<input type='text' placeholder='email@host.com' onChange={_upDateGuestEmail} data-id='event.id' ref={'userEmail'}/>
							<button data-id='newUserEmail' onClick={component._handleAddGuest.bind(component, eventInfo )} className='adduserbutton button-secondary pure-button'>
								<i className="fa fa-user-plus" aria-hidden="true"></i>
							</button>
						</form>
					</div>
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
		'quantity':'',
		'doNotBringThis':'',
		'hostName':''
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

	_upDateItemQuantity:function(evt){
		this.eventObj.quantity = evt.target.value
	},

	_upDateDONOTBringItems:function(evt){
		this.eventObj.doNotBringThis = evt.target.value
	},

	_submitEvent:function(evt){
		evt.preventDefault()
		var component = this
		var hostModel = new User(fbRef.getAuth().uid)
		hostModel.once('sync', function(){
			createEvent(component.eventObj, hostModel)
		})
	},

	_addInput:function(evt){
		// console.log(evt.target.bringFood)
		var i = 1
		var newItemDiv = document.createElement('div')
		newItemDiv.innerHTML = 'Entry' + (i + 1) + `<input type='text' required="required" placeholder='Bring This!' onChange={this._upDateBringItems}/><i className="fa fa-plus-circle" onClick={this._addInput('bringFood')}></i><br/>`
		document.querySelector('bringThis').appendChild(newItemDiv)
		i++

	},

	render:function(){
		return(
			<div className='createEventView'>
				<Header/>
				<NavBar/>
				<form className='pure-form' onSubmit={this._submitEvent}>
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