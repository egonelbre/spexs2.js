"use strict";

var spexs = require("./spexs.js");
var strings = require("./strings.js");
var extender = require("./extender.js");

var dataset = new strings.Dataset([
	"ACGT",
	"CGATA",
	"AGCTTCGA",
	"GCGTAA",
	"GCGTTA"
]);

var groups = [
	{token: "[CG]", tokens: ["C", "G"]},
	{token: "[AT]", tokens: ["A", "T"]}
	//{token: "?", tokens: ["[CG]", "[AT]"]}
];

var search = new spexs.Search({
	dataset: dataset,
	extender: new extender.Regex(groups),
	canExtend: function(q){
		return q.positions.length > 5;
	},
	canOutput: function(q){
		return (q.positions.length > 5) && (q.pattern.length >= 2);
	}
});

search.run();

search.output.sort(function(a,b){ return a.positions.length - b.positions.length; })
for(var i = 0; i < search.output.length; i += 1){
	var q = search.output[i];
	console.log(q.toString(), q.positions.length);
}