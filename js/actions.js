import fbRef from './fbref'
import {User, Users, Event, Events, Attendances, Attendance, EventFinder, fbUrl, QueryByEmail, QueriedAttendance} from './data'

export function createEvent(eventObj, hostName) {
	var data = {
		...eventObj,
		sender_id: fbRef.getAuth().uid,
		hostName:hostName
	}
	// console.log('eventObj',eventObj)
	// console.log('hostName',hostName)
	// console.log('this is the data>>>>', data)

	var events = new Events()

	var eventModel = events.create(data)

	// console.log('eventModel', eventModel)
	// console.log('eventid', eventModel.id)

	var attendanceObj = {
		date:eventModel.get('date'),
		title:eventModel.get('title'),
		hostName:hostName,
		user_uid:fbRef.getAuth().uid
	}	

	// console.log('eventid', eventModel.id)

	eventModel.once('sync', function() {
		// console.log('eventid', eventModel.id)
	
		attendanceObj.event_id = eventModel.id
		var attendances = new Attendances()
		var attendanceModel = attendances.create(attendanceObj)
		// console.log('attendanceModel', attendanceModel)
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
        	let users = new Users()
        	users.create({
        		id: authData.uid,
                firstName: userObj.firstName,
                lastName: userObj.lastName,
                email: userObj.email,
            })
            logUserIn(userObj)
        }
    })
}

export function addGuestToEvent(recipientEmail, evtModel){

	console.log('evtModel : ',evtModel)

	var queriedUsers = new QueryByEmail(recipientEmail)
	var user = queriedUsers

	queriedUsers.once('sync', function( ){
		if( user.models[0].id ){
			var recipientUserModel = user.models[0]
			console.log('userData : ', recipientUserModel)
			var attendList = new Attendances()
			console.log("evt mofdel", evtModel)
			attendList.create({
				event_id: evtModel.id,
				sender_id: evtModel.get('sender_id'),
				date: evtModel.get('date'),
				title:evtModel.get('title'),
				user_uid:recipientUserModel.get('id'),
				userName:recipientUserModel.get('firstName') + ' ' + recipientUserModel.get('lastName'),
				email: recipientUserModel.get('email')
			})
		} else{
			alert('no match for ', recipientEmail)
		}

	})	
}

export function logUserIn(userObj){
	fbRef.authWithPassword({
		email:userObj.email,
		password:userObj.passWord
	}, function(err, authData){
		if (err) {
			alert(err)
			return
		} else {
			location.hash = 'dash'
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
	};
	removeEvent.remove(onComplete);
}