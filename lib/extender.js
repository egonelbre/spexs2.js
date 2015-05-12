"use strict";
var Extender = {};
(function(exports){
	function extend(dataset, positions){
		var stepByToken = {};
		for(var i = 0; i < positions.length; i += 1){
			var step = dataset.walk(positions[i]);
			if((step == null) || (step.positions.length == 0)){
				continue;
			}

			var coll = stepByToken[step.token];
			if(coll){
				coll.positions.push.apply(coll.positions, step.positions);
			} else {
				stepByToken[step.token] = step;
			}
		}

		return stepByToken;
	}

	function combine(stepByToken, dataset, groups){
		for(var i = 0; i < groups.length; i += 1){
			var group = groups[i];

			var step = new SPEXS.Step(group.token, []);
			var tokensMerged = 0;
			for(var k = 0; k < group.tokens.length; k += 1) {
				var token = group.tokens[k];
				if(stepByToken.hasOwnProperty(token)){
					step.merge(stepByToken[token]);
					tokensMerged++;
				}
			}

			if((tokensMerged > 1) && (step.positions.length > 0)){
				stepByToken[step.token] = step;
			}
		}
	}

	function starPosition(dataset, stepByToken, p){
		var todo = [p];
		while(todo.length > 0){
			var next = dataset.walk(todo.pop());
			if((next == null) || (next.positions.length == 0)){ continue }
			todo.push.apply(todo, next.positions);
			
			var coll = stepByToken[next.token];
			if(coll){
				coll.positions.push.apply(coll.positions, next.positions);
			} else {
				stepByToken[next.token] = next;
			}
		}
	}

	function star(dataset, positions){
		var lastPosition = NaN;
		var stepByToken = {};
		for(var i = 0; i < positions.length; i += 1){
			var p = positions[i];
			if(p < lastPosition){ continue; }
			lastPosition = starPosition(dataset, stepByToken, p);
		}
		return stepByToken;
	}

	function gstarPosition(dataset, stepByToken, p){
		var todo = [p];
		var largest = {};
		while(todo.length > 0){
			var next = dataset.walk(todo.pop());
			if((next == null) || (next.positions.length == 0)){ continue }
			todo.push.apply(todo, next.positions);
		
			for(var i = 0; i < next.positions.length; i += 1){
				var p = next.positions[i];
				if(!(largest[next.token] > p)){
					largest[next.token] = p;
				}
			}
		}

		for(var token in largest){
			if(largest.hasOwnProperty(token)){
				var coll = stepByToken[token];
				if(coll){
					coll.positions.push(largest[token]);
				} else {
					stepByToken[token] = new SPEXS.Step(token, [largest[token]]);
				}
			}
		}
	}

	function gstar(dataset, positions){
		var lastPosition = NaN;
		var stepByToken = {};
		for(var i = 0; i < positions.length; i += 1){
			var p = positions[i];
			if(p < lastPosition){ continue; }
			lastPosition = gstarPosition(dataset, stepByToken, p);
		}
		return stepByToken;
	}

	function unwrap(stepByToken, prefix) {
		prefix = prefix || "";
		var r = [];
		for(var token in stepByToken){
			var step = stepByToken[token];
			step.token = prefix + step.token;
			r.push(step);
		}
		return r;
	}

	// Regular extends with token found from dataset.
	exports.Regular = Regular;
	function Regular(){}
	Regular.prototype.extend = function(dataset, positions) {
		return unwrap(extend(dataset, positions));
	};

	exports.Group = Group;
	function Group(groups){
		this.groups = groups;
	}

	Group.prototype.extend = function(dataset, positions){
		var simple = extend(dataset, positions);
		combine(simple, dataset, this.groups);
		return unwrap(simple);
	};

	exports.Star = Star;
	function Star(){}

	Star.prototype.extend = function(dataset, positions){
		var simple = extend(dataset, positions);
		var stars = star(dataset, positions);
		simplify(simple, stars);
		return unwrap(simple).concat(unwrap(stars, ".*"));
	};

	exports.Regex = Regex;
	function Regex(groups){
		this.groups = groups;
	}

	Regex.prototype.extend = function(dataset, positions){
		var simple = extend(dataset, positions);
		combine(simple, dataset, this.groups);

		var stars = star(dataset, positions);
		combine(stars, dataset, this.groups);

		simplify(simple, stars);
		return unwrap(simple).concat(unwrap(stars, ".*"));
	};


	exports.GreedyStar = GreedyStar;
	function GreedyStar(){}

	GreedyStar.prototype.extend = function(dataset, positions){
		var simple = extend(dataset, positions);
		var stars = gstar(dataset, positions);
		simplify(simple, stars);
		return unwrap(simple).concat(unwrap(stars, ".*"));
	};

	exports.GreedyRegex = GreedyRegex;
	function GreedyRegex(groups){
		this.groups = groups;
	}

	GreedyRegex.prototype.extend = function(dataset, positions){
		var simple = extend(dataset, positions);
		combine(simple, dataset, this.groups);

		var stars = gstar(dataset, positions);
		combine(stars, dataset, this.groups);

		simplify(simple, stars);
		return unwrap(simple).concat(unwrap(stars, ".*"));
	};

	function simplify(simple, stars){
		for(var token in stars){
			if(stars.hasOwnProperty(token)){
				var starred = stars[token]
				var other = simple[token];
				if(other && (other.positions.length >= starred.positions.length)){
					delete(stars, token);
				}
			}
		}
	}
})(Extender);