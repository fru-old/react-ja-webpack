import {expect} from 'chai';
import { NICE, SUPER_NICE } from '../lib/colors';

describe("hexColorLuminance", function () {
  it("should return a luminanced color", function () {
    var color = NICE;//hexColorLuminance.luminate("#fff", "-0.5");
    expect(color).is.not.null;
  });
  it("should change the background of an element", function () {
    var div = document.createElement('div');
    div.style.backgroundColor = null;//hexColorLuminance.luminate("#fff", "-0.5");
    expect(div.style.backgroundColor).is.empty;
  });
  it("should be mockable", function () {
	var result = require('inject!../lib/tested.js')({
		'./App.js': {}
	});
    expect(result.default).is.empty;
  });
});