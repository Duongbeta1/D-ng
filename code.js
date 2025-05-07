const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "info",
    version: "1.0",
    author: "Dương Sú",
    countDown: 5,
    role: 0,
    shortDescription: "Quản lý thông tin người dùng",
    longDescription: "Thêm hoặc xem thông tin cá nhân (tên, biệt danh, tuổi, sở thích, ảnh)",
    category: "utility",
    guide: `{pn} add - Thêm thông tin cá nhân\n`
         + `{pn} [@tag] - Xem thông tin người được tag\n`
         + `{pn} - Xem thông tin bản thân`
  },

  onStart: async function ({ api, args, message, event, usersData }) {
    const { threadID, senderID, mentions } = event;
    const infoDir = path.join(__dirname, "../../info");
    const infoFile = path.join(infoDir, "info.txt");

    // Tạo thư mục info nếu chưa tồn tại
    if (!fs.existsSync(infoDir)) {
      fs.mkdirSync(infoDir, { recursive: true });
    }

    // Đọc hoặc khởi tạo info.txt
    let userInfo = fs.existsSync(infoFile) ? JSON.parse(fs.readFileSync(infoFile)) : {};

    if (args[0] === "add") {
      // Bắt đầu quá trình thu thập thông tin
      userInfo[senderID] = { step: "name" }; // Lưu trạng thái bước
      fs.writeFileSync(infoFile, JSON.stringify(userInfo, null, 2));
      return message.reply("Vui lòng nhập tên của bạn:");
    } else if (Object.keys(mentions).length > 0) {
      // Xem thông tin người được tag
      const targetID = Object.keys(mentions)[0];
      if (!userInfo[targetID] || !userInfo[targetID].name) {
        return message.reply("Người này chưa từng điền thông tin vào info!");
      }
      const { name, nickname, age, hobby, image } = userInfo[targetID];
      const msg = `ℹ️𝐓𝐡𝐨̂𝐧𝐠 𝐭𝐢𝐧 𝐜𝐮̉𝐚 ${mentions[targetID].replace(/@/g, "")}:\n`
                + `⚜️𝐓𝐞̂𝐧: ${name}\n`
                + `⚜️𝐁𝐢𝐞̣̂𝐭 𝐝𝐚𝐧𝐡: ${nickname}\n`
                + `⚜️𝐓𝐮𝐨̂̉𝐢: ${age}\n`
                + `⚜️𝐒𝐨̛̉ 𝐭𝐡𝐢́𝐜𝐡: ${hobby}`;          
      return api.sendMessage(
        { body: msg, attachment: image ? fs.createReadStream(path.join(infoDir, image)) : null },
        threadID
      );
    } else {
      // Xem thông tin bản thân
      if (!userInfo[senderID] || !userInfo[senderID].name) {
        return message.reply("Bạn chưa từng điền thông tin vào info!");
      }
      const { name, nickname, age, hobby, image } = userInfo[senderID];
      const msg = `ℹ️𝐓𝐡𝐨̂𝐧𝐠 𝐭𝐢𝐧 𝐜𝐮̉𝐚 𝐛𝐚̣𝐧:\n`
                + `⚜️𝐓𝐞̂𝐧: ${name}\n`
                + `⚜️𝐁𝐢𝐞̣̂𝐭 𝐝𝐚𝐧𝐡: ${nickname}\n`
                + `⚜️𝐓𝐮𝐨̂̉𝐢: ${age}\n`
                + `⚜️𝐒𝐨̛̉ 𝐭𝐡𝐢́𝐜𝐡: ${hobby}`;
      return api.sendMessage(
        { body: msg, attachment: image ? fs.createReadStream(path.join(infoDir, image)) : null },
        threadID
      );
    }
  },

  onChat: async function ({ api, event, message, usersData }) {
    const { threadID, senderID, body } = event;
    const infoDir = path.join(__dirname, "../../info");
    const infoFile = path.join(infoDir, "info.txt");

    if (!fs.existsSync(infoFile)) return;
    let userInfo = JSON.parse(fs.readFileSync(infoFile));

    if (!userInfo[senderID] || !userInfo[senderID].step) return;

    const step = userInfo[senderID].step;

    if (step === "name") {
      userInfo[senderID].name = body.trim();
      userInfo[senderID].step = "nickname";
      fs.writeFileSync(infoFile, JSON.stringify(userInfo, null, 2));
      return message.reply("Vui lòng nhập biệt danh của bạn:");
    } else if (step === "nickname") {
      userInfo[senderID].nickname = body.trim();
      userInfo[senderID].step = "age";
      fs.writeFileSync(infoFile, JSON.stringify(userInfo, null, 2));
      return message.reply("Vui lòng nhập tuổi của bạn:");
    } else if (step === "age") {
      const age = parseInt(body.trim());
      if (isNaN(age) || age < 0) {
        return message.reply("Tuổi phải là một số hợp lệ! Vui lòng nhập lại:");
      }
      userInfo[senderID].age = age;
      userInfo[senderID].step = "hobby";
      fs.writeFileSync(infoFile, JSON.stringify(userInfo, null, 2));
      return message.reply("Vui lòng nhập sở thích của bạn:");
    } else if (step === "hobby") {
      userInfo[senderID].hobby = body.trim();
      userInfo[senderID].step = "image";
      fs.writeFileSync(infoFile, JSON.stringify(userInfo, null, 2));
      return message.reply("Vui lòng gửi ảnh chụp màn hình acc game của bạn:");
    } else if (step === "image") {
      if (!event.attachments || !event.attachments[0] || event.attachments[0].type !== "photo") {
        return message.reply("Vui lòng gửi một ảnh! Gửi lại ảnh chụp màn hình acc game:");
      }
      const attachment = event.attachments[0];
      const imagePath = path.join(infoDir, `${senderID}_${Date.now()}.jpg`);
      const stream = require("request")(attachment.url).pipe(fs.createWriteStream(imagePath));
      stream.on("finish", () => {
        userInfo[senderID].image = path.basename(imagePath);
        delete userInfo[senderID].step; // Hoàn tất quá trình
        fs.writeFileSync(infoFile, JSON.stringify(userInfo, null, 2));
        message.reply("Đã lưu thông tin của bạn!");
      });
    }
  }
};