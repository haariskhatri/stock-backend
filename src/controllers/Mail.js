const nodemailer = require('nodemailer');
const { getTradesOfUser } = require('./User');

var transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: 'kishancoc99@gmail.com',
        pass: 'ibhqkbqskwqfwjqc'
    }

});



const tradeMail = async (userId) => {

    const trades = await getTradesOfUser(userId);

    const tradesHtml = trades
        .map((ele, index) => `
    <tr>
        <td>${index + 1}</td>
        <td>${ele.stock}</td>
        <td>${ele.priceLimit}</td>
        <td>${ele.shares}</td>
        <td>${ele.shares * ele.priceLimit}</td>
        <td>${ele.date}</td>
        <td>${ele.sellerId == userId ? 'sell' : 'buy'}</td>
    </tr>
  `)
        .join('');

    const html = `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mail</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet"
        integrity="sha384-9ndCyUaIbzAi2FUVXJi0CjmCapSmO7SnpJef0486qhLnuZ2cdeRhO02iuK6FUUVM" crossorigin="anonymous">
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"
        integrity="sha384-geWF76RCwLtnZ8qwWowPQNguL3RmwHVBC9FhGdlKrxdiJJigb/j/68SIy3Te4Bkz"
        crossorigin="anonymous"></script>

    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        integrity="sha512-iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOJyj7Yy7tcenmpD1ypASozpmT/E0iPtmFIB46ZmdtAc9eNBvH0H/ZpiBw=="
        crossorigin="anonymous" referrerpolicy="no-referrer" />



    <style>
        .top {
            background-color: #1e2232;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 25px;
            padding: 20px 0px;
            margin-bottom: 20px;
        }

        .top img {
            max-width: 50px;
        }

        .content {
            line-height: 30px;
            padding-bottom: 20px;
        }

        .regards {
            padding-bottom: 30px;
        }

        .order-type {
            text-transform: uppercase;
            font-weight: 500;
        }

        .sharename {
            font-weight: 500;
        }

        .totals {
            display: flex;
            flex-direction: column;
            align-items: end;
            margin-right: 20px;
            margin-bottom: 30px;
        }

        .footer {
            background-color: #1e2232;
            color: white;
            padding: 30px;
        }

        .footer-section {
            border-bottom: 1px solid rgba(211, 206, 206, 0.3);
            padding-top: 20px;
            padding-bottom: 30px;
            margin-bottom: 20px;
        }

        .footer .container .row img {
            width: 45px;
        }

        .footer-logo {
            display: flex;
            column-gap: 10px;
            align-items: center;

        }

        .footer-logo-title {
            font-size: 30px;
            font-weight: 500;
        }

        .footer-address {
            padding-top: 20px;
            font-weight: 500;
        }

        .footer-icons {
            display: flex;
            column-gap: 20px;
            padding-top: 10px;
        }

        .footer-icons i {
            color: white;
            font-size: 25px;

        }
    </style>


</head>



<body>

    <div class="top">
        <img src="./Logo.png" alt="trade-trek logo">
        <div>
            Trade Trek
        </div>
    </div>

    <div class="container">
        <div class="content">
            Dear Customer,<br />

            Thank you for choosing Trade Trek for your trading. We value your presence at TradeTrek. <br />

            Please find below your trades for the day.<br />
        </div>
        <div class="regards">
            Regards, <br />
            Team TradeTrek
        </div>

        <div class="trades table-responsive">
            <table class="table">
                <thead>
                    <tr>
                        <th>Serial </th>
                        <th>Share</th>
                        <th>Price</th>
                        <th>Quantity</th>
                        <th>Amount</th>
                        <th>Time</th>
                        <th>Type</th>
                    </tr>
                </thead>

                <tbody>
                    ${tradesHtml}
                </tbody>


            </table>
        </div>

        <div class="row">

            <div class="col-md-6">

            </div>

            <div class="col-md-6">
                <div class="totals">
                    <div>Total Spent : Rs 250</div>
                    <div>Profits : Rs 250</div>
                    <div>Loss : Rs 0</div>
                </div>
            </div>
        </div>
    </div>

    <div class="footer">
        <div class="container">

            <div class="footer-section">
                <div class="row">
                    <div class="col-md-3">
                        <div class="footer-logo">
                            <img src='Logo.png' alt="" />
                            <div class='footer-logo-title'>TradeTrek</div>
                        </div>
                        <div class="footer-address">
                            The Capital <br />
                            A 404/ 405 <br />
                            Science City Rd <br />
                            Sola, Ahmedabad, Gujarat - 380060 <br />
                        </div>
                        <div class="footer-icons">
                            <i class="fa-brands fa-facebook"></i>
                            <i class="fa-brands fa-twitter"></i>
                            <i class="fa-brands fa-linkedin"></i>
                        </div>
                    </div>
                    <div class="col-md-3">
                    </div>
                    <div class="col-md-3"></div>
                    <div class="col-md-3"></div>
                </div>
            </div>
        </div>
        <div class="container">

            <div class="copyright-section">

                &copy;
                2023-2026 TradeTrek. All rights reserved , Built with in India

            </div>

        </div>
    </div>
    </div>
</body>

</html>`

    var mailOptions = {
        to: 'haarishkkhatri@gmail.com',
        subject: "Trade Update",
        text: 'Hello to myself!',
        html: html
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


const otpMail = (email, otp) => {

    var mailOptions = {
        to: email,
        subject: "OTP for Tradetrek Account",
        text: 'Hello to myself!',
        html: `<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2 ; background-color:black ; color:white">
        <div style="margin:50px auto;width:70%;padding:20px 0">
            <div style="border-bottom:1px solid #eee">
                <a href="" style="font-size:1.4em;color: #0abb92;text-decoration:none;font-weight:600">Trade Trek</a>
            </div>
            <p style="font-size:1.1em">Hi,</p>
            <p>Thank you for choosing Trade Trek. Use the following OTP to complete your Sign Up procedures. OTP is valid for 5 minutes</p>
            <h2 style="background: #0abb92;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff !important;border-radius: 4px;">${otp}</h2>
            <p style="font-size:0.9em;">Regards,<br />Trade trek</p>
            <hr style="border:none;border-top:1px solid #eee" />
            <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
                <p>Trade Trek</p>
                <p>The Capital </p>
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

const sendMail = (email, tradeId, type, stock, units, transac, amount) => {

    var ordertype;

    var transaction;

    if (transac == 'credit') {
        transaction = 'Credited'
    }
    else {
        transaction = 'Debited'
    }

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
        html: `<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2 ; background-color:#000; color:#fff !important">
        <div style="margin:50px auto;width:70%;padding:20px 0">
          <div style="border-bottom:1px solid #eee">
            <a href="http://localhost:4000/" style="font-size:1.4em;color: #0abb92;text-decoration:none;font-weight:600">Trade Trek</a>
          </div>
          <p style="font-size:1.1em">Hi,</p>
          <div style='color:#ffffff !important'>
          
          <p style = "color : #ffffff !important">Your ${ordertype} Order has been executed for ${stock} of ${units} shares. <br> 
          The Transaction Id for your Order is ${tradeId} . Your Account has been ${transaction} with Rs ${amount}.
          </p>
          </div>
          <p style="font-size:0.9em;">Regards,<br />Trade Trek Pvt Ltd</p>
          <hr style="border:none;border-top:1px solid #eee" />
          <div style="float:right;padding:8px 0;color:#fff !important;font-size:0.8em;line-height:1;font-weight:300">
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

module.exports = { sendMail, otpMail };