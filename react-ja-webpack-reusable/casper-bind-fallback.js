// Bind fallback
// http://stackoverflow.com/questions/25359247/casperjs-bind-issue

module.exports = function(casper){
	casper.on( 'page.initialized', function(){
		this.evaluate(function(){
			var isFunction = function(o) {
				return typeof o == 'function';
			};

			var bind,
				slice = [].slice,
				proto = Function.prototype,
				featureMap;

			featureMap = {
				'function-bind': 'bind'
			};

			function has(feature) {
				var prop = featureMap[feature];
				return isFunction(proto[prop]);
			}
			
			if (!has('function-bind')) {
				bind = function bind(obj) {
					var args = slice.call(arguments, 1),
						self = this,
						nop = function() {},
						bound = function() {
							return self.apply(this instanceof nop ? this : (obj || {}), args.concat(slice.call(arguments)));
						};
					nop.prototype = this.prototype || {};
					bound.prototype = new nop();
					return bound;
				};
				proto.bind = bind;
			}
		});
	});
}

