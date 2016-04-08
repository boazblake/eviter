import DOM from 'react-dom'
import React, {Component} from 'react'

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
	render: function(){return(<div className='footer'>FOOTER</div>)}
})

//Views
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
			<div className='splashPageView'>
				<Header/>
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

var DashPage = React.createClass({
	
	componentWillMount:function(){
		var self = this
		self.props.eventColl.on('sync update', function(){
			self.forceUpdate()
		})
	},

	_creatEvent:function(){
		location.hash = 'createvent'
	},

	render:function(){
		return(
			<div className='dashPageView'>
				<Header/>
				<NavBar/>
				<div className='invites'>
				<button onClick={this._creatEvent}>Create Event!</button>
					<EviteBox eventColl={this.props.eventColl} viewEvent={this.props.viewEvent}/>
				</div>
				<Footer/>
			</div>
		)
	}
})

var EviteBox = React.createClass({
	_eventInvite:function(model, i){
		console.log('model:>>>>',model)
		if (model.id)
		return <EventItem eventInfo={model} key={i} viewEvent={this.props.viewEvent}/>
	},
	 
	 render:function(){
	 	return(
	 		<div className='EviteBox'>
	 			{this.props.eventColl.map(this._eventInvite)}
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
	render:function(){
		return(
			<div className='eventView'>
			<Header/>
			<NavBar/>
				<a href='#dash'>back to dashboard!</a><br/>
			<div className='eventContent'>
				<p>{this.props.eventContent.title}</p>
				<p>{this.props.eventContent.date}</p>
				<p>{this.props.eventContent.location}</p>
				<p>{this.props.eventContent.doBringThis}</p>
				<p>{this.props.eventContent.doNotBringThis}</p>
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

	// _upDateGuestName:function(evt){
	// 	this.eventObj.guestName = evt.target.value
	// },

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
		var self = this
		console.log('eventObj', self.eventObj)
		this.props.eventCreator(this.eventObj)
	},

	// <input type='text' placeholder='Guest' onChange={this._upDateGuestName}/><br/>
	render:function(){
		return(
			<div className='createEventView'>
				<Header/>
				<NavBar/>
				<a href='#dash'>back to dashboard!</a><br/>
				<input type='text' placeholder='Event Title' onChange={this._upDateEventTitle}/><br/>
				<input type='text' placeholder='Event Date' onChange={this._upDateEventDate}/><br/>
				<input type='text' placeholder='Event Location' onChange={this._upDateEventLocation}/><br/>
				<input type='text' placeholder='Bring This!' onChange={this._upDateBringItems}/><br/>
				<input type='text' placeholder='DO NOT Bring This!' onChange={this._upDateDONOTBringItems}/><br/>
                <button onClick={this._submitMessage} >Sign Up!</button>
				<Footer/>
			</div>
		)
	}
})


export {DashPage,SplashPage,CreateEvent,EventPage}