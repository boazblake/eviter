import DOM from 'react-dom'
import fbRef from './fbref'
import BackboneFire from 'bbfire'
import React, {Component} from 'react'
import {createEvent, createUser, logUserIn, handleEvent, addInput, removeEventAttendance, addGuestToEvent, createFoodItemForEvent, selectMyFoods, changeFoodAmount, pollForNewData, numToMonth, countUnselectedFood, changePartySize} from './actions'
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
			<div className='row header'>
				<a href='#dash'> <h1 className='heading'>Shin-Dig.It</h1> </a>
				<div>
					{this._showUserProfile()}
					{this._showWelcomeMessage()}
				</div>
			</div>
		)
	}
})

var NavBar = React.createClass({

	getInitialState:function(){
		return {
			display:'none'
		}
	},

	_showDashButton:function(){
		var divStyle = {
			display:this.state.display
		}
		if (location.hash !=='#dash') {
			return (<a href='#dash' title='back to dashboard'>
						<i className='btn btn-lg btn-primary fa fa-reply fa-fw'></i>
						<p style={divStyle}>Back To Dashboard</p>
					</a>

			)
		} else {
			return ''
		}
	},

	_showEventTitle:function(){
		if (this.props.eventDeets) {
			return (
				<h2>
					{this.props.eventDeets.get('title')}
				</h2>
			)

		} else if (location.hash ==='#dash') {
			return (
				<h2>
					DASHBOARD
				</h2>
			)
		} else return (
			<h2>
				Create New Event
			</h2>
		)
		
	},


	render: function(){

		function _handleShowVerbage(){
			function _showVerbage(){
				console.log('divStyle.display', divStyle.display)
				if (divStyle.display === 'none') {
					console.log('divStyle.display', divStyle.display)
					return divStyle.display = 'block'

				} else if (divStyle.display === 'block') {
					console.log('divStyle.display', divStyle.display)
					return divStyle.display = 'none'
				}
			}

		}



		var divStyle = {
			display:this.state.display
		}

		return(
			<div className='navBar'>
				{this._showDashButton()}
				{this._showEventTitle()}
				<a href='#logout' title='logout' onMouseEnter={_handleShowVerbage()} onMouseLeave={_handleShowVerbage()}>
					<i className='btn btn-lg btn-primary fa fa-sign-out fa-fw'></i>
					<p style={divStyle}>LogOut</p>
				</a>
			</div>
		)
	}
})


var Footer = React.createClass({
	render: function(){
		return (
			<div className='row footer'>
				<h4 className='col-xs-12 col-sm-6 col-md-4'>&copy; Boaz Blake, {new Date().getFullYear()}</h4>
				<h5 className="col-xs-12 col-sm-6 col-md-4">
					Made at
					<a href='http://www.theironyard.com' target="_blank"><img className='logoY' src='http://landing.theironyard.com/images/home/tiy-logo.png'/></a>
					With <br/>
					<img className='logo' src='http://dab1nmslvvntp.cloudfront.net/wp-content/uploads/2014/10/1414676226react-logo.png'/>
					<img className='logo' src='http://file.mrbool.com/mrbool/articles/MuhammadAzamuddin/BackBoneEvents/BackBoneEvents01.png'/>
					<img className='logo' src='https://www.theironyard.com/content/dam/theironyard/icons/icon-FrontEnd-update.png'/>
					<img className='logo' src='http://www.raywenderlich.com/wp-content/uploads/2015/07/firebase-discs.png'/>
					<img className='logo' src='https://upload.wikimedia.org/wikipedia/en/4/4c/Sublime_Text_Logo.png'/>
				</h5>
				<div className='col-xs-12 col-sm-6 col-md-4 deetsWrapper'>
					<div className='deets'>
						<a href="mailto:boazblake@gmail.com"><i className="fa fa-envelope"></i></a>
						<h6>eMail me!</h6>
					</div>
					<div onclick="" className='deets'>
						<a target="_blank"  href='https://github.com/boazblake?tab=repositories'><i className="fa fa-github-square"></i></a>
						<h6>gitHub me!</h6>
					</div>
					<div className='deets'>
						<a target="_blank"  href='https://boazblake.github.io/portfolio'><i className="fa fa-book"></i></a>
						<h6>See My Work</h6>
					</div>
				</div>
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
		var usersEmail = evt.currentTarget.value
		this.userObj.email = usersEmail.toLowerCase()
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
				<form className='row form-group signUp' onSubmit={this._handleSubmit}>
					<fieldset>
						<legend className='panel-heading' ><h2>SIGN UP HERE</h2></legend>
						<div className='form-group form-inline'>
							<input required='required' className="form-control" type='text' id="focusedInput" placeholder='Enter email here' onChange={this._upDateEmail}/>
							<input required='required' className="form-control" type='password' placeholder='password' onChange={this._upDatePass}/><br/>
						</div>
						<div className='form-group form-inline'>
							<input required='required' className="form-control" type='text' placeholder='First name' onChange={this._firstName}/>
							<input required='required' className="form-control" type='text' placeholder='Last Name' onChange={this._lastName}/><br/>
						</div>
						<button className='btn btn-primary' >SIGN UP!</button>
					</fieldset>
				</form>
				<br/>
				<br/>

				<form className=' row form-group logIn' onSubmit={this._handleLogin}>
					<fieldset>
						<div className='form-group form-inline'>
							<legend className='panel-heading'><h2>LOG IN HERE</h2></legend>
							<input required='required' type='text' className="form-control" placeholder='Enter email here' onChange={this._upDateEmail}/>
							<input required='required' className="form-control" type='passWord' placeholder='password' onChange={this._upDatePass}/>
							<button className='btn btn-primary'>LOG IN</button>
						</div>
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
		console.log('authed user??', fbRef.getAuth().uid)
		this.state.userModel.fetchWithPromise().then(() => this.forceUpdate())

	},

	eventObj:{
		'title':'',
		'date':'',
		'location':'',
		'hostName':'',
		gravatarURL:'',
	},

	_upDateEventTitle:function(evt){
		this.eventObj.title = evt.target.value
	},

	_upDateEventDate:function(evt){
		var fullDate = evt.target.value

		var year = fullDate.substring(0,4)
		var month = numToMonth(fullDate.substring(5,7))
		var day = fullDate.substring(8,10)
		var time = fullDate.substring(11)
		var hour = time.substring(0,2)
		var min = time.substring(3)
		var amPM = 'PM'
		var newHour = (((parseInt(hour) + 11) % 12) + 1 )
		var newTime = newHour+':'+min

		if (hour <= 12 ) {
			amPM = 'AM'
		}

		var eventDate = day +' '+ month +' '+ year +' at ' + newTime + '' +amPM
		this.eventObj.date = eventDate
	},

	_upDateEventLocation:function(evt){
		this.eventObj.location = evt.target.value
	},

	_upDateEventName:function(evt){
		this.eventObj.name = evt.target.value
	},

	_submitEvent:function(evt){
		evt.preventDefault()
		console.log('submit evetn firred')
		this.eventObj.gravatarURL = fbRef.getAuth().password.profileImageURL
		var component = this
		var hostModel = new User(fbRef.getAuth().uid )
		hostModel.fetch()
		if (hostModel.id) {
			createEvent(component.eventObj, hostModel)
		} else {
			hostModel.on('sync', function(){
				createEvent(component.eventObj, hostModel)
			})
		}
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
						
						<input type='datetime-local' className='form-control' required="required" placeholder='Event Date ...' onChange={this._upDateEventDate}/>

						<input type='text' className='form-control' required="required" placeholder='Event Location...' onChange={this._upDateEventLocation}/>

			            <button className="btn btn-default btn-lg btn-block" onClick={this._submitEvent}>Create My Event! </button>
					</div>
				</form>
				<Footer/>
			</div>
		)
	}
})


//All Events
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

	 	var altImage = ''
	 	if (this.state.attendanceMods) {
	 		altImage = (
	 			<h1>CREATE NEW EVENT TO BEGIN</h1>
	 			)
	 	}



	 	return(
	 		<div className='row myEvents'>
	 			{}
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
	

	_removeAttendance: function(evt) {
		this.props.attendanceMod.destroy()
		console.log('this.props.attendanceMod', this.props.attendanceMod)
	},

	render:function(){
		var attendanceMod = this.props.attendanceMod
		// console.log('attendanceMod>>>>',attendanceMod)
		return(
			<div onclick='' className='col-xs-12 col-sm-6 col-md-4'>
				<div className='attendance btn-default'>
					<button data-id={attendanceMod.id} onClick={this._removeAttendance} className='btn btn-danger btn-xs removeButton'>
						<i className="fa fa-times"></i>
					</button>
					<div className='eventInfo' onClick={handleEvent} data-event-id={attendanceMod.get('event_id')}>
						<p>
							<strong>
								Event:
							</strong>
							{attendanceMod.get('title')}
						</p>
						<p>
							<strong>
								Date:
							</strong>
							{attendanceMod.get('date')}
						</p>
						<p>
							<strong>
								Host:
							</strong>
							{attendanceMod.get('hostName')}
							<img src={attendanceMod.get('hostGravatarURL')}/>
						</p>
					</div>
				</div>
			</div>		
		)
	}
})



// Event Page
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
			<div className='eventPageView'>
				<Header userModel={this.state.userModel}/>
				<NavBar eventDeets={this.state.event}/>
				<br/>
				<div className= 'container'>
					<EventDeets eventDeets={this.state.event} guestList={this.state.guestList} foodListColl={this.state.foodListColl}/>
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

		var guestListArray = this.props.guestList.models
		
		var foodListColl = this.props.foodListColl
		
		 var foodCount = countUnselectedFood(foodListColl)

		 function guestListNumber(){}

		return (
			<div className={'row alert alert-info eventDeets' /**/}>
				<div className='col-xs-12 col-sm-4 text-primary panel-info'>

					<div className='panel-heading'>
						<h3 className='panel-title'>DATE OF EVENT</h3>
					</div>

					<div className='panel-body'>
						{event.get('date')}
					</div>

				</div>

				<div className='col-xs-12 col-sm-4 text-primary panel-info'>

					<div className='panel-heading'>
						<h3 className='panel-title'>LOCATION</h3>
					</div>
				
					<div className='panel-body'>
						{event.get('location')}
					</div>

				</div>

				<div className='col-xs-12 col-sm-4 text-primary nav nav-pills'>
					<strong>TOTAL GUESTS ATTENDING</strong><span className='badge alert-success'>{guestListArray.length}</span>
					<br/>
					<br/>
					<strong>UNSELECTED ITEMS</strong><span className='badge alert-danger'>{foodCount.length}</span>
				</div>

			</div>
		)
	}
})


//Guests Section
var Guests = React.createClass({

	_handleAddGuest: function(evt){
		evt.preventDefault()

		var usersEmail = this.refs.userEmail.value
		var userEmail = usersEmail.toLowerCase()
		console.log('userEmail', userEmail)

		var eventID = this.props.eventID
		this.refs.userEmail.value = ''

		var searchForAttendance = new QueriedAttendance('email', userEmail)
		console.log('searchForAttendance', searchForAttendance)
		
		if (!searchForAttendance.models.id) {
			addGuestToEvent(userEmail, this.props.eventID)
		}
		else {
			alert( userEmail + ' has already been invited!')
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

				<form className='form-inline col' data-id='newUserEmail'>
					<div className='form-group inviteWrapper'>
						<label>Invite Guests Here</label><br/>
						<input className='form-control' id="inputEmail" type='text' placeholder='Enter email here' 
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
						
	// _removeAttendance: function(evt) {
	// 	this.props.attendanceMod.destroy()
	// 	console.log('this.props.attendanceMod', this.props.attendanceMod)
	// },
	
	_showGuests:function(){
		var component = this
		var guestsArr = this.props.guests
		return guestsArr.map(function(guest, i){
			if(guest.id) {
				component = guest

				return (
					<GuestItem key={i} guestModel={component} />
				)
			}
		})

	},

	render:function(){
		var component = this
		var guestsArr = this.props.guestList
		return(
			<div className='guestList '>
				{component._showGuests()}
			</div>
		)
	}
})

var GuestItem = React.createClass({
	
	getInitialState:function(){
		return {
			rotated:false
		}
	},

	componentWillMount:function(){
		// var component = this
		// 
	},

	_handleRotate:function(guest, evt){
		var guestId = guest.id
		console.log('guestId',guestId)

		if (this.state.rotated){
			return (
				this.setState({
					rotated:false
				})		
			)	
		} else {
			return (
				this.setState({
				rotated:true
				})
			)	
		}
	},

	_handlePartySize:function(attendanceModel, evt){
		console.log('attendanceModel', attendanceModel)
		console.log('evt', evt)
		changePartySize(attendanceModel, evt)
	},



	render:function(){


		var component = this

		var guest = component.props.guestModel

		if (this.state.rotated) {
			var divStyle = {
				transform:'rotateY(180deg)',
			}
			var divStyleBack = {
				transform:'rotateY(0deg)',
			}
		}
			return (
				<div onClick='' className='guestItem '>

					<button className='btn btn-danger btn-xs removeButton'>
						   <i className="fa fa-times"></i>
					</button>

					<div style={divStyle} className='guestSide frontOfGuest'>
							<img src={guest.get('gravatarURL')}/>
							<h3>{guest.get('userName')}</h3>
							<h5>{guest.get('email')}</h5>
					</div>

					<div style={divStyleBack} className='guestSide backOfGuest'>
						<div className='rsvpWrapper list-group'>
							<h3 className='panel-heading'>RSVP</h3>
							<h4>I am bringing</h4>
							<div className='partySize'>
								<div className='partSizeWarpper'>
									<i data-partyquant_id='minus' className="fa fa-arrow-down" onClick={component._handlePartySize.bind(component, guest)} aria-hidden="true"></i>
									<span className='badge guestName'>
										{guest.get('party_size')}
									</span>
									
									<i data-partyquant_id='plus' className="fa fa-arrow-up" onClick={component._handlePartySize.bind(component, guest)} aria-hidden="true"></i>
								</div>

							</div>
							<h4>guests</h4>
						</div>
					</div>

					<button onClick={component._handleRotate.bind(component, guest)}className='btn btn-success btn-xs revolveButton'>
						   <i className="fa fa-repeat" aria-hidden="true"></i>
					</button>


				</div>
			)
	}
})



//Foods Section
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
		evt.currentTarget.dataset.foodname_id = ''
		evt.currentTarget.dataset.foodq_id = '' 

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
		var eventID = this.props.eventID
		return(
			<div className='col-xs-12 col-sm-4 bringThis'>
		
				<div className='form-group foodAddWrapper'>
					<label>Add Items Here</label>
					<form className='form-horizontal' onSubmit={this._handleFoodItem}>
						<input type='text' data-foodname_id='foodName' required="required" className='form-control' placeholder='Bring This!' onChange={this._upDateFoodName}/>
						<input type='number' data-foodq_id='itemQ'required="required" className='form-control' placeholder='quantity' onChange={this._upDateItemQuantity}/>
						<h3 onClick={this._handleFoodItem} className="btn btn-primary btn-xs">PRESS TO ADD ITEMS</h3>
					</form>
				</div>

				<div className='foodListWrapper'>
				<FoodList userModel={this.props.userModel} foodListColl={this.props.foodListColl} eventID={eventID}/>
				</div>
				

			</div>
		)
	}
})

var FoodList = React.createClass({
	
	_showFoodItems:function(){
		
		var grav = ''
		var component = this
		var eventID = component.props.eventID
		var foodListArr = this.props.foodListColl
		return foodListArr.map(function(foodItem, i){
			if (foodItem.id) {
				return(
					<FoodItem key={i} foodModel={foodItem} userModel={component.props.userModel} eventID={component.props.eventID}/>
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

var FoodItem = React.createClass({
	
	_handleFoodBringer:function(foodItem, evt){
		var component = this
		console.log('clicked targets model-foodItem',foodItem)
		// var foodItem = evt.currentTarget.dataset.fooditem_id
		var foodBringerName
		var event_id = component.props.eventID
		var userModel = component.props.userModel


		if ( foodItem.get('bringer_uid') === fbRef.getAuth().uid ) {
			console.log('yes')
			
			 foodItem.set({
				bringer_name:'Click to Select',
				bringer_uid:'000',
				bringer_grav:''
			})

		pollForNewData()
		} 
			  

		else if (foodItem.get('bringer_name') === 'Click to Select') {
			selectMyFoods(foodItem, userModel, event_id )
		}
	},

	_removeFood: function(foodItem, evt){
		var component = this
		var listArr = component.props.foodListColl
		listArr.remove(foodItem)
		this.forceUpdate()
	},

	_handleChangeFoodQuant: function(foodItemMdl, evt){
		console.log('evt.currentTarget.dataset.foodquant_id', evt.currentTarget.dataset.foodquant_id)
		console.log('foodItemMdl', foodItemMdl)
		changeFoodAmount(foodItemMdl, evt)
	},



	render:function(){
		var component = this
		var foodItem = component.props.foodModel
		var userModel = component.props.userModel
		var eventID = component.props.eventID

		return (
			<div className='foodItemWrapper '>
				<div onclick="" className='foodItem' draggable="true" >
					<button  data-fooditem_id={foodItem.id}onClick={component._removeFood.bind(component, foodItem)} className='btn btn-danger btn-xs removeButton'>
						<i className="fa fa-times"></i>
					</button>


					<div data-fooditem_id={foodItem.id} className='foodItemWrapper '>
						<span onClick={component._handleFoodBringer.bind(component, foodItem)} className='foodBringerName '>
						<img src={foodItem.get('bringer_grav')}/>
						<button type="button" className="btn btn-default">
							{foodItem.get('bringer_name')}
						</button><br/>
							 is Bringing
						</span>


						<div className='lowerHalfFoodItem' >
							<div className='foodQuantityWrapper'>
								<i data-foodquant_id='minus' className="fa fa-arrow-down" onClick={component._handleChangeFoodQuant.bind(component, foodItem)} aria-hidden="true"></i>
								<span className='badge foodItemName'>
									{foodItem.get('food_quantity')}
								</span>
								
								<i data-foodquant_id='plus' className="fa fa-arrow-up" onClick={component._handleChangeFoodQuant.bind(component, foodItem)} aria-hidden="true"></i>

								<span className='foodName'>
									<h4>{foodItem.get('food_name')}</h4>
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


export {DashPage,SplashPage,CreateEvent,EventPage}