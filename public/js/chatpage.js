let socket = io()

let user = {
    name: document.querySelector('.userHeading').innerHTML,
    image: document.querySelector('.currentUserImage').src
}
let messages = []

if(!user.image.includes('.jpg')) {
    user.image = '/public/images/profile.jpg'
    document.querySelector('.currentUserImage').src = user.image
    document.querySelector('.show-on-small .sideNav').src = user.image
}


let text, to, msgHTML, listHTML, element


// Send init details
socket.emit('init', user)

document.querySelector('.material-icons').addEventListener('click', sendMessage)
document.addEventListener('keypress', (event) => {
    if(event.keyCode === 13) {
        sendMessage()
    }
})

// Sending messages
function sendMessage() {
    document.querySelector('#msgDiv > i').classList.add('animated', 'fadeOutRight')
    setTimeout(function () {
        document.querySelector('#msgDiv > i').classList.remove('animated', 'fadeOutRight')
    }, 1000);
    text = document.querySelector('#msgDiv > input').value
    to = document.querySelector('#to').textContent
    socket.emit('msg', {from: user.name, to, text, image: user.image})
    msgHTML = 
    `
    <div class="senderMessage"> 
    <p>
    ${text}
    <span>${new Date().getHours()}:${new Date().getMinutes()}</span>
    <i class="material-icons">done</i>
    </p>
    </div>
    `
    document.querySelector(`#${getIdName(to)}`).insertAdjacentHTML('beforeend', msgHTML)
    uptoTop(to, text)
    scrollToTop(getIdName(to))
    document.querySelector('#msgDiv > input').value = ""
}

let getIdName = (name) => {
    return name.split('.').join('').split(' ').join('')
}

// Receiving messages
var index = -1, panels = [], idName, i, names, list
socket.on('msg', data => {
    console.log(data)
    chooseDIV(data.name)
    msgHTML = 
    `
    <div class="threads">
    <img src="${data.image}">    
    <p>${data.text}
    <span>${new Date().getHours()}:${new Date().getMinutes()}</span>
    </p>
    </div>
    `
    document.querySelector(`#${getIdName(data.name)}`).insertAdjacentHTML('beforeend', msgHTML)
    document.querySelector('.friendsMenu .name').parentNode.querySelector('.lastMessage').style.color = 'rgb(153, 153, 153)';
    

    // And show last message
    uptoTop(data.name, data.text)

    scrollToTop(getIdName(data.name))

// // Storing messages in Browser
    //     // Pushing name
    // messages.forEach((item, i) => {
    //     if(data.name == item.name) {
    //         index = i
    //     }
    // })
    // if(index == -1) {
    //     messages.push({name: data.name, msgs: []})
    // }
    // index = messages.length - 1
    // console.log(messages)
    // // Pushing messages
    // messages[index].msgs.push(data.text)
    // console.log(messages)
    
    // Handling badges
})

function uptoTop(name, msg) {
    let elements = document.querySelectorAll(`.friendsMenu  p.name`)
    let poppedElement, elementLocation
    elements.forEach((item, i) => {
        if(item.textContent == name) {
            elementLocation = item.parentNode.parentNode.parentNode
            poppedElement = elementLocation.removeChild(elementLocation.children[i])
            elementLocation.insertBefore(poppedElement, elementLocation.childNodes[0])


            item.parentNode.querySelector('p.lastMessage').textContent = msg
        }
    })
}

// user lists
socket.on('list', data => {
    if(data.name != user.name) {
        let friendsMenu = document.querySelector('.friendsMenu')
        let div = `
        <li class="msg">
             <div class="hoverable friendCard">
                 <img src="${data.image}" alt="" class="rounded">
                 <p class="name">${data.name}</p>
                 <p class="lastMessage">Click here to start a chat.</p>
                 <p class="time">${new Date().getHours()}:${new Date().getMinutes()}</p>
                 <span class="badge" style="display: none">0</span>
             </div>
         </li>
        `
        friendsMenu.insertAdjacentHTML('afterbegin', div)

    }


    // // Clearing previously available lists
    // let lists = document.querySelectorAll('.friendsMenu > li')
    // lists.forEach(item => {
    //     item.remove()
    // })
    
    
    // // Adding new lists
    // listHTML = ''
    // data.forEach(item => {
        // // removing our list
    //     if(item.name === user.name) {
    //         return
    //     }


    //     element = `
    // <li class="">
    //     <div class="hoverable friendCard">
    //         <img src="${item.image}" alt="">
    //         <p class="name">${item.name}</p>
    //         <p class="lastMessage">Click here to start a chat.</p>
    //         <p class="time">${new Date().getHours()}:${new Date().getMinutes()}</p>
    //         <span class="badge" style="display: none">0</span>
    //     </div>
    // </li>
    // `
    //     listHTML = listHTML + element
        
    // })




    // document.querySelector('.friendsMenu').insertAdjacentHTML('beforeend', listHTML)
    // console.log('action made')
    
})

socket.on('removeList', data => {
    let friendsMenu = document.querySelectorAll('.friendsMenu p.name')
    friendsMenu.forEach(item => {
        if(item.textContent == data) {
            console.log('item removed')
            item.parentNode.remove()
        }

    })
})



// Selecting friend for chat
let selectFriend = (event) => {
    if (event.target.childElementCount === 0) {
        target = event.target.parentNode
    } else {
        target = event.target
    }
    divName = target.children[1].textContent
    chooseDIV(divName, openDiv, clearBadge)
    to = document.querySelector('#to').textContent
    socket.emit('seen', {
        from: user.name,
        to
    })

document.querySelector('.receiverName').style.color = 'white'

    document.querySelector('#receiver').style.display = 'inherit'
    document.querySelectorAll('.friendsMenu p.name').forEach(item => {
        let src
        if (to == item.textContent) {
            src = item.parentNode.querySelector('img').src
            document.querySelector('#receiver img').src = src
        }
    })
}
let target, chatDivs, divName, divs
document.querySelector('.friendsMenu').addEventListener('click', (event) => selectFriend(event))

function openDiv(names, divName) {

    divs = document.querySelectorAll('.messageBoard > .messages')
    divs.forEach(div => div.style.display = 'none')
    
    document.querySelector(`#${names}`).style.display = 'inline'
    document.querySelector('#to').textContent = divName
    // document.querySelector('.friendsMenu .name').parentNode.querySelector('.lastMessage').style.color = 'rgb(153, 153, 153)';
}

var friendsLists, badgeNum = 0, badgeElement
function chooseDIV(divName, callback, clearBadge) {
    // Divs handling for different users
    names = getIdName(divName)
    i = panels.indexOf(names)
    if (i != -1) {
        idName = panels[i]
    } else {
        panels.push(names)
        idName = panels.length - 1
        console.log(panels[idName])
        document.querySelector('.messageBoard').insertAdjacentHTML('beforeend',
            `<div id="${panels[idName]}" class="messages"></div>`)
        
        
        document.querySelector(`#${panels[idName]}`).style.display = 'none'
    }
    friendsLists = document.querySelectorAll('.friendCard > .name')
    if(callback) {
        callback(names, divName)
    } else {


        if(!isActiveDiv(names)) {
            friendsLists = document.querySelectorAll('.friendCard > .name')
            friendsLists.forEach(item => {
                if(item.textContent == divName) {
                    item.parentNode.classList.add('animated', 'flash')
                    setTimeout(function () {
                        item.parentNode.classList.remove('animated', 'flash')
                    }, 1000);
                    badgeElement = item.parentElement.childNodes[9]
                    badgeElement.classList.add('new', 'purple')
                    badgeNum = parseInt(badgeElement.textContent) 
                    if(badgeNum >= 0) {
                        badgeElement.style.display = 'inline'
                    }
                    badgeElement.textContent = ++badgeNum
                    document.querySelector('.online').classList.remove('hide')

                }
            })

        } 
        
    }
    if(clearBadge) {
        clearBadge(friendsLists)
    } 
}

function clearBadge(friendsLists) {
    friendsLists.forEach(item => {
        if (item.textContent == divName) {
            badgeElement = item.parentElement.childNodes[9]
            badgeElement.classList.remove('new', 'purple')
            badgeElement.textContent = 0
            badgeElement.style.display = 'none'
            document.querySelector('.online').classList.add('hide')
        }
    })
}


function isActiveDiv(name) {
    let ans = document.querySelector(`.messageBoard > #${name}`)
    if(ans == undefined || ans.style.display == 'none') {
        return false
    } else {
        socket.emit('seen', {
            from: user.name,
            to: document.querySelector('#to').textContent
        })
        return true
    }
}


// Typing status
let length
document.querySelector('#msgDiv > input').addEventListener('input', function(event) {
    to = document.querySelector('#to').textContent
    socket.emit('event', { from: user.name, to, event: 'typing' })
})

socket.on('event', data => {
    let eventElement = document.querySelectorAll('.friendCard > .name ')
    let element, val
    eventElement.forEach(item => {
        if(item.textContent == data.name) {
            element = item.parentNode.querySelector('.lastMessage')
            val = element.textContent
            element.textContent = 'typing...'
            item.parentNode.querySelector('.lastMessage').style.color = 'green'
            setTimeout(function () {
                if(element.textContent === 'typing...') {
                    element.textContent = val
                    element.style.color = 'rgb(153, 153, 153)'
                }
            }, 2000);
        }
    })
})

socket.on('seen', name => {
    div = document.querySelector(`.messageBoard > #${getIdName(name)}`)
    document.querySelectorAll('.senderMessage i').forEach(item => {
        item.textContent = 'done_all'
        item.style.color = 'rgb(7, 194, 7)'
    })
})

// for mobile off canvas menu

document.querySelector('.sideNav').addEventListener('click', () => {
    document.querySelectorAll('.friendsMen .msg').forEach(item => item.remove())
    document.querySelector('.friendsMen .frLists').insertAdjacentHTML('beforeend', document.querySelector('.friendsMenu').innerHTML)
})

document.querySelector('.friendsMen .frLists').addEventListener('click', event => {
    // document.querySelector('.sideNav').sideNav('hide')
    selectFriend(event)
})

// Scroll to top
function scrollToTop (name) {
    let scrollDiv = document.querySelector(`.messageBoard > #${name}`)
    scrollDiv.scrollTop = scrollDiv.scrollHeight
}

var oneClickFunction = (event) => {
    console.log('running')
    if (event.target.childElementCount === 0) {
        target = event.target.parentNode
    } else {
        target = event.target
    }
    divName = target.children[1].textContent
    let encodeURI = `player1=${user.name}&player2=${divName}`
    socket.emit('link', { from: user.name, to: divName, link: `/games?${encodeURI}`, image: user.image })
    document.querySelector('.friendsMenu').removeEventListener('click', oneClickFunction)
    document.querySelector('.frLists').removeEventListener('click', oneClickFunction)
    window.open(`/games?${encodeURI}`)
}


document.querySelector('.games2').addEventListener('click', () => {
    document.querySelector('.frLists').addEventListener('click', oneClickFunction)
})
document.querySelector('.games').addEventListener('click', () => {
    document.querySelector('.friendsMenu').addEventListener('click', oneClickFunction)
})


socket.on('link', data => {
    let link = `
    <div class="threads">
    <img src="${data.image}">    
    <h5>Lets play <b>Tic Tac Toe</b> online.</h5>
    <p>
    Click this link
    <a href="${data.link}" target="_blank">Tic tac toe game</a>
    <span>${new Date().getHours()}:${new Date().getMinutes()}</span>
    </p>
    </div>
    `
    chooseDIV(data.name)
    document.querySelector(`#${getIdName(data.name)}`).insertAdjacentHTML('beforeend', link)
    window.open(data.link)
})




