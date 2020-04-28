function play () {
  var x = document.getElementById('GUI')
  if (x.style.display === 'none') {
    x.style.display = 'block'
  } else {
    x.style.display = 'none'
    name = document.getElementById('myText').value
    playerCreated = true
  }
}
