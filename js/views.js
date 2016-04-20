import DOM from 'react-dom'
import fbRef from './fbref'
import BackboneFire from 'bbfire'
import React, {Component} from 'react'
import {createEvent, createUser, logUserIn, handleEvent, addInput, removeEventAttendance, addGuestToEvent, createFoodItemForEvent, selectMyFoods, changeFoodAmount, pollForNewData} from './actions'
import {User, Users, Event, Events, Attendances, EventFinder, QueriedAttendance, AddFood, FoodsToBring} from './data'


//Modules
var Header = React.createClass({

	_showWelcomeMessage:function(){
		if (this.props.userModel) {
			var userName = this.props.userModel.get('firstName') +' ' + this.props.userModel.get('lastName')

			return (
				<h3 className='userWelcome'>welcome {userName}</h3>
			)
		} else {
			return 'Sign in to organize all your events!'
		}
	},

	_showUserProfile: function(){
		if (fbRef.getAuth()) {
			var gravatar = fbRef.getAuth().password.profileImageURL
			// console.log('gravatar', gravatar)
			return (
				<img src={gravatar}/>
				)
		} else {
			return ' '
		}
	},

	render: function(){

		return(
			<div className='header'>
				<a href='#dash'> <h1 className='heading'>EVITER</h1> </a>
				<div>
					{this._showUserProfile()}
					{this._showWelcomeMessage()}
				</div>
			</div>
		)
	}
})

var NavBar = React.createClass({
	_showDashButton:function(){
		if (location.hash !=='#dash') {
			return (
					<i className='btn btn-primary fa fa-reply fa-fw'></i>
			)
		} else {
			return ''
		}
	},


	render: function(){
		return(
			<div className='navBar'>
				<a href='#dash' title='back to dashboard'>{this._showDashButton()}</a>
				<a href='#logout' title='logout'><i className='btn btn-primary-lg fa fa-sign-out fa-fw'></i></a>
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

	_handleSubmit:function(evt){
		evt.preventDefault()
		createUser(this.userObj)
	},

	_handleLogin:function(evt){
		evt.preventDefault()
		logUserIn(this.userObj)
	},

	render:function(){
		return(
			<div className='container splashPageView'>
				<Header/>
				<form className='panel panel-primary row form-group form-horizontal signUp' onSubmit={this._handleSubmit}>
					<fieldset>
						<legend className='panel-title' ><h3>SIGN UP HERE</h3></legend>
						<input required='required' className="form-control col-xs-12 col-sm-6 col-md-4" type='text' id="focusedInput" placeholder='email@host.com' onChange={this._upDateEmail}/>
						<input required='required' className="form-control" type='password' placeholder='password' onChange={this._upDatePass}/><br/>
						<input required='required' className="form-control" type='text' placeholder='First name' onChange={this._firstName}/>
						<input required='required' className="form-control" type='text' placeholder='Last Name' onChange={this._lastName}/><br/>
						<button className='btn btn-primary' >SIGN UP!</button>
					</fieldset>
				</form>
				<br/>
				<br/>
				<form className='panel panel-primary row form-group form-horizontal logIn' onSubmit={this._handleLogin}>
					<fieldset>
						<legend className='panel-title'><h3>LOG IN HERE</h3></legend>
						<input required='required' type='text' className="form-control" placeholder='email@host.com' onChange={this._upDateEmail}/>
						<input required='required' className="form-control" type='passWord' placeholder='password' onChange={this._upDatePass}/>
						<button className='btn btn-primary'>LOG IN</button>
					</fieldset>
				</form>
				<Footer/>	
			</div>

		)
	},
})

var DashPage = React.createClass({
	getInitialState:function() {
		return {
			userModel: new User(fbRef.getAuth().uid),
		}
	},

	componentWillMount:function(){
		var component = this
		this.state.userModel.fetchWithPromise().then(() => this.forceUpdate())

		BackboneFire.Events.on('pollForNewData',
			function(){
				console.log('poll heard, component updating...')
				component.state.userModel.fetchWithPromise().then(() => component.forceUpdate())
				})


	},

	render:function(){

		return(
			<div className='dashPageView'>
				<Header userModel={this.state.userModel}/>
				<NavBar/>
				<div className='container  invites'>
					<a className='btn btn-primary' href="#createevent">Create New Event!</a>
					<MyEvents />
				</div>
				<Footer/>
			</div>
		)
	}
})

var CreateEvent = React.createClass({
	getInitialState:function() {
		return {
			userModel: new User(fbRef.getAuth().uid),
		}
	},

	componentWillMount:function(){
		var component = this
		this.state.userModel.fetchWithPromise().then(() => this.forceUpdate())

	},

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
		hostModel.fetch()
		hostModel.once('sync', function(){
			createEvent(component.eventObj, hostModel)
		})
	},

	
	render:function(){
		return(
			<div className='container createEventView'>
				<Header userModel={this.state.userModel}/>
				<NavBar/>
				<form className='row' onSubmit={this._submitEvent}>
					<div className=' jumbotron createEvent'>
						<legend className='col-lg-2 control-label'>Enter Event Details Below</legend>
						<input type='text' className='form-control' required="required" placeholder='Event Title ...' onChange={this._upDateEventTitle}/>
						
						<input type='date' className='form-control' required="required" placeholder='Event Date ...' onChange={this._upDateEventDate}/>

						<input type='text' className='form-control' required="required" placeholder='Event Location...' onChange={this._upDateEventLocation}/>

			            <button className="btn btn-default btn-lg btn-block">Submit! </button>
					</div>
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


	componentWillMount(){
		var component = this

		function setAttendanceState(comp, fbAttCollection) {
			console.log('myAttendances', fbAttCollection)

			var modsArr = fbAttCollection.models
			var noGhostList = modsArr.filter(function(model, i){
				 return model.id
			})

			console.log('noooo ghosts', noGhostList)
			comp.setState({
				attendanceMods: noGhostList
			})
		}

		console.log('user uid',fbRef.getAuth().uid)
		this.myAttendances = new QueriedAttendance('user_uid', fbRef.getAuth().uid )

		if (typeof this.myAttendances.models[0].id === 'undefined'){
			this.myAttendances.fetch()
		} else {
			setAttendanceState(this, this.myAttendances)
		}

		this.myAttendances.on('sync update', function(){ 
			setAttendanceState(component, component.myAttendances) 
		})

		// console.log('about to poll')
		BackboneFire.Events.on('pollForNewData', function(){
			console.log("data getting poolled forr")
			component.myAttendances.fetch()
		})
	},

	  componentWillUnmount: function(){
	  	this.myAttendances.off()
	  	BackboneFire.Events.off()
	  },
	 
	 render:function(){

	 	console.log('this.state.attendanceMods', this.state.attendanceMods)
	 	return(
	 		<div className='row myEvents'>
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
			<div className='col-xs-12 col-sm-6 col-md-4'>
				<div className='attendance btn-default'>
					<button data-id={attendanceMod.id} onClick={this.removeAttendance} className='btn btn-danger btn-xs removeButton'>
						<i className="fa fa-times"></i>
					</button>
					<div className='eventInfo' onClick={handleEvent} data-event-id={attendanceMod.get('event_id')}>
						<p>
							<span>
								Event:
							</span>
							{attendanceMod.get('title')}
						</p>
						<p>
							<span>
								Date:
							</span>
							{attendanceMod.get('date')}
						</p>
						<p>
							<span>
								Host:
							</span>
							{attendanceMod.get('hostName')}
						</p>
					</div>
				</div>
			</div>		
		)
	}
})



// Detail of Event
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
		this.state.foodListColl.fetchWithPromise().then(() => this.forceUpdate())
		this.state.userModel.fetchWithPromise().then(() => this.forceUpdate())
		this.state.guestList.fetchWithPromise().then(() => this.forceUpdate())

		BackboneFire.Events.on('pollForNewData',
			function(){
				console.log('poll heard, component updating...')
				component.state.event.fetchWithPromise().then(() => component.forceUpdate())
				component.state.guestList.fetchWithPromise().then(() => component.forceUpdate())
				component.state.foodListColl.fetchWithPromise().then(function(){
					component.forceUpdate()	
				})
			})
	},


	render:function(){

		return(
			<div className=''>
				<Header userModel={this.state.userModel}/>
				<NavBar/>
				<br/>
				<div className= 'container'>
					<EventDeets eventDeets={this.state.event}/>
					<div className='row'>
						<Guests guestList={this.state.guestList} eventID={this.state.event}/>
						<Food userModel={this.state.userModel} eventID={this.state.event.id} foodListColl={this.state.foodListColl}/>
					</div>
				</div>
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
			<div className='row eventDeets'>
				<div className='col-xs-4'>
					<span>DATE:</span>
					<br/>
					{event.get('date')}
				</div>
				<div className='col-xs-4'>
					<span>LOCATION:</span>
					<br/>
					{event.get('location')}
				</div>
				<div className='col-xs-4'>
					<span>Event:</span>
					<br/>
					{event.get('title')}
				</div>
			</div>
		)
	}
})


//Guests
var Guests = React.createClass({

	_handleAddGuest: function(evt){
		evt.preventDefault()
		var userEmail = this.refs.userEmail.value
		var eventID = this.props.eventID
		this.refs.userEmail.value = ''

		var searchForAttendance = new QueriedAttendance('email', userEmail)
		console.log('searchForAttendance', searchForAttendance)
		
		if (!searchForAttendance.models.id) {
			addGuestToEvent(userEmail, this.props.eventID)
		}
		else {
			swal( userEmail + 'has already been invited!')
		}

	},

	render:function(){
		var component = this
		var event = component.props.event

		var newUserEmail = ''
		var eventInfo = ''

		function _upDateGuestEmail(evt){
			evt.preventDefault()
			newUserEmail = evt.target.value
			// evt.target.value= ''
		}



		return(
			<div className='col-xs-12 col-sm-8 guests'>

				<form className='' data-id='newUserEmail'>
					<div className='inviteWrapper'>
						<label>Invite Guests Here</label>
						<br/>
						<input type='text' placeholder='email@host.com' 
						onChange={_upDateGuestEmail} data-id='event.id' ref={'userEmail'}/>
						<button data-id='newUserEmail' onClick={this._handleAddGuest} className='adduserbutton btn btn-primary btn-sm'>
							<i className="fa fa-user-plus" aria-hidden="true"></i>
						</button>
					</div>

				</form>

				<div>
					<GuestList eventID={this.props.eventID} guests={this.props.guestList} />
				</div>



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
				console.log('guest',guest)
				return (
					<div key={i} className='guestItem btn-default' data-container="body" data-toggle="popover" data-placement="left" data-content="Vivamus sagittis lacus vel augue laoreet rutrum faucibus.">
						<img src={guest.get('gravatarUrl')}/>
						<h3>{guest.get('userName')}</h3>
						<h5>{guest.get('email')}</h5>
					</div>
				)
			}
		})

	},

	render:function(){
		var component = this
		var guestsArr = this.props.guestList
		return(
			<div className='guestList '>
				{this._showGuests()}
			</div>
		)
	}
})

//Foods
var Food = React.createClass({
	
	foodItem:{
		food_name:'',
		food_quantity:'',
		bringer_uid:'0000',
		bringer_name:'Click to Select',
		event_id:''
	},

	componentDidMount:function(){
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
		evt.preventDefault()
		var component = this

		var foodListCollection = component.props.foodListColl
		var event_id = component.props.eventID
		component.foodItem.event_id = event_id
		
		var newFoodAdded = new BackboneFire.Model(component.foodItem)
		foodListCollection.create(newFoodAdded.attributes)
		console.log('foodListCollection', foodListCollection)
	},


	render: function(){

		return(
			<div className='col-xs-12 col-sm-4 bringThis'>
		
				<div className='foodAddWrapper'>
					<label>Add Item</label>
					<form className=''>
						<input type='text' id='foodName' required="required" placeholder='Bring This!' onChange={this._upDateFoodName}/>
						<input type='number' id='itemQ'required="required" placeholder='quantity' onChange={this._upDateItemQuantity}/>
						<i onClick={this._handleFoodItem} className="btn btn-primary btn-xs fa fa-shopping-cart"></i>
					</form>
				</div>

				<div>
				<FoodList userModel={this.props.userModel} foodListColl={this.props.foodListColl} eventID={this.props.eventID}/>
				</div>
				

			</div>
		)
	}
})

var FoodList = React.createClass({

	getInitialState: function () {
	    return {selected: false};
	},
	

	_handleFoodBringer:function(foodItem, evt){
		console.log('clicked targets model-foodItem',foodItem)
		// var foodItem = evt.currentTarget.dataset.fooditem_id
		var foodBringerName
		var event_id = this.props.eventID
		var userModel = this.props.userModel
				if (foodItem.get('bringer_name') === 'Click to Select') {
			selectMyFoods(foodItem, userModel, event_id )
		}
		this.state.selected = true

		
	},

	_removeFood: function(foodItem, evt){
		var listArr = this.props.foodListColl
		listArr.remove(foodItem)
		this.forceUpdate()
	},

	_handleChangeFoodQuant: function(foodItemMdl, evt){
		console.log('evt.currentTarget.dataset.foodquant_id', evt.currentTarget.dataset.foodquant_id)
		console.log('foodItemMdl', foodItemMdl)
		changeFoodAmount(foodItemMdl, evt)
	},



	_showFoodItems:function(){
		var divStyle = {}

		if (!this.state.selected){
			divStyle = {
				color:'rgba(255,175,75,1)'
			}
		} else if (this.state.selected) {
			divStyle = {
				color:'rgba(22, 160, 133,1)'
			}
		}
		

		var component = this
		var foodListArr = this.props.foodListColl
		return foodListArr.map(function(foodItem, i){
			if (foodItem.id) {
				return(
					<div className='foodItemWrapper '>
						<div className='foodItem' key={i} >
							<button  data-fooditem_id={foodItem.id}onClick={component._removeFood.bind(component, foodItem)} className='btn btn-danger btn-xs removeButton'>
								<i className="fa fa-times"></i>
							</button>


							<div style={divStyle} data-fooditem_id={foodItem.id} className='foodItemWrapper '>

								<span onClick={component._handleFoodBringer.bind(component, foodItem)} className='foodBringerName '>
								<button type="button" className="btn btn-default" data-container="body" data-toggle="popover" data-placement="left" data-content="Vivamus sagittis lacus vel augue laoreet rutrum faucibus." data-original-title="" title="">
									{foodItem.get('bringer_name')}
								</button>
									 is Bringing
								</span>


								<div className='lowerHalfFoodItem' >
									<div className='foodQuantityWrapper'>
										<i data-foodquant_id='minus' className="fa fa-minus-circle" onClick={component._handleChangeFoodQuant.bind(component, foodItem)} aria-hidden="true"></i>
										<span className='foodItemName'>
											{foodItem.get('food_quantity')}
										</span>
										
										<i data-foodquant_id='plus' className="fa fa-plus-circle" onClick={component._handleChangeFoodQuant.bind(component, foodItem)} aria-hidden="true"></i>

										<span className='foodName'>
											{foodItem.get('food_name')}
										</span>
									</div>
								</div>

							</div>

						</div>
						<br/>
					</div>
				)				
			}
		}) 
	},

	render:function(){

		return(
			<div className='foodListView'>
					{this._showFoodItems()}
			</div>
		)
	}
})


export {DashPage,SplashPage,CreateEvent,EventPage}