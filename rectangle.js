class Rectangle {

	constructor(x, y, width, height) {	
		this._x = x;
		this._y = y;
		this._width = width;
		this._height = height;
	}
	
	get x() {
		return this._x;
	}
	
	get y() {
		return this._y;
	}
	
	get right() {
		return this._x + this._width;
	}
	
	get left() {
		return this._x;
	}
	
	get bottom() {
		return this._y + this._height;
	}
	
	get top() {
		return this._y;
	}
	
	get width() {
		return this._width;
	}
	
	get height() {
		return this._height;
	}
	
}
	
	