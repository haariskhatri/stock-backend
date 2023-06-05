const nodemailer = require('nodemailer')

const sendMail = (email, tradeId, type, stock, units, transac, amount) => {

    var ordertype;

    var transaction;

    if (transac == 'credit') {
        transaction = 'Credited'
    }
    else {
        transaction = 'Debited'
    }

    var transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            user: 'kishancoc99@gmail.com',
            pass: 'ibhqkbqskwqfwjqc'
        }

    });

    if (type == 0) {
        ordertype = 'Buy'
    }
    else {
        ordertype = 'Sell'
    }

    var mailOptions = {
        to: email,
        subject: "Order Update",
        text: 'Hello to myself!',
        html: `<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2 ; background-color:#000; color:#fff">
        <div style="margin:50px auto;width:70%;padding:20px 0">
          <div style="border-bottom:1px solid #eee">
            <a href="http://localhost:4000/" style="font-size:1.4em;color: #0abb92;text-decoration:none;font-weight:600">Trade Trek</a>
          </div>
          <p style="font-size:1.1em">Hi,</p>
          <div style='color:#ffffff'>
          
          <p style = "color : #ffffff">Your ${ordertype} Order has been executed for ${stock} of ${units} shares. <br> 
          The Transaction Id for your Order is ${tradeId} . Your Account has been ${transaction} with Rs ${amount}.
          </p>
          </div>
          <p style="font-size:0.9em;">Regards,<br />Trade Trek Pvt Ltd</p>
          <hr style="border:none;border-top:1px solid #eee" />
          <div style="float:right;padding:8px 0;color:#fff;font-size:0.8em;line-height:1;font-weight:300">
            <p>Trade Trek</p>
            <p>The Capital</p>
            <p>Ahmedabad</p>
          </div>
        </div>
      </div>`
    };
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return error;
        }
        else {
            return 200;
        }
    });
}

module.exports = sendMail;