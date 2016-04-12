import fbRef from './fbref'
import {User, Users, Event, Events, Attendances, Attendance, EventFinder, fbUrl, QueryByEmail} from './data'

export function createEvent(eventObj) {
	var data = {
		...eventObj,
		sender_id: fbRef.getAuth().uid
	}
	console.log('eventObj',eventObj)

	console.log('this is the data>>>>', data)
	let events = new Events(),
		a = new Attendances()

	let {id:event_id} = events.create(data)
	events.once('sync', function() {
		let {id:attendance_id} = a.create({user_uid: data.sender_id, event_id, title:eventObj.title, date:eventObj.date})
		a.once('sync', () => {
			location.hash = 'dash'
		})
	})
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

export function addGuestToEvent(obj){

	console.log('obj',obj)

	var queriedUsers = new QueryByEmail(obj.email)
	var user = queriedUsers

	queriedUsers.once('sync', function( ){
		if( user.models[0].id ){
			var userData = user.models[0]
			console.log('userData', userData)
			var attendList = new Attendances()
			attendList.create({
				event_id: obj.eventData.id,
				sender_uid: obj.eventData.get('sender_uid'),
				date: obj.eventData.get('date'),
				title:obj.eventData.get('title'),
				user_uid:userData.get('id'),
				userName:userData.get('firstName') + ' ' + userData.get('lastName')
			})
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
		var event_id = evt.currentTarget.id
		console.log('event_id',event_id)
		location.hash = 'event/' + event_id
}

export function removeEventAttendance(evt){
	console.log(evt.currentTarget)
	console.log('eventID>>>>', evt.currentTarget.getAttribute('data-id'))
	console.log('userID>>>>', fbRef.getAuth().uid)

	var eventID = evt.currentTarget.getAttribute('data-id')
	var userId = fbRef.getAuth().uid


	var removeUrl = `https://eviter.firebaseio.com/attendance/${eventID}/`

	console.log(removeUrl)
	var removeEvent = new Firebase(removeUrl)

	var onComplete = function(error) {
	  if (error) {
	    console.log('Synchronization failed');
	  } else {
	    console.log('Synchronization succeeded');
	  }
	};
	removeEvent.remove(onComplete);
}

