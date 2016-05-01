import fbRef from './fbref'
import {User, Users, Event, Events, Attendances, Attendance, EventFinder, fbUrl, QueryByEmail, QueriedAttendance, FoodsToBring, AddFood} from './data'
import BackboneFire from 'bbfire'

import {_currentUserData} from './app.js'

export function countUnselectedFood(foodListColl){
	var noGhostList = foodListColl.filter(function(model, i){
		 return model.id
	})

	var foodCount = noGhostList.filter(function(foodMdl){
			return (foodMdl.get('bringer_name') === "Click to Select")
	})
	return foodCount
}

export function numToMonth(month) {
	var monthArray = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
	return monthArray[month - 1]
}

export function pollForNewData(){
	console.log('polling for new data')
	setTimeout(function(){
		BackboneFire.Events.trigger('pollForNewData')
	}, 1000)
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
		if (foodItemMdl.get('food_quantity') > 0) {
			foodItemMdl.set({
				food_quantity:parseInt(foodItemMdl.get('food_quantity')) - 1
			})
		}
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
		bringer_grav:foodBringerMdl.get('gravatarURL'),
		bringer_uid: foodBringerMdl.id,
		bringer_name:foodBringerMdl.get('firstName') + ' ' + foodBringerMdl.get('lastName')
	})
	console.log('foodItmModel', foodItmModel)


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
	console.log('data', data)

	eventModel.once('sync', function() {
	
		var attendanceObj = {
			event_id: eventModel.id,
			sender_id: eventModel.get('host_id'),
			date: eventModel.get('date'),
			title:eventModel.get('title'),
			user_uid:hostModel.get('id'),
			userName:hostModel.get('firstName') + ' ' + hostModel.get('lastName'),
			email: hostModel.get('email'),
			hostName:eventModel.get('hostName'),
			hostGravatarURL:data.gravatarURL,
			gravatarURL:data.gravatarURL,
			party_size:'0'
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
        	
			BackboneFire.Events.trigger('updateComponent')
			pollForNewData()
            
            var p = new Promise(function(res,rej) {
            	logUserIn(userObj, res)
            })
            
            p.then(function(pData) {
            	console.log('userMod + auth data on signup...', pData)

        		let users = new Users()
        		users.create({
        			id: pData.authData.uid,
        	        firstName: pData.userObj.firstName,
        	        lastName: pData.userObj.lastName,
        	        email: pData.userObj.email,
        	        gravatarURL :  pData.authData.password.profileImageURL
        	   	})
         
            	//add gravatr to user object???
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

			var evtPlusUsrObj = {
				event_id: evtModel.id,
				sender_id: evtModel.get('host_id'),
				date: evtModel.get('date'),
				title:evtModel.get('title'),
				user_uid:recipientUserModel.get('id'),
				userName:recipientUserModel.get('firstName') + ' ' + recipientUserModel.get('lastName'),
				email: recipientUserModel.get('email'),
				hostName:evtModel.get('hostName'),
				hostGravatarURL:evtModel.get('gravatarURL'),
				gravatarURL:recipientUserModel.get('gravatarURL'),
				party_size:'0',
			}

			createAttendanceForEvt(evtPlusUsrObj)
		} else{
			alert('no match for ', recipientEmail)
		}

			console.log('evtPlusUsrObj ', evtPlusUsrObj)

		pollForNewData()

	})	
}

export function changePartySize(attendanceModel, evt){
	console.log('evt.currentTarget.dataset.partyquant_id', evt.currentTarget.dataset.partyquant_id)
	console.log('attendanceModel', attendanceModel)
	var buttonPressed = evt.currentTarget.dataset.partyquant_id

	if (buttonPressed === 'plus') {
		attendanceModel.set({
			party_size:parseInt(attendanceModel.get('party_size')) + 1
		})
	} else if (buttonPressed === 'minus') {
		if (attendanceModel.get('party_size') > 0) {
			attendanceModel.set({
				party_size:parseInt(attendanceModel.get('party_size')) - 1
			})
		}
	}
	attendanceModel.save()
	// BackboneFire.Events.trigger('updateComponent')
	pollForNewData()
}

export function displayPartySize(allGuestsColl){
	console.log('allGuestsColl',allGuestsColl)
	var totalGuests = new Number()
		var allPlusOnes = allGuestsColl.map(function(guest){
			if (guest.id) {
				console.log("guest.get('party_size')", guest.get('party_size'))
				totalGuests += parseInt(guest.get('party_size'))
				return  totalGuests
			}
		})
			return totalGuests
			pollForNewData()
	

	//>>> 3
	//[0]
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


	if (!evtPlusUsrObj.event_id)  {alert("obj missing event_id"); return}
	if (!evtPlusUsrObj.sender_id)  {alert("obj missing sender_id"); return}
	if (!evtPlusUsrObj.date)  {alert("obj missing date"); return}
	if (!evtPlusUsrObj.title)  {alert("obj missing title"); return}
	if (!evtPlusUsrObj.user_uid)  {alert("obj missing user_uid"); return}
	if (!evtPlusUsrObj.userName)  {alert("obj missing userName"); return}
	if (!evtPlusUsrObj.email)  {alert("obj missing email"); return}
	if (!evtPlusUsrObj.hostName)  {alert("obj missing hostName"); return}
	if (!evtPlusUsrObj.gravatarURL)  {alert("obj missing gravatarURL"); return}
	if (!evtPlusUsrObj.hostGravatarURL)  {alert("obj missing hostGravatarURL"); return}
	if (!evtPlusUsrObj.party_size)  {alert("obj missing party_size"); return}

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
				res({
					authData: authData, 
					userObj: userObj
				})
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
	console.log(evt.currentTarget)
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