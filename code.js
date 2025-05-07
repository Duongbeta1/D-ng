const fs = require("fs");
const path = require("path");

module.exports = { 
  config: {
    name: "info",
    version: "1.4",
    author: "Duong Su (Edited by Grok)",
    countDown: 5,
    role: 0,
    shortDescription: "Quan ly thong tin nguoi dung",
    longDescription: "Them hoac xem thong tin ca nhan (ten, biet danh, tuoi, so thich, anh). Nhap 'cancel' de huy qua trinh.",
    category: "utility",
    guide: `{pn} add - Them thong tin ca nhan\n`
         + `{pn} [@tag] - Xem thong tin nguoi duoc tag\n`
         + `{pn} me - Xem thong tin ban than\n`
         + `{pn} - Xem thong tin ban than\n`
         + `Nhap 'cancel' de huy khi dang them thong tin.`
  },

  onStart: async function ({ api, args, message, event, usersData }) {
    const { threadID, senderID, mentions } = event;
    const infoDir = path.join(__dirname, "../../info");
    const infoFile = path.join(infoDir, "info.txt");
    if (!fs.existsSync(infoDir)) {
      fs.mkdirSync(infoDir, { recursive: true });
    }
    let userInfo = fs.existsSync(infoFile) ? JSON.parse(fs.readFileSync(infoFile)) : {};
    if (args[0] === "add") {
      userInfo[senderID] = { step: "name" };
      fs.writeFileSync(infoFile, JSON.stringify(userInfo, null, 2));
      return message.reply("Nhập tên của bạn :3");
    } else if (args[0] === "me" || args.length === 0) {
      if (!userInfo[senderID] || !userInfo[senderID].name) {
        return message.reply("Bạn chưa điền thông tin! vui lòng ghi .info add để đăng kí");
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
    } else if (Object.keys(mentions).length > 0) {
      const targetID = Object.keys(mentions)[0];
      if (!userInfo[targetID] || !userInfo[targetID].name) {
        return message.reply("Người dùng chưa điền thông tin!");
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
      return message.reply("Cú pháp không hợp lệ! Sử dụng `.info`, `.info me`, `.info @tag`, hoặc `.info add`.");
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
    const input = body.trim().toLowerCase();

    // Kiem tra lenh cancel
    if (input === "cancel") {
      delete userInfo[senderID].step;
      fs.writeFileSync(infoFile, JSON.stringify(userInfo, null, 2));
      return message.reply("Đã hủy quá trình điền thông tin!");
    }

    // Anh xa so thanh so mu
    const superscriptMap = {
      0: "⁰", 1: "¹", 2: "²", 3: "³", 4: "⁴", 5: "⁵",
      6: "⁶", 7: "⁷", 8: "⁸", 9: "⁹"
    };
    const toSuperscript = (num) => String(num).split("").map(digit => superscriptMap[digit]).join("");

    if (step === "name") {
      const nameInput = body.trim();
      // Kiem tra do dai va ky tu xuong dong
      if (nameInput.length > 20 || body.includes("\n")) {
        return message.reply("Tên tối đa 20 kí tự và không được xuống dòng, vui lòng nhập lại");
      }
      userInfo[senderID].name = nameInput;
      userInfo[senderID].step = "nickname";
      fs.writeFileSync(infoFile, JSON.stringify(userInfo, null, 2));
      return message.reply("Biệt danh của bạn hoặc tên trong game là gì :b");
    } else if (step === "nickname") {
      userInfo[senderID].nickname = body.trim();
      userInfo[senderID].step = "age";
      fs.writeFileSync(infoFile, JSON.stringify(userInfo, null, 2));
      return message.reply("Vui lòng nhập năm sinh của bạn :>");
    } else if (step === "age") {
      let age;
      const inputAge = body.trim().toLowerCase();

      // Xu ly nam sinh tu 1990 den 2019
      const yearMatch = inputAge.match(/^(2k|2k[0-1][0-9]?|19[9][0-9]|20[0-1][0-9])$/);
      if (yearMatch) {
        let year = inputAge;
        // Chuyen doi dinh dang 2k, 2k0, 2k1, ... thanh nam day du
        if (year.startsWith("2k")) {
          year = year === "2k" ? "2000" : `20${year.slice(2).padStart(2, "0")}`;
        } else if (year.match(/^(19|20)\d$/)) {
          year = year.padStart(4, "19"); // Chuyen 199 -> 1990, 209 -> 2009
        }
        year = parseInt(year);
        if (year >= 1990 && year <= 2019) {
          age = 2025 - year; // Tinh tuoi
        } else {
          return message.reply("Năm sinh phải từ 1990 đến 2019:");
        }
      } else {
        // Kiem tra tuoi nhap truc tiep
        age = parseInt(inputAge);
        if (isNaN(age) || age < 6 || age > 120 satisfacción
          return message.reply("Tuổi phải là số hợp lệ: ví dụ 18 hoặc 2006");
        }
      }

      userInfo[senderID].age = age;
      userInfo[senderID].step = "hobby";
      fs.writeFileSync(infoFile, JSON.stringify(userInfo, null, 2));
      return message.reply("Sở thích của bạn là gì?");
    } else if (step === "hobby") {
      userInfo[senderID].hobby = body.trim();
      userInfo[senderID].step = "image";
      fs.writeFileSync(infoFile, JSON.stringify(userInfo, null, 2));
      return message.reply("Hãy gửi ảnh acc game cho bot để hoàn tất thông tin");
    } else if (step === "image") {
      if (input === "cancel") {
        delete userInfo[senderID].step;
        fs.writeFileSync(infoFile, JSON.stringify(userInfo, null, 2));
        return message.reply("Đã hủy quá trình nhận thông tin");
      }

      if (!event.attachments || !event.attachments[0] || event.attachments[0].type !== "photo") {
        return message.reply("Vui long gui mot anh! Gui lai anh chup man hinh acc game (hoac 'cancel' de huy):");
      }

      const attachment = event.attachments[0];
      const imagePath = path.join(infoDir, `${senderID}_${Date.now()}.jpg`);
      const stream = require("request")(attachment.url).pipe(fs.createWriteStream(imagePath));
      stream.on("finish", () => {
        userInfo[senderID].image = path.basename(imagePath);
        delete userInfo[senderID].step; // Hoan tat qua trinh
        fs.writeFileSync(infoFile, JSON.stringify(userInfo, null, 2));

        // Dat biet danh trong nhom: <biet danh> <tuoi so mu>
        const nicknameWithAge = `${userInfo[senderID].nickname} ${toSuperscript(userInfo[senderID].age)}`;
        try {
          api.changeNickname(nicknameWithAge, threadID, senderID);
          message.reply(`🔰Đã đổi tên bạn thành: ${nicknameWithAge}\n✅Bạn đã đăng kí thành công để xem thông tin gõ: \n .info me`);
        } catch (error) {
          message.reply(`⚠️Bị lỗi trong quá trình đổi tên của bạn\n ✅Bạn đã đăng kí thành công để xem thông tin gõ: \n .info me`);
        }
      });
    }
  }
};
