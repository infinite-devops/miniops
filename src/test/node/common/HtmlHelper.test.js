const chai = require("chai");
const assert = chai.assert;
const expect = chai.expect;
const HtmlHelper = require("../../../main/node/common/HtmlHelper.js");

describe("HtmlHelper", function () {
  it("should work", async function () {
    var htmlHelper = new HtmlHelper();
    console.log(htmlHelper.createTableFromObject({
        foo:"value1",
        bar:"value2"
    }))

  });
});
