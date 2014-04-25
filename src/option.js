var ins
var Option = {
	init: function() {
		ins = $(".option > input")
		ins.each(function (i) {
			this.value = gd(this.name)
		})
	},
	save: function () {
		ins.each(function() {
			s(this.name, this.value)
		})
		id("rez").innerText = "Setting is saved."
	},
	reset: function() {
		ins.each(function() {
			var v = Default[this.name]
			s(this.name, v)
			this.value = v
		})
		id("rez").innerText = "Setting is reset."
	}
}


document.addEventListener('DOMContentLoaded', function () {
	Option.init()
	$("#save").click(Option.save)
	$("#reset").click(Option.reset)
});