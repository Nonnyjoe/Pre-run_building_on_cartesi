// XXX even though ethers is not used in the code below, it's very likely
// it will be used by any DApp, so we are already including it here
const { ethers } = require("ethers");
const { BigNumber } = require('ethers');

const rollup_server = process.env.ROLLUP_HTTP_SERVER_URL;
console.log("HTTP rollup_server url is " + rollup_server);

emitNotice = async (data) => {
  let hexresult = numberToHex(data);
  console.log(`Hexresult: ${hexresult}`)
  advance_req = await fetch(rollup_server + "/notice", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ payload: hexresult }),
  });
  return advance_req;
}

emitReport = async(e) => {
  console.log("error is:", e);
 console.log(`Adding notice with binary value "${payload}"`);
 await fetch(rollup_server + "/report", {
   method: "POST",
   headers: {
     "Content-Type": "application/json",
   },
   body: JSON.stringify({ payload: payload }),
 });
 return "reject";
}

// convert string to hex
function stringToHex(str) {
  let hex = "";
  for (let i = 0; i < str.length; i++) {
    const charCode = str.charCodeAt(i).toString(16);
    hex += charCode.padStart(2, '0'); // Ensure each byte is represented by two characters
  }
  return `0x${hex}`;
}

function dec2Hex(dec) {
  return `0x${Math.abs(dec).toString(16)}`;
}

function numberToHex(number) {
  const bigNumber = ethers.toBeHex(number);
  return bigNumber;
}

async function handle_advance(data) {
  console.log("Received advance request data " + JSON.stringify(data));

  const payload = data.payload;
  console.log('payload...', payload);
  const payloadStr = ethers.toUtf8String(payload);
  console.log('payloadStr', payloadStr);
  JsonPayload = JSON.parse(payloadStr);
  console.log('JsonPayload', JsonPayload);

  try {
    if (JsonPayload.function == "add") {
        let response = JsonPayload.arg1 + JsonPayload.arg2;
        console.log('response add', response);
        emitNotice(response);

    } else if (JsonPayload.function == "sub") {
      let response = JsonPayload.arg1 - JsonPayload.arg2;
      console.log('response sub', response);
      emitNotice(response);
    } else if (JsonPayloads.function == "div") {
      let response = JsonPayload.arg1 / JsonPayload.arg2;
      console.log('response div', response);
      emitNotice(response);
    } else if (JsonPayloads.function == "mul") {
      let response = JsonPayload.arg1 * JsonPayload.arg2;
      console.log('response mul', response);
      emitNotice(response);
    } else {
      console.log("function not recognized")
    }
  } catch(e) {
    console.log(e);
  }




  return "accept";
}

async function handle_inspect(data) {
  console.log("Received inspect request data " + JSON.stringify(data));
  return "accept";
}

var handlers = {
  advance_state: handle_advance,
  inspect_state: handle_inspect,
};

var finish = { status: "accept" };

(async () => {
  while (true) {
    const finish_req = await fetch(rollup_server + "/finish", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: "accept" }),
    });

    console.log("Received finish status " + finish_req.status);

    if (finish_req.status == 202) {
      console.log("No pending rollup request, trying again");
    } else {
      const rollup_req = await finish_req.json();
      var handler = handlers[rollup_req["request_type"]];
      finish["status"] = await handler(rollup_req["data"]);
    }
  }
})();
