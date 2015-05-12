"use strict";

function StringsDataset(strs){
	this.full = "";
	this.seq = [];
	this.strs = strs;

	for(var i = 0; i < strs.length; i++){
		this.full += strs[i] + "\x00";
		for(var k = 0; k < strs[i].length; k++){
			this.seq.push(i);
		}
		this.seq.push(i);
	}
}

StringsDataset.prototype.positions = function(){
	var result = [];
	for(var i = 0; i < this.full.length; i += 1){
		if(this.full.charCodeAt(i) != 0){
			result.push(i);
		}
	}
	return result;
};

StringsDataset.prototype.walk = function(position){
	var next = this.full.charCodeAt(position);
	if(next !== 0){
		var token = this.full.charAt(position);
		return new SPEXS.Step(token, [position+1]);
	}
	return null;
};