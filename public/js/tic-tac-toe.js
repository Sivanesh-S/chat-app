let socket = io()
var i;
for(i = 1; i <= 9; i++) {
  document.querySelector('#b' + i).src = "";
}

var ans = 'x', xwin = 0, owin = 0, gameInit = 'x', matches = 0

var xo = [undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, ];

// Inits
if(gameInit == 'x') {
  document.querySelector('.x').innerHTML = "X's turn";
} else {
  document.querySelector('.o').innerHTML = "0's turn";
}
document.getElementById('restart-game').style.display = 'none'


document.querySelector('.grid-inline').addEventListener('click', selector)

function selector (event) {
  var n = event.target.id.slice(1, 2);
  var i;
  if (0 < n && n < 10) {
    // UI

    if (xo[n] == null) {
      document.querySelector('#b' + n).src = 'public/images/' + ans + '.png';
      xo[n] = ans;

      // Turn Changer UI
      if (ans === '0') {
        document.querySelector('.x').innerHTML = "X's turn";
        document.querySelector('.o').innerHTML = "O";
      } else {
        document.querySelector('.o').innerHTML = "O's turn";
        document.querySelector('.x').innerHTML = "X";
      }

      // Manipulations

      // Answer
      var winner = validateAnswer();
      // Answer to UI
      if (winner === 'x') {
        document.querySelector('.x').innerHTML = "X is <br> the Winner";
        document.querySelector('.x').style.color = "yellowgreen"
        document.getElementById('winsLeft').textContent = ++xwin
        gameOver()
      } else if (winner === '0') {
        document.querySelector('.o').innerHTML = "O is <br> the Winner";
        document.querySelector('.o').style.color = "yellowgreen"
        document.getElementById('winsRight').textContent = ++owin

        gameOver()
      }

      ans === 'x' ? ans = '0' : ans = 'x';

    }

  }

  checkLost()


}

function checkLost() {
  let count = 0
  for(let i = 1; i < xo.length; i++) {
    if(xo[i] == undefined) {
      count++
    }
  }
  if(count === 0) {
    gameOver()
  }
  count = 0
}

function validateAnswer() {
  // Horizontal Check
  for(i = 1; i <= 7; i = i + 3) {
    if(xo[i] == ans && xo[i + 1] == ans && xo[i + 2] == ans) {
      console.log('won');
      return ans;
    }
  }

  // Vertical Check
  for(i = 1; i <= 3; i++) {
    if(xo[i] == ans && xo[i + 3] == ans && xo[i + 6] == ans) {
      console.log('won');
      return ans;
    }
  }

  // Diagonals Check
  if(xo[1] == ans && xo[5] == ans && xo[9] == ans || xo[3] == ans && xo[5] == ans && xo[7] == ans) {
    console.log('won diagonally');
    return ans;
  }
}

function gameOver() {
  document.getElementById('restart-game').style.display = 'inherit'
  document.querySelector('.grid-inline').removeEventListener('click', selector)
}

document.getElementById('restart-game').addEventListener('click', () => {
  document.getElementById('restart-game').style.display = 'none'
  document.querySelectorAll('.x, .o').forEach(item => item.style.color = 'white')

  document.querySelector('.grid-inline').addEventListener('click', selector)
  xo = [undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined,];
  for(let i = 1; i < 10; i++) {
    document.getElementById(`b${i}`).src = ""
  }

  document.querySelector('.o').textContent = '0'
  document.querySelector('.x').textContent = 'X'
  gameInit == 'x' ? gameInit = '0': gameInit = 'x'

  // Matches count
  document.querySelector('#matches').textContent = ++matches


  if (gameInit == 'x') {
    document.querySelector('.x').innerHTML = "X's turn";
  } else {
    document.querySelector('.o').innerHTML = "0's turn";
  }
})

// Socket dealings
