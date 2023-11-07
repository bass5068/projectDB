const mysql = require("mysql2");

const dbConnection = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "login"
}).promise();

// ไม่จำเป็นต้องเรียก dbConnection.connect()

// ตรวจสอบการเชื่อมต่อ
dbConnection.getConnection()
  .then((connection) => {
    console.log("Connected to MySQL Database!");
    // ทำสิ่งที่คุณต้องการเมื่อเชื่อมต่อสำเร็จ
    // เช่น query ฐานข้อมูล
    connection.release(); // คืน connection เมื่อเสร็จสิ้นการใช้งาน
  })
  .catch((error) => {
    console.error("เกิดข้อผิดพลาดในการเชื่อมต่อ:", error);
  });

module.exports = dbConnection;