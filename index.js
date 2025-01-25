const io = require('socket.io')(8800,{
    cors : {
        origin: '*'
    }
})
const axios = require('axios')

let activeUsers = []

io.on('connection',(socket)=>{

    //Add new USer
    socket.on('add-new-user',(newUserId)=>{
        if(newUserId != null){
            if(!activeUsers.some((user)=>user.userId === newUserId)){
                activeUsers.push({
                    userId: newUserId,
                    socketId : socket.id
                })
            }
        }
        io.emit('get-users', activeUsers)
    })

    //send message
    socket.on('send-message',(data)=>{
        const {recieverId} = data
        const user = activeUsers.find((user)=> user.userId === recieverId )
        console.log('sending socket to :',recieverId)
        console.log('Data :',data);
        if(user){
            io.to(user.socketId).emit('recieve-message',data)
        }
    })

    //Disconnect users
    socket.on('disconnect',async()=>{
        console.log(activeUsers)
        activeUsers.map((user)=>{
            let requestBody = {
                id: user?.userId,
                lastseen: {
                    date: new Date().toLocaleDateString('en-GB',{day:'2-digit',month:'2-digit',year:'numeric'}),
                    time: new Date().toLocaleTimeString('en-US',{timeZone:'Asia/Kolkata',hour:'2-digit',minute:'2-digit',hour12:true})
                }
            }
            const result = axios.post('https://chatapplication-htk5.onrender.com/api/lastseen',requestBody)
        })
        activeUsers = activeUsers.filter((user)=> user.socketId !== socket.id)
        console.log('user Disconnected',activeUsers);
        io.emit('get-users',activeUsers)
        io.emit('lastseen-time',new Date().toLocaleString())
    })

})