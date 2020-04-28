const SPEED = 0.8
const ACC = 0.1

function Blob (x, y, r, name) {
  this.name = name
  this.r = r
  this.pos = createVector(x, y)
  this.vel = createVector(0, 0)
  this.display = function () {
    fill(255)
    ellipse(this.pos.x, this.pos.y, this.r * 2, this.r * 2)
    textSize(NAME_SIZE)
    textAlign(CENTER)
    text(this.name, this.pos.x, this.pos.y + this.r * 2)
  }
  this.update = function () {
    var newVel = createVector(mouseX - width / 2, mouseY - height / 2)
    // newVel.div(50);
    // newVel.limit(3);
    newVel.setMag(SPEED)
    this.vel.lerp(newVel, ACC)
    this.pos.add(this.vel)
  }
  this.eats = function (xx, yy, rr) {
    var otherPos = createVector(xx, yy)
    var d = p5.Vector.dist(this.pos, otherPos)
    if (d < this.r + rr) {
      // Area = PI * r^2 (not based on just adding others radius)
      var sum = PI * sq(this.r) + PI * sq(rr)
      this.r = sqrt(sum / PI)
      // this.r += other.r * 0.1;
      return true
    }
    return false
  }
  this.constrain = function () {
    blob.pos.x = constrain(blob.pos.x, -worldWidth / 2, worldWidth / 2)
    blob.pos.y = constrain(blob.pos.y, -worldHeight / 2, worldHeight / 2)
  }
}
