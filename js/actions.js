import fbRef from './fbref'
import {User, Users, Event, Events, Attendances, Attendance, EventFinder, fbUrl, QueryByEmail, QueriedAttendance, FoodsToBring, AddFood} from './data'
import BackboneFire from 'bbfire'

import {_currentUserData} from './app.js'

export function pollForNewData(){
	console.log('polling for new data')
	setTimeout(function(){
		BackboneFire.Events.trigger('pollForNewData')
	}, 500)
}

export function changeFoodAmount(foodItemMdl, evt){
	console.log('evt.currentTarget.dataset.foodquant_id', evt.currentTarget.dataset.foodquant_id)
	console.log('foodItemMdl', foodItemMdl)
	var buttonPressed = evt.currentTarget.dataset.foodquant_id

	if (buttonPressed === 'plus') {
		foodItemMdl.set({
			food_quantity:parseInt(foodItemMdl.get('food_quantity')) + 1
		})
	} else if (buttonPressed === 'minus') {
		foodItemMdl.set({
			food_quantity:parseInt(foodItemMdl.get('food_quantity')) - 1
		})
	}
	foodItemMdl.save()
	// BackboneFire.Events.trigger('updateComponent')
	pollForNewData()
}


export function selectMyFoods(foodItmModel, foodBringerMdl, eventID){
	console.log('foodBringerMdl', foodBringerMdl)
	console.log('foodItmModel', foodItmModel)
	console.log('eventID', eventID)

 
	foodItmModel.set({
		bringer_uid: foodBringerMdl.id,
		bringer_name:foodBringerMdl.get('firstName') + ' ' + foodBringerMdl.get('lastName')
	})
	pollForNewData()
}

export function createEvent(eventObj, hostModel) {
	var data = {
		...eventObj,
		host_id: fbRef.getAuth().uid,
		hostName: hostModel.get('firstName') + ' ' + hostModel.get('lastName')
	}

	var events = new Events()
	var eventModel = events.create(data)

	console.log('eventModel', eventModel)

	eventModel.once('sync', function() {
	
		var attendanceObj = {
			event_id: eventModel.id,
			sender_id: eventModel.get('host_id'),
			date: eventModel.get('date'),
			title:eventModel.get('title'),
			user_uid:hostModel.get('id'),
			userName:hostModel.get('firstName') + ' ' + hostModel.get('lastName'),
			email: hostModel.get('email'),
			hostName:eventModel.get('hostName')
		}
		
		console.log('attendanceObj', attendanceObj)



		createAttendanceForEvt(attendanceObj)
		// BackboneFire.Events.trigger('updateComponent')
		pollForNewData()
	})

	location.hash = 'dash'
}

export function createUser(userObj) {
    fbRef.createUser({
        email: userObj.email,
        password: userObj.passWord
    },
    function(err, authData) {
        if (err) {
        	console.log(err)
        	return
        } else {
        	
        	// var gravatar = fbRef.getAuth().password.profileImageURL
        	// console.log('fbRef',fbRef.getAuth().password.profileImageURL)
        	// console.log('gravatar',gravatar)
        	let users = new Users()
        	users.create({
        		id: authData.uid,
                firstName: userObj.firstName,
                lastName: userObj.lastName,
                email: userObj.email,
                // gravatar:authData.password.profileImageURL
            })
			BackboneFire.Events.trigger('updateComponent')
			pollForNewData()
            var p = new Promise(function(res,rej) {
            	logUserIn(userObj,res)
            })
            p.then(function(authData) {
            	console.log(authData)
            })
        }
    })
}

export function addGuestToEvent(recipientEmail, evtModel){

	console.log('evtModel', evtModel)

	var queriedUsers = new QueryByEmail(recipientEmail)
	var user = queriedUsers

	console.log('user', user)

	queriedUsers.on('sync', function( ){
		if( user.models[0].id ){
			var recipientUserModel = user.models[0]
			console.log('queried email result:  : ', recipientUserModel)

			var attDataObj = {
				event_id: evtModel.id,
				sender_id: evtModel.get('host_id'),
				date: evtModel.get('date'),
				title:evtModel.get('title'),
				user_uid:recipientUserModel.get('id'),
				userName:recipientUserModel.get('firstName') + ' ' + recipientUserModel.get('lastName'),
				email: recipientUserModel.get('email'),
				hostName:evtModel.get('hostName'),
			}

			createAttendanceForEvt(attDataObj)
		} else{
			alert('no match for ', recipientEmail)
		}
		pollForNewData()

	})	
}

export function createAttendanceForEvt(evtPlusUsrObj){
	// REQUIRES
	//-----------
		// event_id: 
		// sender_id: 
		// date: 
		// title:	
		// user_uid:
		// userName:
		// email: 
		// hostName:
	console.log('evtPlusUsrObj', evtPlusUsrObj)


	if (!evtPlusUsrObj.event_id)  {console.log("obj missing event_id"); return}
	if (!evtPlusUsrObj.sender_id)  {console.log("obj missing sender_id"); return}
	if (!evtPlusUsrObj.date)  {console.log("obj missing date"); return}
	if (!evtPlusUsrObj.title)  {console.log("obj missing title"); return}
	if (!evtPlusUsrObj.user_uid)  {console.log("obj missing user_uid"); return}
	if (!evtPlusUsrObj.userName)  {console.log("obj missing userName"); return}
	if (!evtPlusUsrObj.email)  {console.log("obj missing email"); return}
	if (!evtPlusUsrObj.hostName)  {console.log("obj missing hostName"); return}

	var attendList = new Attendances()
	attendList.once('sync', function(){
		
		attendList.create(evtPlusUsrObj)

	})
}

export function logUserIn(userObj,res){
	fbRef.authWithPassword({
		email:userObj.email,
		password:userObj.passWord
	}, function(err, authData){
		if (err) {
			alert(err)
			return
		} else {
			location.hash = 'dash'
			if (res) {
				res(authData)
			}
		}
	})
}

export function getMyEvents(){
	var uid = fbRef.getAuth().uid,
		// user = Users.find(uid)
		events = new User(uid)

	return events
}

export function handleEvent(evt){
		var event_id = evt.currentTarget.getAttribute('data-event-id')
		// console.log('event_id',event_id)
		location.hash = 'event/' + event_id
}

export function removeAttendance(evt){
	// console.log(evt.currentTarget)
	// console.log('eventID>>>>', evt.currentTarget.getAttribute('data-id'))
	// console.log('userID>>>>', fbRef.getAuth().uid)

	var eventID = evt.currentTarget.getAttribute('data-id')
	var userId = fbRef.getAuth().uid


	var removeUrl = `https://eviter.firebaseio.com/attendance/${eventID}/`

	// console.log(removeUrl)
	var removeEvent = new Firebase(removeUrl)

	var onComplete = function(error) {
	  if (error) {
	    // console.log('Synchronization failed');
	  } else {
	    // console.log('Synchronization succeeded');
	  }
		// BackboneFire.Events.trigger('updateComponent')
		pollForNewData()

	};
	removeEvent.remove(onComplete);
}