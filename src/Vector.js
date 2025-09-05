class Vector {
  div1;
  div2;
  side;
  color;

  constructor(div1, div2, side = null, color = null) {
    this.div1 = div1.id;
    this.div2 = div2.id;
    this.side = side;
    this.color = color;
  }
}

export { Vector };
