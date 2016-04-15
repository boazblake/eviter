import DOM from 'react-dom'
import fbRef from './fbref'
import BackboneFire from 'bbfire'
import React, {Component} from 'react'
import {createEvent, createUser, logUserIn, handleEvent, addInput, removeEventAttendance, addGuestToEvent, createFoodItemForEvent, selectMyFoods} from './actions'
import {User, Users, Event, Events, Attendances, EventFinder, QueriedAttendance, FoodToBring, FoodsToBring} from './data'


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

var CreateEvent = React.createClass({

	eventObj:{
		'title':'',
		'date':'',
		'location':'',
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

	_submitEvent:function(evt){
		evt.preventDefault()
		var component = this
		var hostModel = new User(fbRef.getAuth().uid)
		hostModel.once('sync', function(){
			createEvent(component.eventObj, hostModel)
		})
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
					</div>
					<br/>
		            <button className='pure-button pure-button-primary'>Submit!</button>
				</form>
				<Footer/>
			</div>
		)
	}
})


//Events
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
				<button data-id={attendanceMod.id} onClick={this.removeAttendance} className='removeButton button-error'>
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
		return {
			event: new Event(this.props.eventID),
			foodListColl: new FoodsToBring(this.props.eventID),
			userModel: new User(fbRef.getAuth().uid),
			guestList: new QueriedAttendance('event_id', this.props.eventID)
		}
	},

	componentWillMount:function(){
		var component = this
		this.state.event.fetchWithPromise().then(() => this.forceUpdate())
		this.state.foodListColl.fetchWithPromise().then(function(){
			component.forceUpdate()	
		})
		this.state.userModel.fetchWithPromise().then(() => this.forceUpdate())
		this.state.guestList.fetchWithPromise().then(() => this.forceUpdate())

		BackboneFire.Events.on('updateComponent',
			function(){
				component.state.event.fetchWithPromise().then(() => component.forceUpdate())
				component.state.guestList.fetchWithPromise().then(() => component.forceUpdate())
				component.state.foodListColl.fetchWithPromise().then(function(){
					component.forceUpdate()	
				})
			})
	},


	render:function(){



		return(
			<div className='eventView'>
				<Header/>
				<NavBar/>
				<br/>
				<EventDeets eventDeets={this.state.event}/>
				<Guests guestList={this.state.guestList} eventID={this.state.event}/>
				<FoodInput userModel={this.state.userModel} eventID={this.state.event.id} foodListColl={this.state.foodListColl}/>
				<Footer/>
			</div>
		)
	}
})

var EventDeets = React.createClass({
	render:function(){

		var component = this
		var event = component.props.eventDeets


		return (
			<div className='eventDeets pure-u-*'>
				<p>DATE<br/>{event.get('date')}</p>
				<p>LOCATION<br/>{event.get('location')}</p>
				<p>TITLE<br/>{event.get('title')}</p>
			</div>
		)
	}
})


//Guests
var Guests = React.createClass({

	_handleAddGuest: function(eventInfo){

		var userEmail = this.refs.userEmail.value
		var eventID = this.props.eventID
		this.refs.userEmail.value = ''

		var searchForAttendance = new QueriedAttendance('email', userEmail)
		console.log('searchForAttendance', searchForAttendance)
		
		if (!searchForAttendance.models.id) {
			addGuestToEvent(userEmail, this.props.eventID)
		}
		else {
			alert( userEmail + 'has already been invited!')
		}

	},

	render:function(){
		var component = this
		var event = component.props.event

		var newUserEmail = ''
		var eventInfo = ''

		function _upDateGuestEmail(evt){
			newUserEmail = evt.target.value
		}



		return(
			<div className='guests'>
				<div>
					<GuestList eventID={this.props.eventID} guests={this.props.guestList} />
				</div>
				<form data-id='newUserEmail'>
					<label>Invite Guests</label>
					<input type='text' placeholder='email@host.com' onChange={_upDateGuestEmail} data-id='event.id' ref={'userEmail'}/>
					<button data-id='newUserEmail' onClick={this._handleAddGuest} className='adduserbutton button-secondary pure-button'>
						<i className="fa fa-user-plus" aria-hidden="true"></i>
					</button>
				</form>
			</div>
		)
	}
})

var GuestList = React.createClass({

	_showGuests:function(){
		var component = this
		var guestsArr = this.props.guests
		return guestsArr.map(function(guest, i){
			if(guest.id) {
				return (
					<div key={i} className='guestItem'>
						<p>{guest.get('userName')}</p>
						<p>{guest.get('email')}</p>
					</div>
				)
			}
		})

	},

	render:function(){
		var component = this
		var guestsArr = this.props.guestList
		return(
			<div className='guestList'>
				{this._showGuests()}
			</div>
		)
	}
})

//Foods
var FoodInput = React.createClass({
	
	foodItem:{
		food_name:'',
		food_quantity:'',
		bringer_uid:'0000',
		bringer_name:'unassigned',
		event_id:''
	},

	componentWillMount:function(){
		var component = this
		this.props.foodListColl.on('sync update', function(){
			component.forceUpdate()
		})
	},

	_upDateFoodName:function(evt){
		this.foodItem.food_name = evt.target.value
	},

	_upDateItemQuantity:function(evt){
		this.foodItem.food_quantity = evt.target.value
	},

	_handleFoodItem: function(evt){
		var component = this
		var event_id = this.props.eventID
		this.foodItem.event_id = event_id
		createFoodItemForEvent(this.foodItem, event_id, function(){
			component.foodItem = {}
			component.forceUpdate()
		})
	},


	render: function(){

		return(
			<div className='bringThis'>
				<div>
				<FoodList userModel={this.props.userModel} foodListColl={this.props.foodListColl} eventID={this.props.eventID}/>
				</div>
				<label>Food To Bring</label>
				<input type='text' id='foodName' required="required" placeholder='Bring This!' onChange={this._upDateFoodName}/>
				<input type='number' id='itemQ'required="required" placeholder='quantity' onChange={this._upDateItemQuantity}/>
				<i onClick={this._handleFoodItem} className="fa fa-plus-square-o pure-button pure-button-primary"></i>
			</div>
		)
	}
})

var FoodList = React.createClass({

	_handleFoodBringer:function(foodItem, evt){
		console.log('clicked targets model-foodItem',foodItem)
		// var foodItem = evt.currentTarget.dataset.fooditem_id

		var foodBringerName
		var event_id = this.props.eventID
		var userModel = this.props.userModel
		selectMyFoods(foodItem, userModel, event_id )
	},

	_removeFood: function(foodItem, evt){
		var listArr = this.props.foodListColl
		listArr.remove(foodItem)
		this.forceUpdate()
	},

	_showFoodItems:function(){
		var component = this
		var foodListArr = this.props.foodListColl
		return foodListArr.map(function(foodItem, i){
			if (foodItem.id) {
				return(
					<div  className='foodItem' key={i} >
						<button data-fooditem_id={foodItem.id} onClick={component._removeFood.bind(component, foodItem)} className='removeButton button-error'>
							<i className="fa fa-times"></i>
						</button>
						<div data-fooditem_id={foodItem.id} onClick={component._handleFoodBringer.bind(component, foodItem)}>
							<p className='foodItem'>Food:{foodItem.get('food_name')}</p>
							<p className='foodItem'>Quantitiy:{foodItem.get('food_quantity')}</p>
							<p className='foodItem'>Bringer:{foodItem.get('bringer_name')}</p>
						</div>
					</div>
				)				
			}
		}) 
	},

	render:function(){

		return(
			<div>
					{this._showFoodItems()}
			</div>
		)
	}
})


export {DashPage,SplashPage,CreateEvent,EventPage}