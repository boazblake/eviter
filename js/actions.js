import fbRef from './fbref'
import {User, Users, Event, Events, Attendances, Attendance, UserSearch} from './data'

export function createEvent(eventObj) {

	var data = {
		...eventObj,
		sender_id: fbRef.getAuth().uid
	}

	let events = new Events(),
		a = new Attendances()

	let {id:event_id} = events.create(data)

	events.once('sync', function() {
		let {id:attendance_id} = a.create({ user_id: data.sender_id, event_id, title:eventObj.title, date:eventObj.date })
		a.once('sync', () => {
			location.hash = 'dash'
		})
	})
}

// Helper Functions
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
                id: authData.uid,
            })
            logUserIn(userObj)
        }
    })
}

export function addGuest(){
	var newGuest = new UserSearch(eventObj.guestName)
	
	newGuest.fetch()
	newGuest.on('sync', function(){

		var guestID = newGuest.models[0].get('id')
		var EventObjectsColl = new EventObjects(guestID)
		EventObjectsColl.create({
			content: eventObj,
			sender_email: fbRef.getAuth().password.email,
			sender_id: fbRef.getAuth().uid,
			sender_name:eventObj.firstName + eventObj.lastName
		})
		// storing events sent	
		EventObjectsColl.on('sync', function(){
			var inviteModels = EventObjectsColl.models.filter(function(m){ return m.get('id') })
			var mostRecentInvite = inviteModels[ inviteModels.length - 1 ]
			
			var receivedEventColl = new EventObjects(fbRef.getAuth().uid)
			
			receivedEventColl.create(mostRecentInvite.toJSON() )
			// this.forceUpdate()
		})
		
	})
	location.hash='dash'
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
		location.hash = 'event/' + event_id
	}