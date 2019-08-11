var assert = require("assert");
let chai = require("chai");
let chaiHttp = require("chai-http");
let server = require("../app");
let should = chai.should();

chai.use(chaiHttp);
describe("Purchase Order", function () {

  var issuedPO = null;

  it("Should Issue PO", (done) => {

    var pos = [
      { "supplierId": "CHEESECO", "itemType": "CHEESE", "qty": 20, "uom": "kg" },
      { "supplierId": "DOUGHCO", "itemType": "DOUGH", "qty": 50, "uom": "kg" }
    ];

    chai.request(server)
      .post("/purchase-order/")
      .send(pos)
      .end((err, res) => {
        res.should.have.status(201);
        issuedPO = res.body.data;
      })
      console.log("apiGatewayControllerTest : issuedPO = "+JSON.stringify(issuedPO));

    done()
  })

  it ("Should Fetch Purchase Order by Id", (done)=>{
    var poId = "15651739533332126315895899462";
      chai.request(server)
          .get("/purchase-order/"+poId)
          .end((err, result)=>{                    
              result.should.have.status(200)
              console.log("Fetched PO using /purchase-order/:poId : ", result.body)
              done()
          })
  })

  it ("Should Fetch PO ids", (done)=>{
      chai.request(server)
          .get("/purchase-order/")
          .end((err, result)=>{
              result.should.have.status(200);
              console.log ("Got",result.body.data.length, " docs")

              done()
          })
  })


})