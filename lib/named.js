"use strict";

function NamedDataset(datasets){
	this.full = "";
	this.seq = [];
	this.seqdataset = [];
	this.datasets = Object.keys(datasets);

	var seqidx = 0;
	for(var datasetname in datasets){
		var dataset = datasets[datasetname];
		for(var i = 0; i < dataset.length; i++){
			this.full += dataset[i] + "\x00";
			for(var k = 0; k < dataset[i].length; k++){
				this.seq.push(seqidx);
			}
			this.seq.push(seqidx);
			this.seqdataset.push(datasetname);
			seqidx += 1;
		}
	}
}

NamedDataset.prototype.occurrences = function(positions){
	var count = {};
	for(var i = 0; i < this.datasets.length; i++){
		count[this.datasets[i]] = 0;
	}

	for(var i = 0; i < positions.length; i++){
		var pos = positions[i];
		var seq = this.seq[pos];
		var dataset = this.seqdataset[seq];
		count[dataset]++;
	}
	return count;
};

NamedDataset.prototype.positions = function(){
	var result = [];
	for(var i = 0; i < this.full.length; i += 1){
		if(this.full.charCodeAt(i) != 0){
			result.push(i);
		}
	}
	return result;
};

NamedDataset.prototype.walk = function(position){
	var next = this.full.charCodeAt(position);
	if(next !== 0){
		var token = this.full.charAt(position);
		return new SPEXS.Step(token, [position+1]);
	}
	return null;
};