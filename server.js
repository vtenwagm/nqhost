const express = require('express');
const fs = require('fs');
const path = require('path');
const db = require('./database');
const bodyParser = require("body-parser");

const app = express();
const port = 3000;

app.use(express.json());

app.use(
	bodyParser.urlencoded({
		extended: true,
	}),
);


// Middleware kiểm tra IP bị cấm
app.use((req, res, next) => {
	const ip = req.ip;

	// Kiểm tra nếu IP đã bị cấm
	db.get("SELECT * FROM banned_ips WHERE ip = ?", [ip], (err, row) => {
		if (err) {
			console.error(err);
			res.status(500).send("Internal Server Error");
			return;
		}

		if (row) {
			res.status(403).send(ip);
		} else {
			if (req.method === "GET") {
				// Cấm IP nếu phương thức là GET
				db.run(
					"INSERT INTO banned_ips (ip) VALUES (?)",
					[ip],
					function (err) {
						if (err) {
							console.error(err);
							res.status(500).send("Internal Server Error");
							return;
						}

						res.status(403).send(ip);
					},
				);
			} else {
				next();
			}
		}
	});
});

// Route xử lý POST yêu cầu
app.post('/file/:file_name', (req, res) => {
    const ip = req.ip;
    const hwid = req.body.hwid;
    const fileName = req.params.file_name;
    const filePath = path.join(__dirname, 'files', fileName);
    console.log(hwid)
    if (!hwid) {
        // Chặn IP và tất cả các HWID từng kết nối từ IP này
        db.run('INSERT INTO banned_ips (ip) VALUES (?)', [ip], function(err) {
            if (err) {
                console.error(err);
                res.status(500).send('Internal Server Error');
                return;
            }

            db.all('SELECT hwid FROM hwids WHERE ip = ?', [ip], (err, rows) => {
                if (err) {
                    console.error(err);
                    res.status(500).send('Internal Server Error');
                    return;
                }

                rows.forEach(row => {
                    db.run('INSERT INTO banned_ips (ip) VALUES (?)', [row.hwid], function(err) {
                        if (err) {
                            console.error(err);
                        }
                    });
                });

                res.status(403).send('IP and associated HWIDs are banned');
            });
        });
        return;
    }

    // Lưu HWID và IP vào cơ sở dữ liệu
    db.run('INSERT INTO hwids (ip, hwid) VALUES (?, ?)', [ip, hwid], function(err) {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
            return;
        }

        // Kiểm tra xem tệp có tồn tại không
        fs.access(filePath, fs.constants.F_OK, (err) => {
            if (err) {
                res.status(404).send('File not found');
                return;
            }

            // Gửi tệp nếu tồn tại
            res.sendFile(filePath);
        });
    });
});

app.listen(80);
