import { io } from "socket.io-client";
import inquirer from "inquirer";
import chalk from "chalk";
import chalkAnimation from 'chalk-animation'
// import {title} from './components/title.js'




const sleep = (ms=2000)=>{ return new Promise((resolve)=>setTimeout(resolve,ms))}

// ---------------------------------------------------------------------

// async function welcome(){
//     const rainbowTitle = chalkAnimation.rainbow(
//         'HO HO NEW PROJECT WITH TERMINAL CLI\n'
//     );
//     await sleep(2000);
//     console.log('HIII');
//     // rainbowTitle.stop();
//     console.log(chalk.green('Welcome to the Terminal Chat!'));
// }

// await welcome()

// ---------------------------------------------------------------------

const socket = io('http://localhost:3000');

// GET INFO------
let playerName;
let roomId;
let roomChat = [];


async function askName(){
    const answers = await inquirer.prompt({
        name:'player_name',
        type:'input',
        message:'What is your name?',
        default(){
            return 'anonymous'
        },
    })
    playerName = answers.player_name;
}

await askName();

// ---------------------------------------------------------------------
// Choices Functions
// Set Choicess-----------------------------

async function choices(){
    const answers = await inquirer.prompt({
        type:'list',
        name:'choice',
        message:'What do you want to do?',
        choices:[
            'Join Room',
            'Create Room',
            'Send Message',
            'Read Message',
            'Leave Room',
            'Exit'
        ]
    })
    const choice = answers.choice;

    if(choice == 'Join Room'){
        // Join ROOM
        joinRoom()
    }else if(choice == 'Create Room'){
        // Create ROOM
        createRoom()
    }else if(choice == 'Send Message'){
        // Send Message
        sendMessage()
    }else if(choice == 'Read Message'){
        // Read Message
        readMessage()

    }else if(choice == 'Leave Room'){
        // Leave Room
        leaveRoom();
    }else if(choice == 'Exit'){
        // Exit
        console.log(`${chalk.bgRed('Exiting ....')}`);
        process.exit(0)
    }
    
}

choices()

// -------------------------------------------------------------------
// ----------------------------Join ROom-------------------------------

async function joinRoom(){
    if(roomId){
        console.log(`${chalk.bgRed('You are already in a room with ID - ' + roomId)}`);
    }
    const answers = await inquirer.prompt({
        type:'input',
        name:'room_id',
        message:'Enter room id (type "exit" to quit || Press Enter To Return):'
    })
    const room_id = answers.room_id;
    if(room_id == ''){
        choices()
    }else{
        roomId = room_id;
        socket.emit('join-room',{playerName,roomId})
        sendMessage();
    }
}

// -----------------------------------Create Room --------------------------

async function createRoom(){
    if(roomId) leaveRoom();
    const answers = await inquirer.prompt({
        type:'input',
        name:'room_id',
        message:'Enter Room-ID To Create Room || Press Enter To Return:'
    })
    const room_id = answers.room_id;
    if(room_id == ''){
        choices()
    }else{
        roomId = room_id;
        socket.emit('join-room',{playerName,roomId})
        console.log(`${chalk.bgBlue("Room Created With ID-"+ roomId)}`);
        sendMessage()
    }
}

// -----------------------------Leave Room-----------------------------------
async function leaveRoom(){
    roomId = null;
}

// ---------------------Read Message-----------------------------------------

async function readMessage(){
    if(roomChat.length == 0){
        console.log(`${chalk.bgRed('No messages to read')}`);
        await sleep(1000);
        choices()
    }else{
        roomChat.forEach((data)=>{
            console.log(`${chalk.bgGreen(data.playerName)} : ${data.message}`);
        })
        const answers = await inquirer.prompt({
            type:'list',
            name:'choice',
            message:'What do you want to do?',
            choices:[
                'Send Message',
                'Read Message',
                'Leave Room',
                'Exit'
            ]
        });
        const choice = answers.choice;
        if(choice == 'Send Message'){
            // Send Message
            sendMessage()
        }else if(choice == 'Read Message'){
            // Read Message
            readMessage()
        }else if(choice == 'Leave Room'){
            // Leave Room
        }else if(choice == 'Exit'){
            // Exit
            console.log(`${chalk.bgRed('Exiting ....')}`);
            process.exit(0)
        }
        // choices()
    }
}

// -----------------------Send Message----------------------------------------

async function sendMessage(){
    const answers = await inquirer.prompt({
        type:'input',
        name:'message',
        message:'Enter message (type "exit" to quit || Press Enter To Return):'
    })
    const message = answers.message;
    if(message == ''){
        choices()
    }else{
        const data = {
            playerName,
            message
        }
        
        socket.emit('message',data)
        sendMessage()
    }
}

// -------------------------Receive Message From Server On ChatRoom----------------------------

socket.on('message-received',(data)=>{
    // console.log(`${chalk.bgGreen(data.playerName)} : ${data.message}`);
    // THis is Data
    // { playerName, message: `${playerName} Joined The Room` }
    roomChat.push(data)
    // console.log('\n');
    // console.log(roomChat);
})

// ---------------------Receive Joined USER Chat  on Client----------------------------------------------

socket.on('joined-room',(data)=>{
    // console.log(`${chalk.bgGreen(data.playerName)} : ${data.message}`);
    roomChat.push(data)
    // console.log(roomChat);
})


// -----------------------------------------------------------------------------------------------------------
