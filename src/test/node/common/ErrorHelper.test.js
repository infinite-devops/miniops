const chai = require("chai");
const assert = chai.assert;
const expect = chai.expect;
const ErrorHelper = require("../../../main/node/common/ErrorHelper.js");

describe("ErrorHelper", function () {
  it("should work", async function () {
    new ErrorHelper();//only for coverage
    var newError = ErrorHelper.reThrow("bar", new Error("foo") ).stack;
    expect(newError.includes("Error: bar")).to.eq(true)
    expect(newError.includes("Error: foo")).to.eq(true)

  });
});
