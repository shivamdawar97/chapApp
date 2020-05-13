const users = []

// addUser, removeUser, getUser, getUsersInRoom

const addUSer = ({id,username,room}) => {
    
    //validate the data
    if(!username || !room) return { error: 'Username and room are required!' }
    
    //Clean the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    //Checking for existing user
    const existingUser = users.find(user=> {
        return user.room === room && user.username === username
    }) 

    if(existingUser) return { error: 'Username is already in user!' }

    //Store User

    const user = { id, username, room}
    users.push(user)

    return { user }
}


const removeUser = id => users.splice(users.findIndex( user => user.id === id),1)[0]

const getUser = id => users.find(user=> user.id === id) 

const getUsersInRoom = room => users.filter( user => user.room === room)

module.exports = {
    addUSer, removeUser, getUsersInRoom, getUser
}