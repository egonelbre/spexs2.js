var SPEXS = {};
(function(exports){
	"use strict";
	exports.Search = Search;

	// Search contains searching state
	function Search(conf){
		this.dataset = conf.dataset;
		this.input = conf.input || [];
		this.output = conf.output || [];
		this.extender = conf.extender;
		this.canExtend = conf.canExtend;
		this.canOutput = conf.canOutput || conf.canExtend;
		this.postprocess = function(q){};
	}

	// Search.run the whole search.
	Search.prototype.run = function(){
		var S = this;
		S.input.push(Query.start(S.dataset));
		while(S.input.length > 0){
			var q = S.input.pop();
			S.step(q);
			S.postprocess(q);
		}
	};

	// Search.step extends a single query
	Search.prototype.step = function(q){
		var S = this;
		var steps = S.extender.extend(S.dataset, q.positions);
		for(var i = 0; i < steps.length; i += 1){
			var step = steps[i],
				c = q.child(step);
			if(S.canExtend(c)){
				S.input.push(c);
				if(S.canOutput(c)){
					S.output.push(c);
				}
			}
		}
	};

	exports.Query = Query;
	// Query represents a pattern, which ends at "positions"
	function Query(pattern, positions){
		this.dataset = null;
		this.pattern = pattern;
		this.positions = positions;
	}

	// Query.start returns the initial query for a dataset
	Query.start = function(dataset){
		var q = new Query([], dataset.positions());
		q.dataset = dataset;
		return q;
	};

	// Query.child creates a new child query from the parent
	Query.prototype.child = function(step){
		var pattern = this.pattern.slice();
		pattern.push(step.token);
		var q = new Query(pattern, step.positions);
		q.dataset = this.dataset;
		return q;
	};

	// Query.toString returns the patterns string representation
	Query.prototype.toString = function(){
		var ds = this.dataset,
			r = "";
		for(var i = 0; i < this.pattern.length; i += 1){
			r += this.pattern[i];
		}
		return r;
	};

	exports.Step = Step;
	// Step represents a possible extension to a query
	function Step(token, positions){
		this.token = token;
		this.positions = positions;
	}

	function merge(left, right){
		var into = [];
		if(left.length == 0){
			into.push.apply(into, right);
			return into;
		}
		if(right.length == 0){
			into.push.apply(into, left);
			return into;
		}

		var rlast = 0;
		for(var li = 0; li < left.length; li += 1){
			var lv = left[li];
			for(var ri = rlast; ri < right.length; ri += 1){
				var rv = right[ri];
				if(lv < rv){
					break;
				}
				into.push(rv);
				rlast++;
			}
			into.push(lv);
		}

		into.push.apply(into, right.slice(rlast));
		return into;
	}

	Step.prototype.merge = function(right){
		this.positions = merge(this.positions, right.positions);
	};
})(SPEXS);