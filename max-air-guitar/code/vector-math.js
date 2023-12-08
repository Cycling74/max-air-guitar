function cross() {
	var args = arrayfromargs(arguments);
	var v1 = args.slice(0, 3);
	var v2 = args.slice(3, 6);
	var a = vec3_cross(v1, v2);
	outlet(0, a[0], a[1], a[2]);
}

function project_perpendicular() {
	var args = arrayfromargs(arguments);
	var v1 = args.slice(0, 3);
	var v2 = args.slice(3, 6);
	var a = vec3_dot(v1, v2);
	var dd = vec3_dot(v2, v2);
	var v1a = vec3_mul_scalar(v1, a / dd);
	var perp = vec3_sub(v1a, v2);
	outlet(0, perp[0], perp[1], perp[2]);
}
	
function angle_between() {
	var args = arrayfromargs(arguments);
	var v1 = args.slice(0, 3);
	var v2 = args.slice(3, 6);
	v1 = vec3_normalize(v1);
	v2 = vec3_normalize(v2);
	var dp = vec3_dot(v1, v2);
	outlet(0, Math.acos(dp));
}

///---- Some simple vec-math ----///
function vec3_mul_scalar(vec, s) {
	return [vec[0] * s, vec[1] * s, vec[2] * s];
}

function vec3_length(vec) {
	var x=vec[0];
	var y=vec[1];
	var z=vec[2];
	var v = x*x + y*y + z*z;

	if(v != 0)
		return Math.sqrt(v);
	else 
		return v;
}

function vec3_add(vec1, vec2) {
	var x1=vec1[0];
	var y1=vec1[1];
	var z1=vec1[2];
	
	var x2=vec2[0];
	var y2=vec2[1];
	var z2=vec2[2];		
	var res = new Array();
	res.push(x1+x2);
	res.push(y1+y2);
	res.push(z1+z2);
	return res;
}

function vec3_sub(vec1, vec2) {
	var x1=vec1[0];
	var y1=vec1[1];
	var z1=vec1[2];
	
	var x2=vec2[0];
	var y2=vec2[1];
	var z2=vec2[2];		
	var res = new Array();
	res.push(x1-x2);
	res.push(y1-y2);
	res.push(z1-z2);
	return res;
}

function vec3_cross (v1, v2)
{
	var temp = new Array();

	temp[0] = (v1[1] * v2[2]) - (v1[2] * v2[1]);
	temp[1] = (v1[2] * v2[0]) - (v1[0] * v2[2]);
	temp[2] = (v1[0] * v2[1]) - (v1[1] * v2[0]);
	
	return temp;
}

function vec3_dot (v1,v2)
{
	return v1[0]*v2[0] + v1[1]*v2[1] + v1[2]*v2[2];
}

function radtodeg (angle) {
  return angle * (180 / Math.PI);
}


function vec3_normalize(v) {
	var mag = Math.sqrt(vec3_dot(v, v));
	return [v[0] / mag, v[1] / mag, v[2] / mag];
}