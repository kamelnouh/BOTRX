const login = require("fca-project-origen");
const fs = require("fs");
const axios = require("axios");
const express = require("express");
const { createCanvas, loadImage } = require("canvas");

const app = express();
const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Bot 🐈‍⬛ is running!");
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

let appState;
try {
  appState = JSON.parse(fs.readFileSync("appstate.json", "utf8"));
} catch (err) {
  console.error("خطأ في قراءة ملف appstate.json:", err);
  process.exit(1);
}

// دالة مساعدة لإنشاء دمج صورتي البروفايل بين المرسل والمستهدف
async function createDualCanvas({ senderAvatar, targetAvatar, title, emoji, bgColor, subText }) {
  const canvas = createCanvas(600, 380);
  const ctx = canvas.getContext("2d");

  // خلفية الصورة
  ctx.fillStyle = bgColor || "#1e1e2f";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // نص العنوان الرئيسي
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 26px Arial";
  ctx.textAlign = "center";
  ctx.fillText(title, canvas.width / 2, 45);

  // تحميل الصور
  const img1 = await loadImage(senderAvatar);
  const img2 = await loadImage(targetAvatar);

  // رسم البروفايل الأول (المرسل)
  ctx.save();
  ctx.beginPath();
  ctx.arc(170, 190, 70, 0, Math.PI * 2, true);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(img1, 100, 120, 140, 140);
  ctx.restore();

  // رسم رمز التفاعل في المنتصف
  ctx.font = "45px Arial";
  ctx.fillText(emoji, canvas.width / 2, 205);

  // رسم البروفايل الثاني (المستهدف)
  ctx.save();
  ctx.beginPath();
  ctx.arc(430, 190, 70, 0, Math.PI * 2, true);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(img2, 360, 120, 140, 140);
  ctx.restore();

  // نص أسفل الصورة
  if (subText) {
    ctx.fillStyle = "#ffcc00";
    ctx.font = "bold 20px Arial";
    ctx.fillText(subText, canvas.width / 2, 330);
  }

  const imagePath = __dirname + `/dual_${Date.now()}.png`;
  const buffer = canvas.toBuffer("image/png");
  fs.writeFileSync(imagePath, buffer);

  return imagePath;
}

login({ appState: appState }, (err, api) => {
  if (err) {
    console.error("فشل تسجيل الدخول:", err);
    return;
  }

  console.log("تم تسجيل الدخول بنجاح! البوت Bot 🐈‍⬛ جاهز للعمل.");

  api.setOptions({ listenEvents: true, selfListen: false });

  api.listenMqtt(async (err, event) => {
    if (err) return console.error(err);

    if (event.type === "message" || event.type === "message_reply") {
      const body = event.body ? event.body.trim() : "";
      const lowerBody = body.toLowerCase();
      const threadID = event.threadID;
      const senderID = event.senderID;
      const messageID = event.messageID;

      // ==========================================
      // 1. تفاعل البوت عند الرد على إحدى رسائله
      // ==========================================
      if (event.type === "message_reply" && event.messageReply.senderID === api.getCurrentUserID()) {
        const activeReplies = [
          "خير؟ علاش راك ترجع عليا؟ 😡🐈‍⬛",
          "اسمع أنت.. متزيدش ترجع عليا هكذا سينون نخرجلك من التيليفون! 😾💥",
          "وش بيك حاب تتضارب معايا ولا كيفاه؟ 🥊😠",
          "يا ودي بلع عليا وخلينا مقصرين ترانكيل! 😒",
          "أيا بركا متضل تعاود في كلامي يا الزين 😼✨",
          "وش حاب تقولي؟ فهمنا معاك ولا راك غير تتشوكر؟ 🤨",
          "راك تقلق فيا.. روح تلعب بعيد خيرلك! 😼💢",
          "واش خصك يا الحبيب؟ هضر ني نسمع فيك 🎧👀",
          "يا أخي خطيني، راني شاد روحي بالسيف عليك! 😤",
          "أهلاً أهلاً! وش راك تقول يا غالي؟ 🥳💖"
        ];
        const randomReply = activeReplies[Math.floor(Math.random() * activeReplies.length)];
        return api.sendMessage(randomReply, threadID, messageID);
      }

      // ==========================================
      // 2. الرد التلقائي عند ذكر اسمك (كمال / Kamal)
      // ==========================================
      if (lowerBody.includes("كمال") || lowerBody.includes("kamal")) {
        return api.sendMessage("كمال مكاشو شخصك 😒", threadID, messageID);
      }

      // ==========================================
      // 3. الردود التلقائية العامة
      // ==========================================

      if (lowerBody.includes("نكمك")) {
        return api.sendMessage("مطيحش لانضربو فيك 😕🪻", threadID, messageID);
      }

      if (lowerBody === "اهلا" || lowerBody === "أهلا") {
        return api.sendMessage("أهلين وسهلين 🥳💋", threadID, messageID);
      }

      if (lowerBody === "حلو") {
        return api.sendMessage("انت حلو ياحبيبي 🥺🌸", threadID, messageID);
      }

      if (lowerBody.includes("نكحتشون يماك") || lowerBody.includes("نيك")) {
        return api.sendMessage("حذاري شتم ول برا 🥰😒😋🥳🪻", threadID, messageID);
      }

      if (lowerBody.includes("كمال نقش")) {
        return api.sendMessage("مكانش نقش قدك 😋", threadID, messageID);
      }

      if (lowerBody.includes("نحبك") || lowerBody.includes("نحبك يا بوت")) {
        return api.sendMessage("حتى أنا نحبك ونعزك يا الزين! 💖🥳", threadID, messageID);
      }

      if (lowerBody.includes("حزين") || lowerBody.includes("زفان") || lowerBody.includes("راني مقلق")) {
        return api.sendMessage("علاش راك حزين يا خويا؟ حتى أنا حزنت معاك 🥺💔 أضحك للدنيا تضحكلك!", threadID, messageID);
      }

      // أمر الخروج
      if (lowerBody === "اخرج") {
        api.sendMessage("ني خارج 😒 واحد ميطيح ول يتشوكر على حبيبنا 😋", threadID, () => {
          api.removeUserFromGroup(api.getCurrentUserID(), threadID);
        });
        return;
      }

      // أمر الطرد بالرد
      if (lowerBody === "طرد" && event.type === "message_reply") {
        const targetToKick = event.messageReply.senderID;
        api.removeUserFromGroup(targetToKick, threadID, (err) => {
          if (err) {
            api.sendMessage("❌ مقدرتش نطردو، كاشما خصتني صلاحيات أدمن ولا البوت ماهوش أدمن في القروب!", threadID);
          } else {
            api.sendMessage("🚫 تم طرده بنجاح من القروب!", threadID);
          }
        });
        return;
      }

      // ==========================================
      // 4. أوامر البوت الثنائية (صورة البروفايلين معاً)
      // ==========================================

      if (!body.startsWith("!") && body !== "اوامر" && body !== "الأوامر") return;

      const args = body.startsWith("!") ? body.slice(1).trim().split(/ +/) : [body];
      const command = args.shift().toLowerCase();

      // تحديد ID المرسل والمستهدف
      const senderAvatar = `https://unavatar.io/facebook/${senderID}`;
      let targetID = senderID;
      if (event.type === "message_reply") {
        targetID = event.messageReply.senderID;
      } else if (event.mentions && Object.keys(event.mentions).length > 0) {
        targetID = Object.keys(event.mentions)[0];
      }
      const targetAvatar = `https://unavatar.io/facebook/${targetID}`;

      // أوامر تتطلب الرد على شخص آخر لدمج الصورتين
      const dualCommands = ["زواج", "خطوبة", "طلاق", "حب", "بوسة", "ضرب", "سجن", "هجوم", "تحدي"];

      if (dualCommands.includes(command) && senderID === targetID) {
        return api.sendMessage("❌ هذا الأمر يتطلب الرد على رسالة الشخص المستهدف !", threadID, messageID);
      }

      switch (command) {
        case "اوامر":
        case "الأوامر":
        case "مساعدة":
        case "help":
          api.sendMessage(
            "🐈‍‍⬛ **أوامر الألعاب المدمجة بالصور الثنائية (رد على أي شخص):**\n\n" +
            "💍 **الحب والزواج:**\n" +
            "• !زواج - عقد زواج وصورتين مدمجتين 💍\n" +
            "• !خطوبة - بطاقة خطوبة 💐\n" +
            "• !طلاق - وثيقة انفصال 💔\n" +
            "• !حب - قياس الحب وتصميم رومنسي 💖\n" +
            "• !بوسة - قبلة ثنائية بالصور 💋\n\n" +
            "🥊 **التحدي والمواجهة:**\n" +
            "• !ضرب - مواجهة وبوكس مباشر 🤛\n" +
            "• !سجن - وضع الشخص في السجن 🔒\n" +
            "• !هجوم - هجوم مباشر بالصور 💥\n" +
            "• !تحدي - حلبة مصارعة وتحدي 🔥\n\n" +
            "⚡ **ملاحظة:** الأوامر تعمل بالرد على رسالة أي عضو في القروب!",
            threadID
          );
          break;

        case "زواج":
          try {
            api.sendMessage("⏳ جاري تصميم عقد الزواج ...", threadID);
            const img = await createDualCanvas({
              senderAvatar,
              targetAvatar,
              title: "💍 عقد زواج مبارك 💍",
              emoji: "💖",
              bgColor: "#4a154b",
              subText: "بارك الله لكما وجمع بينكما في خير 🎉"
            });
            api.sendMessage({ body: "💍 مبروك الزواج الرسمي بالصورة والتوثيق!", attachment: fs.createReadStream(img) }, threadID, () => fs.unlinkSync(img));
          } catch (e) {
            api.sendMessage("❌ حدث خطأ في إنشاء الصورة.", threadID);
          }
          break;

        case "خطوبة":
          try {
            api.sendMessage("⏳ جاري تحضير بطاقة الخطوبة...", threadID);
            const img = await createDualCanvas({
              senderAvatar,
              targetAvatar,
              title: "💐 خطوبة مباركة 💐",
              emoji: "🌸",
              bgColor: "#2c3e50",
              subText: "عقبال الفرحة الكبيرة إن شاء الله ✨"
            });
            api.sendMessage({ body: "💐 مبارك الخطوبة الثنائية!", attachment: fs.createReadStream(img) }, threadID, () => fs.unlinkSync(img));
          } catch (e) {
            api.sendMessage("❌ حدث خطأ في إنشاء الصورة.", threadID);
          }
          break;

        case "طلاق":
          try {
            api.sendMessage("⏳ جاري استخراج ورقة الطلاق...", threadID);
            const img = await createDualCanvas({
              senderAvatar,
              targetAvatar,
              title: "💔 وثيقة طلاق وانفصال 💔",
              emoji: "⚡",
              bgColor: "#2d1316",
              subText: "قُضيت المحبة وكل واحد يروح لدارهم! 📜"
            });
            api.sendMessage({ body: "💔 تم الانفصال والطلاق رسمياً!", attachment: fs.createReadStream(img) }, threadID, () => fs.unlinkSync(img));
          } catch (e) {
            api.sendMessage("❌ حدث خطأ في إنشاء الصورة.", threadID);
          }
          break;

        case "حب":
          try {
            const lovePercent = Math.floor(Math.random() * 101);
            api.sendMessage("⏳ جاري قياس نسبة العشق والتصميم...", threadID);
            const img = await createDualCanvas({
              senderAvatar,
              targetAvatar,
              title: "💖 اختبار نسبة الحب والعشق 💖",
              emoji: "💘",
              bgColor: "#831010",
              subText: `نسبة التوافق والعشق: ${lovePercent}%`
            });
            api.sendMessage({ body: `💖 نسبة العشق بيناتكم هي: ${lovePercent}%!`, attachment: fs.createReadStream(img) }, threadID, () => fs.unlinkSync(img));
          } catch (e) {
            api.sendMessage("❌ حدث خطأ في إنشاء الصورة.", threadID);
          }
          break;

        case "بوسة":
          try {
            api.sendMessage("⏳ جاري إرسال البوسة ...", threadID);
            const img = await createDualCanvas({
              senderAvatar,
              targetAvatar,
              title: "💋 بوسة ومحبة كبيرة 💋",
              emoji: "😘",
              bgColor: "#6f1d1b",
              subText: "بوسة دافية وماركة مسجلة! ✨"
            });
            api.sendMessage({ body: "💋 أحلى بوسة ثنائية !", attachment: fs.createReadStream(img) }, threadID, () => fs.unlinkSync(img));
          } catch (e) {
            api.sendMessage("❌ حدث خطأ في إنشاء الصورة.", threadID);
          }
          break;

        case "ضرب":
          try {
            api.sendMessage("⏳ جاري توجيه البوكس المباشر...", threadID);
            const img = await createDualCanvas({
              senderAvatar,
              targetAvatar,
              title: "🤛 معركة وبوكس مباشر 🤛",
              emoji: "💥",
              bgColor: "#3a0ca3",
              subText: "طاااااخ! كف حامي في العين باش تتربى! 😂"
            });
            api.sendMessage({ body: "👊 ضربة قاضية ومباشرة !", attachment: fs.createReadStream(img) }, threadID, () => fs.unlinkSync(img));
          } catch (e) {
            api.sendMessage("❌ حدث خطأ في إنشاء الصورة.", threadID);
          }
          break;

        case "سجن":
          try {
            api.sendMessage("⏳ جاري الزف إلى السجن...", threadID);
            const img = await createDualCanvas({
              senderAvatar,
              targetAvatar,
              title: "🔒 قضية ودخول السجن 🔒",
              emoji: "👮‍♂️",
              bgColor: "#1b263b",
              subText: "تم إدخاله للسجن والكفالة غالية! 😂"
            });
            api.sendMessage({ body: "🔒  تسليم المتهم للسجن!", attachment: fs.createReadStream(img) }, threadID, () => fs.unlinkSync(img));
          } catch (e) {
            api.sendMessage("❌ حدث خطأ في إنشاء الصورة.", threadID);
          }
          break;

        case "هجوم":
          try {
            api.sendMessage("⏳ جاري الإغارة والهجوم...", threadID);
            const img = await createDualCanvas({
              senderAvatar,
              targetAvatar,
              title: "💣 هجوم كاسح ومباغت 💣",
              emoji: "🎯",
              bgColor: "#4a0e17",
              subText: "تم الهجوم وتدمير الهدف بنجاح! 🔥"
            });
            api.sendMessage({ body: "💣  الهجوم والتدمير!", attachment: fs.createReadStream(img) }, threadID, () => fs.unlinkSync(img));
          } catch (e) {
            api.sendMessage("❌ حدث خطأ في إنشاء الصورة.", threadID);
          }
          break;

        case "تحدي":
          try {
            api.sendMessage("⏳ جاري دخول حلبة المصارعة...", threadID);
            const img = await createDualCanvas({
              senderAvatar,
              targetAvatar,
              title: "🔥 حلبة التحدي والمواجهة 🔥",
              emoji: "⚔️",
              bgColor: "#2b2d42",
              subText: "شكون يربح في التحدي؟ شعلت النار! 🥊"
            });
            api.sendMessage({ body: "🔥 التحدي والمواجهة الثنائية!", attachment: fs.createReadStream(img) }, threadID, () => fs.unlinkSync(img));
          } catch (e) {
            api.sendMessage("❌ حدث خطأ في إنشاء الصورة.", threadID);
          }
          break;

        default:
          break;
      }
    }
  });
});

